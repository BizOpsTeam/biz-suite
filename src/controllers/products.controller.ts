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
import { productSchema } from "../zodSchema/product.zodSchema";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const productImageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        public_id: `product_images/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ width: 600, height: 600, crop: "limit" }],
    }),
});
const uploadProductImages = multer({
    storage: productImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB limit

const PLACEHOLDER_IMAGE =
    "https://res.cloudinary.com/demo/image/upload/sample.jpg";

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

export const addProductHandler = [
    uploadProductImages.array("images", 5), // up to 5 images
    catchErrors(async (req, res) => {
        const userId = req.user?.id;
        appAssert(userId, UNAUTHORIZED, "User ID is required");
        // Parse form fields
        const { name, price, stock, categoryId, description, cost } = req.body;
        // Validate required fields
        productSchema.parse({
            name,
            price: Number(price),
            stock: Number(stock),
            categoryId,
            description,
            cost: cost ? Number(cost) : undefined,
        });
        // Handle images
        let imageUrls: string[] = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            imageUrls = req.files.map((file: any) => file.path);
        } else {
            imageUrls = [PLACEHOLDER_IMAGE];
        }
        // Create product
        const product = await createProduct(
            {
                name,
                price: Number(price),
                stock: Number(stock),
                categoryId,
                description,
                images: imageUrls,
                cost: cost ? Number(cost) : undefined,
            },
            userId,
        );
        res.status(CREATED).json({
            data: product,
            message: "Product added successfully",
        });
    }),
];

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
        page = "1",
        limit = "20",
    } = req.query;
    const result = await getMyProducts({
        ownerId: userId,
        categoryId: categoryId as string | undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        inStock: inStock !== undefined ? inStock === "true" : undefined,
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

export const updateProductHandler = [
    uploadProductImages.array("images", 5), // up to 5 images
    catchErrors(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.id;
        appAssert(
            userId,
            UNAUTHORIZED,
            "Unauthorized, login to perform this action",
        );
        appAssert(id, BAD_REQUEST, "Product Id required");
        // Validate and parse update data (partial allowed)
        const updateData = productSchema.partial().parse(req.body);
        // Handle images
        let imageUrls: string[] | undefined = undefined;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            imageUrls = req.files.map((file: any) => file.path);
        }
        // Pass imageUrls to service if provided
        const updatedProduct = await updateProduct(id, userId, updateData, imageUrls);
        res.status(OK).json({
            data: updatedProduct,
            message: "Product updated successfully",
        });
    }),
];
