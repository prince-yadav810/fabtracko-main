const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./User'); // Adjust the path if needed

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const newUser = new User({
      username: 'admin',           // Change as needed
      password: 'your_new_password'  // This will be hashed automatically
    });
    await newUser.save();
    console.log('New user created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating user:', err);
    process.exit(1);
  });
