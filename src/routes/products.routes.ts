import { Router } from "express";
import { addProductCategoryHandler, addProductHandler, getProductCategoriesHandler, getProductCategoryHandler, getProductsHandler } from "../controllers/products.controller";
import { productSearchHandler } from "../controllers/invoices.controller";

const productsRoutes = Router();

// prefix all routes with /products
productsRoutes.get("/", getProductsHandler)
productsRoutes.post("/add", addProductHandler)
productsRoutes.post("/category/add", addProductCategoryHandler)
productsRoutes.get("/category", getProductCategoriesHandler)
productsRoutes.get("/category/:id", getProductCategoryHandler)
productsRoutes.get("/search", productSearchHandler)

export default productsRoutes;