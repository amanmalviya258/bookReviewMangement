import { Schema, mongoose } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    genre: {
      type: String,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: "Review",
    }],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);


bookSchema.pre("save", function(next) {
  if (this.reviews.length > 0) {
    this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }
  next();
});


bookSchema.methods.hasUserReviewed = function(userId) {
  return this.reviews.some(review => review.user.toString() === userId.toString());
};

export const Book = mongoose.model("Book", bookSchema);