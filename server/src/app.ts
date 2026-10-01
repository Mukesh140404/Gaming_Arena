import express from "express";
import { Request,Response } from "express";
import path from "node:path";
import { ApiResponse } from "./lib/ApiResponse.js";
import routes from "./routes/index.js"

const app = express();

app.get("/", (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Welcome to the Gaming Arena API" }, "API is running")
    );
})

app.get("/health", (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { status: "ok" }, "Health check passed")
    );
});

app.use("/api/v1",routes)

app.use((req, res) => {
  throw new Error(`Route ${req.originalUrl} not found`);
});

app.use(errorMiddleware)

export default app;