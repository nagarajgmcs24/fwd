# Fix My Ward - Getting Started Guide

This is a full-stack application for reporting and tracking ward infrastructure issues in Bengaluru.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  - Pages: Home, Auth, Dashboard         │
│  - Real-time updates via Socket.io      │
│  - Communicates via REST API            │
└────────────────┬────────────────────────┘
                 │
         HTTP + WebSocket
                 │
┌────────────────▼────────────────────────┐
│  Backend (Node.js + Express)            │
│  - REST API endpoints                   │
│  - JWT Authentication                   │
│  - Socket.io Real-time Server           │
└────────────────┬────────────────────────┘
                 │
           Database Connection
                 │
┌────────────────▼────────────────────────┐
│  MongoDB                                │
│  - Users, Issues, Notifications         │
│  - Indexes for fast queries              │
└─────────────────────────────────────────┘
```

## Project Structure

```
fix-my-ward/
├── code/                      # Frontend (React)
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API & utility services
│   │   ├── types.ts           # TypeScript types
│   │   ├── App.tsx            # Main app component
│   │   └── index.tsx          # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                   # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/            # Database schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   ├── utils/             # Utilities
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── BACKEND_SETUP.md           # Quick backend setup
├── GETTING_STARTED.md         # This file
└── README.md                  # Project overview
```

## Setup Instructions

### 1. Backend Setup (Required First)

The backend must be running for the frontend to work.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (see BACKEND_SETUP.md for details)
# Minimum: Set MONGODB_URI, JWT_SECRET, CORS_ORIGIN

# Start backend server
npm run dev
```

**Backend will be running on:** `http://localhost:5000`

✅ See: [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed setup

### 2. Frontend Setup

Once backend is running, in another terminal:

```bash
# Navigate to frontend directory
cd code

# Install dependencies
npm install

# Create .env file (if doesn't exist)
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_WS_URL=http://localhost:5000" >> .env

# Start frontend dev server
npm run dev
```

**Frontend will be running on:** `http://localhost:5173`

### 3. Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Join the Community" → "Register" 
3. Sign up with:
   - Role: CITIZEN
   - Ward: Ward 1 (or any ward)
4. After login, you can:
   - Create new issue reports
   - View your submitted issues
   - Track issue status updates

### 4. Test Councillor Features

1. Sign up as COUNCILLOR (select different role in signup)
2. Login as councillor
3. See all issues in your assigned ward
4. Update issue status (Pending → In Progress → Resolved)

## Key Features

### Citizen Features
- 📸 Report infrastructure issues with photos
- 🎯 Auto-categorization with AI analysis
- 📍 Add location data to issues
- 📊 Track issue status in real-time
- 💬 Add comments to issues
- 📋 View personal issue history

### Councillor Features
- 👥 View all issues in their ward
- ✅ Update issue status
- 📞 Respond to citizen reports
- 📈 Track resolution statistics
- 🗺️ View issues on interactive map

## Database Models

### User
- username, email, name, password
- role (CITIZEN or COUNCILLOR)
- ward assignment
- profile picture support

### Issue
- title, description, category
- status (PENDING → IN_PROGRESS → RESOLVED/REJECTED)
- location coordinates
- attached photos/images
- AI analysis summary
- comments thread

### Notification
- Email-based notifications
- Real-time Socket.io updates
- Status change alerts

## API Endpoints Summary

| Feature | Endpoint | Method |
|---------|----------|--------|
| Sign Up | `/api/auth/signup` | POST |
| Login | `/api/auth/login` | POST |
| Get Current User | `/api/auth/me` | GET |
| Create Issue | `/api/issues` | POST |
| Get Issues | `/api/issues` | GET |
| Get Issue Details | `/api/issues/:id` | GET |
| Update Issue Status | `/api/issues/:id/status` | PATCH |
| Add Comment | `/api/issues/:id/comments` | POST |

See `backend/README.md` for full API documentation.

## Real-time Features

The app uses Socket.io for real-time updates:

- 🔔 Instant issue status notifications
- 💬 Live comment updates
- 🔄 Real-time issue list refresh
- 👥 Ward member presence

Ward members automatically receive updates when issues are:
- Created in their ward
- Status changed
- Commented on

## Technologies Used

### Frontend
- React 19 with TypeScript
- Vite (fast build tool)
- Socket.io Client (real-time)
- Tailwind CSS (styling)
- Google Generative AI (analysis)

### Backend
- Node.js 18+
- Express.js (REST API)
- MongoDB (database)
- Socket.io (real-time)
- JWT (authentication)
- bcryptjs (password hashing)
- TypeScript

## Development Workflow

### Make Changes

**Frontend changes:**
1. Edit files in `code/src/`
2. Auto-reload in browser at `http://localhost:5173`

**Backend changes:**
1. Edit files in `backend/src/`
2. Auto-rebuild with `npm run dev`

### Testing Workflow
1. Sign up as CITIZEN
2. Create issue report
3. In another browser tab, login as COUNCILLOR
4. See issue appear and update status
5. See real-time update in citizen view

## Common Tasks

### Reset All Data
```bash
# Delete MongoDB database
mongo fix-my-ward --eval "db.dropDatabase()"

# Restart both servers
```

### View Logs
```bash
# Backend logs appear in terminal where `npm run dev` is running
# Frontend logs appear in browser console (F12)
```

### Change Ports
```bash
# Backend: Edit PORT in backend/.env
# Frontend: Edit vite.config.ts or set --port flag
```

### Deploy

**Backend:**
- See deployment section in `backend/README.md`
- Recommended: Heroku, AWS, DigitalOcean

**Frontend:**
- Build: `npm run build`
- Deploy to: Netlify, Vercel, GitHub Pages

## Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running: `npm run dev` in `backend/`
- Check VITE_API_URL in frontend `.env`
- Check CORS_ORIGIN in backend `.env`

### "Database connection failed"
- Check MongoDB is running
- Verify MONGODB_URI is correct
- For Atlas: Check IP whitelist

### "Login fails"
- Check JWT_SECRET is set
- Verify user was created in signup
- Check network tab in browser DevTools

### "Real-time updates not working"
- Check Socket.io connection in browser console
- Verify backend can connect to MongoDB
- Check firewall allows WebSocket connections

## Learning Resources

- **API Testing:** Use curl or Postman
- **Database:** Use MongoDB Compass
- **Real-time:** Open browser DevTools → Network → WS tab
- **Logs:** Terminal for backend, Console for frontend

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Sign up and test features
4. ✅ Create issues and test real-time updates
5. 🚀 Deploy to production when ready

## Support

- **Backend Setup:** See `BACKEND_SETUP.md`
- **API Documentation:** See `backend/README.md`
- **Frontend Code:** Check TypeScript files in `code/src/`
- **Issues:** Check browser console and server logs

## Quick Command Reference

```bash
# Start backend (Terminal 1)
cd backend && npm install && npm run dev

# Start frontend (Terminal 2)
cd code && npm install && npm run dev

# Build for production
npm run build (in both directories)

# Test backend API
curl http://localhost:5000/api/health

# Access frontend
Open http://localhost:5173 in browser
```

---

Happy reporting! 🚀 Fix My Ward is building a better Bengaluru together.
