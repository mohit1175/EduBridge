# EduBridge Backend API

A comprehensive Node.js backend API for the EduBridge educational management system with MongoDB integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Support for students, teachers, and HOD roles
- **Exam Management**: Create, manage, and track exam results
- **Attendance Tracking**: Mark and monitor student attendance
- **Doubt Resolution**: Q&A system for students and teachers
- **Course Management**: Manage courses and instructors
- **Timetable Management**: Create and manage class schedules
- **File Uploads**: Support for CSV and PDF file uploads
- **Statistics & Analytics**: Comprehensive reporting and analytics

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend directory with the following variables:
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

3. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

4. **Run the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create a new exam
- `PUT /api/exams/:id` - Update an exam
- `DELETE /api/exams/:id` - Delete an exam
- `GET /api/exams/results` - Get exam results
- `POST /api/exams/results` - Upload exam results
- `GET /api/exams/config` - Get exam configurations
- `POST /api/exams/config` - Create exam configuration
- `GET /api/exams/stats` - Get exam statistics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record
- `POST /api/attendance/bulk` - Mark bulk attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Doubts
- `GET /api/doubts` - Get doubts
- `POST /api/doubts` - Create a new doubt
- `PUT /api/doubts/:id/answer` - Answer a doubt
- `PUT /api/doubts/:id/resolve` - Mark doubt as resolved
- `PUT /api/doubts/:id` - Update a doubt
- `DELETE /api/doubts/:id` - Delete a doubt
- `GET /api/doubts/stats` - Get doubt statistics

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `GET /api/courses/:id` - Get a specific course

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create a new timetable entry
- `PUT /api/timetable/:id` - Update a timetable entry
- `DELETE /api/timetable/:id` - Delete a timetable entry
- `GET /api/timetable/week` - Get weekly timetable

## User Roles

1. **Student** (`student`)
   - View own exam results and attendance
   - Submit doubts and questions
   - View timetable and courses

2. **Teacher Level 2** (`teacher_level2`)
   - Create and manage exams
   - Upload exam results
   - Mark attendance
   - Answer student doubts

3. **Teacher Level 1 / HOD** (`teacher_level1`)
   - All teacher level 2 permissions
   - Create exam configurations
   - Manage courses and timetable
   - Access to all student data
   - Administrative functions

## Database Models

- **User**: User accounts with authentication
- **Exam**: Exam information and scheduling
- **ExamResult**: Individual exam results
- **ExamConfig**: Exam configuration settings
- **Attendance**: Attendance records
- **Doubt**: Student questions and teacher answers
- **Course**: Course information
- **Timetable**: Class schedule

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- CORS protection
- Error handling and logging

## File Upload Support

- CSV files for bulk data import
- PDF files for documents
- Image files for attachments
- Configurable file size limits

## Development

The server runs on port 4000 by default. The API includes:
- Comprehensive error handling
- Request validation
- Database connection management
- Graceful shutdown handling
- Health check endpoint

## Health Check

Visit `http://localhost:4000/api/health` to check if the API is running properly.

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## License

This project is part of the EduBridge educational management system.
