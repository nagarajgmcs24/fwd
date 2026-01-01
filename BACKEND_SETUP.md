# Fix My Ward - Backend Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env with your settings
```

**Minimum configuration for local development:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fix-my-ward
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start Backend Server
```bash
npm run dev
```

You should see:
```
╔══════════════════════════════════════╗
║   Fix My Ward - Backend Server       ║
║   Listening on port 5000             ║
║   Environment: development           ║
╚══════════════════════════════════════╝
```

### Step 4: Configure Frontend
In the root directory, create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### Step 5: Test Connection
Navigate to: `http://localhost:5000/api/health`

You should see:
```json
{"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

## Important Notes

### Database Setup

**Using Local MongoDB:**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `use fix-my-ward`

**Using MongoDB Atlas (Cloud):**
1. Create free account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/fix-my-ward`)
4. Set in `.env`: `MONGODB_URI=<your-connection-string>`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (default: 5000) |
| MONGODB_URI | Yes | Database connection string |
| JWT_SECRET | Yes | Secret key for tokens (change in production!) |
| CORS_ORIGIN | Yes | Frontend URL |
| NODE_ENV | No | development or production |

### Common Errors

**Error: "Cannot connect to MongoDB"**
- Check MongoDB is running: `mongod`
- Verify connection string is correct
- Check firewall allows connection

**Error: "CORS error"**
- Ensure CORS_ORIGIN matches exactly your frontend URL
- Restart backend server after changing

**Error: "Module not found"**
- Run: `npm install` again
- Delete node_modules and npm install fresh

## API is Ready!

Once running, your backend provides:

✅ User Authentication (signup/login)
✅ Issue Management (create, read, update, delete)
✅ Real-time Updates (Socket.io)
✅ Role-based Access Control
✅ Comment System
✅ Ward-specific Filtering

## Next Steps

1. Start the frontend dev server in another terminal
2. Navigate to `http://localhost:5173`
3. Sign up or login with test credentials
4. Create and track issues

## Production Deployment

When ready to deploy:

1. **Change JWT_SECRET** to a strong random value
2. **Use MongoDB Atlas** instead of local database
3. **Set NODE_ENV=production**
4. **Update CORS_ORIGIN** to your production frontend URL
5. **Deploy to Heroku, AWS, DigitalOcean, or similar**

See `backend/README.md` for detailed documentation.

## Support

- Backend logs: Check terminal running `npm run dev`
- API docs: `backend/README.md`
- Frontend integration: Check `services/apiService.ts`
