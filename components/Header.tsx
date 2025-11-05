import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <span className="text-2xl font-bold text-blue-600">Omnipost</span>
      </div>
      <nav className="space-x-8 text-gray-700 font-medium">
        <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
        <a href="/pricing" className="hover:text-blue-600">Pricing</a>
        <a href="/blog" className="hover:text-blue-600">Blog</a>
        {!isLoggedIn && <a href="/login" className="hover:text-blue-600">Login</a>}
        {isLoggedIn && <button onClick={handleLogout} className="hover:text-blue-600">Logout</button>}
      </nav>
    </header>
  );
};

export default Header; 