# EduBridge – Database Table Structure (MongoDB/Mongoose)

Format: Sr No. | Name | Type | Constraint | Default | Notes

Note: All collections include `_id` (ObjectId, primary key). Most schemas enable `timestamps: true`, which auto-manages `createdAt` and `updatedAt`.

---

## User

| Sr No. | Name        | Type     | Constraint                                                                 | Default | Notes |
|-------:|-------------|----------|----------------------------------------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | Auto-generated |
| 2 | name | String | required, trim | — | — |
| 3 | email | String | required, unique, lowercase, trim | — | Unique per user |
| 4 | password | String | required, minlength: 6 | — | Hashed on save; excluded from toJSON |
| 5 | role | String | required, enum: [student, teacher_level1, teacher_level2, admin] | — | — |
| 6 | rollNumber | String | unique, sparse | — | Multiple nulls allowed due to sparse |
| 7 | department | String | trim | — | — |
| 8 | semester | Number | min: 1, max: 8 | — | — |
| 9 | isActive | Boolean | — | true | — |
| 10 | lastLogin | Date | — | — | — |
| 11 | createdAt | Date | — | now | Auto (timestamps) |
| 12 | updatedAt | Date | — | now | Auto (timestamps) |

---

## Course

| Sr No. | Name         | Type       | Constraint                               | Default | Notes |
|-------:|--------------|------------|------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | courseName | String | required, unique, trim | — | — |
| 3 | courseCode | String | required, unique, trim | — | — |
| 4 | department | String | required, trim | — | — |
| 5 | semester | Number | required, min: 1, max: 8 | — | — |
| 6 | credits | Number | required, min: 1, max: 10 | — | — |
| 7 | program | String | enum: [BSc, MSc] | BSc | — |
| 8 | instructor | ObjectId (ref User) | required | — | Primary instructor |
| 9 | instructors | [ObjectId] (ref User) | — | — | Co-teachers list |
| 10 | hod | ObjectId (ref User) | — | — | Optional HOD owner |
| 11 | description | String | trim | — | — |
| 12 | isActive | Boolean | — | true | — |
| 13 | students | [ObjectId] (ref User) | — | — | Optional explicit roster |
| 14 | createdAt | Date | — | now | Auto (timestamps) |
| 15 | updatedAt | Date | — | now | Auto (timestamps) |

Notes: Pre-save sync ensures `instructor` appears in `instructors`.

---

## Exam

| Sr No. | Name      | Type     | Constraint                                                         | Default   | Notes |
|-------:|-----------|----------|--------------------------------------------------------------------|-----------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | examType | String | required, enum: [ICA Test 1, ICA Test 2, ICA Test 3, Other Internal, External] | — | — |
| 3 | subject | String | required, trim | — | — |
| 4 | examDate | Date | required | — | — |
| 5 | examTime | String | — | 10:00 AM | — |
| 6 | duration | String | — | 1hr | — |
| 7 | room | String | — | A1 | — |
| 8 | examLink | String | trim | — | — |
| 9 | totalMarks | Number | required | 100 | — |
| 10 | createdBy | ObjectId (ref User) | required | — | — |
| 11 | isActive | Boolean | — | true | — |
| 12 | createdAt | Date | — | now | Auto (timestamps) |
| 13 | updatedAt | Date | — | now | Auto (timestamps) |

---

## ExamConfig

| Sr No. | Name              | Type     | Constraint                               | Default | Notes |
|-------:|-------------------|----------|------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | subjectName | String | required, unique, trim | — | — |
| 3 | internalMarks | Number | required, min: 0, max: 100 | — | — |
| 4 | externalMarks | Number | required, min: 0, max: 100 | — | — |
| 5 | icaOption | String | required, enum: [best, average] | — | — |
| 6 | icaCount | Number | required, min: 1, max: 5 | — | — |
| 7 | otherInternalMarks | Number | required, min: 0, max: 100 | — | — |
| 8 | createdBy | ObjectId (ref User) | required | — | — |
| 9 | isActive | Boolean | — | true | — |
| 10 | createdAt | Date | — | now | Auto (timestamps) |
| 11 | updatedAt | Date | — | now | Auto (timestamps) |

---

## ExamResult

| Sr No. | Name        | Type                    | Constraint                                          | Default | Notes |
|-------:|-------------|-------------------------|-----------------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | student | ObjectId (ref User) | required | — | — |
| 3 | exam | ObjectId (ref Exam) | — | — | Optional link to Exam |
| 4 | course | String | required, trim | — | Course code/name text |
| 5 | examType | String | required, enum: [ICA, Internal, External] | — | — |
| 6 | examName | String | required, trim | — | — |
| 7 | marks | Number | required, min: 0 | — | — |
| 8 | totalMarks | Number | required, min: 1 | — | — |
| 9 | percentage | Number | min: 0, max: 100 | — | Computed pre-save |
| 10 | grade | String | enum: [A+, A, B, C, D, F] | — | Computed pre-save |
| 11 | date | Date | required | — | — |
| 12 | semester | Number | min: 1, max: 8 | — | — |
| 13 | uploadedBy | ObjectId (ref User) | required | — | — |
| 14 | createdAt | Date | — | now | Auto (timestamps) |
| 15 | updatedAt | Date | — | now | Auto (timestamps) |

Indexes: `(student, course)`, `(exam)`, `(examType)`.

---

## Attendance

| Sr No. | Name      | Type                    | Constraint                              | Default | Notes |
|-------:|-----------|-------------------------|-----------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | student | ObjectId (ref User) | required | — | — |
| 3 | course | String | required, trim | — | Course code/name text |
| 4 | date | Date | required | — | — |
| 5 | status | String | required, enum: [present, absent, late] | — | — |
| 6 | semester | Number | min: 1, max: 8 | — | — |
| 7 | markedBy | ObjectId (ref User) | required | — | — |
| 8 | remarks | String | trim | — | — |
| 9 | createdAt | Date | — | now | Auto (timestamps) |
| 10 | updatedAt | Date | — | now | Auto (timestamps) |

Indexes: `(student, course, date)`, `(date)`.

---

## Timetable

| Sr No. | Name       | Type                    | Constraint                                                     | Default | Notes |
|-------:|------------|-------------------------|----------------------------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | course | String | required, trim | — | Course code/name text |
| 3 | program | String | enum: [BSc, MSc, Other] | BSc | — |
| 4 | department | String | trim | — | — |
| 5 | term | Number | min: 1, max: 8 | — | — |
| 6 | day | String | required, enum: [Monday..Saturday] | — | — |
| 7 | startTime | String | required | — | — |
| 8 | endTime | String | required | — | — |
| 9 | room | String | required, trim | — | — |
| 10 | instructor | ObjectId (ref User) | required | — | — |
| 11 | semester | Number | required, min: 1, max: 8 | — | — |
| 12 | isActive | Boolean | — | true | — |
| 13 | createdAt | Date | — | now | Auto (timestamps) |
| 14 | updatedAt | Date | — | now | Auto (timestamps) |

Indexes: `(day, startTime)`, `(course, semester)`, `(instructor, day)`, `(program, term)`.

---

## Doubt

| Sr No. | Name        | Type                    | Constraint                                      | Default | Notes |
|-------:|-------------|-------------------------|-------------------------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | student | ObjectId (ref User) | required | — | — |
| 3 | course | String | required, trim | — | Course code/name text |
| 4 | subject | String | required, trim | — | — |
| 5 | question | String | required, trim | — | — |
| 6 | description | String | trim | — | — |
| 7 | category | String | enum: [attendance, marks, timetable, other] | other | — |
| 8 | priority | String | enum: [low, medium, high] | medium | — |
| 9 | status | String | enum: [pending, answered, resolved] | pending | — |
| 10 | answer | String | trim | — | — |
| 11 | answeredBy | ObjectId (ref User) | — | — | — |
| 12 | answeredAt | Date | — | — | — |
| 13 | assignedTo | ObjectId (ref User) | — | — | — |
| 14 | attachments | Array of { filename, url, mimetype } | — | — | Subdocuments |
| 15 | createdAt | Date | — | now | Auto (timestamps) |
| 16 | updatedAt | Date | — | now | Auto (timestamps) |

Indexes: `(student, status)`, `(course, status)`.

---

## Notice

| Sr No. | Name        | Type                    | Constraint                 | Default       | Notes |
|-------:|-------------|-------------------------|----------------------------|---------------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | title | String | required | — | — |
| 3 | description | String | — | '' | — |
| 4 | attachments | Array of { filename, url, mimetype, size } | — | — | See subfields below |
| 5 | visibleTo | [String] | — | ['all'] | Audience tags |
| 6 | published | Boolean | — | true | — |
| 7 | expiresAt | Date | — | — | — |
| 8 | createdBy | ObjectId (ref User) | required | — | — |
| 9 | createdAt | Date | — | now | Auto (timestamps) |
| 10 | updatedAt | Date | — | now | Auto (timestamps) |

Attachments subdocument:

| Sr No. | Name     | Type   | Constraint | Default | Notes |
|-------:|----------|--------|------------|---------|-------|
| 1 | filename | String | — | — | — |
| 2 | url | String | — | — | — |
| 3 | mimetype | String | — | — | — |
| 4 | size | Number | — | — | — |

Indexes: `(createdAt desc)`, `(expiresAt)`.

---

## StudyMaterial

| Sr No. | Name        | Type                    | Constraint                    | Default | Notes |
|-------:|-------------|-------------------------|-------------------------------|---------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | title | String | required, trim | — | — |
| 3 | description | String | trim | — | — |
| 4 | course | ObjectId (ref Course) | required | — | — |
| 5 | subjectName | String | required | — | — |
| 6 | fileName | String | required | — | — |
| 7 | fileUrl | String | required | — | — |
| 8 | mimeType | String | required | — | — |
| 9 | size | Number | — | 0 | bytes |
| 10 | uploadedBy | ObjectId (ref User) | required | — | — |
| 11 | isActive | Boolean | — | true | — |
| 12 | createdAt | Date | — | now | Auto (timestamps) |
| 13 | updatedAt | Date | — | now | Auto (timestamps) |

Index: `(subjectName, uploadedBy)`.

---

## AdminLog

| Sr No. | Name        | Type                    | Constraint                                  | Default  | Notes |
|-------:|-------------|-------------------------|---------------------------------------------|----------|-------|
| 1 | _id | ObjectId | Primary Key | — | — |
| 2 | action | String | required | — | e.g., NOTICE_CREATE, RESULTS_IMPORT |
| 3 | actor | ObjectId (ref User) | required | — | — |
| 4 | actorEmail | String | required | — | — |
| 5 | status | String | enum: [success, partial, error] | success | — |
| 6 | targetType | String | — | — | e.g., Course, Exam |
| 7 | targetId | String | — | — | — |
| 8 | counts.created | Number | — | 0 | — |
| 9 | counts.updated | Number | — | 0 | — |
| 10 | counts.assigned | Number | — | 0 | — |
| 11 | counts.enrolled | Number | — | 0 | — |
| 12 | counts.skipped | Number | — | 0 | — |
| 13 | meta | Object | — | — | Arbitrary JSON |
| 14 | createdAt | Date | — | now | Auto (timestamps) |
| 15 | updatedAt | Date | — | now | Auto (timestamps) |

Index: `(createdAt desc)`.
