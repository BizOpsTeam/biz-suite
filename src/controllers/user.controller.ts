import { Request, Response, NextFunction } from "express";
import {
    createCustomerSchema,
    updateCustomerSchema,
    updateUserProfileSchema,
} from "../zodSchema/user.zodSchema";
import {
    createCustomer,
    getCustomers,
    getTotalCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    updateUserProfile,
    getCustomerStatement,
} from "../services/user.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const logoStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        public_id: `company_logos/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ width: 300, height: 150, crop: "limit" }],
    }),
});
const upload = multer({
    storage: logoStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
}); // 2MB limit

export const uploadLogoHandler = [
    upload.single("logo"),
    catchErrors(async (req: Request, res: Response) => {
        const file = req.file as Express.Multer.File & { path?: string };
        if (!file || !file.path) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded or upload failed.",
            });
        }
        const url = file.path;
        return res.json({ success: true, url });
    }),
];

export const createCustomerHandler = catchErrors(
    async (req: Request, res: Response): Promise<any> => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        
        console.log("Received customer data:", req.body);
        
        const validated = createCustomerSchema.parse(req.body);
        console.log("Validated customer data:", validated);
        
        try {
            const customer = await createCustomer({
                ...validated,
                ownerId: userId,
            });
            
            console.log("Created customer:", customer);
            
            return res.status(201).json({ 
                success: true, 
                data: customer,
                message: "Customer created successfully"
            });
        } catch (error: any) {
            console.error("Error creating customer:", error);
            
            // Handle specific error cases
            if (error.message.includes("already exists")) {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                    errorCode: "DUPLICATE_EMAIL"
                });
            }
            
            // Re-throw other errors to be handled by catchErrors
            throw error;
        }
    },
);

export const getCustomersHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");

        //let it take params
        const { page, limit, search } = req.query;

        const customers = await getCustomers(userId, Number(page) || 1, Number(limit) || 10, search as string || "");
        return res.json({ success: true, data: customers });
    },
);

export const getTotalCustomersHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const total = await getTotalCustomers(userId);
        return res.json({ success: true, total });
    },
);

export const getCustomerByIdHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const { id } = req.params;
        const customer = await getCustomerById(id, userId);
        if (!customer) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        return res.json({ success: true, data: customer });
    },
);

export const updateCustomerHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const { id } = req.params;
        const validated = updateCustomerSchema.parse(req.body);
        const customer = await updateCustomer(id, userId, validated);
        if (customer == null) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        return res.json({ success: true, data: customer });
    },
);

export const deleteCustomerHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const { id } = req.params;
        const customer = await deleteCustomer(id, userId);
        if (!customer) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        return res.json({ success: true, message: "Customer deleted" });
    },
);

export const updateUserProfileHandler = catchErrors(
    async (req: Request, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const validated = updateUserProfileSchema.parse(req.body);
        const updatedUser = await updateUserProfile(userId, validated);
        return res.json({ success: true, data: updatedUser });
    },
);

export const getCustomerStatementHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, 401, "Unauthorized");
    const { id } = req.params;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
    const data = await getCustomerStatement(id, userId, startDate, endDate);
    return res
        .status(200)
        .json({ data, message: "Customer statement fetched" });
});
