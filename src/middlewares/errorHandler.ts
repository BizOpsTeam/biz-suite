import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import AppError from "../errors/AppError"
import dotenv from "dotenv"
import { ZodError } from "zod"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http"
import { Prisma } from "@prisma/client"

dotenv.config()

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {

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
    }

    // Handle Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
            status: "error",
            message: "Database request error",
            errorCode: err.code,
            meta: err.meta,
        });
    }

    // Handle Prisma validation errors (bad queries)
    if (err instanceof Prisma.PrismaClientValidationError) {
         res.status(400).json({
            status: "error",
            message: "Database validation error",
        });
    }

    // Handle Prisma unknown errors
    if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        res.status(500).json({
            status: "error",
            message: "Unknown database error",
        });
    }

    // Handle Prisma client initialization errors
    if (err instanceof Prisma.PrismaClientInitializationError) {
         res.status(500).json({
            status: "error",
            message: "Database initialization failed",
        });
    }

    // Handle Prisma client panic (Rust engine crash)
    if (err instanceof Prisma.PrismaClientRustPanicError) {
         res.status(500).json({
            status: "error",
            message: "Database engine crashed",
        });
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            errorCode: err.errorCode || "INTERNAL_ERROR",
        });
    }

    // Handle unexpected errors
    console.error("Unhandled Error:", err);
    res.status(INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Something went wrong",
    });
}

export default errorHandler
