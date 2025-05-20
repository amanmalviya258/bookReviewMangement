import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const healthCheck = asyncHandler(async (req, res) => {
  try {
    
    const state = mongoose.connection.readyState;

    const states = {
      0: "🔴 Disconnected",
      1: "🟢 Connected",
      2: "🟡 Connecting",
      4: "🟠 Disconnecting",
    };

    const client = mongoose.connection.client;

    const data = {
      status: states[state],
      db_name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      poolSize: client?.options?.maxPoolSize || "default",
      topologyType: client?.topology?.description?.type || "unknown",
      uptimeSeconds: process.uptime().toFixed(2),
    };

    const response = new ApiResponse({
      statusCode: state === 1 ? 200 : 500,
      success: state === 1,
      message: state === 1 ? "MongoDB is healthy" : "MongoDB is not connected properly",
      data,
      meta: {
        dbStateCode: state,
        dbStateDescription: states[state],
        timestamp: new Date().toISOString(),
      },
    });

    return ApiResponse.send(res, response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Health check failed", [error.message]);
  }
});

export { healthCheck }; 