import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const globalErrorHandler = (err, req, res, next) => {
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

  // Unhandled/unexpected errors
  const response = new ApiResponse({
    statusCode: 500,
    success: false,
    message: "Internal Server Error",
    error: err.message,
    meta: {
      path: req.originalUrl,
      method: req.method,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });

  return ApiResponse.send(res, response);
};

export default globalErrorHandler;