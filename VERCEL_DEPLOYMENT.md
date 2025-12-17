# Backend Deployment Guide - Vercel

## 📋 Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. MongoDB Atlas account (for production database)
3. Git repository (GitHub, GitLab, or Bitbucket)

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment Variables

Before deploying, you need to set up these environment variables in Vercel:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
MAX_FILE_SIZE=5242880
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from backend directory:
```bash
cd backend
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (for first time)
   - What's your project's name? **loan-management-backend**
   - In which directory is your code located? **./**
   - Want to override settings? **N**

5. Add environment variables:
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add CORS_ORIGIN
```

6. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
5. Add Environment Variables (click "Environment Variables"):
   - Add all variables from Step 1
6. Click **"Deploy"**

---

## 🔧 MongoDB Atlas Setup

If you don't have MongoDB Atlas set up:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `your_username`
   - Password: `your_password`
4. Whitelist IP addresses:
   - Network Access → Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0` (for Vercel)
5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `loan-management`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/loan-management?retryWrites=true&w=majority
```

---

## 🔐 Generate Secure JWT Secrets

Use Node.js to generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

---

## 🌐 Update Frontend CORS

After backend is deployed, update your frontend's API URL:

**Frontend `.env` file:**
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

**Backend CORS_ORIGIN:**
```
CORS_ORIGIN=https://your-frontend-url.vercel.app,https://your-user-app-url.vercel.app
```

---

## ✅ Verify Deployment

1. Open your Vercel backend URL: `https://your-backend-url.vercel.app`
2. You should see:
```json
{
  "message": "Loan Management System API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "loans": "/api/loans",
    ...
  }
}
```

3. Test login endpoint:
```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@example.com","password":"Test@123"}'
```

---

## 📝 Important Notes

### 1. File Uploads
Vercel has a read-only filesystem. For file uploads (photos, documents):
- Use cloud storage like **Cloudinary**, **AWS S3**, or **Uploadcare**
- Update multer configuration to use cloud storage

### 2. Cold Starts
- Vercel serverless functions may have cold starts
- First request after inactivity might be slow (2-3 seconds)
- Subsequent requests will be fast

### 3. Function Timeout
- Free tier: 10 seconds timeout
- Pro tier: 60 seconds timeout
- Optimize long-running operations

### 4. Database Connection
- Use connection pooling
- Current mongoose setup is optimized for serverless

### 5. Logs
- View logs in Vercel dashboard
- Runtime → Functions → Select function → Logs

---

## 🔄 Redeploy

### Automatic Redeployment
- Push to your Git repository
- Vercel will automatically redeploy

### Manual Redeployment
```bash
cd backend
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check MongoDB Atlas IP whitelist and connection string

### Issue: "CORS error"
**Solution:** Add frontend URL to CORS_ORIGIN environment variable

### Issue: "JWT error"
**Solution:** Verify JWT_SECRET and JWT_REFRESH_SECRET are set correctly

### Issue: "Function timeout"
**Solution:** Optimize database queries or upgrade Vercel plan

### Issue: "File upload not working"
**Solution:** Implement cloud storage (Vercel filesystem is read-only)

---

## 📊 Monitoring

1. **Vercel Analytics:** Enable in project settings
2. **MongoDB Atlas Monitoring:** Check database performance
3. **Error Tracking:** Consider using Sentry or similar service

---

## 🔒 Security Checklist

- ✅ Strong JWT secrets (64+ characters)
- ✅ CORS configured with specific origins
- ✅ Environment variables set correctly
- ✅ MongoDB user with limited permissions
- ✅ Rate limiting enabled
- ✅ Helmet.js security headers
- ✅ No sensitive data in code
- ✅ .env files in .gitignore

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Test API endpoints with Postman
4. Review environment variables

---

## 🎉 Success!

Your backend is now deployed on Vercel! 

**Next Steps:**
1. Deploy frontend to Vercel
2. Update frontend API URL
3. Test all features
4. Set up monitoring
5. Configure custom domain (optional)

---

**Deployment URL Format:**
- Backend: `https://loan-management-backend.vercel.app`
- Frontend: `https://loan-management-frontend.vercel.app`

**API Base URL:**
- `https://loan-management-backend.vercel.app/api`
