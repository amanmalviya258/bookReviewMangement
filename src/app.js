import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";  //globalHandler file import


const app = express();

// Request logging middleware
// app.use((req, res, next) => {
//     console.log(`request received: ${req.method} ${req.url}`);
//     next();
// });

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN, // Allow all origins for development
        credentials: true,
        methods: 'GET,HEAD,PUT,POST,DELETE'
    })
)

app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"})); 
app.use(express.static('public'));

//routes
import healthCheckerRouter from "./routes/health.Route.js"


//routes declaration
app.use("/api/v1", healthCheckerRouter);


// Global error handler should be last
app.use(globalErrorHandler);

export { app };