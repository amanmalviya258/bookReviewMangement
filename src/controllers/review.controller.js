const addReview = asyncHandler(async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
        error: [{ field: "rating", message: "Rating is required" }]
      });
    }

    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating",
        error: [{ field: "rating", message: "Rating must be between 1 and 5" }]
      });
    }

    
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long",
        error: [{ field: "comment", message: "Comment must be less than 1000 characters" }]
      });
    }

    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    
    const existingReview = await Review.findOne({
      book: bookId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book",
        error: [{ message: "Only one review per book is allowed" }]
      });
    }

    const review = await Review.create({
      book: bookId,
      user: userId,
      rating,
      comment
    });

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

const updateReview = asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
        error: [{ message: "Please provide a valid review ID" }]
      });
    }

    
    if (!rating && !comment) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
        error: [{ message: "Please provide either rating or comment to update" }]
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating",
        error: [{ field: "rating", message: "Rating must be between 1 and 5" }]
      });
    }

   
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long",
        error: [{ field: "comment", message: "Comment must be less than 1000 characters" }]
      });
    }

    const review = await Review.findById(reviewId);
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
      reviewId,
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

const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;


    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
        error: [{ message: "Please provide a valid review ID" }]
      });
    }

    const review = await Review.findById(reviewId);
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

    await Review.findByIdAndDelete(reviewId);

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