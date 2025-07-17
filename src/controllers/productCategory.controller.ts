import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { createProductCategory, getProductCategories, getProductCategoryById, updateCategory } from "../services/productCategory.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { productCategorySchema } from "../zodSchema/product.zodSchema";

export const addProductCategoryHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, Login to perform this action");
    const { body } = req;
    const { name, description } = productCategorySchema.parse(body);
    const productCategory = await createProductCategory({ name, description }, ownerId);
    res.status(CREATED).json({ data: productCategory, message: "Product category added successfully" });
});

export const getProductCategoriesHandler = catchErrors(async (req, res) => {
    const productCategories = await getProductCategories();
    res.status(OK).json({ data: productCategories, message: "Product categories fetched successfully" });
});

export const getProductCategoryHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    appAssert(id, BAD_REQUEST, "Product category ID is required");
    const productCategory = await getProductCategoryById(id);
    res.status(OK).json({ data: productCategory, message: "Product category fetched successfully" });
});

export const updateCategoryHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    const { id: categoryId } = req.params;
    const updateData = req.body;
    appAssert(userId, UNAUTHORIZED, "Login to update the category");
    const updatedCategory = await updateCategory(userId, categoryId, updateData);
    res.status(OK).json({ data: updatedCategory, message: "Category updated successfully" });
}); 