# Book Review Management System

A RESTful API for managing books and their reviews, built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Book management (CRUD operations)
- Review system with validation
- Search functionality
- Pagination support

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/refresh-token` - Refresh access token

### Books
- `POST /api/v1/books` - Create a new book (Protected)
- `GET /api/v1/books` - Get all books (with pagination)
- `GET /api/v1/books/:id` - Get book by ID
- `GET /api/v1/books/search` - Search books by title or author

### Reviews
- `POST /api/v1/books/:id/reviews` - Add a review to a book (Protected)
- `PUT /api/v1/books/reviews/:id` - Update a review (Protected)
- `DELETE /api/v1/books/reviews/:id` - Delete a review (Protected)

## Review System Rules

### Adding Reviews
- Users must be authenticated to add reviews
- One review per user per book is allowed
- Rating must be between 1 and 5
- Comment is optional but must be less than 1000 characters
- Required fields: rating

### Updating Reviews
- Users can only update their own reviews
- At least one field (rating or comment) must be provided
- Rating must be between 1 and 5
- Comment must be less than 1000 characters
- Review ID must be valid

### Deleting Reviews
- Users can only delete their own reviews
- Review ID must be valid

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": [
    {
      "field": "field_name",
      "message": "Error description"
    }
  ]
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

For testing, create a `.env.test` file with:

```env
MONGODB_URI_TEST=mongodb://localhost:27017/bookReviewTest
ACCESS_TOKEN_SECRET=test_access_token_secret_key_123
REFRESH_TOKEN_SECRET=test_refresh_token_secret_key_456
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the server:
   ```bash
   npm start
   ```

## Testing

Run tests with:
```bash
npm test
```

## Error Handling

The API uses a consistent error handling format:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Input validation
- Rate limiting
- CORS enabled

## Dependencies

- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- express-rate-limit
- jest (for testing)
- supertest (for testing)


##  Architecture

### Tech Stack
- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Documentation**: RESTful endpoints

### Project Structure
```
src/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middlewares/        # Custom middlewares
├── models/            # Database models
├── routes/            # API routes
├── utils/             # Utility functions
└── app.js            # Application entry point
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bookReviewManagement
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bookReviewDB

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

4. Start the server:
```bash
npm run dev
```

##  API Endpoints

### Authentication Endpoints

#### Register User
- **URL**: `/api/v1/users/register`
- **Method**: `POST`
- **Auth**: Not Required
- **Body**:
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "password": "password123"
}
```

#### Login User
- **URL**: `/api/v1/users/login`
- **Method**: `POST`
- **Auth**: Not Required
- **Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Logout User
- **URL**: `/api/v1/users/logout`
- **Method**: `POST`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`

### Book Endpoints

#### Get All Books
- **URL**: `/api/v1/books`
- **Method**: `GET`
- **Auth**: Not Required
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `author` (optional)
  - `genre` (optional)

#### Search Books
- **URL**: `/api/v1/books/search`
- **Method**: `GET`
- **Auth**: Not Required
- **Query Parameters**:
  - `title` (optional)
  - `author` (optional)
  - `page` (default: 1)
  - `limit` (default: 10)

#### Get Book by ID
- **URL**: `/api/v1/books/:id`
- **Method**: `GET`
- **Auth**: Not Required
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)

#### Create Book
- **URL**: `/api/v1/books`
- **Method**: `POST`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Genre",
    "description": "Book description"
}
```

### Review Endpoints

#### Add Review
- **URL**: `/api/v1/books/:id/reviews`
- **Method**: `POST`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "rating": 5,
    "comment": "Great book!"
}
```

#### Update Review
- **URL**: `/api/v1/books/reviews/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "rating": 4,
    "comment": "Updated review"
}
```

#### Delete Review
- **URL**: `/api/v1/books/reviews/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Headers**: `Authorization: Bearer <token>`

##  Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Token Types
1. **Access Token**: Short-lived token for regular API access
2. **Refresh Token**: Long-lived token for obtaining new access tokens

##  Data Models

### User Model
```javascript
{
    username: String,
    email: String,
    fullName: String,
    password: String,
    refreshToken: String
}
```

### Book Model
```javascript
{
    title: String,
    author: String,
    genre: String,
    description: String,
    reviews: [Review],
    averageRating: Number
}
```

### Review Model
```javascript
{
    user: ObjectId,
    rating: Number,
    comment: String
}
```

##  Response Format

All API responses follow this format:
```json
{
    "statusCode": 200,
    "success": true,
    "message": "Success message",
    "data": {},
    "error": [],
    "meta": {
        "timestamp": "2024-03-20T10:00:00.000Z",
        "path": "/api/v1/endpoint",
        "method": "GET"
    }
}
```

##  Error Handling

The API uses a centralized error handling system with custom error classes:
- `ApiError`: Custom error class for API-specific errors
- `ValidationError`: For input validation errors
- `AuthenticationError`: For authentication-related errors

##  Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

##  Testing

Run tests using:
```bash
npm test
```

##  Design Decisions & Assumptions

### Design Decisions

1. **Separate Review Model**
   - Reviews are stored in a separate collection instead of being embedded in the Book model
   - This allows for better scalability and independent review operations
   - Enables efficient querying and updating of reviews

2. **JWT Authentication**
   - Chosen over session-based auth for statelessness and scalability
   - Dual token system (access + refresh) for better security
   - Access tokens are short-lived (1 day) to minimize security risks
   - Refresh tokens are long-lived (10 days) for better user experience

3. **Pagination Implementation**
   - Offset-based pagination instead of cursor-based
   - Default limit of 10 items per page
   - Includes total count and total pages in response
   - Allows for flexible page size through limit parameter

4. **Error Handling**
   - Centralized error handling with custom error classes
   - Consistent error response format
   - Detailed error messages for debugging
   - Field-level validation errors

5. **Search Implementation**
   - Case-insensitive search using MongoDB regex
   - Search across multiple fields (title, author)
   - Pagination support for search results
   - No full-text search to keep implementation simple

### Assumptions

1. **User Management**
   - One user can have multiple reviews
   - Users can only review a book once
   - Users can only modify their own reviews
   - Email addresses are unique

2. **Book Management**
   - Books can have multiple reviews
   - Books must have basic information (title, author, genre, description)
   - Average rating is calculated from all reviews
   - Books can exist without reviews

3. **Review System**
   - Ratings are on a scale of 1-5
   - Reviews must include both rating and comment
   - Reviews cannot be anonymous
   - Reviews are immutable once created (can only be updated or deleted)

4. **Performance**
   - Database will handle up to 100,000 books
   - Each book can have up to 1000 reviews
   - Search operations should complete within 1 second
   - API response time should be under 200ms

##  Database Schema

### Collections

#### Users Collection
```javascript
{
    _id: ObjectId,
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}
```

#### Books Collection
```javascript
{
    _id: ObjectId,
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
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    reviews: [{
        type: ObjectId,
        ref: 'Review'
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}
```

#### Reviews Collection
```javascript
{
    _id: ObjectId,
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    book: {
        type: ObjectId,
        ref: 'Book',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}
```

### Indexes
- Users: username, email, fullName
- Books: title, author, genre
- Reviews: user, book
- Compound indexes for common queries

### Relationships
- One-to-Many: User to Reviews
- One-to-Many: Book to Reviews
- Many-to-One: Review to User
- Many-to-One: Review to Book

### Data Validation
- Required fields are enforced at the schema level
- Rating range (1-5) is enforced
- Unique constraints on username and email
- Trim and lowercase transformations where appropriate
- Timestamps for auditing
