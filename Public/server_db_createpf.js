 // server.js (Node.js + Express) with Profile Creation
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const serviceAccount = require("./firebase-key.json"); // Firebase Admin SDK Key

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Profile Schema
const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, unique: true },
    bio: { type: String }
});
const Profile = mongoose.model('Profile', ProfileSchema);

// Register User
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Profile
app.post('/create-profile', async (req, res) => {
    try {
        const { userId, username, bio } = req.body;
        const existingProfile = await Profile.findOne({ username });
        if (existingProfile) return res.status(400).json({ error: 'Username already taken' });
        
        const newProfile = new Profile({ userId, username, bio });
        await newProfile.save();
        res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Firebase Token
app.post('/verify-firebase-token', async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.json({ uid: decodedToken.uid, email: decodedToken.email });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
