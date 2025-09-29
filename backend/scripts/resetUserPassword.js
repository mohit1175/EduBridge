
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const [, , email, newPassword, newRole] = process.argv;

  if (!email || !newPassword) {
    console.error('Usage: node backend/scripts/resetUserPassword.js <email> <newPassword> [newRole]');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edubridge';

  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.password = newPassword;

    // Optionally normalize role
    if (newRole) {
      user.role = newRole;
    }

    await user.save();

    console.log('🎉 User updated successfully:');
    console.log({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt
    });

    console.log('\nYou can now login with the new password.');
  } catch (err) {
    console.error('❌ Failed to update user:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

main();


