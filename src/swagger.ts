import swaggerJsdocLib from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdocLib.Options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Biz-Suite API Documentation",
            version: "1.0.0",
            description: "API documentation for Biz-Suite",
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Development server",
            },
            {
                url: "https://biz-suite-voarww.fly.dev",
                description: "Deployed Server",
            },
        ],
        components: {
            schemas: {
                Product: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "integer" },
                        category: {
                            $ref: "#/components/schemas/ProductCategory",
                        },
                        description: { type: "string" },
                        images: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/ProductImage",
                            },
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                ProductInput: {
                    type: "object",
                    required: ["name", "price", "stock", "categoryId"],
                    properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "integer" },
                        categoryId: { type: "string" },
                        description: { type: "string" },
                        images: {
                            type: "array",
                            items: {
                                type: "string",
                                description: "Image URL",
                            },
                        },
                        cost: {
                            type: "number",
                            description: "Cost per unit (COGS)",
                            example: 10.5,
                        },
                    },
                },
                ProductCategory: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                ProductCategoryInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                    },
                },
                ProductImage: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                },
                RegisterInput: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "johndoe@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "StrongP@ssw0rd",
                        },
                        role: {
                            type: "string",
                            enum: ["admin", "worker", "user"],
                            example: "admin",
                            description: "Role of the user",
                        },
                    },
                },
                LoginInput: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "johndoe@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "StrongP@ssw0rd",
                        },
                    },
                },
                ForgotPasswordInput: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "johndoe@example.com",
                        },
                    },
                },
                ResetPasswordInput: {
                    type: "object",
                    required: ["password"],
                    properties: {
                        password: {
                            type: "string",
                            format: "password",
                            example: "NewStrongP@ssw0rd",
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "12345",
                        },
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            example: "johndoe@example.com",
                        },
                        role: {
                            type: "string",
                            enum: ["admin", "worker", "user"],
                            example: "admin",
                            description: "Role of the user",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                SaleInput: {
                    type: "object",
                    required: [
                        "customerId",
                        "items",
                        "paymentMethod",
                        "channel",
                    ],
                    properties: {
                        customerId: { type: "string" },
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/SaleItemInput",
                            },
                        },
                        paymentMethod: {
                            type: "string",
                            enum: ["CASH", "CREDIT", "CARD", "OTHER"],
                        },
                        channel: { type: "string", example: "in-store" },
                        notes: { type: "string" },
                    },
                },
                SaleItemInput: {
                    type: "object",
                    required: ["productId", "quantity", "price"],
                    properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer" },
                        price: { type: "number" },
                        discount: { type: "number" },
                        tax: { type: "number" },
                    },
                },
                Sale: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        customerId: { type: "string" },
                        channel: { type: "string" },
                        paymentMethod: { type: "string" },
                        discount: { type: "number" },
                        taxAmount: { type: "number" },
                        totalAmount: { type: "number" },
                        status: { type: "string" },
                        notes: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                SalesStats: {
                    type: "object",
                    properties: {
                        period: {
                            type: "string",
                            description:
                                "The period (date, week, month, or year)",
                        },
                        total: {
                            type: "number",
                            description: "Total sales amount for the period",
                        },
                    },
                },
                Invoice: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        customerName: { type: "string" },
                        totalAmount: { type: "number" },
                        status: { type: "string" },
                        dueDate: { type: "string", format: "date-time" },
                        createdAt: { type: "string", format: "date-time" },
                        // Add more fields as needed based on your actual invoice model
                    },
                },
                ExpenseCategory: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ExpenseCategoryInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                    },
                },
                Expense: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        ownerId: { type: "string" },
                        amount: { type: "number" },
                        categoryId: { type: "string" },
                        category: {
                            $ref: "#/components/schemas/ExpenseCategory",
                        },
                        description: { type: "string" },
                        date: { type: "string", format: "date" },
                        isRecurring: { type: "boolean" },
                        recurrenceType: {
                            type: "string",
                            enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
                        },
                        nextDueDate: { type: "string", format: "date" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ExpenseInput: {
                    type: "object",
                    required: ["amount", "categoryId", "date"],
                    properties: {
                        amount: { type: "number" },
                        categoryId: { type: "string" },
                        description: { type: "string" },
                        date: { type: "string", format: "date" },
                        isRecurring: { type: "boolean" },
                        recurrenceType: {
                            type: "string",
                            enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
                        },
                        nextDueDate: { type: "string", format: "date" },
                    },
                },
                StockAdjustment: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        productId: { type: "string" },
                        product: { $ref: "#/components/schemas/Product" },
                        userId: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                        quantityChange: { type: "integer" },
                        reason: { type: "string" },
                        note: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                StockAdjustmentInput: {
                    type: "object",
                    required: ["productId", "quantityChange", "reason"],
                    properties: {
                        productId: { type: "string" },
                        quantityChange: { type: "integer" },
                        reason: { type: "string" },
                        note: { type: "string" },
                    },
                },
                CustomerGroup: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        ownerId: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CustomerGroupInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                    },
                },
                CustomerGroupAssignInput: {
                    type: "object",
                    required: ["groupIds"],
                    properties: {
                        groupIds: { type: "array", items: { type: "string" } },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["src/routes/*.ts", "src/docs/routes/*.ts"],
};

const swaggerSpec = swaggerJsdocLib(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
