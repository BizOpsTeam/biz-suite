import { Router } from "express";
import { loginHandler, logoutHandler, registerHandler } from "../controllers/auth.controller";

const authRoutes = Router()

//prefix is auth
authRoutes.post('/register', registerHandler)
authRoutes.post('/login', loginHandler)
authRoutes.post('/logout', logoutHandler)

export default authRoutes