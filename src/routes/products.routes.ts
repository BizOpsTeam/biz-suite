import { Router } from "express";
import {
    addProductHandler,
    getProductHandler,
    getProductsHandler,
    updateProductHandler,
    productsSearchHandler,
    deleteProductHandler,
} from "../controllers/products.controller";
import { invoiceSearchHandler, deleteInvoiceHandler } from "../controllers/invoices.controller";
import { authenticateUser } from "../middlewares/authenticateUser";

const productsRoutes = Router();

productsRoutes.get("/", authenticateUser, getProductsHandler);
productsRoutes.get("/search", authenticateUser, productsSearchHandler);
productsRoutes.get("/invoices/products/search", authenticateUser, invoiceSearchHandler);
productsRoutes.get("/:id", authenticateUser, getProductHandler);
productsRoutes.post("/", authenticateUser, addProductHandler);
productsRoutes.patch("/:id", authenticateUser, updateProductHandler);
productsRoutes.delete("/:id", authenticateUser, deleteProductHandler);
productsRoutes.delete("/invoices/:id", authenticateUser, deleteInvoiceHandler);

export default productsRoutes;
