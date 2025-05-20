# Book Review Management System

A RESTful API for managing books and their reviews, built with Node.js, Express, and MongoDB.

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
