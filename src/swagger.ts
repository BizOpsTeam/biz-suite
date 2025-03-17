import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express } from "express"

const options: swaggerJsdoc.Options = {
    swaggerDefinition: {
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
    },
    apis: ["src/routes/*.ts"],
}

const swaggerDocs = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}