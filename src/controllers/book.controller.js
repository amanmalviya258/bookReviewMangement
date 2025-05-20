import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { Review } from "../models/reviewSchema.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

    if (!rating || !comment) {
      throw new ApiError(400, "Rating and comment are required");
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({
      user: userId,
      book: id
    });

    if (existingReview) {
      throw new ApiError(400, "You have already reviewed this book");
    }

    // Create new review
    const review = await Review.create({
      user: userId,
      rating,
      comment
    });

    // Add review to book
    book.reviews.push(review._id);
    await book.save();

    const response = new ApiResponse({
      statusCode: 201,
      success: true,
      message: "Review added successfully",
      data: {
        review,
        book
      }
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to add review", [error.message]);
  }
});

//-------------------------------------------------------------------------------------


const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      throw new ApiError(400, "Rating and comment are required");
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Find the review directly using the Review model
    const review = await Review.findById(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    // Check if the user owns this review
    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only update your own reviews");
    }

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
      data: review
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to update review", [error.message]);
  }
});

//-------------------------------------------------------------------------------------


const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the review directly using the Review model
    const review = await Review.findById(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    // Check if the user owns this review
    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own reviews");
    }

    // Delete the review
    await Review.findByIdAndDelete(id);

    // Remove the review reference from the book
    await Book.updateOne(
      { reviews: id },
      { $pull: { reviews: id } }
    );

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Review deleted successfully"
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to delete review", [error.message]);
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
