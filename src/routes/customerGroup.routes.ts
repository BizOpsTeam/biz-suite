import { Router } from "express";
import {
    addCustomerGroupHandler,
    getCustomerGroupsHandler,
    getCustomerGroupHandler,
    updateCustomerGroupHandler,
    deleteCustomerGroupHandler,
    assignGroupsToCustomerHandler,
    getCustomersByGroupHandler,
} from "../controllers/customerGroup.controller";

const router = Router();

router.get("/", getCustomerGroupsHandler);
router.post("/", addCustomerGroupHandler);
router.get("/:id", getCustomerGroupHandler);
router.patch("/:id", updateCustomerGroupHandler);
router.delete("/:id", deleteCustomerGroupHandler);
router.post("/assign/:id", assignGroupsToCustomerHandler); // id = customerId
router.get("/customers/by-group", getCustomersByGroupHandler);

export default router; 