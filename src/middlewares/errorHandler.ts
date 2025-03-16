import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import AppError from "../errors/AppError"
import dotenv from "dotenv"
import { ZodError } from "zod"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http"

dotenv.config()

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    // Handle Zod validation errors
    if (err instanceof ZodError) { 
        res.status(BAD_REQUEST).json({
            status: "error",
            message: "Validation failed",
            errors: err.errors.map(e => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
        return;  // Zod errors are handled above, so we don't need to continue here.
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            errorCode: err.errorCode || "INTERNAL_ERROR",
        });
        return;
    }

    // Handle unexpected errors
    console.error("Unhandled Error:", err);
    res.status(INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Something went wrong",
    });
}

export default errorHandler
