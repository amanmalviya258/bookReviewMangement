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

### System Architecture Diagram
For a detailed visual representation of the system architecture, please visit:
[System Architecture Diagram](https://app.eraser.io/workspace/DjL400jlioSvPkPR7Vji?origin=share)

### Data Modeling Diagram
For a detailed visual representation of data modeling and schema blueprint, please visit:
[Data Modeling Diagram](https://app.eraser.io/workspace/AjkfnwCpqqlAERn07uC3?origin=share)


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
