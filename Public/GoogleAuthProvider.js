  import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';
import './styles-1.css';

const firebaseConfig = {
  apiKey: "AIzaSyAPbRitIvjFraGw7cu3VzoGDkEg-EbkRQY",
  authDomain: "skye-pi.firebaseapp.com",
  projectId: "skye-pi",
  storageBucket: "skye-pi.firebasestorage.app",
  messagingSenderId: "81096604979",
  appId: "1:81096604979:web:f0d89dacde2f978d775246",
  measurementId: "G-1S4973D84M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to QR Auth App</h1>
      <Link to="/login">Log In</Link> | <Link to="/signup">Sign Up</Link>
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/profile');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <button onClick={handleGoogleSignIn}>Sign Up with Google</button>
      <Link to="/login">Already have an account? Log In</Link>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/profile');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Log In</h2>
      <button onClick={handleGoogleSignIn}>Log In with Google</button>
      <Link to="/signup">Don't have an account? Sign Up</Link>
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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
