// src/components/Auth.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    if (!cleanedEmail || !cleanedPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation
    if (cleanedPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      let authError, authData;

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: cleanedPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { app_role: 'user' },
          },
        });
        authError = error;
        authData = data;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: cleanedPassword,
        });
        authError = error;
        authData = data;
      }

      if (authError) {
        console.error('Auth error:', authError);
        let friendly = authError.message;
        
        // Handle specific error cases
        if (authError.message?.includes('Invalid login credentials')) {
          friendly = "Invalid email or password. Please check your credentials and try again.";
        } else if (authError.message?.includes('Email not confirmed')) {
          friendly = "Please check your email and click the confirmation link before signing in.";
        } else if (authError.message?.includes('signup') && authError.message?.includes('disabled')) {
          friendly = "Account registration is currently disabled. Please contact support.";
        } else if (authError.message?.includes('password') && authError.message?.includes('length')) {
          friendly = "Password does not meet the requirements. Try a longer password.";
        } else if (authError.message?.includes('rate limit')) {
          friendly = "Too many attempts. Please wait a minute before trying again.";
        } else if (authError.message?.includes('already registered')) {
          friendly = "This email is already registered. Try signing in instead.";
        } else if (authError.status === 400) {
          friendly = "Authentication failed. Please check your email and password.";
        }
        
        toast.error(friendly);
      } else {
        if (isSignUp) {
          toast.success('Registration successful! Please check your email inbox to confirm your account.');
        } else {
          toast.success('Signed in successfully!');
        }
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full mb-6"
          >
            <SparklesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Shopping Assistant
          </h1>
          <p className="text-lg text-gray-600">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-elegant p-8"
        >
          <form onSubmit={handleAuth} className="space-y-6">
            {/* Demo Login Helper */}
            {!isSignUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              >
                <h4 className="text-sm font-medium text-blue-900 mb-2">🚀 Quick Demo Access</h4>
                <p className="text-xs text-blue-700 mb-3">
                  Try the enhanced shopping assistant with filter-based search
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@example.com');
                    setPassword('demo123456');
                    toast.info('Demo credentials filled! Click Sign In to continue.');
                  }}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors"
                >
                  Fill Demo Credentials
                </button>
              </motion.div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </motion.button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          Powered by advanced AI • Find the perfect products effortlessly
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Auth;
