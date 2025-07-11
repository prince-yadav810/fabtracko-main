const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path if your models are in a different location

dotenv.config();

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'VFW810' });
    if (existingUser) {
      console.log('User VFW810 already exists, deleting...');
      await User.deleteOne({ username: 'VFW810' });
    }
    
    // Create new user with your desired credentials
    const newUser = new User({
      username: 'VFW810',
      password: 'Gabbar810.'  // This will be hashed automatically by the pre-save hook
    });
    
    await newUser.save();
    console.log('✅ User created successfully!');
    console.log('Username: VFW810');
    console.log('Password: Gabbar810.');
    console.log('You can now login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createUser();