import React, { useState } from 'react';
import AuthForm from './AuthForm';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const SignupPage: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleSignup = async (email: string, password: string) => {
    setError(undefined);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      navigate('/welcome');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleGoogleSignUp = async () => {
    setError(undefined);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      // Check if this is a new user (first time sign up with Google)
      // If it's a new user, show welcome. Otherwise, go to dashboard.
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
      navigate(isNewUser ? '/welcome' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    }
  };

  return <AuthForm mode="signup" onSubmit={handleSignup} error={error} onGoogleSignIn={handleGoogleSignUp} />;
};

export default SignupPage; 