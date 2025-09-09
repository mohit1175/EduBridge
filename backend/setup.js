// Setup script to initialize the database with sample data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const ExamConfig = require('./models/ExamConfig');
const Doubt = require('./models/Doubt');
const Timetable = require('./models/Timetable');

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@student.com',
    password: 'password123',
    role: 'student',
    rollNumber: 'STU001',
    department: 'Computer Science',
    semester: 5
  },
  {
    name: 'Jane Smith',
    email: 'jane@teacher.com',
    password: 'password123',
    role: 'teacher_level2',
    department: 'Computer Science'
  },
  {
    name: 'Dr. Admin',
    email: 'admin@hod.com',
    password: 'password123',
    role: 'teacher_level1',
    department: 'Computer Science'
  },
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

    // Clear existing data
    console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
    await Course.deleteMany({});
    await ExamConfig.deleteMany({});
    await Doubt.deleteMany({});
  await Timetable.deleteMany({});

    // Create extra sample students for CS semester 5
    const extraStudents = Array.from({ length: 10 }, (_, i) => {
      const n = (i + 1).toString().padStart(2, '0');
      return {
        name: `CS5 Student ${n}`,
        email: `cs5student${n}@college.edu`,
        password: 'password123',
        role: 'student',
        rollNumber: `CS05-${n}`,
        department: 'Computer Science',
        semester: 5
      };
    });
    // Also add CS semester-2 students for MSc courses
    const extraStudentsSem2 = Array.from({ length: 10 }, (_, i) => {
      const n = (i + 1).toString().padStart(2, '0');
      return {
        name: `CS2 Student ${n}`,
        email: `cs2student${n}@college.edu`,
        password: 'password123',
        role: 'student',
        rollNumber: `CS02-${n}`,
        department: 'Computer Science',
        semester: 2
      };
    });
    const usersToCreate = [...sampleUsers, ...extraStudents, ...extraStudentsSem2];

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
    const coursesWithInstructor = [
      // BSc subjects for teacher (semester 5)
      { ...sampleCourses[0], courseName: 'Web Development', courseCode: 'CS-BSC-WD', program: 'BSc', instructor: teacher._id, semester: 5, credits: 4 },
      { ...sampleCourses[2], courseName: 'Machine Learning', courseCode: 'CS-BSC-ML', program: 'BSc', instructor: teacher._id, semester: 5, credits: 4 },
      // 2-credit lab subject (semester 5)
      { ...sampleCourses[0], courseName: 'Cloud Computing Lab', courseCode: 'CS-BSC-CCLAB', program: 'BSc', instructor: teacher._id, semester: 5, credits: 2, description: 'Hands-on cloud lab exercises' },
      // MSc subjects for teacher (semester 2)
      { ...sampleCourses[1], courseName: 'Artificial Intelligence', courseCode: 'CS-MSC-AI', program: 'MSc', instructor: teacher._id, semester: 2, credits: 4 },
      { ...sampleCourses[1], courseName: 'Advanced DBMS', courseCode: 'CS-MSC-ADBMS', program: 'MSc', instructor: teacher._id, semester: 2, credits: 4 }
    ];
    let createdCourses = await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Assign different students per subject (course)
    console.log('🔗 Enrolling students per course...');
    const allStudents = createdUsers.filter(u => u.role === 'student');
    const cs5 = allStudents.filter(s => s.department === 'Computer Science' && s.semester === 5);
    const cs2 = allStudents.filter(s => s.department === 'Computer Science' && s.semester === 2);

    // For BSc courses (semester 5): split cs5 across two theory courses, and enroll all in lab
    const webDev = createdCourses.find(c => c.courseCode === 'CS-BSC-WD');
    const ml = createdCourses.find(c => c.courseCode === 'CS-BSC-ML');
    const cloudLab = createdCourses.find(c => c.courseCode === 'CS-BSC-CCLAB');
    if (webDev && ml) {
      const half = Math.ceil(cs5.length / 2);
      await Course.findByIdAndUpdate(webDev._id, { students: cs5.slice(0, half).map(s => s._id) });
      await Course.findByIdAndUpdate(ml._id, { students: cs5.slice(half).map(s => s._id) });
    }
    if (cloudLab) {
      await Course.findByIdAndUpdate(cloudLab._id, { students: cs5.map(s => s._id) });
    }

    // For MSc courses (semester 2): split cs2 across two courses
    const ai = createdCourses.find(c => c.courseCode === 'CS-MSC-AI');
    const adbms = createdCourses.find(c => c.courseCode === 'CS-MSC-ADBMS');
    if (ai && adbms) {
      const half2 = Math.ceil(cs2.length / 2);
      await Course.findByIdAndUpdate(ai._id, { students: cs2.slice(0, half2).map(s => s._id) });
      await Course.findByIdAndUpdate(adbms._id, { students: cs2.slice(half2).map(s => s._id) });
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
    const hodUser = createdUsers.find(u => u.role === 'teacher_level1');
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

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Student: john@student.com / password123');
    console.log('Teacher: jane@teacher.com / password123');
    console.log('HOD: admin@hod.com / password123');
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
