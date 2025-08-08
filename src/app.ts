import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import notFoundHandler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHandler";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./swagger";
import salesRoutes from "./routes/sales.route";
import productsRoutes from "./routes/products.routes";
import { authenticateUser } from "./middlewares/authenticateUser";
import invoicesRoutes from "./routes/invoices.routes";
import userRoutes from "./routes/user.routes";
import userProfileRoutes from "./routes/userProfile.routes";
import analyticsRoutes from "./routes/analytics.routes";
import receiptsRoutes from "./routes/receipts.routes";
import expenseCategoryRoutes from "./routes/expenseCategory.routes";
import expenseRoutes from "./routes/expense.routes";
import budgetRoutes from "./routes/budget.routes";
import campaignRoutes from "./routes/campaign.routes";
import cron from "node-cron";
import { processRecurringExpenses } from "./services/expense.service";
import stockAdjustmentRoutes from "./routes/stockAdjustment.routes";
import customerGroupRoutes from "./routes/customerGroup.routes";
import productCategoryRoutes from "./routes/productCategory.routes";
import reminderRoutes from "./routes/reminder.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();
//----------------cors config-----------------------//
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://bizopsclient.vercel.app"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);
//::todo update the cors to match expected fronted endpoints

app.use(express.json());
app.use(cookieParser());

//setup Swagger docs
setupSwagger(app);

//-------------routes-------------------------//

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "Hello World" });
});

app.get("/healthz", (_req: Request, res: Response) => {
    res.status(200).json({ message: "OK" });
});

//-------auth routes---------//
app.use("/auth", authRoutes);

//---admin route-----//
app.use("/admin", adminRoutes);

//-------sales routes---------//
app.use("/sales", authenticateUser, salesRoutes);
app.use("/invoices", authenticateUser, invoicesRoutes);
//-------product routes---------//
app.use("/products", authenticateUser, productsRoutes);
app.use("/receipts", authenticateUser, receiptsRoutes);
app.use("/expense-categories", authenticateUser, expenseCategoryRoutes);
app.use("/expenses", authenticateUser, expenseRoutes);
app.use("/budgets", authenticateUser, budgetRoutes);
app.use("/stock-adjustments", authenticateUser, stockAdjustmentRoutes);
app.use("/customer-groups", authenticateUser, customerGroupRoutes);
app.use("/product-categories", authenticateUser, productCategoryRoutes);

//-------user routes---------//
app.use("/users", authenticateUser, userRoutes);

//-------user profile routes (accessible to all authenticated users)---------//
app.use("/users", authenticateUser, userProfileRoutes);

//-------AI routes---------//
app.use("/ai", authenticateUser, aiRoutes);

//-------analytics routes---------//
app.use("/analytics", authenticateUser, analyticsRoutes);

//-------campaign routes---------//
app.use("/campaigns", authenticateUser, campaignRoutes);

//-------reminder routes---------//
app.use("/reminders", authenticateUser, reminderRoutes);

// Schedule recurring expense processing every day at midnight
cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Processing recurring expenses...");
    await processRecurringExpenses();
    console.log("[CRON] Recurring expenses processed.");
});

// Global error handler for invalid JSON
app.use((err: any, _req: any, res: any, next: any) => {
    if (
        err instanceof SyntaxError &&
        typeof (err as any).status === "number" &&
        (err as any).status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            message: "Invalid JSON: Please check your request body syntax.",
        });
    }
    next(err);
});

// Not found handler for unmatched routes
app.use(notFoundHandler);

// Error handling middleware 
app.use(errorHandler);

export default app;
