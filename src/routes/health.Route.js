import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";


const router = express.Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    try {
      // Check system health
      const state = mongoose.connection.readyState;
   // console.log("MongoDB connection state:", state);
    
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

   // console.log("Health check data:", data);

    const response = new ApiResponse({
      statusCode: state === 1 ? 200 : 500,
      success: state === 1,
      message:
        state === 1
          ? "MongoDB is healthy"
          : "MongoDB is not connected properly",
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
  })
);

export default router;
