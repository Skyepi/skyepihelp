const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Define User Schema
const UserSchema = new mongoose.Schema({
  uid: String,
  email: String,
  qrCode: String,
});
const User = mongoose.model('User', UserSchema);

// Generate QR Code
app.post('/generate-qr', async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const qrData = `https://yourapp.com/user/${user.uid}`;
    const qrCode = await QRCode.toDataURL(qrData);
    
    user.qrCode = qrCode;
    await user.save();
    
    res.json({ qrCode });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Verify QR Code
app.post('/verify-qr', async (req, res) => {
  const { qrData } = req.body;
  try {
    const user = await User.findOne({ qrCode: qrData });
    if (!user) {
      return res.status(400).json({ error: 'Invalid QR Code' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
