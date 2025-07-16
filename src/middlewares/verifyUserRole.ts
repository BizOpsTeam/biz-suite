import { NextFunction, Request, Response } from "express";
import { getUserRole } from "../utils/getUserRole";
import AppError from "../errors/AppError";
import { FORBIDDEN } from "../constants/http";

export const isAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userRole = await getUserRole(req.user?.id as string);
    if (userRole !== "admin") {
        throw new AppError(FORBIDDEN, "Forbidden");
    }
    next();
};

export const isWorker = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userRole = await getUserRole(req.user?.id as string);
    if (userRole !== "worker") {
        throw new AppError(FORBIDDEN, "Forbidden");
    }
    next();
};
