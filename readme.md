# Book Review Management System

A RESTful API for managing books and their reviews, built with Node.js, Express, and MongoDB.

### System Architecture Diagram

For a detailed visual representation of the system architecture, please visit:
[System Architecture Diagram](https://app.eraser.io/workspace/DjL400jlioSvPkPR7Vji?origin=share)

### Data Modeling Diagram

For a detailed visual representation of data modeling and schema blueprint, please visit:
[Data Modeling Diagram](https://app.eraser.io/workspace/AjkfnwCpqqlAERn07uC3?origin=share)

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
MONGODB_URI=

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

4. Create a `.env.test` file in the root directory with the following variables for testing:
```env
# Server Configuration
PORT=8000
NODE_ENV=test

# MongoDB Configuration
MONGODB_URI_TEST

# JWT Configuration
ACCESS_TOKEN_SECRET=test_access_token_secret_key_123
REFRESH_TOKEN_SECRET=test_refresh_token_secret_key_456
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Server Check
- `GET /api/v1/health` - Get the status and information about the server and DB connection.

### User
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user [protected route]
- `POST /api/v1/users/refresh-token` - Refresh access token [protected route]
- `POST /api/v1/users/change-password` - Change user password [protected route]
- `GET /api/v1/users/current-user` - Get current user [protected route]
- `PATCH /api/v1/users/update-account` - Update user's details [protected]
- `DELETE /api/v1/users/delete` - Delete current user [protected]


### Books
- `POST /api/v1/books` - Create a new book [protected]
- `GET /api/v1/books` - Get all books (with pagination)
- `GET /api/v1/books/:id` - Get book by ID
- `GET /api/v1/books/search` - Search books by title or author

### Reviews
- `POST /api/v1/books/:id/reviews` - Add a review to a book (Protected)
- `PUT /api/v1/books/reviews/:id` - Update a review (Protected)
- `DELETE /api/v1/books/reviews/:id` - Delete a review (Protected)

## API Response Format

All API responses follow a consistent format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "error": null,
  "meta": {
    "timestamp": "2024-03-21T10:30:00.000Z",
    // Additional metadata
  }
}
```

### Response Fields

- `statusCode`: HTTP status code of the response
- `success`: Boolean indicating if the operation was successful
- `message`: Human-readable message describing the operation result
- `data`: The actual response data (null if no data)
- `error`: Array of error objects (null if no errors)
- `meta`: Additional metadata including timestamp and other contextual information

### Error Response Format

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error",
  "data": null,
  "error": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "meta": {
    "timestamp": "2024-03-21T10:30:00.000Z",
    "path": "/api/v1/users",
    "method": "POST"
  }
}
```

## Error Handling

The API uses a consistent error handling format:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
