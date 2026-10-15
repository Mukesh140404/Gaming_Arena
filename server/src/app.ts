import express from "express";
import { ApiResponse } from "./lib/ApiResponse";
import routes from "./routes/index"
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";
import cookieParser from "cookie-parser"
import helmet from "helmet";
import { env } from "./config/env";

const app = express();
app.use(helmet());
const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://192.168.1.21:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));


app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Welcome to the Gaming Arena API" }, "API is running")
    );
})

app.get("/healthz", (req, res) => {
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