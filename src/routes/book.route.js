import { Router } from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  addReview,
  updateReview,
  deleteReview,
  searchBooks
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllBooks);          //checked
router.route("/search").get(searchBooks);    //checked
router.route("/:id").get(getBookById);      //checked 

// Protected routes
router.route("/").post(verifyJWT, createBook);   //checked
router.route("/:id/reviews").post(verifyJWT, addReview);  //checked
router.route("/reviews/:id").put(verifyJWT, updateReview);  //checked
router.route("/reviews/:id").delete(verifyJWT, deleteReview);  //checked

export default router; 