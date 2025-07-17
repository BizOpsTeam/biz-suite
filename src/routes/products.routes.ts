import { Router } from "express";
import {
    addProductHandler,
    getProductHandler,
    getProductsHandler,
    updateProductHandler,
} from "../controllers/products.controller";
import { productSearchHandler } from "../controllers/invoices.controller";
import { authenticateUser } from "../middlewares/authenticateUser";

const productsRoutes = Router();

productsRoutes.get("/", authenticateUser ,getProductsHandler);
productsRoutes.get("/:id",authenticateUser, getProductHandler);
productsRoutes.post("/add", authenticateUser ,addProductHandler);
productsRoutes.patch("/:id", authenticateUser,updateProductHandler);
productsRoutes.get("/search", authenticateUser, productSearchHandler);

export default productsRoutes;
