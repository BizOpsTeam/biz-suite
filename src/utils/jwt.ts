import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import appAssert from "./appAssert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "../constants/http";


// Load environment variables from .env file
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET 

export const signToken = (id: string) => {
    appAssert(JWT_SECRET, NOT_FOUND, "JWT_SECRET not found")
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
    appAssert(JWT_SECRET, NOT_FOUND, "JWT_SECRET not found")
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.TokenExpiredError) {
            appAssert(false, UNAUTHORIZED, "Token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            appAssert(false, UNAUTHORIZED, "Invalid token");
        } else {
            appAssert(false, INTERNAL_SERVER_ERROR, "Token verification failed");
        }
    }
};