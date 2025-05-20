import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler.js"; //globalHandler file import
import { asyncHandler } from "./utils/asyncHandler.js";

const app = express();

// Request logging middleware
// app.use((req, res, next) => {
//     console.log(`Request received: ${req.method} ${req.url}`);
//     console.log('Headers:', req.headers);
//     console.log('Body:', req.body);
//     next();
// });

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow all origins for development
    credentials: true,
    methods: "GET,HEAD,PUT,POST,DELETE",
  }),
);


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(express.static("public"));

//routes
import healthCheckerRouter from "./routes/health.route.js";
import userRouter from "./routes/user.route.js";
import bookRouter from "./routes/book.route.js";

//routes declaration
app.use("/api/v1", healthCheckerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

// Global error handler should be last
app.use(globalErrorHandler);

export { app };
