import { Router } from "express";
import { addProductCategoryHandler, addProductHandler } from "../controllers/products.controller";

const productsRoutes = Router();

productsRoutes.post("/add", addProductHandler)
productsRoutes.post("/category/add", addProductCategoryHandler)
// productsRoutes.get("/category", getProductCategoriesHandler)
// productsRoutes.get("/category/:id", getProductCategoryHandler)
// productsRoutes.get("/", getProductsHandler)

export default productsRoutes;