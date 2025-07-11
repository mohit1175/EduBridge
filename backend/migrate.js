const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Existing user data from the JSON file
const existingUsers = [
  {
    email: "a@a.com",
    password: "a",
    role: "student"
  },
  {
    email: "b@b.com",
    password: "b",
    role: "teacher_level2"
  },
  {
    email: "c@c.com",
    password: "c",
    role: "teacher_level1"
  },
  {
    email: "ram@a.com",
    password: "ram123",
    role: "student",
    name: "ram"
  },
  {
    email: "shyam@a.com",
    password: "shyam123",
    role: "student",
    name: "shyam"
  },
  {
    email: "krishna@a.com",
    password: "krishna123",
    role: "student",
    name: "krishna"
  }
];

const migrateData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert users
    const savedUsers = [];
    for (const userData of existingUsers) {
      const user = new User(userData);
      await user.save();
      savedUsers.push(user);
      console.log(`User ${userData.email} created successfully`);
    }

    console.log(`Migration completed! ${savedUsers.length} users created.`);
    process.exit(0);

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateData();