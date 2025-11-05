import React, { useState } from 'react';

type AuthFormProps = {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => void;
  error?: string;
  onGoogleSignIn?: () => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, error, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow max-w-md w-full mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">{mode === 'login' ? 'Login to Omnipost' : 'Sign Up for Omnipost'}</h2>
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
      {onGoogleSignIn && (
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded font-semibold hover:bg-gray-100 transition shadow"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.09 30.18 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.19 5.6C43.98 37.09 46.1 31.27 46.1 24.5z"/><path fill="#FBBC05" d="M10.67 28.04A14.5 14.5 0 019.5 24c0-1.4.23-2.76.64-4.04l-7.98-6.2A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.48l8.18-6.44z"/><path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.57l-7.19-5.6c-2.01 1.35-4.6 2.17-7.95 2.17-6.38 0-11.87-3.63-14.33-8.7l-8.18 6.44C6.73 42.52 14.82 48 24 48z"/></g></svg>
          Continue with Google
        </button>
      )}
    </form>
  );
};

export default AuthForm; 