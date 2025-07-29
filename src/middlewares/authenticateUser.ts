import { NextFunction, Request, Response, RequestHandler } from "express";
import { UNAUTHORIZED } from "../constants/http";
import { verifyAccessToken } from "../utils/jwt";
import { configDotenv } from "dotenv";
import appAssert from "../utils/appAssert";

configDotenv();

// Define interface for the user property on Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export const authenticateUser: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    console.log(req.cookies);

    const accessToken =
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    appAssert(accessToken, UNAUTHORIZED, "No access token provided");

    const payload = verifyAccessToken(accessToken);
    appAssert(payload, UNAUTHORIZED, "Invalid access token");

    console.log("Verified user's Payload: ", payload);

    // Attach the user ID to the request object
    req.user = { id: payload.id };

    next();
};
