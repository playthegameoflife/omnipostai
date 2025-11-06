
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import WelcomePage from './components/WelcomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import BlogPage from './components/BlogPage';
import BlogPostDetail from './components/BlogPostDetail';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import ContactPage from './components/ContactPage';

const Hero = () => (
  <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
        One Dashboard.<br />
        <span className="text-blue-600">All Your Social Media.</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
        Create, schedule, and publish content across Facebook, X, LinkedIn, and more—all from one place. 
        Let AI help you craft the perfect post for each platform.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <Link to="/signup" className="px-10 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
          Get Started Free
        </Link>
        <Link to="/dashboard" className="px-10 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
          See How It Works
        </Link>
      </div>
      <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-8">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Free to start</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>AI-powered</span>
        </div>
      </div>
    </div>
  </section>
);

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    ),
    title: 'AI-Powered Content',
    desc: 'Get intelligent post suggestions tailored to each platform. Our AI writes compelling content that resonates with your audience.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    ),
    title: 'Smart Scheduling',
    desc: 'Schedule posts for optimal engagement times. Set it and forget it—your content goes live automatically.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    ),
    title: 'Real-Time Analytics',
    desc: 'Track likes, shares, comments, and engagement across all platforms. See what works and optimize your strategy.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ),
    title: 'Multi-Platform Support',
    desc: 'Connect Facebook, X, LinkedIn, Pinterest, and more. One post, multiple platforms—each optimized for its audience.'
  },
];

const Features = () => (
  <section className="py-20 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Everything You Need to Succeed</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Powerful features that help you create, schedule, and analyze your social media content
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {features.map((f, i) => (
          <div key={i} className="flex gap-6 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                {f.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <div className="inline-block p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <p className="text-lg text-gray-700 mb-4">
            <strong className="text-gray-900">Join thousands</strong> of creators and businesses using Omnipost to grow their social presence
          </p>
          <Link to="/signup" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Start Free Today
          </Link>
        </div>
      </div>
    </div>
  </section>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <ErrorBoundary>
            <Header />
          </ErrorBoundary>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <Features />
                </>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostDetail />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </ErrorBoundary>
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
