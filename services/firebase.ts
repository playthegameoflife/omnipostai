import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDEM5oykLU1XXAldbyNgky3Lcm0akM3diQ',
  authDomain: 'promptifyai-6j2zl.firebaseapp.com',
  databaseURL: 'https://promptifyai-6j2zl-default-rtdb.firebaseio.com',
  projectId: 'promptifyai-6j2zl',
  storageBucket: 'promptifyai-6j2zl.appspot.com', // fixed typo
  messagingSenderId: '1006476503666',
  appId: '1:1006476503666:web:271b5c8e56ad7ad681b0eb'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app; 