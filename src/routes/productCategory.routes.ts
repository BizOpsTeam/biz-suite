import { Router } from "express";
import {
    addProductCategoryHandler,
    getProductCategoriesHandler,
    getProductCategoryHandler,
    updateCategoryHandler
} from "../controllers/productCategory.controller";

const productCategoryRoutes = Router();

productCategoryRoutes.get("/", getProductCategoriesHandler);
productCategoryRoutes.post("/", addProductCategoryHandler);
productCategoryRoutes.get("/:id", getProductCategoryHandler);
productCategoryRoutes.patch("/:id", updateCategoryHandler);

export default productCategoryRoutes; 