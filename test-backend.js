require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resume = require('./models/Resume');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resumespark';

async function runTests() {
  console.log('--- STARTING BACKEND AUTOMATED TESTS ---');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✔ Connected to MongoDB successfully.');
  } catch (err) {
    console.error('✘ Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  const testUsername = 'testuser_' + Date.now();
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  let userId;

  try {
    // 1. Register User Test
    console.log('\n--- Test 1: User Registration ---');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);
    
    const newUser = new User({
      username: testUsername,
      email: testEmail,
      password: passwordHash
    });
    
    const savedUser = await newUser.save();
    userId = savedUser._id;
    console.log(`✔ User registered successfully. ID: ${userId}`);

    // 2. Duplicate Registration Guard Test
    console.log('\n--- Test 2: Duplicate Registration Guard ---');
    try {
      const duplicateUser = new User({
        username: testUsername,
        email: testEmail,
        password: passwordHash
      });
      await duplicateUser.save();
      console.log('✘ Failed: Duplicate user should not have been saved.');
    } catch (err) {
      console.log('✔ Verified: Duplicate user insertion blocked as expected.');
    }

    // 3. Save Resume Test
    console.log('\n--- Test 3: Save Resume ---');
    const testTemplateId = 'template1';
    const testHtml = '<div id="print"><h1>John Doe</h1><p>Software Engineer</p></div>';
    
    const newResume = await Resume.findOneAndUpdate(
      { userId, templateId: testTemplateId },
      { htmlContent: testHtml, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    console.log(`✔ Resume saved successfully. ID: ${newResume._id}`);
    if (newResume.htmlContent !== testHtml) {
      throw new Error('Resume content mismatch on save.');
    }

    // 4. Load Resume Test
    console.log('\n--- Test 4: Load Resume ---');
    const loadedResume = await Resume.findOne({ userId, templateId: testTemplateId });
    if (!loadedResume) {
      throw new Error('Saved resume could not be retrieved.');
    }
    console.log('✔ Resume loaded successfully.');
    if (loadedResume.htmlContent !== testHtml) {
      throw new Error('Loaded resume content mismatch.');
    }
    console.log('✔ Saved data matches loaded data.');

    // 5. Cleanup Test Data
    console.log('\n--- Test 5: Cleanup ---');
    await User.findByIdAndDelete(userId);
    await Resume.deleteOne({ userId });
    console.log('✔ Cleanup completed successfully.');

    console.log('\n======================================');
    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY 🎉');
    console.log('======================================');

  } catch (error) {
    console.error('\n✘ Test run failed with error:', error);
    if (userId) {
      // attempt cleanup
      await User.findByIdAndDelete(userId);
      await Resume.deleteOne({ userId });
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runTests();
