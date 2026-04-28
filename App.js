import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { firebaseAuth } from './src/services/authService'; // ← import the real instance
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  useEffect(() => {
    const testAuth = async () => {
      try {
        console.log('Testing Firebase Auth connectivity...');
        console.log('Firebase app name:', firebaseAuth.app.name);
        console.log('Firebase app options:', {
          apiKey: firebaseAuth.app.options.apiKey?.slice(0, 15) + '...',
          authDomain: firebaseAuth.app.options.authDomain,
          projectId: firebaseAuth.app.options.projectId,
        });

        await signInWithEmailAndPassword(
          firebaseAuth,          // ← use the real auth instance
          'almergoco@gmail.com',
          '123456'
        );
        console.log('Firebase Auth WORKS on this device');
      } catch (err) {
        console.log('Firebase Auth error code:', err.code);
        console.log('Firebase Auth error message:', err.message);
      }
    };

    testAuth();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}