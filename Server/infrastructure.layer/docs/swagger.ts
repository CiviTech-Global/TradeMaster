import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TradeMaster API",
      version: "1.0.0",
      description: "Peer-to-peer marketplace platform API",
      contact: {
        name: "TradeMaster Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            firstname: { type: "string" },
            lastname: { type: "string" },
            email: { type: "string", format: "email" },
            avatar: { type: "string", nullable: true },
            phone: { type: "string", nullable: true },
            bio: { type: "string", nullable: true },
          },
        },
        Business: {
          type: "object",
          properties: {
            id: { type: "integer" },
            owner: { type: "integer" },
            title: { type: "string" },
            longitude: { type: "number" },
            latitude: { type: "number" },
            address: { type: "string" },
            emails: { type: "array", items: { type: "string" } },
            phones: { type: "array", items: { type: "string" } },
            is_active: { type: "boolean" },
            logo: { type: "string" },
            description: { type: "string", nullable: true },
            category_id: { type: "integer", nullable: true },
            cover_image: { type: "string", nullable: true },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            business_id: { type: "integer" },
            category_id: { type: "integer", nullable: true },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            price: { type: "number" },
            currency: { type: "string" },
            stock_quantity: { type: "integer" },
            is_active: { type: "boolean" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            order_number: { type: "string" },
            buyer_id: { type: "integer" },
            business_id: { type: "integer" },
            status: { type: "string", enum: ["pending", "confirmed", "in_transit", "delivered", "cancelled"] },
            total_amount: { type: "number" },
            currency: { type: "string" },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "integer" },
            sender_id: { type: "integer" },
            receiver_id: { type: "integer" },
            content: { type: "string" },
            is_read: { type: "boolean" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer" },
            reviewer_id: { type: "integer" },
            business_id: { type: "integer" },
            product_id: { type: "integer", nullable: true },
            order_id: { type: "integer", nullable: true },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./presentation.layer/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TradeMaster API Documentation",
  }));

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
