import { Router } from "express";
import {
    createCustomerHandler,
    getCustomersHandler,
    getCustomerByIdHandler,
    updateCustomerHandler,
    deleteCustomerHandler,
    updateUserProfileHandler,
    uploadLogoHandler,
    getCustomerStatementHandler,
} from "../controllers/user.controller";

const router = Router();

// Customer routes
router.post("/customers", createCustomerHandler);
router.get("/customers", getCustomersHandler);
router.get("/customers/:id", getCustomerByIdHandler);
router.patch("/customers/:id", updateCustomerHandler);
router.delete("/customers/:id", deleteCustomerHandler);
router.patch("/profile", updateUserProfileHandler);
router.post("/profile/logo", uploadLogoHandler);
router.get("/customers/:id/statement", getCustomerStatementHandler);

export default router;
