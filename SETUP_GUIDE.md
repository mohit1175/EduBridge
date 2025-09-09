# EduBridge Setup Guide

This guide will help you set up the complete EduBridge application with both frontend and backend components.

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/edubridge

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### Frontend Environment
Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:4000/api

# App Configuration
REACT_APP_APP_NAME=EduBridge
REACT_APP_VERSION=1.0.0
```

### 3. Database Setup

#### Start MongoDB
```bash
# For Windows
mongod

# For macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/your/db
```

#### Initialize Database with Sample Data
```bash
cd backend
npm run setup
```

This will create:
- Sample users (student, teacher, HOD)
- Sample courses
- Sample exam configurations

### 4. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:4000`

#### Start Frontend Application
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Sample Login Credentials

After running the setup script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Student | john@student.com | password123 |
| Teacher | jane@teacher.com | password123 |
| HOD | admin@hod.com | password123 |

## API Endpoints

The backend provides the following main API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam
- `GET /api/exams/results` - Get exam results
- `POST /api/exams/results` - Upload results
- `GET /api/exams/stats` - Get statistics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/stats` - Get statistics

### Doubts
- `GET /api/doubts` - Get doubts
- `POST /api/doubts` - Create doubt
- `PUT /api/doubts/:id/answer` - Answer doubt

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create timetable entry

## User Roles and Permissions

### Student (`student`)
- View own exam results and attendance
- Submit doubts and questions
- View timetable and courses
- Download hall tickets and timetables

### Teacher Level 2 (`teacher_level2`)
- Create and manage exams
- Upload exam results
- Mark attendance
- Answer student doubts
- View student data

### Teacher Level 1 / HOD (`teacher_level1`)
- All teacher level 2 permissions
- Create exam configurations
- Manage courses and timetable
- Access to all student data
- Administrative functions
- Upload timetable and hall ticket files

## File Structure

```
EduBridge-2/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # File uploads directory
│   ├── index.js         # Main server file
│   ├── setup.js         # Database setup script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS files
│   │   ├── utils/       # Utility functions
│   │   └── data/        # Sample data
│   └── package.json
└── SETUP_GUIDE.md
```

## Development

### Backend Development
- The backend uses Express.js with MongoDB
- Authentication is handled with JWT tokens
- All routes are protected with role-based authorization
- File uploads are supported for CSV and PDF files

### Frontend Development
- Built with React and React Router
- Uses the API client utility for backend communication
- Responsive design with CSS modules
- State management with React hooks

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file
   - Verify MongoDB is accessible on the specified port

2. **CORS Errors**
   - Check FRONTEND_URL in backend .env file
   - Ensure frontend is running on the correct port

3. **Authentication Issues**
   - Verify JWT_SECRET is set in .env file
   - Check token expiration settings
   - Ensure proper role assignments

4. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure proper file type validation

### Health Check

Visit `http://localhost:4000/api/health` to verify the backend is running properly.

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in .env
2. Use a strong JWT_SECRET
3. Configure proper MongoDB connection string
4. Set up proper CORS origins
5. Use a process manager like PM2

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the build folder with a web server
3. Update API_URL for production backend
4. Configure proper environment variables

## Support

For issues and questions:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and data

## Features Overview

- **User Management**: Registration, login, profile management
- **Exam System**: Create exams, upload results, view statistics
- **Attendance Tracking**: Mark attendance, view reports
- **Doubt Resolution**: Q&A system for students and teachers
- **Course Management**: Manage courses and instructors
- **Timetable**: Create and view class schedules
- **File Management**: Upload and download documents
- **Analytics**: Comprehensive reporting and statistics
- **Role-based Access**: Different permissions for different user types

The system is designed to be scalable and maintainable with proper separation of concerns between frontend and backend.
