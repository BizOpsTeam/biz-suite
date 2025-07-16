import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import appAssert from "./appAssert";
import {
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    UNAUTHORIZED,
} from "../constants/http";

// Load environment variables from .env file
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

//generte access token
export const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
};

//generate refresh token
export const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
};

export const verifyAccessToken = (id: string) => {
    appAssert(ACCESS_TOKEN_SECRET, NOT_FOUND, "ACCESS_TOKEN_SECRET not found");
    try {
        return jwt.verify(id, ACCESS_TOKEN_SECRET) as { id: string };
    } catch (error) {
        handleJwtError(error);
    }
};

export const verifyRefreshToken = (id: string) => {
    appAssert(
        REFRESH_TOKEN_SECRET,
        NOT_FOUND,
        "REFRESH_TOKEN_SECRET not found",
    );
    try {
        return jwt.verify(id, REFRESH_TOKEN_SECRET) as { id: string };
    } catch (error) {
        handleJwtError(error);
    }
};

const handleJwtError = (error: any) => {
    if (error instanceof jwt.TokenExpiredError) {
        appAssert(false, UNAUTHORIZED, "Token expired");
        return;
    } else if (error instanceof jwt.JsonWebTokenError) {
        appAssert(false, UNAUTHORIZED, "Invalid token");
    } else {
        appAssert(false, INTERNAL_SERVER_ERROR, "Token verification failed");
    }
};
