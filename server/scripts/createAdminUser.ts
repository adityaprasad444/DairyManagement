import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../../src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairy';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    const newAdminUser = new User({
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
      phone: '1234567890',
      password: hashedPassword,
    });

    await newAdminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 