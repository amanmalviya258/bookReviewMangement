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
router.route("/register").post(registerUser);                              //checked
router.route("/login").post(loginUser);                                    //checked 
router.route("/refresh-token").post(refreshAccessToken);                   //checked

// Protected routes
router.route("/logout").post(verifyJWT, logOutUser);                       //checked
router.route("/update-account").patch(verifyJWT, updateAccountDetails);    //checked
router.route("/change-password").post(verifyJWT, changeCurrentPassword);   //checked
router.route("/current-user").get(verifyJWT, getCurrentUser);              //checked
router.route("/delete").delete(verifyJWT, deleteUser);                     

export default router;
