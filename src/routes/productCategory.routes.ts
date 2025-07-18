import { Router } from "express";
import {
    addProductCategoryHandler,
    getProductCategoriesHandler,
    getProductCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
} from "../controllers/productCategory.controller";

const productCategoryRoutes = Router();

productCategoryRoutes.get("/", getProductCategoriesHandler);
productCategoryRoutes.post("/", addProductCategoryHandler);
productCategoryRoutes.get("/:id", getProductCategoryHandler);
productCategoryRoutes.patch("/:id", updateCategoryHandler);
productCategoryRoutes.delete("/:id", deleteCategoryHandler);

export default productCategoryRoutes;
