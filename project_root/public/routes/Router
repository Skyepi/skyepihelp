import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages (you would import or create these components)
import SignUp from './pages/SignUp';
import CreateProfile from './pages/CreateProfile';
import UserProfile from './pages/UserProfile';
import QRCodePage from './pages/QRCodePage';
import FollowLinks from './pages/FollowLinks';
import SocialMedia from './pages/SocialMedia';

// External links handlers
const CashAppLink = () => {
  window.location.href = 'https://cash.app/YOUR_CASHAPP_ID';
  return null;
};

const AmazonWishList = () => {
  window.location.href = 'https://www.amazon.com/hz/wishlist/ls/YOUR_WISHLIST_ID';
  return null;
};

const InstagramPage = () => {
  window.location.href = 'https://www.instagram.com/skye.p1org/';
  return null;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Main routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/qr-code" element={<QRCodePage />} />

        {/* External links */}
        <Route path="/donate" element={<CashAppLink />} />
        <Route path="/wish-list" element={<AmazonWishList />} />

        {/* Story following */}
        <Route path="/follow-the-story" element={<FollowLinks />} />
        <Route path="/follow-links" element={<FollowLinks />} />
        <Route path="/social-media" element={<SocialMedia />} />

        {/* Social media redirects */}
        <Route path="/instagram" element={<InstagramPage />} />

        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/signup" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
