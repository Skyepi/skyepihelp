import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';
import './styles.css';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to QR Auth App</h1>
      <Link to="/profile">Go to Profile</Link>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setQrData(`https://yourapp.com/user/${currentUser.uid}`);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="container">
      {user ? (
        <>
          <h2>Profile</h2>
          <p>Email: {user.email}</p>
          <QRCode value={qrData} size={200} />
          <br />
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
