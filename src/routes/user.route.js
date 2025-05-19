import { Router } from "express";
import {
  logOutUser,
  loginUser,
  registerUser,
  refreshAccessToken,
  updateAccountDetails,
  changeCurrentPassword,
  getCurrentUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/delete").delete(verifyJWT, deleteUser);

export default router;
