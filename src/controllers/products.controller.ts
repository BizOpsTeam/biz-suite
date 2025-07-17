import {
    BAD_REQUEST,
    CREATED,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from "../constants/http";
import {
    createProduct,
    getMyProducts,
    getProductById,
    updateProduct,
} from "../services/products.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
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
    const { name, price, stock, categoryId, description, images, cost } =
        productSchema.parse(body);

    // get userId from request
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "User ID is required");

    // Create product
    const product = await createProduct(
        { name, price, stock, categoryId, description, images, cost },
        userId,
    );

    res.status(CREATED).json({
        data: product,
        message: "Product added successfully",
    });
});

export const getProductsHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Login to view your products");
    const {
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort,
      page = '1',
      limit = '20',
    } = req.query;
    const result = await getMyProducts({
      ownerId: userId,
      categoryId: categoryId as string | undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
      search: search as string | undefined,
      sort: sort as string | undefined,
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 20,
    });
    res.status(OK).json({
      ...result,
      message: "Products fetched successfully",
    });
});

export const updateProductHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized, login to perform this action");
    appAssert(id, BAD_REQUEST, "Product Id required");
    // Validate and parse update data (partial allowed)
    const updateData = productSchema.partial().parse(req.body);
    const updatedProduct = await updateProduct(id, userId, updateData);
    res.status(OK).json({
        data: updatedProduct,
        message: "Product updated successfully",
    });
});
