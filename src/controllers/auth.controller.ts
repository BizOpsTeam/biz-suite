import { Response } from "express";
import { CREATED, NOT_FOUND, UNAUTHORIZED } from "../constants/http";
import { createUserAccount, loginUser, revokeAllRefreshTokensForAUser, saveRefreshToken, verifyRefreshTokenInDB } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../utils/jwt";
import { loginSchema, userSchema } from "../zodSchema/user.zodSchema";
import { configDotenv } from "dotenv";
import appAssert from "../utils/appAssert";
import path from "path";
import { oneHourFromNow } from "../utils/dates";

configDotenv();

const setRefreshTokenCookie = (token: string, res: Response) => {
    res.cookie("refreshToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax", 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export const registerHandler = catchErrors(async (req, res) => {
    const { body } = req
    //validate request body
    const validatedUser = userSchema.parse(body)
    //call service to create a new user in the database
    const newUser = await createUserAccount(validatedUser)

    //generate jwt tokens
    const accessToken = generateAccessToken(newUser.id)
    const refreshToken = generateRefreshToken(newUser.id)

    //save the refresh token in the database
    await saveRefreshToken(refreshToken, newUser.id)

    //set refresh token as httpOnly cookie
    setRefreshTokenCookie(refreshToken, res)
    res.status(CREATED).json({ data: newUser, accessToken, message: 'User registered successfully' })
})

export const loginHandler = catchErrors(async(req, res) => {
    const { body } = req;
    const validatedUser = loginSchema.parse(body)

    //login user service
    const user = await loginUser(validatedUser.email, validatedUser.password)

    //remove all refreshTokens for this user in db;
    await revokeAllRefreshTokensForAUser(user.id)
    
    //generate jwt tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    //save the refresh token in the database
    await saveRefreshToken(refreshToken, user.id)

    //set refresh token as httpOnly cookie
    setRefreshTokenCookie(refreshToken, res)

    res.json({ data: user, accessToken, expiresIn: oneHourFromNow() , message: 'Logged in successfully' })
} )


export const logoutHandler = catchErrors(async (req, res) => {
    //get accessToken from request headers
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    appAssert(accessToken, UNAUTHORIZED, "No access token provided")

    //get userId from the accessToken
    const user = verifyAccessToken(accessToken);

    appAssert(user, UNAUTHORIZED, "No userId provided")

    // revoke all refresh tokens in the database for this user
    await revokeAllRefreshTokensForAUser(user.id);

    //clear refresh token cookie
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
})


export const refreshTokenHandler = catchErrors(async(req, res) => {
    //get refreshToken from request cookies
    const refreshToken = req.cookies["refreshToken"];
    appAssert(refreshToken, UNAUTHORIZED, "No refresh token provided");

    //verify the refreshToken in the database
    const userId = await verifyRefreshTokenInDB(refreshToken);
    appAssert(userId, UNAUTHORIZED, "Invalid or expired refresh token");
    await revokeAllRefreshTokensForAUser(userId)

    //generate new access token and refresh token
    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    //save the new refresh token in the database
    await saveRefreshToken(newRefreshToken, userId);
    setRefreshTokenCookie(newRefreshToken, res);

    res.json({ accessToken, expiresIn: oneHourFromNow() , message: "Refreshed successfully" });
})
