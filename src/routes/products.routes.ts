import { Router } from "express";
import {
    addProductCategoryHandler,
    addProductHandler,
    getProductCategoriesHandler,
    getProductCategoryHandler,
    getProductHandler,
    getProductsHandler,
    updateCategoryHandler,
} from "../controllers/products.controller";
import { productSearchHandler } from "../controllers/invoices.controller";

const productsRoutes = Router();

productsRoutes.get("/", getProductsHandler);
productsRoutes.get("/:id", getProductHandler);
productsRoutes.post("/add", addProductHandler);
productsRoutes.post("/category", addProductCategoryHandler);
productsRoutes.get("/category", getProductCategoriesHandler);
productsRoutes.get("/category/:id", getProductCategoryHandler);
productsRoutes.patch("/category/:id", updateCategoryHandler);
productsRoutes.get("/search", productSearchHandler);

export default productsRoutes;
