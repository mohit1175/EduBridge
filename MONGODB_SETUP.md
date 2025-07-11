# EduBridge MongoDB Integration

This document explains how to set up and use the MongoDB integration in EduBridge.

## Overview

EduBridge now supports MongoDB for user authentication and data storage. The application includes:
- Express.js backend server with MongoDB integration
- JWT-based authentication
- Graceful fallback to static data when backend is unavailable

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- MongoDB (via Docker or local installation)

## Quick Start

### 1. Start MongoDB

Using Docker Compose (recommended):
```bash
docker compose up -d
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Set Up Environment Variables

The backend uses the following environment variables (already configured in `backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/edubridge?authSource=admin
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 4. Migrate Existing User Data

```bash
cd backend
npm run migrate
```

This will populate MongoDB with the existing user data from the JSON file.

### 5. Start the Backend Server

```bash
cd backend
npm start
```

The server will run on http://localhost:5000

### 6. Start the Frontend

```bash
npm start
```

The React app will run on http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
  ```json
  {
    "email": "user@example.com",
    "password": "password",
    "role": "student|teacher_level1|teacher_level2"
  }
  ```

- `GET /api/auth/users` - Get all users (development only)

## User Data

The following demo users are available:

| Email | Password | Role | Name |
|-------|----------|------|------|
| a@a.com | a | student | Alice |
| b@b.com | b | teacher_level2 | Bob |
| c@c.com | c | teacher_level1 | Mohit |
| ram@a.com | ram123 | student | ram |
| shyam@a.com | shyam123 | student | shyam |
| krishna@a.com | krishna123 | student | krishna |

## Offline Mode

If the backend is not available, the application will automatically fall back to the static JSON data for authentication, ensuring the app continues to work in offline scenarios.

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for session management
- Change the JWT_SECRET in production
- Use environment variables for sensitive configuration

## Development Scripts

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run migrate` - Populate database with demo data

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests