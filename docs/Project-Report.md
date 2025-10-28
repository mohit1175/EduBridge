# EduBridge — Department Academic ERP

Version: 1.0.0
Date: October 15, 2025

## Introduction

India’s higher-education landscape is large, diverse, and increasingly digital. Departments juggle internal assessments, externals, attendance, timetables, study materials, notices, and student support—often across spreadsheets, email threads, and fragmented tools. Accreditation cycles (NAAC), choice-based curricula (CBCS), and data-driven reporting expectations have raised the bar for evidence, auditability, and student experience. EduBridge is designed as a focused, department-first academic ERP layer that turns everyday teaching and assessment operations into a transparent, verifiable, and student-centric workflow.

### The coordination gap

- Academic data lives in silos—faculty spreadsheets, messaging apps, and separate ERPs—making it hard to aggregate results, verify internal marks, and share timely information with students.
- Exam lifecycles (ICA/internal/external) generate frequent CSV exchanges; without consistent validation and audit trails, errors and rework creep in.
- Program, department, and exam cell reporting is manual and slow, risking gaps when evidence is needed for internal reviews and accreditation.

### What the platform is

EduBridge is a role-based academic operations platform for departments:
- Structured exams lifecycle: create exams, upload results via CSV, smart student resolution (by roll/email/name), auto-percentage/grade, and internal-marks logic.
- Teaching operations: attendance (bulk and stats), timetables, study materials, student doubts (ask → answer → resolve), and notices with attachments.
- Analytics and documents: subject-wise dashboards, grade distributions, pass-rate insights; one-click PDFs (Student Hall Ticket, Timetable; HOD Subject Report).
- Fast onboarding: CSV templates for users, courses, enrollments, and results; consistent REST APIs; audit logs for administrative actions.

### Why students benefit

- Single, trusted place for results, trends, and transparent internal-marks summaries.
- Self-serve documents: download Hall Ticket and Exam Timetable; see upcoming exam links when available.
- Better support loop: track doubts and resolutions; access course materials without hunting through chat history.

### Why faculty benefit

- Faster uploads: CSV-based results with automatic validation and student mapping minimize cleanup.
- Day-to-day essentials: bulk attendance, timetables, materials, and targeted notices—all in one place.
- Insightful views: subject-level distributions and trends help calibrate instruction without extra tooling.

### Why HODs/Admins benefit

- Program-wide visibility: subject/course averages, grade mixes, and participation trends at a glance.
- Governance by default: admin logs, role-based access, and consistent data exports for reviews and accreditation.
- Low-friction setup: CSV templates and APIs enable quick adoption without waiting for institution-wide ERP changes.

### Why now

- Digitization of teaching/assessment is the norm; stakeholders expect timely, verifiable information and documents.
- Accreditation and quality assurance increasingly rely on auditable, reproducible data flows rather than ad-hoc files.
- Cloud-first deployment makes it practical for departments to adopt focused tools that complement existing ERPs.

### Who it serves

- College and university departments (autonomous or affiliated) seeking a practical layer for academic operations.
- HODs and faculty teams that want analytics and audit-ready exports without heavy ERP customization.
- Students who value clarity, timeliness, and portability of records for placements and higher studies.

### Outcomes to expect

- A single source of truth for exams, attendance, materials, notices, and student support.
- Reduced manual effort and errors through CSV onboarding, validation, and audit logs.
- Clear, student-friendly documents and dashboards that improve transparency and trust.
- Faster internal reporting and evidence generation for reviews and accreditation.

## Abstract
EduBridge is a lightweight academic ERP tailored for departments. It streamlines exams, attendance, study materials, notices, doubts, and role-based dashboards (Student, Teacher, HOD, Admin). It features CSV-driven onboarding, analytics, and PDF reports (Hall Ticket, Timetable, HOD Subject Report), with secure JWT auth and audit logging.

## Problem Statement and Objectives
- Fragmented tools for academic operations
- Slow onboarding and poor data portability
- Limited student self-serve (hall tickets, analytics)

Objectives:
- Unified portal with role-based access
- Fast CSV-based data import/export
- Exam analytics, internal marks logic, and document generation

## System Overview
- Frontend: React (SPA), Recharts, jsPDF, html2canvas
- Backend: Node.js/Express, MongoDB (Mongoose), JWT
- Storage: Local uploads (extensible to Blob/S3)
- Deploy: Frontend (Firebase/Static Web Apps), Backend (Azure App Service/Container)

## Key Features (by role)
- Student: View results and analytics, Internal Marks Summary, Hall Ticket/Timetable PDFs, Study materials, Notices, Doubts
- Teacher: Upload results via CSV (smart student resolution), Manage attendance and materials, Answer/resolve doubts, Create exams
- HOD: Subject-wise analytics and PDF report, Course assignments, Timetable oversight, Notices
- Admin: Admin logs/audit trail, User/course setup, Notices management

## Architecture
- API base: `/api`
- Core modules: auth, exams, attendance, doubts, courses, timetable, materials, notices, admin logs
- Uploads served from `/uploads`

```mermaid
flowchart LR
  subgraph Frontend [React SPA]
  UI[Dashboards & Pages]
  Charts[Recharts]
  PDF[jsPDF+html2canvas]
  end

  subgraph Backend [Express API]
  Auth[/Auth/]
  Exams[/Exams/]
  Attend[/Attendance/]
  Doubts[/Doubts/]
  Courses[/Courses/]
  TT[/Timetable/]
  Materials[/Materials/]
  Notices[/Notices/]
  Admin[/Admin Logs/]
  end

  UI -->|fetch| Backend
  Charts --> UI
  PDF --> UI
  Backend -->|Mongoose| DB[(MongoDB / Atlas)]
  Backend -->|Static| Files[/uploads]
```

## Data Model — ER Diagram (PlantUML)
Paste this in any PlantUML renderer.

```plantuml
@startuml
hide circle
skinparam classAttributeIconSize 0
skinparam linetype ortho

entity "User" as User {
  * _id : ObjectId
  --
  name : String
  email : String
  password : String (hashed)
  role : String <<student|teacher_level1|teacher_level2|admin>>
  rollNumber : String?
  department : String?
  semester : Number?
  isActive : Boolean
  lastLogin : Date?
  createdAt : Date
  updatedAt : Date
}

entity "Course" as Course {
  * _id : ObjectId
  --
  courseName : String (unique)
  courseCode : String (unique)
  department : String
  semester : Number
  credits : Number
  program : String <<BSc|MSc>>
  description : String?
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
}

entity "Exam" as Exam {
  * _id : ObjectId
  --
  examType : String <<ICA Test 1|ICA Test 2|ICA Test 3|Other Internal|External>>
  subject : String
  examDate : Date
  examTime : String
  duration : String
  room : String
  examLink : String?
  totalMarks : Number
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
}

entity "ExamResult" as ExamResult {
  * _id : ObjectId
  --
  student : ObjectId(User)
  exam : ObjectId(Exam)?
  course : String
  examType : String <<ICA|Internal|External>>
  examName : String
  marks : Number
  totalMarks : Number
  percentage : Number
  grade : String <<A+|A|B|C|D|F>>
  date : Date
  semester : Number?
  createdAt : Date
  updatedAt : Date
  uploadedBy : ObjectId(User)
}

entity "ExamConfig" as ExamConfig {
  * _id : ObjectId
  --
  subjectName : String (unique)
  internalMarks : Number
  externalMarks : Number
  icaOption : String <<best|average>>
  icaCount : Number
  otherInternalMarks : Number
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
  createdBy : ObjectId(User)
}

entity "Attendance" as Attendance {
  * _id : ObjectId
  --
  student : ObjectId(User)
  course : String
  date : Date
  status : String <<present|absent|late>>
  semester : Number?
  remarks : String?
  createdAt : Date
  updatedAt : Date
  markedBy : ObjectId(User)
}

entity "Timetable" as Timetable {
  * _id : ObjectId
  --
  course : String
  program : String <<BSc|MSc|Other>>
  department : String?
  term : Number?
  day : String <<Mon..Sat>>
  startTime : String
  endTime : String
  room : String
  semester : Number
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
  instructor : ObjectId(User)
}

entity "Doubt" as Doubt {
  * _id : ObjectId
  --
  student : ObjectId(User)
  course : String
  subject : String
  question : String
  description : String?
  category : String <<attendance|marks|timetable|other>>
  priority : String <<low|medium|high>>
  status : String <<pending|answered|resolved>>
  answer : String?
  answeredAt : Date?
  assignedTo : ObjectId(User)?
  answeredBy : ObjectId(User)?
  createdAt : Date
  updatedAt : Date
}

entity "Notice" as Notice {
  * _id : ObjectId
  --
  title : String
  description : String
  visibleTo : String[]
  published : Boolean
  expiresAt : Date?
  createdAt : Date
  updatedAt : Date
  createdBy : ObjectId(User)
}

entity "StudyMaterial" as StudyMaterial {
  * _id : ObjectId
  --
  title : String
  description : String?
  course : ObjectId(Course)
  subjectName : String
  fileName : String
  fileUrl : String
  mimeType : String
  size : Number
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
  uploadedBy : ObjectId(User)
}

entity "AdminLog" as AdminLog {
  * _id : ObjectId
  --
  action : String
  actorEmail : String
  status : String <<success|partial|error>>
  targetType : String?
  targetId : String?
  counts : Object
  meta : Object
  createdAt : Date
  updatedAt : Date
  actor : ObjectId(User)
}

entity "Attachment" as Attachment {
  filename : String
  url : String
  mimetype : String
  size : Number?
}

User ||--o{ Course : instructor
User o{--o{ Course : coTeacher
Course o{--o{ User  : students
User |o--o{ Course : hod

User  ||--o{ Exam       : createdBy
Exam  |o--o{ ExamResult : exam
User  ||--o{ ExamResult : student
User  ||--o{ ExamResult : uploadedBy
User  ||--o{ ExamConfig : createdBy

User  ||--o{ Attendance : student
User  ||--o{ Attendance : markedBy
User  ||--o{ Timetable  : instructor

User  ||--o{ Doubt : student
User  |o--o{ Doubt : assignedTo
User  |o--o{ Doubt : answeredBy

User        ||--o{ Notice        : createdBy
Course      ||--o{ StudyMaterial : has
User        ||--o{ StudyMaterial : uploadedBy
User        ||--o{ AdminLog      : actor

Notice ||--o{ Attachment : attachments
Doubt  ||--o{ Attachment : attachments

Course .. Exam        : subject (String)
Course .. ExamResult  : course (String)
Course .. Attendance  : course (String)
Course .. Timetable   : course (String)
Course .. Doubt       : course (String)
@enduml
```

## Object Model — Class Diagram (PlantUML)
(Alternative view focusing on objects and compositions.)

```plantuml
@startuml
skinparam classAttributeIconSize 0
hide circle
' Refer to ER for attributes; associations mirrored here
@enduml
```

## API Summary
- Auth: POST /auth/login, POST /auth/register, GET /auth/me, PUT /auth/profile, GET /auth/users
- Exams: GET/POST/PUT/DELETE /exams, GET/POST /exams/results, GET/POST /exams/config, GET /exams/stats
- Attendance: GET/POST/PUT/DELETE /attendance, POST /attendance/bulk, GET /attendance/stats
- Doubts: GET/POST /doubts, PUT /doubts/:id/answer, PUT /doubts/:id/resolve, PUT/DELETE /doubts/:id, GET /doubts/stats
- Courses: GET/POST/PUT/DELETE /courses, GET /courses/:id, GET /courses/:id/students, POST /courses/assignments/upload, PUT /courses/:id/instructor
- Timetable: GET/POST/PUT/DELETE /timetable, GET /timetable/week
- Materials: GET/POST /materials
- Notices: GET/POST/PUT/DELETE /notices (+ /notices/admin list)
- Admin Logs: GET/DELETE /admin/logs

## UI Walkthrough (Screenshots placeholders)
Add screenshots here:
- Dashboard (Admin/Teacher/HOD/Student)
- Exams (upload, analytics, student view)
- Attendance, Doubts, Materials, Notices

## Deployment Guide (Firebase + Azure App Service)
- Frontend: set `REACT_APP_API_URL` to backend HTTPS URL, build, deploy to Firebase Hosting or Azure Static Web Apps.
- Backend: deploy to Azure App Service (Node 20), set env vars: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL(S)`; adjust CORS to allow your frontend domains.
- Health check: `GET /api/health`.

## Testing Strategy
- Unit: utility functions for normalization and calculations
- Integration: API endpoints with seeded data
- UI smoke: role-based navigation, CSV uploads, PDF generation

## Security
- JWT auth, role-based authorization
- Input validation via express-validator
- CORS whitelist; HTTPS in production
- Audit logging via AdminLog

## Future Work
- Move uploads to Azure Blob Storage
- Add rate limiting and email notifications
- Deep links to Teams/communication tools

## References
- MongoDB, Mongoose, Express, React, Recharts, jsPDF, html2canvas
- Azure App Service docs, Firebase Hosting docs
