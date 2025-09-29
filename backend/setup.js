// Setup script to initialize the database with sample data
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const User = require('./models/User');
const Course = require('./models/Course');
const ExamConfig = require('./models/ExamConfig');
const Doubt = require('./models/Doubt');
const Timetable = require('./models/Timetable');
const Attendance = require('./models/Attendance');
const Notice = require('./models/Notice');
const StudyMaterial = require('./models/StudyMaterial');
const Exam = require('./models/Exam');
const ExamResult = require('./models/ExamResult');
const AdminLog = require('./models/AdminLog');

const sampleUsers = [
  // Teachers (HOD + 4 teachers)
  {
    name: 'ashish gavande',
    email: 'ashish.gavande@teacher.com',
    password: 'password123',
    role: 'teacher_level1', // HOD
    department: 'Computer Science'
  },
  {
    name: 'jayashree ravee',
    email: 'jayashree.ravee@teacher.com',
    password: 'password123',
    role: 'teacher_level2',
    department: 'Computer Science'
  },
  {
    name: 'omkar mohite',
    email: 'omkar.mohite@teacher.com',
    password: 'password123',
    role: 'teacher_level2',
    department: 'Computer Science'
  },
  {
    name: 'amol jogalekar',
    email: 'amol.jogalekar@teacher.com',
    password: 'password123',
    role: 'teacher_level2',
    department: 'Computer Science'
  },
  {
    name: 'neelam jain',
    email: 'neelam.jain@teacher.com',
    password: 'password123',
    role: 'teacher_level2',
    department: 'Computer Science'
  },
  // Students
  {
    name: 'Mohit',
    email: 'mohit@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU101',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Yashvi',
    email: 'yashvi@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU102',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Neha',
    email: 'neha@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU103',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Sahaj',
    email: 'sahaj@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU104',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Pratham',
    email: 'pratham@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU105',
    department: 'Computer Science',
    semester: 5
  },
  // Additional students
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU106',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Aanya Patel',
    email: 'aanya.patel@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU107',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Karthik Iyer',
    email: 'karthik.iyer@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU108',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Priya Singh',
    email: 'priya.singh@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU109',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Rohit Verma',
    email: 'rohit.verma@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU110',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Kavya Nair',
    email: 'kavya.nair@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU111',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Aditya Gupta',
    email: 'aditya.gupta@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU112',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU113',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Varun Joshi',
    email: 'varun.joshi@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU114',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Ishita Mehta',
    email: 'ishita.mehta@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU115',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Nikhil Rao',
    email: 'nikhil.rao@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU116',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Rutuja Deshmukh',
    email: 'rutuja.deshmukh@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU117',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Aniket Patil',
    email: 'aniket.patil@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU118',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Pooja Mishra',
    email: 'pooja.mishra@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU119',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Tanvi Kapoor',
    email: 'tanvi.kapoor@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU120',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Saurabh Chavan',
    email: 'saurabh.chavan@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU121',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Ananya Pandey',
    email: 'ananya.pandey@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU122',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Rahul Bansal',
    email: 'rahul.bansal@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU123',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Divya Kannan',
    email: 'divya.kannan@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU124',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Harshit Jain',
    email: 'harshit.jain@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU125',
    department: 'Computer Science',
    semester: 5
  },
  // Platform Admin (kept for access)
  {
    name: 'Super Admin',
    email: 'admin@college.com',
    password: 'password123',
    role: 'admin',
    department: 'Administration'
  }
];

const sampleCourses = [
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CS301',
    department: 'Computer Science',
    semester: 5,
    credits: 4,
    description: 'Advanced data structures and algorithm design',
    program: 'BSc'
  },
  {
    courseName: 'Database Management Systems',
    courseCode: 'CS302',
    department: 'Computer Science',
    semester: 2,
    credits: 4,
    description: 'Database design and management',
    program: 'MSc'
  },
  {
    courseName: 'Software Engineering',
    courseCode: 'CS303',
    department: 'Computer Science',
    semester: 5,
    credits: 3,
    description: 'Software development methodologies',
    program: 'BSc'
  }
];

const sampleExamConfigs = [
  {
    subjectName: 'Data Structures and Algorithms',
    internalMarks: 40,
    externalMarks: 60,
    icaOption: 'best',
    icaCount: 3,
    otherInternalMarks: 20
  },
  {
    subjectName: 'Database Management Systems',
    internalMarks: 40,
    externalMarks: 60,
    icaOption: 'average',
    icaCount: 2,
    otherInternalMarks: 20
  },
  {
    subjectName: 'Software Engineering',
    internalMarks: 40,
    externalMarks: 60,
    icaOption: 'best',
    icaCount: 2,
    otherInternalMarks: 20
  }
];

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubridge');
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
    await Course.deleteMany({});
    await ExamConfig.deleteMany({});
    await Doubt.deleteMany({});
  await Timetable.deleteMany({});
  await Attendance.deleteMany({});
  await Notice.deleteMany({});
  await StudyMaterial.deleteMany({});
  await Exam.deleteMany({});
  await ExamResult.deleteMany({});
  await AdminLog.deleteMany({});

  // Only create explicitly requested users
  const usersToCreate = [...sampleUsers];

    // Create sample users (ensure password hashing runs)
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    for (const sample of usersToCreate) {
      // Using create/save to trigger pre-save hooks for password hashing
      const created = await User.create(sample);
      createdUsers.push(created);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

  // Create sample courses
  console.log('📚 Creating sample courses...');
  const hodUser = createdUsers.find(user => user.role === 'teacher_level1');
  const teachers = createdUsers.filter(user => user.role === 'teacher_level2');
  const t = (i) => teachers[i % Math.max(1, teachers.length)];
    const coursesWithInstructor = [
      // BSc subjects for semester 5
      { ...sampleCourses[0], courseName: 'Web Development', courseCode: 'CS-BSC-WD', program: 'BSc', instructor: t(0)._id, semester: 5, credits: 4, description: 'Frontend and backend fundamentals with projects', hod: hodUser?._id },
      { ...sampleCourses[2], courseName: 'Machine Learning', courseCode: 'CS-BSC-ML', program: 'BSc', instructor: t(1)._id, semester: 5, credits: 4, description: 'Supervised, unsupervised learning and model evaluation', hod: hodUser?._id },
      { ...sampleCourses[0], courseName: 'Cloud Computing Lab', courseCode: 'CS-BSC-CCLAB', program: 'BSc', instructor: t(2)._id, semester: 5, credits: 2, description: 'Hands-on cloud lab exercises', hod: hodUser?._id },
      { ...sampleCourses[0], courseName: 'Operating Systems', courseCode: 'CS-BSC-OS', program: 'BSc', instructor: t(3)._id, semester: 5, credits: 4, description: 'Processes, threads, scheduling, memory and file systems', hod: hodUser?._id },
      { ...sampleCourses[0], courseName: 'Computer Networks', courseCode: 'CS-BSC-CN', program: 'BSc', instructor: t(0)._id, semester: 5, credits: 4, description: 'OSI model, TCP/IP, routing and network security', hod: hodUser?._id },
      // MSc subjects for semester 2
      { ...sampleCourses[1], courseName: 'Artificial Intelligence', courseCode: 'CS-MSC-AI', program: 'MSc', instructor: t(1)._id, semester: 2, credits: 4, description: 'AI search, knowledge representation, planning', hod: hodUser?._id },
      { ...sampleCourses[1], courseName: 'Advanced DBMS', courseCode: 'CS-MSC-ADBMS', program: 'MSc', instructor: t(2)._id, semester: 2, credits: 4, description: 'Transactions, indexing, query optimization', hod: hodUser?._id }
    ];
    let createdCourses = await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Assign students per course (using only the 5 specified students)
    console.log('🔗 Enrolling students per course...');
    const allStudents = createdUsers.filter(u => u.role === 'student');
    const bscSem5Courses = createdCourses.filter(c => c.program === 'BSc' && c.semester === 5);
    for (const c of bscSem5Courses) {
      // Enroll all students to each core subject to make attendance/marks realistic
      c.students = allStudents.map(s => s._id);
      await c.save();
    }
    // Refresh createdCourses with populated students for downstream use
    createdCourses = await Course.find({ _id: { $in: createdCourses.map(c => c._id) } });

  // Create sample exam configs
    console.log('⚙️ Creating sample exam configurations...');
    const hod = createdUsers.find(user => user.role === 'teacher_level1');
    const extraConfigs = [
      { subjectName: 'Web Development', internalMarks: 40, externalMarks: 60, icaOption: 'best', icaCount: 3, otherInternalMarks: 20 },
      { subjectName: 'Machine Learning', internalMarks: 40, externalMarks: 60, icaOption: 'best', icaCount: 3, otherInternalMarks: 20 },
      { subjectName: 'Cloud Computing Lab', internalMarks: 40, externalMarks: 60, icaOption: 'best', icaCount: 3, otherInternalMarks: 20 },
      { subjectName: 'Operating Systems', internalMarks: 40, externalMarks: 60, icaOption: 'best', icaCount: 3, otherInternalMarks: 20 },
      { subjectName: 'Computer Networks', internalMarks: 40, externalMarks: 60, icaOption: 'best', icaCount: 3, otherInternalMarks: 20 },
      { subjectName: 'Advanced DBMS', internalMarks: 40, externalMarks: 60, icaOption: 'average', icaCount: 2, otherInternalMarks: 20 },
      { subjectName: 'Artificial Intelligence', internalMarks: 40, externalMarks: 60, icaOption: 'average', icaCount: 2, otherInternalMarks: 20 },
    ];
    const configsWithCreator = [...sampleExamConfigs, ...extraConfigs].map(config => ({
      ...config,
      createdBy: hod._id
    }));
    const createdConfigs = await ExamConfig.insertMany(configsWithCreator, { ordered: false }).catch(() => []);
    console.log(`✅ Exam configurations ensured (${Array.isArray(createdConfigs) ? createdConfigs.length : 'many'})`);

    // Create sample doubts
    console.log('❓ Creating sample doubts...');
  const student = createdUsers.find(u => u.role === 'student');
    const teacherUser = createdUsers.find(u => u.role === 'teacher_level2');
    await Doubt.insertMany([
      { student: student._id, course: 'Data Structures and Algorithms', subject: 'DSA Syllabus', question: 'Clarification on Unit 3 topics', description: 'Is AVL tree part of Unit 3?', category: 'marks', assignedTo: teacherUser._id, priority: 'medium' },
      { student: student._id, course: 'Database Management Systems', subject: 'Attendance', question: 'Attendance for lab counted?', description: 'Are lab sessions included in attendance calculation?', category: 'attendance', assignedTo: hodUser._id, priority: 'low' }
    ]);
    console.log('✅ Sample doubts created');

    // Create sample timetable entries
    console.log('🗓️  Creating sample timetable entries...');
    const entries = [];
    const make = (courseName, day, start, end, room, semester, instructor) => ({
      course: courseName,
      day,
      startTime: start,
      endTime: end,
      room,
      semester,
      program: 'BSc',
      department: 'Computer Science',
      instructor
    });
    const tTeacher = teacher; // previously defined teacher
    entries.push(
      make('Machine Learning', 'Monday', '07:00', '08:00', 'B201', 5, tTeacher._id),
      make('Web Development', 'Monday', '09:00', '10:00', 'B105', 5, tTeacher._id),
      make('Advanced DBMS', 'Tuesday', '09:00', '10:00', 'M201', 2, tTeacher._id),
      make('Artificial Intelligence', 'Wednesday', '11:00', '12:00', 'M105', 2, tTeacher._id)
    );
    await Timetable.insertMany(entries);
    console.log(`✅ Created ${entries.length} timetable entries`);

    // Additional timetable to look complete
    try {
      const moreEntries = [];
      const findCourseByName = (name) => createdCourses.find(c => c.courseName === name);
      const addSlot = (courseName, day, start, end, room) => {
        const course = findCourseByName(courseName);
        if (!course) return;
        moreEntries.push({
          course: course.courseName,
          day,
          startTime: start,
          endTime: end,
          room,
          semester: course.semester,
          program: course.program,
          department: course.department,
          instructor: course.instructor
        });
      };
      addSlot('Operating Systems', 'Thursday', '10:00', '11:00', 'B204');
      addSlot('Computer Networks', 'Friday', '11:00', '12:00', 'B206');
      if (moreEntries.length) {
        await Timetable.insertMany(moreEntries);
        console.log(`📚 Added ${moreEntries.length} more timetable entries`);
      }
    } catch (_) {}

    // ===== Attendance seeding for realism =====
    console.log('📝 Creating attendance records...');
    const attendanceDocs = [];
    const today = new Date();
    const daysBack = [1, 2, 3, 4, 5]; // last 5 weekdays
    const wd = createdCourses.find(c => c.courseCode === 'CS-BSC-WD');
    const mlCourse = createdCourses.find(c => c.courseCode === 'CS-BSC-ML');
    const forCourses = [wd, mlCourse].filter(Boolean);
    for (const course of forCourses) {
      for (const db of daysBack) {
        const date = new Date(today);
        date.setDate(today.getDate() - db);
        for (const s of allStudents) {
          const present = Math.random() < 0.88; // ~88% attendance
          attendanceDocs.push({
            student: s._id,
            course: course.courseName,
            date,
            status: present ? 'present' : 'absent',
            semester: course.semester,
            markedBy: course.instructor
          });
        }
      }
    }
    if (attendanceDocs.length) {
      await Attendance.insertMany(attendanceDocs);
      console.log(`✅ Created ${attendanceDocs.length} attendance records`);
    }

    // ===== Notices =====
    console.log('📣 Creating sample notices...');
    const noticeAuthor = hodUser;
    await Notice.insertMany([
      { title: 'Department Seminar on AI Ethics', description: 'Guest lecture by industry expert on AI ethics this Friday.', attachments: [], visibleTo: ['all'], createdBy: noticeAuthor._id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) },
      { title: 'Lab Maintenance', description: 'Cloud lab will be under maintenance on Saturday 2-4 PM.', attachments: [], visibleTo: ['student','teacher_level2','teacher_level1'], createdBy: noticeAuthor._id, expiresAt: new Date(Date.now() + 3*24*60*60*1000) },
      { title: 'Submission Reminder', description: 'Submit Web Development assignment 2 by Sunday midnight.', attachments: [], visibleTo: ['student'], createdBy: noticeAuthor._id, expiresAt: new Date(Date.now() + 5*24*60*60*1000) },
    ]);
    console.log('✅ Notices created');

    // ===== Study materials =====
    console.log('📚 Uploading study materials (records)...');
    const materials = [];
    for (const c of createdCourses.filter(c => c.program === 'BSc' && c.semester === 5)) {
      materials.push({ title: `${c.courseName} Unit 1 Notes`, description: 'Curated lecture notes', course: c._id, subjectName: c.courseName, fileName: `${c.courseCode}-unit1.pdf`, fileUrl: `/uploads/materials/misc/${c.courseCode}-unit1.pdf`, mimeType: 'application/pdf', size: 234567, uploadedBy: c.instructor });
      materials.push({ title: `${c.courseName} Assignment 1`, description: 'Assignment sheet', course: c._id, subjectName: c.courseName, fileName: `${c.courseCode}-assignment1.pdf`, fileUrl: `/uploads/materials/misc/${c.courseCode}-assignment1.pdf`, mimeType: 'application/pdf', size: 123456, uploadedBy: c.instructor });
    }
    if (materials.length) {
      await StudyMaterial.insertMany(materials);
      console.log(`✅ Study materials created: ${materials.length}`);
    }

    // ===== Exams and Results =====
    console.log('🧪 Creating exams and results...');
    const exams = [];
    const past = new Date(); past.setDate(past.getDate() - 14);
    const future = new Date(); future.setDate(future.getDate() + 7);
    for (const c of createdCourses.filter(c => c.program === 'BSc' && c.semester === 5)) {
      exams.push({ examType: 'ICA Test 1', subject: c.courseName, examDate: past, examTime: '10:00 AM', duration: '1hr', room: 'B105', totalMarks: 40, createdBy: c.instructor });
      exams.push({ examType: 'ICA Test 2', subject: c.courseName, examDate: future, examTime: '10:00 AM', duration: '1hr', room: 'B105', totalMarks: 40, createdBy: c.instructor });
    }
    const createdExams = await Exam.insertMany(exams);
    console.log(`✅ Created ${createdExams.length} exam entries`);

    // Create exam results for ICA Test 1
    const results = [];
    const examBySubject = (subj, type) => createdExams.find(e => e.subject === subj && e.examType === type);
    for (const c of createdCourses.filter(c => c.program === 'BSc' && c.semester === 5)) {
      const e = examBySubject(c.courseName, 'ICA Test 1');
      for (const s of allStudents) {
        const marks = Math.max(10, Math.min(40, Math.round(18 + Math.random()*20))); // 10..40 skew ~upper
        results.push({ student: s._id, exam: e?._id, course: c.courseName, examType: 'ICA', examName: 'ICA Test 1', marks, totalMarks: 40, date: e?.examDate || past, semester: c.semester, uploadedBy: c.instructor });
      }
    }
    if (results.length) {
      await ExamResult.insertMany(results);
      console.log(`✅ Created ${results.length} exam results`);
    }

    // ===== Admin logs (seed summary) =====
    try {
      const admin = createdUsers.find(u => u.role === 'admin') || hodUser;
      await AdminLog.create({
        action: 'setup.seed',
        actor: admin._id,
        actorEmail: admin.email,
        status: 'success',
        targetType: 'database',
        meta: { courses: createdCourses.length, students: allStudents.length, exams: createdExams.length },
        counts: { created: createdCourses.length + allStudents.length }
      });
      console.log('🧾 Admin log recorded');
    } catch (_) {}

    // ===== Optional: Apply bulk operations from CSVs if present =====
    console.log('🧩 Applying CSV-driven assignments if templates are present...');
    const rootDir = path.resolve(__dirname, '..');
    const csvPaths = {
      instructors: path.join(rootDir, 'sample_course_assignments.csv'),
      hods: path.join(rootDir, 'frontend', 'hod_assignments.csv'),
      enrollments: path.join(rootDir, 'frontend', 'student_enrollments.csv')
    };

    // Helper to safely parse CSV with headers
    const readCsv = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const rows = parse(content, { columns: true, skip_empty_lines: true, bom: true, trim: true });
        return rows;
      } catch (e) {
        console.warn(`⚠️  Could not parse CSV at ${filePath}:`, e.message);
        return null;
      }
    };

    // Apply instructor assignments
    if (fs.existsSync(csvPaths.instructors)) {
      const rows = readCsv(csvPaths.instructors) || [];
      let assigned = 0, skipped = 0;
      for (const r of rows) {
        try {
          const courseCode = (r.courseCode || r.code || '').trim();
          const courseName = (r.courseName || r.subject || r.course || '').trim();
          const teacherEmail = (r.teacherEmail || r.email || r.teacher || '').trim().toLowerCase();
          const teacherName = (r.teacherName || r.instructor || '').trim();
          if (!courseCode && !courseName) { skipped++; continue; }
          let course = await Course.findOne(courseCode ? { courseCode } : { courseName });
          if (!course) { skipped++; continue; }
          let instructor = null;
          if (teacherEmail) instructor = await User.findOne({ email: teacherEmail, role: { $in: ['teacher_level1','teacher_level2'] } });
          if (!instructor && teacherName) instructor = await User.findOne({ name: new RegExp('^' + teacherName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '$', 'i'), role: { $in: ['teacher_level1','teacher_level2'] } });
          if (!instructor) { skipped++; continue; }
          course.instructor = instructor._id;
          await course.save();
          assigned++;
        } catch (_) { skipped++; }
      }
      console.log(`👩🏽‍🏫 Instructor CSV: assigned=${assigned}, skipped=${skipped}`);
    } else {
      console.log('👩🏽‍🏫 Instructor CSV not found, skipping.');
    }

    // Apply HOD assignments
    if (fs.existsSync(csvPaths.hods)) {
      const rows = readCsv(csvPaths.hods) || [];
      let assigned = 0, skipped = 0;
      for (const r of rows) {
        try {
          const courseCode = (r.courseCode || r.code || '').trim();
          const courseName = (r.courseName || r.subject || '').trim();
          const hodEmail = (r.hodEmail || r.email || '').trim().toLowerCase();
          const hodName = (r.hodName || r.name || '').trim();
          if (!courseCode && !courseName) { skipped++; continue; }
          let course = await Course.findOne(courseCode ? { courseCode } : { courseName });
          if (!course) { skipped++; continue; }
          let hodUserCandidate = null;
          if (hodEmail) hodUserCandidate = await User.findOne({ email: hodEmail, role: 'teacher_level1' });
          if (!hodUserCandidate && hodName) hodUserCandidate = await User.findOne({ name: new RegExp('^' + hodName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '$', 'i'), role: 'teacher_level1' });
          if (!hodUserCandidate) { skipped++; continue; }
          course.hod = hodUserCandidate._id;
          await course.save();
          assigned++;
        } catch (_) { skipped++; }
      }
      console.log(`🏫 HOD CSV: assigned=${assigned}, skipped=${skipped}`);
    } else {
      console.log('🏫 HOD CSV not found, skipping.');
    }

    // Apply student enrollments
    if (fs.existsSync(csvPaths.enrollments)) {
      const rows = readCsv(csvPaths.enrollments) || [];
      let enrolled = 0, skipped = 0, already = 0;
      for (const r of rows) {
        try {
          const ref = (r.student || r.email || r.roll || r.rollNumber || r.name || '').trim();
          const courseCode = (r.courseCode || r.code || '').trim();
          const courseName = (r.courseName || r.subject || '').trim();
          if (!ref) { skipped++; continue; }
          const course = await Course.findOne(courseCode ? { courseCode } : { courseName });
          if (!course) { skipped++; continue; }
          const lc = ref.toLowerCase();
          let student = await User.findOne({ email: lc });
          if (!student) student = await User.findOne({ rollNumber: ref });
          if (!student) student = await User.findOne({ name: new RegExp('^' + ref.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '$', 'i') });
          if (!student) { skipped++; continue; }
          if (!Array.isArray(course.students)) course.students = [];
          const exists = course.students.find(id => id.toString() === student._id.toString());
          if (exists) { already++; continue; }
          course.students.push(student._id);
          await course.save();
          enrolled++;
        } catch (_) { skipped++; }
      }
      console.log(`📥 Enrollment CSV: enrolled=${enrolled}, already=${already}, skipped=${skipped}`);
    } else {
      console.log('📥 Enrollment CSV not found, skipping.');
    }

    console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 Sample Login Credentials:');
  console.log('HOD: ashish.gavande@teacher.com / password123');
  console.log('Teachers:');
  console.log(' - jayashree.ravee@teacher.com / password123');
  console.log(' - omkar.mohite@teacher.com / password123');
  console.log(' - amol.jogalekar@teacher.com / password123');
  console.log(' - neelam.jain@teacher.com / password123');
  console.log('Students:');
  console.log(' - mohit@student.com / password123');
  console.log(' - yashvi@student.com / password123');
  console.log(' - neha@student.com / password123');
  console.log(' - sahaj@student.com / password123');
  console.log(' - pratham@student.com / password123');
  console.log('Admin: admin@college.com / password123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
