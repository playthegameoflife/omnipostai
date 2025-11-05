
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

const Hero = () => (
  <section className="flex flex-col items-center justify-center text-center py-20 bg-gray-50">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900">Grow Your Brand on Social</h1>
    <p className="text-lg md:text-2xl text-gray-600 mb-8 max-w-2xl">
      Plan, schedule, and publish your content across all your social channels from one simple dashboard.
    </p>
    <a href="#signup" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">Get Started Free</a>
  </section>
);

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6c0-2.21 3.582-4 8-4s8 1.79 8 4v8c0 2.21-3.582 4-8 4z"/></svg>
    ),
    title: 'All-in-One Dashboard',
    desc: 'Manage all your social accounts in one place.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h8a2 2 0 002-2v-6"/></svg>
    ),
    title: 'Schedule Posts',
    desc: 'Plan and schedule content for optimal times.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-7 4v4m0 0l-4-4m4 4l4-4"/></svg>
    ),
    title: 'Content Calendar',
    desc: 'Visualize your posting schedule with a calendar.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 11V7a4 4 0 118 0v4m-4 4v4m0 0l-4-4m4 4l4-4"/></svg>
    ),
    title: 'Analytics',
    desc: 'Track engagement and performance of your posts.'
  },
];

const Features = () => (
  <section className="py-16 bg-white">
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm">
            {f.icon}
            <h3 className="mt-4 text-xl font-semibold text-gray-800">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
            </>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
