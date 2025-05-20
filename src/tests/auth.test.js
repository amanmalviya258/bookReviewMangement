import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { Review } from '../models/reviewSchema.model.js';

describe('Authentication Tests', () => {
  let testUser;
  const testUserData = {
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'password123'
  };

  beforeAll(async () => {
    
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000, 
    });
  }, 30000); 

  afterAll(async () => {
    
    await User.deleteMany({});
    await mongoose.disconnect();
  }, 30000); 

  beforeEach(async () => {
    
    await User.deleteMany({});
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(testUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', testUserData.username);
      expect(response.body.data).toHaveProperty('email', testUserData.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      
      await request(app)
        .post('/api/v1/users/register')
        .send(testUserData);

      
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(testUserData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveLength(4); 
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      
      await request(app)
        .post('/api/v1/users/register')
        .send(testUserData);
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUserData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUserData.password
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/logout', () => {
    let accessToken;

    beforeEach(async () => {
      
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
      }
    });

    it('should logout user successfully', async () => {
      if (!accessToken) {
        throw new Error('Login failed - no access token available');
      }

      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should not logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 