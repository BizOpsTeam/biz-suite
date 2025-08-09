import { Router } from "express";
import {
    addProductHandler,
    getProductHandler,
    getProductsHandler,
    updateProductHandler,
    productsSearchHandler,
    deleteProductHandler,
} from "../controllers/products.controller";

import { authenticateUser } from "../middlewares/authenticateUser";

const productsRoutes = Router();

productsRoutes.get("/", authenticateUser, getProductsHandler);
productsRoutes.get("/search", authenticateUser, productsSearchHandler);

productsRoutes.get("/:id", authenticateUser, getProductHandler);
productsRoutes.post("/", authenticateUser, addProductHandler);
productsRoutes.patch("/:id", authenticateUser, updateProductHandler);
productsRoutes.delete("/:id", authenticateUser, deleteProductHandler);


export default productsRoutes;
