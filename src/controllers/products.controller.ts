import { BAD_REQUEST, CREATED } from "../constants/http";
import { createProduct, createProductCategory } from "../services/products.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { productCategorySchema, productSchema } from "../zodSchema/product.zodSchema";


export const addProductHandler = catchErrors(async (req, res) => {
    const { body } = req;
    const { name, price, stock, categoryId, description, images } = productSchema.parse(body);

    // Create product
    const product = await createProduct({ name, price, stock, categoryId, description, images })

    res.status(CREATED).json({ data: product, message: "Product added successfully" });
})


export const addProductCategoryHandler = catchErrors(async (req, res) => {
    const { body } = req;
    const { name, description } = productCategorySchema.parse(body);

    // Create product category
    const productCategory = await createProductCategory({ name, description })

    res.status(CREATED).json({ data: productCategory, message: "Product category added successfully" });
})