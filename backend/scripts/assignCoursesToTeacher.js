require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/assignCoursesToTeacher.js <teacher_email>');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubridge');
    const teacher = await User.findOne({ email });
    if (!teacher) {
      console.error('No user found with email:', email);
      process.exit(2);
    }
    if (!['teacher_level1', 'teacher_level2'].includes(teacher.role)) {
      console.error('User is not a teacher. Found role:', teacher.role);
      process.exit(3);
    }
    const res = await Course.updateMany({}, { instructor: teacher._id });
    console.log(`Updated ${res.modifiedCount} courses to instructor ${teacher.name} (${teacher.email})`);
    process.exit(0);
  } catch (err) {
    console.error('Assignment failed:', err);
    process.exit(4);
  } finally {
    await mongoose.connection.close();
  }
}

run();
