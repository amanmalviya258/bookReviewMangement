import { Router } from "express";
import {
  addBook,
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
router.route("/").get(getAllBooks);
router.route("/search").get(searchBooks);
router.route("/:id").get(getBookById);

// Protected routes
router.route("/").post(verifyJWT, addBook);
router.route("/:id/reviews").post(verifyJWT, addReview);
router.route("/reviews/:id").put(verifyJWT, updateReview);
router.route("/reviews/:id").delete(verifyJWT, deleteReview);

export default router; 