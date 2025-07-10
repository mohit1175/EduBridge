# Internal Marks System Guide

## Overview
This system implements a comprehensive internal marks management system for college examinations with the following structure:

### Mark Distribution
- **100 Marks Subjects**: 40 marks internal (20 marks ICA + 20 marks other internals) + 60 marks external
- **50 Marks Subjects**: 20 marks internal (ICA only) + 30 marks external

### ICA (Internal Continuous Assessment)
- 3 MCQ tests conducted per subject
- HOD can configure whether to take "Best of 3" or "Average of 3"
- Each ICA test is worth 20 marks

## Role-Based Features

### HOD (teacher_level1)
1. **Exam Configuration**
   - Configure subjects with mark distribution
   - Set ICA option (Best/Average of 3 tests)
   - View configuration summary
   - Delete configurations

2. **Teacher Assignment**
   - Assign teachers to courses
   - View current assignments
   - Remove assignments

### Teacher (teacher_level2)
1. **CSV Upload**
   - Upload exam results via CSV files
   - Support for ICA Tests 1-3, Other Internal, and External exams
   - Add exam links for students to access forms
   - View uploaded exams history

2. **CSV Format**
   ```
   Student,Marks
   Alice,18
   Bob,16
   Mohit,20
   ```

### Student
1. **Exam Links**
   - View available exam forms uploaded by teachers
   - Direct access to exam forms via links
   - See exam type and subject information

2. **Internal Marks Summary**
   - View calculated internal marks based on ICA configuration
   - Breakdown of ICA marks and other internal marks
   - Total internal marks vs maximum possible

3. **Results View**
   - View all exam results with exam types
   - Filter by course and semester
   - Progress bars and grade indicators

## How to Use

### For HODs:
1. Go to Exams page
2. Configure subjects using the Exam Configuration section
3. Set ICA option (Best or Average)
4. Assign teachers to courses in the Courses page

### For Teachers:
1. Go to Exams page
2. Use the Upload Exam Results section
3. Select exam type, subject, and date
4. Optionally add exam link for students
5. Upload CSV file with results
6. View uploaded exams history

### For Students:
1. Go to Exams page
2. View available exam forms in the "Available Exam Forms" section
3. Click "Take Exam" to access exam forms
4. View internal marks summary
5. Check detailed results in the results table

## Technical Implementation

### Data Storage
- Exam configurations: `localStorage.examConfigs`
- Uploaded exams: `localStorage.uploadedExams`
- Exam results: `localStorage.examResults`
- Teacher assignments: `localStorage.teacherAssignments`

### Key Components
- `ExamConfig.jsx`: HOD exam configuration interface
- `ExamUpload.jsx`: Teacher CSV upload interface
- `Exams.jsx`: Main exams page with role-based features

### Internal Marks Calculation
```javascript
// For Best of 3 ICA tests
icaMarks = Math.max(...icaResults.map(r => r.marks));

// For Average of 3 ICA tests
icaMarks = Math.round(icaResults.reduce((sum, r) => sum + r.marks, 0) / icaResults.length);

// Total Internal = ICA Marks + Other Internal Marks
totalInternal = icaMarks + otherInternalMarks;
```

## Sample Data
The system includes demo data for:
- Students: Alice, Bob, Mohit
- Subjects: Computer Science (100 marks), Mathematics (50 marks)
- ICA tests, other internals, and external exams
- Sample CSV file: `sample_exam_results.csv`

## Features
- ✅ Role-based access control
- ✅ ICA configuration (Best/Average)
- ✅ CSV upload for exam results
- ✅ Exam links for students
- ✅ Internal marks calculation
- ✅ Visual progress indicators
- ✅ Responsive design
- ✅ Data persistence in localStorage 