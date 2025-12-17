# Loan Management System - Backend API

A comprehensive Node.js/Express.js backend for managing loans, customers, shopkeepers, payments, and notifications.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Roles**: Admin, Verifier, Collections Officer, Shopkeeper
- **Loan Management**: Complete loan lifecycle from application to completion
- **Customer Management**: KYC verification and customer data management
- **Shopkeeper Management**: Shopkeeper registration and verification
- **Payment Processing**: EMI collection and payment tracking
- **Notifications**: Real-time notification system for all stakeholders
- **File Upload**: Document upload support for KYC and loan documents

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Validation**: Express Validator

## Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/loan-management
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

3. **Start MongoDB**:
```bash
# Make sure MongoDB is running on your system
mongod
```

4. **Seed the database** (optional):
```bash
npm run seed
```

This will create default users:
- Admin: `admin@loanmanagement.com` / `admin123`
- Verifier: `verifier@loanmanagement.com` / `verifier123`
- Collections: `collections@loanmanagement.com` / `collections123`
- Shopkeeper 1: `shopkeeper1@example.com` / `shop123`
- Shopkeeper 2: `shopkeeper2@example.com` / `shop123`

5. **Start the server**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Loans (`/api/loans`)
- `POST /` - Create loan application
- `GET /` - Get all loans (with filters)
- `GET /statistics` - Get loan statistics
- `GET /:id` - Get loan by ID
- `PUT /:id/status` - Update loan status
- `PUT /:id/kyc` - Update KYC status
- `POST /:id/payment` - Collect payment
- `POST /:id/penalty` - Apply penalty
- `PUT /:id/due-date` - Set next due date
- `DELETE /:id` - Delete loan

### Customers (`/api/customers`)
- `POST /` - Create customer
- `GET /` - Get all customers
- `GET /:id` - Get customer by ID
- `PUT /:id` - Update customer
- `DELETE /:id` - Delete customer
- `PUT /:id/kyc` - Update customer KYC

### Shopkeepers (`/api/shopkeepers`)
- `POST /` - Register shopkeeper
- `GET /` - Get all shopkeepers
- `GET /statistics` - Get shopkeeper statistics
- `GET /:id` - Get shopkeeper by ID
- `PUT /:id` - Update shopkeeper
- `DELETE /:id` - Delete shopkeeper
- `PUT /:id/kyc` - Update shopkeeper KYC

### Notifications (`/api/notifications`)
- `POST /` - Create notification
- `GET /` - Get all notifications
- `GET /unread-count` - Get unread count
- `GET /:id` - Get notification by ID
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification
- `DELETE /` - Clear all notifications

### Payments (`/api/payments`)
- `POST /` - Create payment record
- `GET /` - Get all payments
- `GET /statistics` - Get payment statistics
- `GET /loan/:loanId` - Get payments by loan
- `GET /:id` - Get payment by ID
- `PUT /:id` - Update payment
- `DELETE /:id` - Delete payment

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

Different endpoints require different roles:
- **Admin**: Full access to all endpoints
- **Verifier**: Can verify loans and KYC
- **Collections**: Can collect payments and manage active loans
- **Shopkeeper**: Can create loan applications and view their own loans

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Database Models

### User
- Authentication and user management
- Roles: admin, verifier, collections, shopkeeper

### Loan
- Complete loan information
- Status tracking (Pending → Verified → Approved → Active → Paid)
- Payment history
- Penalty tracking

### Customer
- Customer information
- KYC status
- Linked loans

### Shopkeeper
- Shopkeeper details
- KYC verification
- Linked loans

### Notification
- System notifications
- Role-based targeting
- Read/unread status

### Payment
- Payment records
- Transaction tracking
- EMI details

## Development

### Project Structure
```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Utility scripts
├── utils/           # Helper functions
├── uploads/         # File uploads
├── .env.example     # Environment template
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Helmet for HTTP headers security
- CORS configuration
- Rate limiting
- Input validation
- File upload restrictions

## License

ISC
