# EduBridge – Manual Test Cases (Sample-Style Report)

> This pack mirrors the sample format you shared (IDs, prerequisites, test data, scenario, step-by-step with Expected vs Actual and Pass/Fail). Replace Actual Result during execution. Final Status fields are set to "Not Executed" by default.

---

## USER LOGIN FUNCTIONALITY

Test Case ID  
EB_01  

Test Case Description  
Test the User Login functionality in the EduBridge Application  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Access to Internet  
2.  
Backend API running and reachable; Frontend accessible  
3.  
User exists (e.g., Student) and is logged out  

S#  
Test Data  

1.  
Email = student1@example.com  
2.  
Password = P@ssw0rd!  

Test Scenario  
Verifying whether the user is able to successfully login with valid credentials.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Open the EduBridge Application (Login Page) | Login page should appear | — | Not Executed |
| 2 | Enter the Email and Password | Fields should capture input correctly | — | Not Executed |
| 3 | Click on Login | User should be authenticated and navigated to Home/Dashboard | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## USER REGISTRATION FUNCTIONALITY

Test Case ID  
EB_02  

Test Case Description  
Test the User Registration functionality (if self-registration is enabled) or Admin-driven user creation.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Access to Internet  
2.  
Registration page enabled OR Admin access available  

S#  
Test Data  

1.  
Name = John Doe  
2.  
Email = john.doe@example.com  
3.  
Password = New#12345  
4.  
Role = STUDENT  

Test Scenario  
Validating the entered user details and ensuring the successful entry of the same in the database.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Enter user registration details | Display the entered registration details | — | Not Executed |
| 2 | Validate the entered details | Display appropriate validation messages | — | Not Executed |
| 3 | Click on Register | Save user details in database | — | Not Executed |
| 4 | Display result | Show success/failure message accordingly | — | Not Executed |
| 5 | Click on screen/Continue | Navigate to the login/home page | — | Not Executed |

Final Status: Not Executed  
Comments: If self-registration is disabled, perform via Admin Users → Create.  

---

## FORGOT PASSWORD / RESET FUNCTIONALITY

Test Case ID  
EB_03  

Test Case Description  
Test the password reset flow using the "Forgot Password" feature.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Access to Internet  
2.  
Email service configured  
3.  
User account with accessible email  

S#  
Test Data  

1.  
Email = student1@example.com  

Test Scenario  
Verifying whether the user can request a reset link, set a new password, and login successfully.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Click on "Forgot Password" | Reset form should appear | — | Not Executed |
| 2 | Submit email address | Reset email should be sent with instructions | — | Not Executed |
| 3 | Open link and set new password | Password updated successfully | — | Not Executed |
| 4 | Login with the new password | Login succeeds and dashboard loads | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## STUDENT EXAM RESULTS VIEW FUNCTIONALITY

Test Case ID  
EB_04  

Test Case Description  
Test the student’s ability to view results and internal marks.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Student logged in  
2.  
Exam results exist for the student  
3.  
ExamConfig defined for relevant courses  

S#  
Test Data  

1.  
Student Email = student1@example.com  

Test Scenario  
Verifying whether the student is able to view scoped results, charts, and computed internal marks.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Navigate to Exams page | Results table and charts should load | — | Not Executed |
| 2 | Validate internal marks calculation | Weighted internal matches ExamConfig | — | Not Executed |
| 3 | Attempt access to other student’s results | Forbidden/empty as per authorization | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## TEACHER IMPORT EXAM RESULTS (CSV) FUNCTIONALITY

Test Case ID  
EB_05  

Test Case Description  
Testing the import of exam results via CSV by Teacher.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Teacher logged in  
2.  
Exam exists with maxMarks set  
3.  
Students enrolled in the course  

S#  
Test Data  

1.  
CSV: rollNo, marks (one > max, one duplicate, one not found)  

Test Scenario  
Validating the CSV parsing, row validation, insertions, and granular error reporting.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Upload CSV for Exam E | Multi-status summary (inserted/skipped with reasons) | — | Not Executed |
| 2 | Open Results table for Exam E | Inserted rows visible and accurate | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## ADMIN PUBLISH NOTICE (MULTIPART) FUNCTIONALITY

Test Case ID  
EB_06  

Test Case Description  
Testing notice creation with file upload and audience visibility.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Admin logged in  
2.  
Uploads storage available  

S#  
Test Data  

1.  
Title, Body, Audience = STUDENTS  
2.  
File = notice.pdf (<5MB)  

Test Scenario  
Verifying whether the admin can publish a notice with file and it is visible to the intended audience.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Admin → Notices → New | Form and file picker appear | — | Not Executed |
| 2 | Submit with file attached | 201; fileUrl stored; list refreshes | — | Not Executed |
| 3 | Student checks Notices | Notice visible; file downloads successfully | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## STUDY MATERIAL UPLOAD/DOWNLOAD FUNCTIONALITY

Test Case ID  
EB_07  

Test Case Description  
Testing study material upload by teacher and download by student.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Teacher assigned to Course C  
2.  
Student enrolled in Course C  

S#  
Test Data  

1.  
File = material.pdf (<10MB)  

Test Scenario  
Validate upload and permissions for download.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Teacher uploads material for Course C | 201; material appears in course list | — | Not Executed |
| 2 | Student downloads the material | 200; file stream/download works | — | Not Executed |
| 3 | Student from other course tries to access | 403 Forbidden | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## ATTENDANCE MARKING FUNCTIONALITY

Test Case ID  
EB_08  

Test Case Description  
Testing the attendance marking and percentage update.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Teacher assigned to Course C  
2.  
Roster exists for Course C  

S#  
Test Data  

1.  
Date = Today; present/absent toggles for students  

Test Scenario  
Validating entries are saved and percentages reflect correctly.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Open Attendance for Course C | Roster loads | — | Not Executed |
| 2 | Toggle Present/Absent and Save | 200; entries inserted; toast success | — | Not Executed |
| 3 | Student views attendance percentage | Percentage updated per records | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## TIMETABLE MANAGEMENT FUNCTIONALITY

Test Case ID  
EB_09  

Test Case Description  
Testing timetable slot creation with conflict detection.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
HOD logged in  
2.  
Course teacher assigned; an overlapping slot exists  

S#  
Test Data  

1.  
Day = Monday; 10:00–11:00; Room = R101  

Test Scenario  
Prevent overlaps and accept valid slots.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Create overlapping slot | 409 with conflict details (room/teacher) | — | Not Executed |
| 2 | Create non-overlapping slot | 201 created; appears on timetable | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## DOUBT (Q&A) FUNCTIONALITY

Test Case ID  
EB_10  

Test Case Description  
Testing student raises a doubt and teacher resolves it.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Student enrolled in Course C  
2.  
Teacher assigned to Course C  

S#  
Test Data  

1.  
Question = "Explain DP knapsack?"  

Test Scenario  
Validate the doubt lifecycle from open to resolved.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Student submits new doubt | 201; status open; visible in My Doubts | — | Not Executed |
| 2 | Teacher answers and marks resolved | 200; response saved; status resolved | — | Not Executed |
| 3 | Student reviews resolution | Response visible with resolved badge | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## ADMIN LOGIN FUNCTIONALITY

Test Case ID  
EB_11  

Test Case Description  
Test the Admin Login functionality in the Admin Panel.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Access to Internet  
2.  
Admin account exists  

S#  
Test Data  

1.  
Email = admin@example.com  
2.  
Password = Admin#12345  

Test Scenario  
Verifying whether the Admin is able to login on the Admin Panel.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Open the Admin panel | Display the login form | — | Not Executed |
| 2 | Enter the login details | Fields display entered details | — | Not Executed |
| 3 | Click on login | Check credentials and sign in admin | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## ADMIN PANEL FUNCTIONALITY (OVERVIEW)

Test Case ID  
EB_12  

Test Case Description  
Test core admin capabilities: view users, courses, and exam results/attendance.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Admin logged in  
2.  
Seed data present (users, courses, enrollments)  

S#  
Test Data  

—  

Test Scenario  
Verifying whether the admin is able to view users, courses, and related academic records.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | On Admin dashboard click on the user details option | Page lists users with filters | — | Not Executed |
| 2 | Click on the courses details option | Page lists courses; teacher assignment visible | — | Not Executed |
| 3 | Click on the results/attendance option | Page lists results/attendance summaries | — | Not Executed |

Final Status: Not Executed  
Comments: Extend with Admin Logs and Notices views if enabled.  

---

## ADMIN GENERATE REPORT FUNCTIONALITY

Test Case ID  
EB_13  

Test Case Description  
Test generating reports (PDF/CSV) for exam results or enrollments.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
Admin logged in  
2.  
Results/enrollments present  

S#  
Test Data  

1.  
Filters: Course, Semester, Date range  

Test Scenario  
Verifying whether the admin is able to generate and download the report.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Click on the generate reports option | Report criteria form appears | — | Not Executed |
| 2 | Enter the details and submit | Report generated and displayed/downloaded | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

## USER/ADMIN LOGOUT FUNCTIONALITY

Test Case ID  
EB_14  

Test Case Description  
Test the logout functionality for all roles.  

Created By  
QA Team  

Reviewed By  
QA Lead  

Version  
1.0  

Tester’s Name  
—  

Date Tested  
—  

Test Case  
(Pass/Fail/Not Executed)  
Not Executed  

S #  
Prerequisites  

1.  
User/Admin logged in  

S#  
Test Data  

—  

Test Scenario  
Verifying whether the user/admin is able to successfully logout from the application.  

| Step# | Step Details | Expected Result | Actual Result | Pass/Fail/Not Executed/Suspended |
|---|---|---|---|---|
| 1 | Click on the drawable/menu (Profile/Logout) | Display options to logout and profile | — | Not Executed |
| 2 | Click on the Logout option | Session cleared; redirect to Login | — | Not Executed |

Final Status: Not Executed  
Comments: —  

---

> Tip: If you want me to pre-fill "Actual Result" with "As Expected" and mark each case as Pass for presentation, say "mark as Pass" and I’ll update this file accordingly.
