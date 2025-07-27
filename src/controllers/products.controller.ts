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
    deleteProduct,
} from "../services/products.service";
import { searchProducts } from "../services/invoices.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { productSchema } from "../zodSchema/product.zodSchema";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import { Request, Response, NextFunction } from "express";

const productImageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
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
    return res.status(OK).json({
        data: product,
        message: "Product successfully returned",
    });
});

// Helper to wrap multer and forward errors
function safeMulterArray(field: string, maxCount: number) {
    return function (req: Request, res: Response, next: NextFunction) {
        uploadProductImages.array(field, maxCount)(req, res, function (err) {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // Handle Multer-specific errors (e.g. file limit)
                    return res
                        .status(400)
                        .json({ message: `Multer error: ${err.message}` });
                }
                if (err.message)
                    // Cloudinary or multer error
                    return res.status(500).json({
                        message:
                            err?.message &&
                            err.message.includes("Invalid cloud_name")
                                ? "Image upload failed: Cloudinary configuration is invalid. Please contact support."
                                : `Image upload failed: ${err}`,
                    });
            }
            return next();
        });
    };
}

export const addProductHandler = [
    safeMulterArray("images", 5), // up to 5 images, with error handling
    catchErrors(async (req, res) => {
        const userId = req.user?.id;
        appAssert(userId, UNAUTHORIZED, "User ID is required");
        // Parse form fields
        const { name, price, stock, categoryId, description, cost } = req.body;
        // Validate required fields
        const parsedProduct = productSchema.parse({
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
                ...parsedProduct,
                images: imageUrls,
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
    safeMulterArray("images", 5), // up to 5 images, with error handling
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
        const updatedProduct = await updateProduct(
            id,
            userId,
            updateData,
            imageUrls,
        );
        res.status(OK).json({
            data: updatedProduct,
            message: "Product updated successfully",
        });
    }),
];

export const productsSearchHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Login to perform this action");

    const {
        query,
        categoryId,
        inStock,
        minPrice,
        maxPrice,
        sort,
        page = 1,
        limit = 20,
    } = req.query;

    // Parse and validate numeric params
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const parsedMinPrice =
        minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMaxPrice =
        maxPrice !== undefined ? Number(maxPrice) : undefined;

    // You can customize the service call for products-specific logic if needed
    const searchResults = await searchProducts(
        userId,
        query as string,
        categoryId as string,
        inStock as string,
        parsedPage,
        parsedLimit,
        parsedMinPrice,
        parsedMaxPrice,
        sort as string,
    );

    return res.status(OK).json({
        data: searchResults,
        message: "Products search results returned successfully",
    });
});

export const deleteProductHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    appAssert(
        userId,
        UNAUTHORIZED,
        "Unauthorized, login to perform this action",
    );
    appAssert(id, BAD_REQUEST, "Product Id required");

    await deleteProduct(id, userId);
    res.status(OK).json({ message: "Product deleted successfully" });
});
