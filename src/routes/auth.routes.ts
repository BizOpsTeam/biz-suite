import { Router } from "express";
import {
    forgotPasswordHandler,
    loginHandler,
    logoutHandler,
    refreshTokenHandler,
    registerHandler,
    resetPasswordHandler,
    verifyEmailHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.post("/logout", logoutHandler);
authRoutes.post("/refresh", refreshTokenHandler);
authRoutes.post("/verify-email", verifyEmailHandler);
authRoutes.post("/forgot-password", forgotPasswordHandler);
authRoutes.post("/reset-password", resetPasswordHandler);

export default authRoutes;
