# Fix My Ward - Backend API

Complete backend solution for the Fix My Ward platform, built with Node.js, Express, MongoDB, and Socket.io.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (ready for integration)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` and set:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fix-my-ward
JWT_SECRET=your-secure-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**For MongoDB**:
- **Local**: Use `mongodb://localhost:27017/fix-my-ward`
- **Atlas**: Get your connection string from MongoDB Atlas dashboard

### 4. Start the Server

**Development**:
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires token) |

### Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Create new issue |
| GET | `/api/issues` | Get filtered issues |
| GET | `/api/issues/:id` | Get specific issue |
| PATCH | `/api/issues/:id/status` | Update issue status (councillor only) |
| POST | `/api/issues/:id/comments` | Add comment to issue |
| DELETE | `/api/issues/:id` | Delete issue |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from signup/login endpoints and expire based on `JWT_EXPIRE`.

## Real-time Events (Socket.io)

The server broadcasts events to connected clients in ward rooms.

### Emit Events (Client → Server)

- `join-ward`: Join notifications for a specific ward
- `leave-ward`: Leave ward notifications
- `issue-status-update`: Notify ward of status change
- `issue-created`: Notify ward of new issue

### Listen Events (Server → Client)

- `issue-updated`: When an issue status changes
- `new-issue`: When a new issue is reported in the ward

## Data Models

### User
```typescript
{
  _id: ObjectId
  username: string (unique)
  email: string (unique)
  name: string
  password: string (hashed)
  role: 'CITIZEN' | 'COUNCILLOR'
  ward: string
  profilePicture?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Issue
```typescript
{
  _id: ObjectId
  title: string
  description: string
  category: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
  priority: 'Low' | 'Medium' | 'High'
  ward: string
  location?: { lat: number, lng: number, address?: string }
  image?: string
  reportedBy: string
  reportedByEmail: string
  reportedById: ObjectId
  assignedTo?: ObjectId
  aiAnalysis?: string
  comments?: Array<{ userId, userName, text, createdAt }>
  createdAt: Date
  updatedAt: Date
}
```

### Notification
```typescript
{
  _id: ObjectId
  to: string (email)
  userId: ObjectId
  subject: string
  body: string
  type: 'SECURITY' | 'DISPATCHED' | 'RECEIVED' | 'UPDATE' | 'RESET'
  issueId?: ObjectId
  isRead: boolean
  createdAt: Date
}
```

## Example Requests

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "password": "securepassword",
    "role": "CITIZEN",
    "ward": "Ward 1"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword",
    "role": "CITIZEN"
  }'
```

### Create Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole near traffic signal",
    "category": "Pothole",
    "priority": "High",
    "ward": "Ward 1",
    "location": {
      "lat": 12.9716,
      "lng": 77.5946,
      "address": "Main Street, Ward 1"
    }
  }'
```

### Get Issues
```bash
curl -X GET "http://localhost:5000/api/issues?ward=Ward%201&status=PENDING" \
  -H "Authorization: Bearer <token>"
```

### Update Issue Status
```bash
curl -X PATCH http://localhost:5000/api/issues/<issueId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "IN_PROGRESS"}'
```

## Frontend Integration

The frontend communicates with this backend via `services/apiService.ts`.

### Configure Frontend

1. Create `.env` in frontend root:
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

2. Restart frontend dev server

### Features Available

- ✅ User authentication (signup/login)
- ✅ Issue creation and tracking
- ✅ Real-time issue updates via Socket.io
- ✅ Role-based access control
- ✅ Comment system
- ✅ Ward-specific filtering

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production to a strong random string
2. **CORS**: Configure `CORS_ORIGIN` for your frontend domain
3. **MongoDB**: Use strong credentials and network access lists
4. **Rate Limiting**: Consider adding rate limiting middleware for production
5. **Input Validation**: All inputs are validated before database operations
6. **Password Hashing**: Passwords are hashed with bcryptjs (10 salt rounds)

## Deployment

### Heroku
```bash
git push heroku main
```

### Docker
```bash
docker build -t fix-my-ward-backend .
docker run -p 5000:5000 -e MONGODB_URI=<uri> fix-my-ward-backend
```

### MongoDB Atlas

1. Create cluster on MongoDB Atlas
2. Get connection string
3. Set `MONGODB_URI` environment variable

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running: `mongo --version`
- Check MongoDB connection string format
- Verify firewall rules allow connection

### JWT Errors
- Ensure `JWT_SECRET` is set and consistent
- Check token hasn't expired
- Verify token is sent in `Authorization: Bearer <token>` format

### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL
- Check browser console for exact error message

## Development

### Project Structure
```
backend/
├── src/
│   ├── models/        # Database schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & custom middleware
│   ├── utils/          # Utilities (JWT, etc)
│   └── index.ts        # Server entry point
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Building
```bash
npm run build
```

Compiles TypeScript to `dist/` directory.

## Support

For issues or questions:
1. Check logs: `npm run dev`
2. Review this README
3. Check MongoDB connection
4. Verify environment variables
5. Check API endpoint URLs

## License

Part of Fix My Ward - Bengaluru Community Platform
