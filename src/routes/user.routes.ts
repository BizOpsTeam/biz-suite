import { Router } from "express";
import {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler
} from "../controllers/user.controller";

const router = Router();

// Customer routes
router.post("/customers", createCustomerHandler);
router.get("/customers", getCustomersHandler);
router.get("/customers/:id", getCustomerByIdHandler);
router.patch("/customers/:id", updateCustomerHandler);
router.delete("/customers/:id", deleteCustomerHandler);

export default router;