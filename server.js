 const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB (use your connection string or env variable in production)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skye_pi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a User schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String, // In production, hash passwords!
  profileCount: { type: Number, default: 0 },
  profiles: [{
    qrCodeData: String,
    identificationNumber: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

// Utility: Generate a unique 12-digit identification number
function generateIdentificationNumber(currentCount) {
  // Increment count for the new profile
  const count = currentCount + 1;
  // Calculate two-letter prefix based on profile count:
  // Example: count=1 yields "AA", count=2 yields "AB", etc.
  const firstLetter = String.fromCharCode(65 + Math.floor((count - 1) / 26));
  const secondLetter = String.fromCharCode(65 + ((count - 1) % 26));
  const prefix = firstLetter + secondLetter;
  // Append 10 random digits
  let digits = '';
  for (let i = 0; i < 10; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return prefix + digits;
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if(user) {
      res.json({ success: true, userId: user._id });
    } else {
      res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch(err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to create a new profile (and generate a QR code)
app.post('/api/createProfile', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    // If user doesn't exist, create one (you can adjust this flow as needed)
    if(!user) {
      user = new User({ email, password: 'default' });
    }
    // Update profile count and generate a new identification number
    const newProfileCount = user.profileCount + 1;
    const identificationNumber = generateIdentificationNumber(user.profileCount);
    // Create a QR code that encodes the profile URL or identification number
    const qrDataString = `https://skye-pi.org/profile.html?id=${identificationNumber}`;
    const qrCodeData = await QRCode.toDataURL(qrDataString);
    // Save new profile details
    user.profileCount = newProfileCount;
    user.profiles.push({
      qrCodeData,
      identificationNumber
    });
    await user.save();
    res.json({ success: true, profile: { qrCodeData, identificationNumber } });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.toString() });
  }
});

// Endpoint to check if an account exists (for prompting duplicate account inquiries)
app.post('/api/checkAccount', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
