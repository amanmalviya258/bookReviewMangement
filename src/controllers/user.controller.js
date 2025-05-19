import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import emailValidator from "node-email-verifier";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefereshToken = async (userID) => {
  try {
    console.log("Generating tokens for userID:", userID);
    const user = await User.findById(userID);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    console.log("Access token generated:", accessToken);
    
    const refreshToken = await user.generateRefreshToken();
    console.log("Refresh token generated:", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const tokens = { accessToken, refreshToken };
    console.log("Returning tokens:", tokens);
    return tokens;
  } catch (error) {
    console.error("Token generation error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to generate tokens", [error.message]);
  }
};

//-----------------------------------------------------------------------------

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;
    console.log("Request body:", req.body);

    if (!req.body) {
      throw new ApiError(400, "Request body is missing");
    }

    // Validation
    if ([fullName, email, username, password].some(field => !field?.trim())) {
      throw new ApiError(400, "All fields are required", [
        { field: "fullName", message: "Full name is required" },
        { field: "email", message: "Email is required" },
        { field: "username", message: "Username is required" },
        { field: "password", message: "Password is required" }
      ]);
    }

    // Email validation
    const isEmail = await emailValidator(email);
    if (!isEmail) {
      throw new ApiError(400, "Invalid email format", [
        { field: "email", message: "Please enter a valid email address" }
      ]);
    }

    // Check existing user
    const [existedUser, existedEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (existedUser) {
      throw new ApiError(409, "Username already exists", [
        { field: "username", message: "This username is already taken" }
      ]);
    }

    if (existedEmail) {
      throw new ApiError(409, "Email already exists", [
        { field: "email", message: "This email is already registered" }
      ]);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id)
      .select("-password -refreshToken");

    if (!createdUser) {
      throw new ApiError(500, "Failed to create user", [
        { message: "User creation failed" }
      ]);
    }

    const response = new ApiResponse({
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: createdUser
    });

    return ApiResponse.send(res, response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Registration failed", [error.message]);
  }
});

//-----------------------------------------------------------------------------

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      throw new ApiError(400, "Login credentials required", [
        { field: "credentials", message: "Username or email is required" }
      ]);
    }

    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (!user) {
      throw new ApiError(404, "User not found", [
        { message: "No user found with these credentials" }
      ]);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials", [
        { message: "Incorrect password" }
      ]);
    }
  
    const tokens = await generateAccessAndRefereshToken(user._id);
    console.log("Received tokens in login:", tokens);

    const loggedInUser = await User.findById(user._id)
      .select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        user: loggedInUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, options)
      .cookie("refreshToken", tokens.refreshToken, options)
      .json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Login failed", [error.message]);
  }
});

//--------------------------------------------------------------------------------------------------
const logOutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 }
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Logged out successfully"
    });

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Logout failed", [error.message]);
  }
});

//-----------------------------------------------------------------------------------

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token required", [
        { message: "No refresh token provided" }
      ]);
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token", [
        { message: "User not found" }
      ]);
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token", [
        { message: "Refresh token is expired or used" }
      ]);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Tokens refreshed successfully",
      data: { accessToken, refreshToken }
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(response);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid refresh token", [
        { message: "Invalid token format" }
      ]);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Refresh token expired", [
        { message: "Please login again" }
      ]);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Token refresh failed", [error.message]);
  }
});

//------------------------------------------------------------

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      throw new ApiError(400, "All password fields are required", [
        { field: "oldPassword", message: "Old password is required" },
        { field: "newPassword", message: "New password is required" },
        { field: "confirmNewPassword", message: "Confirm password is required" }
      ]);
    }

    if (oldPassword === newPassword) {
      throw new ApiError(400, "Invalid password change", [
        { message: "New password must be different from old password" }
      ]);
    }

    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, "Password mismatch", [
        { message: "New password and confirm password do not match" }
      ]);
    }

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid password", [
        { message: "Current password is incorrect" }
      ]);
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Password changed successfully"
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Password change failed", [error.message]);
  }
});

//-----------------------------------------------------------------------
//runs after JWT verification -- protected route
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: req.user
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch user", [error.message]);
  }
});

//-------------------------------------------------------------------------
const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, username } = req.body;

    if (!fullName && !email && !username) {
      throw new ApiError(400, "No fields to update", [
        { message: "Provide at least one field to update" }
      ]);
    }

    if (fullName && fullName.length < 2) {
      throw new ApiError(400, "Invalid name", [
        { field: "fullName", message: "Name must be at least 2 characters long" }
      ]);
    }

    if (email) {
      const isEmail = await emailValidator(email);
      if (!isEmail) {
        throw new ApiError(400, "Invalid email", [
          { field: "email", message: "Please enter a valid email address" }
        ]);
      }

      const existedEmail = await User.findOne({ email });
      if (existedEmail) {
        throw new ApiError(409, "Email already exists", [
          { field: "email", message: "This email is already registered" }
        ]);
      }
    }

    if (username) {
      const existedUsername = await User.findOne({ username });
      if (existedUsername) {
        throw new ApiError(409, "Username already exists", [
          { field: "username", message: "This username is already taken" }
        ]);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
          username,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found", [
        { message: "Failed to update user details" }
      ]);
    }

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Account details updated successfully",
      data: user
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to update account", [error.message]);
  }
});

//-------------------------------------------------------------------------------------

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new ApiError(404, "User not found", [
        { message: "Failed to delete user" }
      ]);
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          _id: deletedUser._id,
          username: deletedUser.username,
          email: deletedUser.email
        }
      }
    });

    // Clear cookies after successful deletion
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to delete user", [error.message]);
  }
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  deleteUser,
};
