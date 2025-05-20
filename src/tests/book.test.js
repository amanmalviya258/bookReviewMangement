import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { Review } from '../models/reviewSchema.model.js';

describe('Book Tests', () => {
  let accessToken;
  let testUser;
  let testBook;

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

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
  }, 30000); // 30 second timeout for the hook

  afterAll(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    await mongoose.disconnect();
  }, 30000); // 30 second timeout for the hook

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});

    // Register and login user
    await request(app)
      .post('/api/v1/users/register')
      .send(testUserData);

    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      });

    if (loginResponse.body.success) {
      accessToken = loginResponse.body.data.accessToken;
    } else {
      throw new Error('Login failed - no access token available');
    }
  });

  describe('POST /api/v1/books', () => {
    it('should create a new book successfully', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBookData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', testBookData.title);
      expect(response.body.data).toHaveProperty('author', testBookData.author);
    });

    it('should not create book without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .send(testBookData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveLength(4); // title, author, genre, description
    });
  });

  describe('GET /api/v1/books', () => {
    beforeEach(async () => {
      // Create some test books
      await Book.create([
        testBookData,
        {
          title: 'Another Book',
          author: 'Another Author',
          genre: 'Another Genre',
          description: 'Another Description'
        }
      ]);
    });

    it('should get all books with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(2);
      expect(response.body.data).toHaveProperty('totalPages');
      expect(response.body.data).toHaveProperty('currentPage');
      expect(response.body.data).toHaveProperty('totalBooks');
    });

    it('should filter books by author', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ author: 'Test Author' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].author).toBe('Test Author');
    });

    it('should filter books by genre', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ genre: 'Test Genre' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].genre).toBe('Test Genre');
    });
  });

  describe('GET /api/v1/books/search', () => {
    beforeEach(async () => {
      // Create test books
      await Book.create([
        testBookData,
        {
          title: 'Atomic Habits',
          author: 'James Clear',
          genre: 'Self Help',
          description: 'A book about habits'
        }
      ]);
    });

    it('should search books by title', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ title: 'Atomic' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('Atomic Habits');
    });

    it('should search books by author', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ author: 'James' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].author).toBe('James Clear');
    });

    it('should require at least one search parameter', async () => {
      const response = await request(app)
        .get('/api/v1/books/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = await Book.create(testBookData);
      bookId = book._id;
    });

    it('should get book by id', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', testBookData.title);
      expect(response.body.data).toHaveProperty('author', testBookData.author);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${new mongoose.Types.ObjectId()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return paginated reviews', async () => {
      // Add some reviews
      const book = await Book.findById(bookId);
      const review1 = await Review.create({
        book: bookId,
        user: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Great!'
      });
      const review2 = await Review.create({
        book: bookId,
        user: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good!'
      });
      
      book.reviews = [review1._id, review2._id];
      await book.save();

      const response = await request(app)
        .get(`/api/v1/books/${bookId}?page=1&limit=10`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reviews');
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data.reviews.length).toBe(2);
    });
  });
}); 