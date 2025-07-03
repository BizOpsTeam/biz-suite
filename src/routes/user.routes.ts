import { Router } from "express";
import { registerHandler } from "../controllers/auth.controller";

const userRoutes = Router();

userRoutes.post("/", registerHandler);

export default userRoutes;