import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import AppError from "../errors/AppError"
import dotenv from "dotenv"
import { ZodError } from "zod"
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http"
// import { Prisma } from "@prisma/client"
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError
} from '@prisma/client/runtime/library';

dotenv.config()

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

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
        return;
    }

    // Handle Prisma known errors
    if (err instanceof PrismaClientKnownRequestError) {
        res.status(400).json({
            status: "error",
            message: "Database request error",
            errorCode: (err as any).code,
            meta: (err as any).meta,
        });
        return;
    }

    // Handle Prisma validation errors (bad queries)
    if (err instanceof PrismaClientValidationError) {
         res.status(400).json({
            status: "error",
            message: "Database validation error",
        });
        return;
    }

    // Handle Prisma unknown errors
    if (err instanceof PrismaClientUnknownRequestError) {
        res.status(500).json({
            status: "error",
            message: "Unknown database error",
        });
        return;
    }

    // Handle Prisma client initialization errors
    if (err instanceof PrismaClientInitializationError) {
         res.status(500).json({
            status: "error",
            message: "Database initialization failed",
        });
        return;
    }

    // Handle Prisma client panic (Rust engine crash)
    if (err instanceof PrismaClientRustPanicError) {
         res.status(500).json({
            status: "error",
            message: "Database engine crashed",
        });
        return;
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        res.status((err as any).statusCode).json({
            status: "error",
            message: err.message,
            errorCode: (err as any).errorCode || "INTERNAL_ERROR",
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
