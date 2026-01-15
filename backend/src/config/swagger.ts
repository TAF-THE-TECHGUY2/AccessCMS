import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Router } from "express";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Access Properties API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts"],
});

export const swaggerRouter = Router().use(
  swaggerUi.serve,
  swaggerUi.setup(spec)
);
