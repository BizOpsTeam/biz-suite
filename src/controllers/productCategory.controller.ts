import {
    BAD_REQUEST,
    CREATED,
    OK,
    UNAUTHORIZED,
    NOT_FOUND,
} from "../constants/http";
import {
    createProductCategory,
    getProductCategories,
    getProductCategoryById,
    updateCategory,
    deleteCategory,
} from "../services/productCategory.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { productCategorySchema } from "../zodSchema/product.zodSchema";

export const addProductCategoryHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    appAssert(
        ownerId,
        UNAUTHORIZED,
        "Unauthorized, Login to perform this action",
    );
    const { body } = req;
    const { name, description } = productCategorySchema.parse(body);
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
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, Login to view categories");
    const productCategories = await getProductCategories(ownerId);
    res.status(OK).json({
        data: productCategories,
        message: "Product categories fetched successfully",
    });
});

export const getProductCategoryHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    const { id } = req.params;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, Login to view category");
    appAssert(id, BAD_REQUEST, "Product category ID is required");
    const productCategory = await getProductCategoryById(id, ownerId);
    appAssert(
        productCategory,
        NOT_FOUND,
        `Product category with id ${id} not found or not owned by you`,
    );
    res.status(OK).json({
        data: productCategory,
        message: "Product category fetched successfully",
    });
});

export const updateCategoryHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    const { id: categoryId } = req.params;
    const updateData = req.body;
    appAssert(userId, UNAUTHORIZED, "Login to update the category");
    // Optionally, check existence first for better error
    const existing = await getProductCategoryById(categoryId, userId);
    appAssert(
        existing,
        NOT_FOUND,
        `Product category with id ${categoryId} not found or not owned by you`,
    );
    const updatedCategory = await updateCategory(
        userId,
        categoryId,
        updateData,
    );
    res.status(OK).json({
        data: updatedCategory,
        message: "Category updated successfully",
    });
});

export const deleteCategoryHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    const { id: categoryId } = req.params;
    appAssert(userId, UNAUTHORIZED, "Login to delete the category");
    // Check existence and ownership first
    const existing = await getProductCategoryById(categoryId, userId);
    appAssert(
        existing,
        NOT_FOUND,
        `Product category with id ${categoryId} not found or not owned by you`,
    );
    await deleteCategory(userId, categoryId);
    res.status(OK).json({ message: "Category deleted successfully" });
});
