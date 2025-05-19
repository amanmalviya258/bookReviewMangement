import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const globalErrorHandler = (err, req, res, next) => {
  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    const response = new ApiResponse({
      statusCode: 400,
      success: false,
      message: "Validation Error",
      error: errors,
      meta: {
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
    return ApiResponse.send(res, response);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const response = new ApiResponse({
      statusCode: 409,
      success: false,
      message: "Duplicate Entry",
      error: [{ field, message: `${field} already exists` }],
      meta: {
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
    return ApiResponse.send(res, response);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response = new ApiResponse({
      statusCode: 401,
      success: false,
      message: "Invalid Token",
      error: [{ message: "Invalid authentication token" }],
      meta: {
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
    return ApiResponse.send(res, response);
  }

  // Handle JWT expiration errors
  if (err.name === 'TokenExpiredError') {
    const response = new ApiResponse({
      statusCode: 401,
      success: false,
      message: "Token Expired",
      error: [{ message: "Authentication token has expired" }],
      meta: {
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
    return ApiResponse.send(res, response);
  }

  // Handle custom ApiError instances
  if (err instanceof ApiError) {
    const response = new ApiResponse({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      error: err.errors,
      meta: {
        path: req.originalUrl,
        method: req.method,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
    return ApiResponse.send(res, response);
  }

  // Handle unhandled/unexpected errors
  console.error('Unhandled Error:', err);
  const response = new ApiResponse({
    statusCode: 500,
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    meta: {
      path: req.originalUrl,
      method: req.method,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });

  return ApiResponse.send(res, response);
};

export default globalErrorHandler;