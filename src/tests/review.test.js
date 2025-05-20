import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { Review } from '../models/reviewSchema.model.js';

describe('Review Tests', () => {
  let accessToken;
  let testUser;
  let testBook;
  let testReview;

  const testUserData = {
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'password123'
  };

  const testBookData = {
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Test Genre',
    description: 'Test Description'
  };

  const testReviewData = {
    rating: 5,
    comment: 'Great book!'
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    await mongoose.disconnect();
  }, 30000);

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});

    // Register and login user
    const registerResponse = await request(app)
      .post('/api/v1/users/register')
      .send(testUserData);

    if (!registerResponse.body.success) {
      throw new Error('Registration failed');
    }

    testUser = registerResponse.body.data;

    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      });

    if (!loginResponse.body.success) {
      throw new Error('Login failed');
    }

    accessToken = loginResponse.body.data.accessToken;

    // Create a test book
    const bookResponse = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testBookData);

    if (!bookResponse.body.success) {
      throw new Error('Book creation failed');
    }

    testBook = bookResponse.body.data;
  });

  describe('POST /api/v1/books/:id/reviews', () => {
    it('should add a review successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.review).toHaveProperty('rating', testReviewData.rating);
      expect(response.body.data.review).toHaveProperty('comment', testReviewData.comment);
    });

    it('should not add review without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .send(testReviewData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not add review to non-existent book', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${new mongoose.Types.ObjectId()}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not allow multiple reviews from same user', async () => {
      // Add first review
      await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      // Try to add second review
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate rating range', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rating: 6,
          comment: 'Invalid rating'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate minimum rating value', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rating: 0,
          comment: 'Invalid rating'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate comment length', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rating: 5,
          comment: 'a'.repeat(1001) // Assuming max length is 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/books/reviews/:id', () => {
    let reviewId;

    beforeEach(async () => {
      // Add a review
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      if (!response.body.success) {
        throw new Error('Review creation failed');
      }

      reviewId = response.body.data.review._id;
    });

    it('should update review successfully', async () => {
      const updatedReview = {
        rating: 4,
        comment: 'Updated review'
      };

      const response = await request(app)
        .put(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedReview);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rating', updatedReview.rating);
      expect(response.body.data).toHaveProperty('comment', updatedReview.comment);
    });

    it('should not update review without authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/books/reviews/${reviewId}`)
        .send({ rating: 4, comment: 'Updated' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent review', async () => {
      const response = await request(app)
        .put(`/api/v1/books/reviews/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 4, comment: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not allow updating other users reviews', async () => {
      // Create another user and their review
      const anotherUser = await User.create({
        username: 'anotheruser',
        email: 'another@example.com',
        fullName: 'Another User',
        password: 'password123'
      });

      const anotherReview = await Review.create({
        user: anotherUser._id,
        book: testBook._id,
        rating: 5,
        comment: 'Another review'
      });

      const response = await request(app)
        .put(`/api/v1/books/reviews/${anotherReview._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 4, comment: 'Updated' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields on update', async () => {
      const response = await request(app)
        .put(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate minimum rating value on update', async () => {
      const response = await request(app)
        .put(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rating: 0,
          comment: 'Updated review'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate comment length on update', async () => {
      const response = await request(app)
        .put(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rating: 5,
          comment: 'a'.repeat(1001) // Assuming max length is 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/books/reviews/:id', () => {
    let reviewId;

    beforeEach(async () => {
      // Add a review
      const response = await request(app)
        .post(`/api/v1/books/${testBook._id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testReviewData);

      if (!response.body.success) {
        throw new Error('Review creation failed');
      }

      reviewId = response.body.data.review._id;
    });

    it('should delete review successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify review is deleted
      const deletedReview = await Review.findById(reviewId);
      expect(deletedReview).toBeNull();
    });

    it('should not delete review without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/books/reviews/${reviewId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not delete non-existent review', async () => {
      const response = await request(app)
        .delete(`/api/v1/books/reviews/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not allow deleting other users reviews', async () => {
      // Create another user and their review
      const anotherUser = await User.create({
        username: 'anotheruser',
        email: 'another@example.com',
        fullName: 'Another User',
        password: 'password123'
      });

      const anotherReview = await Review.create({
        user: anotherUser._id,
        book: testBook._id,
        rating: 5,
        comment: 'Another review'
      });

      const response = await request(app)
        .delete(`/api/v1/books/reviews/${anotherReview._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid review ID format', async () => {
      const response = await request(app)
        .delete('/api/v1/books/reviews/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed authorization token', async () => {
      const response = await request(app)
        .delete(`/api/v1/books/reviews/${reviewId}`)
        .set('Authorization', 'Bearer malformed.token.here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 