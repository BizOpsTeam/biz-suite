import { Response } from "express";
import { CREATED, UNAUTHORIZED } from "../constants/http";
import { createUserAccount, loginUser, revokeAllRefreshTokensForAUser, saveRefreshToken } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { loginSchema, userSchema } from "../zodSchema/user.zodSchema";
import { configDotenv } from "dotenv";
import appAssert from "../utils/appAssert";

configDotenv();

const setRefreshTokenCookie = (token: string, res: Response) => {
    res.cookie("refreshToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        path: "/refresh",
        sameSite: "strict", 
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

    //send a response with the created user
    res.status(CREATED).json({ data: newUser, accessToken, message: 'User registered successfully' })
})

export const loginHandler = catchErrors(async(req, res) => {
    const { body } = req;
    console.log(body)
    //validate request body
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

    res.json({ data: user, accessToken, message: 'Logged in successfully' })
} )