import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add a new book
const addBook = asyncHandler(async (req, res) => {
  try {
    const { title, author, genre, description } = req.body;

    if (!title || !author || !genre || !description) {
      throw new ApiError(400, "All fields are required", [
        { field: "title", message: "Title is required" },
        { field: "author", message: "Author is required" },
        { field: "genre", message: "Genre is required" },
        { field: "description", message: "Description is required" }
      ]);
    }

    const book = await Book.create({
      title,
      author,
      genre,
      description
    });

    const response = new ApiResponse({
      statusCode: 201,
      success: true,
      message: "Book added successfully",
      data: book
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to add book", [error.message]);
  }
});

// Get all books with pagination and filters
const getAllBooks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};

    if (author) query.author = new RegExp(author, 'i');
    if (genre) query.genre = new RegExp(genre, 'i');

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Books fetched successfully",
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalBooks: total
      }
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch books", [error.message]);
  }
});

// Get book by ID
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
        totalPages: Math.ceil(book.reviews.length / limit)
      }
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch book", [error.message]);
  }
});

// Add review to book
const addReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      throw new ApiError(400, "Rating and comment are required");
    }

    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    if (book.hasUserReviewed(userId)) {
      throw new ApiError(400, "You have already reviewed this book");
    }

    book.reviews.push({
      user: userId,
      rating,
      comment
    });

    await book.save();

    const response = new ApiResponse({
      statusCode: 201,
      success: true,
      message: "Review added successfully",
      data: book
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to add review", [error.message]);
  }
});

// Update review
const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      throw new ApiError(400, "Rating and comment are required");
    }

    const book = await Book.findOne({
      "reviews._id": id
    });

    if (!book) {
      throw new ApiError(404, "Review not found");
    }

    const review = book.reviews.id(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only update your own reviews");
    }

    review.rating = rating;
    review.comment = comment;
    await book.save();

    const response = new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
      data: book
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to update review", [error.message]);
  }
});

// Delete review
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const book = await Book.findOne({
      "reviews._id": id
    });

    if (!book) {
      throw new ApiError(404, "Review not found");
    }

    const review = book.reviews.id(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own reviews");
    }

    review.remove();
    await book.save();

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

// Search books
const searchBooks = asyncHandler(async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      throw new ApiError(400, "Search query is required");
    }

    const searchQuery = {
      $or: [
        { title: new RegExp(query, 'i') },
        { author: new RegExp(query, 'i') }
      ]
    };

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
        totalBooks: total
      }
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
  addBook,
  getAllBooks,
  getBookById,
  addReview,
  updateReview,
  deleteReview,
  searchBooks
}; 