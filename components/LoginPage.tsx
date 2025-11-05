import React, { useState } from 'react';
import AuthForm from './AuthForm';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setError(undefined);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(undefined);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} error={error} onGoogleSignIn={handleGoogleSignIn} />;
};

export default LoginPage; 