# EduBridge Full-Stack App (React + Express + MongoDB)

## Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud

## Setup

### Backend
```
cd backend
cp .env.example .env
# edit .env with your Mongo URI and JWT secret
npm install
npm run dev
```
Server runs on http://localhost:4000

### Frontend
```
cd frontend
npm install
npm start
```
App runs on http://localhost:3000

## Features
- Email/password auth (JWT)
- Role-based access control (admin, hod, teacher, student)
- REST APIs: users, courses, attendance, exams, doubts
- React Router with role-based dashboards

## Scripts
- Backend: `npm run dev` (nodemon)
- Frontend: `npm start` (CRA)