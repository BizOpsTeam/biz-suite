import { Request, Response, NextFunction } from "express";
import {
    createCustomerSchema,
    updateCustomerSchema,
    updateUserProfileSchema,
} from "../zodSchema/user.zodSchema";
import {
    createCustomer,
    getCustomers,
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
    params: async (req, file) => ({
        public_id: `company_logos/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ width: 300, height: 150, crop: "limit" }],
    }),
});
const upload = multer({ storage: logoStorage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

export const uploadLogoHandler = [
    upload.single("logo"),
    catchErrors(async (req: Request, res: Response) => {
        const file = req.file as Express.Multer.File & { path?: string };
        if (!file || !file.path) {
            return res.status(400).json({ success: false, message: "No file uploaded or upload failed." });
        }
        const url = file.path;
        res.json({ success: true, url });
    }),
];

export const createCustomerHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const validated = createCustomerSchema.parse(req.body);
        const customer = await createCustomer(validated);
        res.status(201).json({ success: true, data: customer });
    },
);

export const getCustomersHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const customers = await getCustomers();
        res.json({ success: true, data: customers });
    },
);

export const getCustomerByIdHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const customer = await getCustomerById(id);
        if (customer == null) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        res.json({ success: true, data: customer });
    },
);

export const updateCustomerHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const validated = updateCustomerSchema.parse(req.body);
        const customer = await updateCustomer(id, validated);
        if (customer == null) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        res.json({ success: true, data: customer });
    },
);

export const deleteCustomerHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const customer = await deleteCustomer(id);
        if (customer == null) {
            return res
                .status(404)
                .json({ success: false, message: "Customer not found" });
        }
        res.json({ success: true, message: "Customer deleted" });
    },
);

export const updateUserProfileHandler = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const validated = updateUserProfileSchema.parse(req.body);
        const updatedUser = await updateUserProfile(userId, validated);
        res.json({ success: true, data: updatedUser });
    },
);

export const getCustomerStatementHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, 401, "Unauthorized");
    const { id } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await getCustomerStatement(id, startDate, endDate);
    res.status(200).json({ data, message: "Customer statement fetched" });
});
