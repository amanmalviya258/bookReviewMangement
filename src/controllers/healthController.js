import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

export const checkMongoHealth = (req, res, next) => {
  //console.log("Health check endpoint called");
  try {
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
   // console.error("Health check error:", error);
    next(error);
  }
};
