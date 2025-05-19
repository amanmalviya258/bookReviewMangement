import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(req.body)

    if (!token) {
      throw new ApiError(401, "Authentication required", [
        { message: "No access token provided" }
      ]);
    }

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken");

      if (!user) {
        throw new ApiError(401, "Invalid access token", [
          { message: "User not found" }
        ]);
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, "Invalid token", [
          { message: "Invalid token format" }
        ]);
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Token expired", [
          { message: "Please login again" }
        ]);
      }
      throw new ApiError(401, "Authentication failed", [jwtError.message]);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Authentication failed", [error.message]);
  }
});
