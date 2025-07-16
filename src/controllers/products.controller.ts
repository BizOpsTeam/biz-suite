import {
    BAD_REQUEST,
    CREATED,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from "../constants/http";
import {
    createProduct,
    createProductCategory,
    getMyProducts,
    getProductById,
    getProductCategories,
    getProductCategoryById,
    updateCategory,
} from "../services/products.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
    productCategorySchema,
    productSchema,
} from "../zodSchema/product.zodSchema";

export const getProductHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    appAssert(
        userId,
        UNAUTHORIZED,
        "Unauthorized, login to perform this action",
    );
    appAssert(id, NOT_FOUND, "Product Id required");

    const product = await getProductById(String(id), userId);
    if (!product) {
        return res
            .status(NOT_FOUND)
            .json({ data: null, message: `Product with id ${id} not found` });
    }
    res.status(OK).json({
        data: product,
        message: "Product successfully returned",
    });
});

export const addProductHandler = catchErrors(async (req, res) => {
    const { body } = req;
    const { name, price, stock, categoryId, description, images } =
        productSchema.parse(body);

    // get userId from request
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "User ID is required");

    // Create product
    const product = await createProduct(
        { name, price, stock, categoryId, description, images },
        userId,
    );

    res.status(CREATED).json({
        data: product,
        message: "Product added successfully",
    });
});

export const addProductCategoryHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    appAssert(
        ownerId,
        UNAUTHORIZED,
        "Unauthorized, Login to perform this action",
    );

    const { body } = req;
    const { name, description } = productCategorySchema.parse(body);

    // Create product category
    const productCategory = await createProductCategory(
        { name, description },
        ownerId,
    );

    res.status(CREATED).json({
        data: productCategory,
        message: "Product category added successfully",
    });
});

export const getProductCategoriesHandler = catchErrors(async (req, res) => {
    const productCategories = await getProductCategories();
    res.status(OK).json({
        data: productCategories,
        message: "Product categories fetched successfully",
    });
});

export const getProductCategoryHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    appAssert(id, BAD_REQUEST, "Product category ID is required");

    const productCategory = await getProductCategoryById(id);
    res.status(OK).json({
        data: productCategory,
        message: "Product category fetched successfully",
    });
});

export const getProductsHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Login to view your products");
    const products = await getMyProducts(userId);
    res.status(OK).json({
        data: products,
        message: "Products fetched successfully",
    });
});

export const updateCategoryHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    const { id: categoryId } = req.params;

    const updateData = req.body;

    appAssert(userId, UNAUTHORIZED, "Login to update the category");

    const updatedCategory = await updateCategory(
        userId,
        categoryId,
        updateData,
    );
    res.status(204).json({
        data: updateCategory,
        message: "category updated successfully",
    });
});
