import bcrypt from 'bcrypt';

const hashedPassword = '$2b$10$p1O4Zd5x4Jjo4FdZ7x/mleSGcY/JLpJ3fNdmy7YbJWY4VKjJ9WnQ6';
const userInput = 'your_new_password'; // Try different guesses

bcrypt.compare(userInput, hashedPassword, (err, result) => {
  if (result) {
    console.log("✅ Password matches!");
  } else {
    console.log("❌ Wrong password.");
  }
});