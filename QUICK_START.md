# Fix My Ward - 5 Minute Quick Start

## 🚀 Start Backend (Terminal 1)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Expected output:**
```
✓ Connected to MongoDB
Listening on port 5000
```

⏱️ **Takes ~1-2 minutes**

## 🎨 Start Frontend (Terminal 2)

```bash
cd code
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_WS_URL=http://localhost:5000" >> .env
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173
```

⏱️ **Takes ~1-2 minutes**

## 🧪 Test It

1. Open: http://localhost:5173
2. Click "Join the Community"
3. Sign up as CITIZEN:
   - Username: `test_user`
   - Email: `test@example.com`
   - Password: `password123`
   - Ward: `Ward 1`
4. Click "File Official Report"
5. Create an issue

✅ **Done!**

## 🔧 Environment Setup

### MongoDB (one-time setup)

**Option 1: Local MongoDB**
```bash
# Install (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh --eval "db.version()"
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `backend/.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fix-my-ward
```

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fix-my-ward
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`code/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## 📱 Test User Roles

### Citizen
- Username: `citizen1`
- Role: CITIZEN
- Can: Create issues, view own issues, add comments

### Councillor
- Username: `councillor1`
- Role: COUNCILLOR
- Can: View ward issues, update status, resolve issues

## 🔑 Key Endpoints

| Action | URL |
|--------|-----|
| Sign Up | POST http://localhost:5000/api/auth/signup |
| Login | POST http://localhost:5000/api/auth/login |
| Create Issue | POST http://localhost:5000/api/issues |
| Get Issues | GET http://localhost:5000/api/issues |
| Health Check | GET http://localhost:5000/api/health |

## 🎯 What You Can Do Now

✅ User Registration & Login
✅ Create Issue Reports
✅ Track Issue Status (Real-time)
✅ Add Comments
✅ Role-based Access (CITIZEN/COUNCILLOR)
✅ Ward-based Filtering

## ❌ Common Issues

### "Cannot connect to MongoDB"
```bash
# Start MongoDB
mongod  # Local
# or check MongoDB Atlas connection string
```

### "CORS Error"
- Ensure `CORS_ORIGIN=http://localhost:5173` in backend `.env`
- Restart backend server

### "Port already in use"
- Change PORT in backend `.env`
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

## 📚 More Information

- **Backend Setup**: See `BACKEND_SETUP.md`
- **Full Guide**: See `GETTING_STARTED.md`
- **API Docs**: See `backend/README.md`
- **Integration**: See `BACKEND_INTEGRATION_SUMMARY.md`

## 🚀 Next Steps

1. ✅ Both servers running
2. ✅ Can sign up and login
3. ✅ Can create and track issues
4. ❓ Want to add more features?
5. ❓ Ready to deploy?

→ Check the detailed guides above!

---

**You're ready to go!** 🎉 Happy coding!
