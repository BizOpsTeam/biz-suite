import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express } from "express"

const options: swaggerJsdoc.Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
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
        ],

        components: {
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        stock: { type: 'integer' },
                        category: {
                            $ref: '#/components/schemas/ProductCategory'
                        },
                        description: { type: 'string' },
                        images: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/ProductImage'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'price', 'stock', 'categoryId'],
                    properties: {
                        name: { type: 'string' },
                        price: { type: 'number' },
                        stock: { type: 'integer' },
                        categoryId: { type: 'string' },
                        description: { type: 'string' },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string',
                                description: 'Image URL'
                            }
                        }
                    }
                },
                ProductCategory: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                ProductCategoryInput: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' }
                    }
                },
                ProductImage: {
                    type: 'object',
                    properties: {
                        url: { type: 'string' }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ["src/routes/*.ts"],
}

const swaggerDocs = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}