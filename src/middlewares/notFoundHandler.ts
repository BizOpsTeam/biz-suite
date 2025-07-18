import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import { NOT_FOUND } from "../constants/http";

const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
    next(
        new AppError(
            NOT_FOUND,
            `Route ${req.originalUrl} not found`,
            "ROUTE_NOT_FOUND",
        ),
    );
};

export default notFoundHandler;
