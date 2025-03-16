import { CREATED } from "../constants/http";
import { createUserAccount, saveRefreshToken } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { userSchema } from "../zodSchema/user.zodSchema";
import { configDotenv } from "dotenv";

configDotenv();

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
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //send a response with the created user
    res.status(CREATED).json({ data: newUser, accessToken, message: 'User registered successfully' })
})