import { Router } from "express";
import { addProductCategoryHandler, addProductHandler, getProductCategoriesHandler, getProductCategoryHandler, getProductsHandler, updateCategoryHandler } from "../controllers/products.controller";
import { productSearchHandler } from "../controllers/invoices.controller";

const productsRoutes = Router();

// prefix all routes with /products
productsRoutes.get("/", getProductsHandler)
productsRoutes.post("/add", addProductHandler)
productsRoutes.post("/category/add", addProductCategoryHandler)
productsRoutes.get("/category", getProductCategoriesHandler)
productsRoutes.get("/category/:id", getProductCategoryHandler)
productsRoutes.patch("/category/:id", updateCategoryHandler)
productsRoutes.get("/search", productSearchHandler)

export default productsRoutes;