This folder contains CSV templates that are directly downloadable from the Admin UI.
Files are served by the frontend dev server under /csv_templates/.

Available templates (English file names only):
- bulk_students.csv (email,name,rollNumber,department,semester)
- bulk_users.csv (email,name,role,department,semester)
- courses_init.csv (program,department,semester,subject,courseCode,credits,description)
- course_enrollments.csv (student,courseCode)
- hod_assignments.csv (courseCode,hodEmail)
- teacher_assignments.csv (courseCode,courseName,department,semester,credits,teacherEmail,teacherName)
- exam_results.csv (student,course,examType,examName,marks,totalMarks,semester,date)

Note: Headers are in English.
