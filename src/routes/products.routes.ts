import { Router } from "express";
import {
    addProductHandler,
    getProductHandler,
    getProductsHandler,
    updateProductHandler,
} from "../controllers/products.controller";
import { productSearchHandler } from "../controllers/invoices.controller";

const productsRoutes = Router();

productsRoutes.get("/", getProductsHandler);
productsRoutes.get("/:id", getProductHandler);
productsRoutes.post("/add", addProductHandler);
productsRoutes.patch("/:id", updateProductHandler);
productsRoutes.get("/search", productSearchHandler);

export default productsRoutes;
