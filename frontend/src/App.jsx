import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from './firebase'; // Import Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import the listener
import { setAuthUser, clearAuthUser, setAuthStatus } from './store/authSlice'; // Import actions

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Loading from './components/Common/Loading';

function App() {
  const { user, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  // We need a local loading state to wait for the initial auth check
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        firebaseUser.getIdToken().then((token) => {
          // Store the fresh token in localStorage for our API interceptor to use
          localStorage.setItem('authToken', token);
          // Dispatch user info to Redux store
          dispatch(
            setAuthUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            })
          );
        });
      } else {
        // User is signed out
        localStorage.removeItem('authToken');
        dispatch(clearAuthUser());
      }
      // Finished the initial check
      setIsAuthChecking(false);
      dispatch(setAuthStatus('idle'));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  if (isAuthChecking) {
    return <div className="h-screen w-screen flex items-center justify-center"><Loading /></div>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;