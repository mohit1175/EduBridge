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
  const teacher = createdUsers.find(user => user.role === 'teacher_level2');
  const hodUser = createdUsers.find(user => user.role === 'teacher_level1');
    const coursesWithInstructor = [
      // BSc subjects for teacher (semester 5)
  { ...sampleCourses[0], courseName: 'Web Development', courseCode: 'CS-BSC-WD', program: 'BSc', instructor: teacher._id, semester: 5, credits: 4, hod: hodUser?._id },
  { ...sampleCourses[2], courseName: 'Machine Learning', courseCode: 'CS-BSC-ML', program: 'BSc', instructor: teacher._id, semester: 5, credits: 4, hod: hodUser?._id },
      // 2-credit lab subject (semester 5)
  { ...sampleCourses[0], courseName: 'Cloud Computing Lab', courseCode: 'CS-BSC-CCLAB', program: 'BSc', instructor: teacher._id, semester: 5, credits: 2, description: 'Hands-on cloud lab exercises', hod: hodUser?._id },
      // MSc subjects for teacher (semester 2)
  { ...sampleCourses[1], courseName: 'Artificial Intelligence', courseCode: 'CS-MSC-AI', program: 'MSc', instructor: teacher._id, semester: 2, credits: 4, hod: hodUser?._id },
  { ...sampleCourses[1], courseName: 'Advanced DBMS', courseCode: 'CS-MSC-ADBMS', program: 'MSc', instructor: teacher._id, semester: 2, credits: 4, hod: hodUser?._id }
    ];
    let createdCourses = await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Assign students per course (using only the 5 specified students)
    console.log('🔗 Enrolling specified students per course...');
    const allStudents = createdUsers.filter(u => u.role === 'student');
    const webDev = createdCourses.find(c => c.courseCode === 'CS-BSC-WD');
    const ml = createdCourses.find(c => c.courseCode === 'CS-BSC-ML');
    const cloudLab = createdCourses.find(c => c.courseCode === 'CS-BSC-CCLAB');
    if (webDev) {
      // First 3 students
      await Course.findByIdAndUpdate(webDev._id, { students: allStudents.slice(0, 3).map(s => s._id) });
    }
    if (ml) {
      // Last 2 students
      await Course.findByIdAndUpdate(ml._id, { students: allStudents.slice(3, 5).map(s => s._id) });
    }
    if (cloudLab) {
      // All students attend lab
      await Course.findByIdAndUpdate(cloudLab._id, { students: allStudents.map(s => s._id) });
    }
    // Refresh createdCourses with populated students for potential downstream use
    createdCourses = await Course.find({ _id: { $in: createdCourses.map(c => c._id) } });

  // Create sample exam configs
    console.log('⚙️ Creating sample exam configurations...');
  const hod = createdUsers.find(user => user.role === 'teacher_level1');
    const configsWithCreator = sampleExamConfigs.map(config => ({
      ...config,
      createdBy: hod._id
    }));
    const createdConfigs = await ExamConfig.insertMany(configsWithCreator);
    console.log(`✅ Created ${createdConfigs.length} exam configurations`);

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
