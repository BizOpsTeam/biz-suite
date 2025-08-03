import { Response } from "express";
import crypto from "crypto";
import { CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import {
    createUserAccount,
    getUserProfile,
    loginUser,
    revokeAllRefreshTokensForAUser,
    saveRefreshToken,
    storeHashedToken,
    updatePassword,
    verifyRefreshTokenInDB,
    verifyResetPasswordToken,
} from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
} from "../utils/jwt";
import { loginSchema, userSchema } from "../zodSchema/user.zodSchema";
import { configDotenv } from "dotenv";
import appAssert from "../utils/appAssert";
import { oneHourFromNow } from "../utils/dates";
import {
    sendResetPasswordEmail,
    sendVerificationEmail,
    updateEmailVerified,
    verifyEmail,
    verifyEmailToken,
} from "../services/email.service";
import AppError from "../errors/AppError";

configDotenv();

const setRefreshTokenCookie = (token: string, res: Response) => {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/auth/refresh",
    };

    console.log("=== Cookie Settings ===");
    console.log("Cookie options:", cookieOptions);
    console.log("=======================");

    res.cookie("refreshToken", token, cookieOptions);
};

export const registerHandler = catchErrors(async (req, res) => {
    const { body } = req;
    //validate request body
    const validatedUser = userSchema.parse(body);
    if (validatedUser.role === "user" || validatedUser.role === "worker") {
        let userWorkerPassword = "00000000";
        validatedUser.password = userWorkerPassword;
    }
    //call service to create a new user in the database
    const newUser = await createUserAccount(validatedUser);
    await sendVerificationEmail(newUser.id); // provide an email parameter on production

    //generate jwt tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    //save the refresh token in the database
    await saveRefreshToken(refreshToken, newUser.id);

    //set refresh token as httpOnly cookie
    setRefreshTokenCookie(refreshToken, res);
    res.status(CREATED).json({
        data: newUser,
        accessToken,
        message: "User registered successfully",
    });
});

export const loginHandler = catchErrors(async (req, res) => {
    const { body } = req;
    const validatedUser = loginSchema.parse(body);

    //login user service
    const user = await loginUser(validatedUser.email, validatedUser.password);

    //remove all refreshTokens for this user in db;
    await revokeAllRefreshTokensForAUser(user.id);

    //generate jwt tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    console.log("Refresh token: ", refreshToken);
    console.log("Access token: ", accessToken);

    //save the refresh token in the database
    await saveRefreshToken(refreshToken, user.id);

    //set refresh token as httpOnly cookie
    setRefreshTokenCookie(refreshToken, res);

    res.status(OK).json({
        data: user,
        accessToken,
        expiresIn: oneHourFromNow(),
        message: "Logged in successfully",
    });
});

export const logoutHandler = catchErrors(async (req, res) => {
    //get accessToken from request headers
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    appAssert(accessToken, UNAUTHORIZED, "No access token provided");

    //get userId from the accessToken
    const user = verifyAccessToken(accessToken);

    appAssert(user, UNAUTHORIZED, "No userId provided");

    // revoke all refresh tokens in the database for this user
    await revokeAllRefreshTokensForAUser(user.id);

    //clear refresh token cookie with same settings
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/auth/refresh",
    });
    res.status(OK).json({ message: "Logged out successfully" });
});

export const refreshTokenHandler = catchErrors(async (req, res) => {
    //get refreshToken from request cookies
    const refreshToken = req.cookies["refreshToken"];

    console.log("This is the refreshToken: ", refreshToken);

    if (!refreshToken) {
        throw new AppError(
            UNAUTHORIZED,
            "No refresh token provided",
            "REFRESH_TOKEN_MISSING",
        );
    }

    //verify the refreshToken in the database
    const userId = await verifyRefreshTokenInDB(refreshToken);
    console.log("This is the userId: ", userId);
    appAssert(userId, UNAUTHORIZED, "Invalid or expired refresh token");
    

    const accessToken = generateAccessToken(userId);
    const userProfile = await getUserProfile(userId)
    

    return res.status(OK).json({
        accessToken,
        user: userProfile,
        expiresIn: oneHourFromNow(),
        message: "Refreshed successfully",
    });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
    const { query } = req;
    const { token } = query;
    appAssert(
        token && typeof token === "string",
        NOT_FOUND,
        "No token provided",
    );

    //verify email using the provided token
    const user = await verifyEmailToken(token);
    appAssert(
        user.id,
        NOT_FOUND,
        "Invalid or expired email verification token",
    );

    //update the user's emailVerified field in the database
    await updateEmailVerified(user.id);
    res.status(OK).json({ message: "Email verified successfully" });
});

export const getMeHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");
    const user = await getUserProfile(userId);
    console.log("User: ", user);
    res.status(200).json({ success: true, data: user, message: "User fetched successfully" });
});

export const forgotPasswordHandler = catchErrors(async (req, res) => {
    const { email } = req.body;
    appAssert(email, NOT_FOUND, "Email address not found");
    //validate email
    const user = await verifyEmail(email);
    appAssert(user, OK, "If email exists, a valid email has been sent");

    //send reset email token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;
    const expiresAt = oneHourFromNow();
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    await storeHashedToken(hashedToken, user.id, expiresAt);
    await sendResetPasswordEmail(resetPasswordUrl);

    res.status(OK).json("'If this email exists, a reset link has been sent.");
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
    const { query, body } = req;
    const { token } = query;
    appAssert(
        token && typeof token === "string",
        NOT_FOUND,
        "No token provided",
    );

    //validate password
    const { password } = body;
    appAssert(
        password && password.length >= 8 && password.length <= 100,
        NOT_FOUND,
        "Password must be between 8 and 100 characters",
    );

    //verify the reset token in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const userId = await verifyResetPasswordToken(hashedToken);
    appAssert(userId, NOT_FOUND, "Invalid or expired reset password token");

    //update the user's password in the database
    await updatePassword(userId, password);
    res.status(OK).json({ message: "Password reset successfully" });
});
