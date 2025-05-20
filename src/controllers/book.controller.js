import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { Review } from "../models/reviewSchema.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

//-------------------------------------------------------------------------------------


const createBook = asyncHandler(async (req, res) => {
  try {
    const { title, author, genre, description } = req.body;

    if (!title || !author || !genre || !description) {
      throw new ApiError(400, "All fields are required", [
        { field: "title", message: "Title is required" },
        { field: "author", message: "Author is required" },
        { field: "genre", message: "Genre is required" },
        { field: "description", message: "Description is required" },
      ]);
    }

    const book = await Book.create({
      title,
      author,
      genre,
      description,
    });

    const response = new ApiResponse({
      statusCode: 201,
      success: true,
      message: "Book added successfully",
      data: book,
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to add book", [error.message]);
  }
});

//-------------------------------------------------------------------------------------


const getAllBooks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const filterOptions = {};

    // Build filter conditions
    const filterConditions = [];
    if (author) {
      filterConditions.push({ author: { $regex: author, $options: "i" } });
    }
    if (genre) {
      filterConditions.push({ genre: { $regex: genre, $options: "i" } });
    }

    // Apply filters if any exist
    if (filterConditions.length > 0) {
      filterOptions.$and = filterConditions;
    }

    const books = await Book.find(filterOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filterOptions);

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Books fetched successfully",
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalBooks: total,
      },
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch books", [error.message]);
  }
});

//-------------------------------------------------------------------------------------


const getBookById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    // Get paginated reviews
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const reviews = book.reviews.slice(startIndex, endIndex);

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Book fetched successfully",
      data: {
        ...book.toObject(),
        reviews,
        totalReviews: book.reviews.length,
        currentPage: page,
        totalPages: Math.ceil(book.reviews.length / limit),
      },
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch book", [error.message]);
  }
});

//-------------------------------------------------------------------------------------

const addReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
        error: [{ field: "rating", message: "Rating is required" }]
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating",
        error: [{ field: "rating", message: "Rating must be between 1 and 5" }]
      });
    }

    // Validate comment length
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long",
        error: [{ field: "comment", message: "Comment must be less than 1000 characters" }]
      });
    }

    // Find book and check if it exists
    const book = await Book.findById(id).populate('reviews');
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      user: userId,
      book: id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book",
        error: [{ message: "Only one review per book is allowed" }]
      });
    }

    // Double check in book's reviews array
    const hasReviewed = book.reviews.some(review => 
      review.user && review.user.toString() === userId.toString()
    );

    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book",
        error: [{ message: "Only one review per book is allowed" }]
      });
    }

    // Create new review
    const review = await Review.create({
      user: userId,
      book: id,
      rating,
      comment
    });

    // Add review to book
    book.reviews.push(review._id);
    await book.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { review }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: [error.message]
    });
  }
});

//-------------------------------------------------------------------------------------


const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
        error: [{ message: "Please provide a valid review ID" }]
      });
    }

    // Validate required fields
    if (!rating && !comment) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
        error: [{ message: "Please provide either rating or comment to update" }]
      });
    }

    // Validate rating range if rating is provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Invalid rating",
          error: [{ field: "rating", message: "Rating must be between 1 and 5" }]
        });
      }
    }

    // Validate comment length if comment is provided
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long",
        error: [{ field: "comment", message: "Comment must be less than 1000 characters" }]
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review"
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: [error.message]
    });
  }
});

//-------------------------------------------------------------------------------------


const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
        error: [{ message: "Please provide a valid review ID" }]
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review"
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: [error.message]
    });
  }
});

//-------------------------------------------------------------------------------------

const searchBooks = asyncHandler(async (req, res) => {
  try {
    const { title, author, page = 1, limit = 10 } = req.query;

    if (!title && !author) {
      throw new ApiError(400, "At least one search parameter (title or author) is required");
    }

    const searchQuery = {
      $or: []
    };

    if (title) {
      searchQuery.$or.push({ title: new RegExp(title, "i") });
    }
    if (author) {
      searchQuery.$or.push({ author: new RegExp(author, "i") });
    }

    const books = await Book.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(searchQuery);

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Search completed successfully",
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalBooks: total,
      },
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Search failed", [error.message]);
  }
});

export {
  createBook,
  getAllBooks,
  getBookById,
  addReview,
  updateReview,
  deleteReview,
  searchBooks,
};
