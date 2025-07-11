# EduBridge

EduBridge is an educational platform built with React and Node.js, featuring MongoDB integration for user authentication and data management.

## Features

- User authentication with role-based access (Student, Teacher Level 1, Teacher Level 2)
- MongoDB integration with graceful fallback to static data
- Dashboard with role-specific views
- Course management, attendance tracking, timetable management
- Doubt resolution system and exam management
- JWT-based secure authentication

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EduBridge
   ```

2. **Set up MongoDB**
   ```bash
   npm run setup:mongodb
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

4. **Migrate user data to MongoDB**
   ```bash
   npm run migrate
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

## Architecture

- **Frontend**: React application with React Router
- **Backend**: Express.js server with MongoDB integration
- **Database**: MongoDB (containerized with Docker)
- **Authentication**: JWT tokens with bcrypt password hashing

## Demo Users

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| a@a.com | a | student | Student Dashboard |
| b@b.com | b | teacher_level2 | Teacher Dashboard |
| c@c.com | c | teacher_level1 | HOD Dashboard |
| ram@a.com | ram123 | student | Student Dashboard |
| shyam@a.com | shyam123 | student | Student Dashboard |
| krishna@a.com | krishna123 | student | Student Dashboard |

## Available Scripts

In the project directory, you can run:

### Frontend Scripts
- `npm start` - Runs the React app in development mode (http://localhost:3000)
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

### Backend Scripts
- `npm run start:backend` - Starts the Express server
- `npm run dev` - Starts both frontend and backend simultaneously
- `npm run migrate` - Populates MongoDB with demo user data

### Database Scripts
- `npm run setup:mongodb` - Starts MongoDB using Docker Compose

## MongoDB Integration

The application now uses MongoDB for user storage and authentication:

- User passwords are securely hashed using bcrypt
- JWT tokens are used for session management
- Automatic fallback to static JSON data if MongoDB is unavailable
- Docker Compose setup for easy MongoDB deployment

For detailed MongoDB setup instructions, see [MONGODB_SETUP.md](./MONGODB_SETUP.md).

## Project Structure

```
EduBridge/
├── src/                     # React frontend source
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── data/               # Static data (fallback)
├── backend/                # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── middleware/         # Express middleware
├── public/                 # Static assets
└── docker-compose.yml      # MongoDB container setup
```

## Learn More

- [React Documentation](https://reactjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
