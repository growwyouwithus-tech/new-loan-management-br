# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Update the `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/loan-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### 4. Seed Database (Optional)
Populate the database with sample data:
```bash
npm run seed
```

This creates default users:
- **Admin**: admin@loanmanagement.com / admin123
- **Verifier**: verifier@loanmanagement.com / verifier123
- **Collections**: collections@loanmanagement.com / collections123
- **Shopkeeper 1**: shopkeeper1@example.com / shop123
- **Shopkeeper 2**: shopkeeper2@example.com / shop123

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will be available at: `http://localhost:5000`

## Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanmanagement.com","password":"admin123"}'
```

**Get Loans (with token):**
```bash
curl -X GET http://localhost:5000/api/loans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman or Thunder Client
1. Import the API endpoints
2. Set the base URL: `http://localhost:5000/api`
3. Login to get access token
4. Add token to Authorization header for protected routes

## API Documentation

Visit `http://localhost:5000` for API information and available endpoints.

## Connecting Frontend Apps

Update the frontend `.env` files:

**Frontend App:**
```env
VITE_API_URL=http://localhost:5000/api
```

**User App:**
```env
VITE_API_URL=http://localhost:5000/api
```

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in `.env` to a different port
- Kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### CORS Errors
- Update CORS_ORIGIN in `.env` with your frontend URLs
- Restart the server after changes

## Next Steps

1. Start the frontend applications
2. Test the complete workflow
3. Customize the API as needed
4. Deploy to production

## Support

For issues or questions, check the README.md file for detailed documentation.
