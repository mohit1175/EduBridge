#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up EduBridge Frontend-Backend Integration...\n');

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendEnvContent = `REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_APP_NAME=EduBridge
REACT_APP_VERSION=1.0.0`;

try {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env file');
} catch (error) {
  console.log('⚠️  Could not create frontend/.env file:', error.message);
  console.log('Please create it manually with the following content:');
  console.log(frontendEnvContent);
}

// Create backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvContent = `# Database Configuration
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
UPLOAD_PATH=./uploads`;

try {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');
} catch (error) {
  console.log('⚠️  Could not create backend/.env file:', error.message);
  console.log('Please create it manually with the following content:');
  console.log(backendEnvContent);
}

console.log('\n📋 Setup Instructions:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Install backend dependencies: cd backend && npm install');
console.log('3. Install frontend dependencies: cd frontend && npm install');
console.log('4. Initialize database: cd backend && npm run setup');
console.log('5. Start backend: cd backend && npm run dev');
console.log('6. Start frontend: cd frontend && npm start');
console.log('\n🔑 Demo Login Credentials:');
console.log('Student: john@student.com / password123');
console.log('Teacher: jane@teacher.com / password123');
console.log('HOD: admin@hod.com / password123');
console.log('\n🌐 URLs:');
console.log('Frontend: http://localhost:3000');
console.log('Backend API: http://localhost:4000');
console.log('Health Check: http://localhost:4000/api/health');

console.log('\n✨ Setup complete! Follow the instructions above to start the application.');
