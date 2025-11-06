import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="w-full flex justify-between items-center py-6 px-8 bg-white shadow-sm">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">Omnipost</Link>
      </div>
      <nav className="space-x-8 text-gray-700 font-medium">
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/pricing" className="hover:text-blue-600">Pricing</Link>
        <Link to="/blog" className="hover:text-blue-600">Blog</Link>
        {!isLoggedIn && <Link to="/login" className="hover:text-blue-600">Login</Link>}
        {isLoggedIn && <button onClick={handleLogout} className="hover:text-blue-600">Logout</button>}
      </nav>
    </header>
  );
};

export default Header; 