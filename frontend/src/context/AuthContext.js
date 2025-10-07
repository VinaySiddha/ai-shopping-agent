// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode first
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    if (isDemoMode) {
      setDemoMode(true);
      setSession({
        user: {
          id: 'demo-user',
          email: 'demo@example.com'
        },
        access_token: 'demo-token'
      });
      setAuthToken('demo-token');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthToken(session?.access_token);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthToken(session?.access_token);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (demoMode) {
      localStorage.removeItem('demoMode');
      setDemoMode(false);
      setSession(null);
      setAuthToken(null);
    } else {
      await supabase.auth.signOut();
      setAuthToken(null);
    }
  };

  const value = {
    session,
    loading,
    signOut,
    user: session?.user,
    isAuthenticated: !!session,
    demoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};