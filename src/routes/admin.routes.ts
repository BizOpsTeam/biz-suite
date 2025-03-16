import { Router } from "express"
import { registerAdmin } from "../controllers/admin.controller"

const adminRoutes = Router()
//prefix: admin
adminRoutes.post('/register', registerAdmin)

export default adminRoutes
