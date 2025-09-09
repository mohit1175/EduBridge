// Setup script to initialize the database with sample data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const ExamConfig = require('./models/ExamConfig');
const Doubt = require('./models/Doubt');

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
    const usersToCreate = [...sampleUsers, ...extraStudents];

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
      // BSc subjects for teacher
      { ...sampleCourses[0], courseName: 'Web Development', courseCode: 'CS-BSC-WD', program: 'BSc', instructor: teacher._id },
      { ...sampleCourses[2], courseName: 'Machine Learning', courseCode: 'CS-BSC-ML', program: 'BSc', instructor: teacher._id },
      // MSc subjects for teacher
      { ...sampleCourses[1], courseName: 'Artificial Intelligence', courseCode: 'CS-MSC-AI', program: 'MSc', instructor: teacher._id },
      { ...sampleCourses[1], courseName: 'Advanced DBMS', courseCode: 'CS-MSC-ADBMS', program: 'MSc', instructor: teacher._id }
    ];
    const createdCourses = await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${createdCourses.length} courses`);

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
