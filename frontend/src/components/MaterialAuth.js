// src/components/MaterialAuth.js
import React, { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ShoppingBag,
  Star,
  TrendingUp,
  Security,
  Speed,
  Build,
  Favorite
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

function MaterialAuth() {
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

  const fillDemoCredentials = () => {
    setEmail('demo@example.com');
    setPassword('demo123456');
    toast.info('Demo credentials filled! Click Sign In to continue.');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      
      <Container component="main" maxWidth="lg" sx={{ height: '100vh', py: 2, position: 'relative', zIndex: 1 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Left Side - Hero Section */}
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              position: 'relative'
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}
            >
              <Box textAlign="center" sx={{ mb: 6 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                >
                  <Avatar
                    sx={{
                      m: 'auto',
                      mb: 3,
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
                    }}
                  >
                    <ShoppingBag sx={{ fontSize: 40 }} />
                  </Avatar>
                </motion.div>
                
                <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="white">
                  AI Shopping Assistant
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
                  Experience the future of intelligent product discovery
                </Typography>
              </Box>

              {/* Feature Cards */}
              <Grid container spacing={2} sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                {[
                  { icon: <Speed />, title: 'Adaptable Performance', desc: 'Effortlessly adjusts to your needs' },
                  { icon: <Build />, title: 'Built to Last', desc: 'Experience unmatched durability' },
                  { icon: <Favorite />, title: 'Great Experience', desc: 'Intuitive interface design' },
                  { icon: <Star />, title: 'Innovative Features', desc: 'Stay ahead with cutting-edge tech' }
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          backdropFilter: 'blur(20px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              mr: 1, 
                              color: '#00d4ff',
                              background: 'rgba(0, 212, 255, 0.1)',
                              borderRadius: '50%',
                              p: 0.5,
                              display: 'flex'
                            }}>
                              {feature.icon}
                            </Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="white">
                              {feature.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="rgba(255,255,255,0.7)">
                            {feature.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>

          {/* Right Side - Auth Form */}
          <Grid item xs={12} sm={8} md={5}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                  }}
                >
                  {/* Header */}
                  <Box textAlign="center" sx={{ mb: 4 }}>
                    <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom color="white">
                      Sign in
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Access your intelligent shopping dashboard
                    </Typography>
                  </Box>

                  {/* Demo Login Helper */}
                  {!isSignUp && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3,
                          backdropFilter: 'blur(20px)',
                          background: 'rgba(0, 212, 255, 0.1)',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                          color: 'white',
                          '& .MuiAlert-icon': {
                            color: '#00d4ff'
                          }
                        }}
                        action={
                          <Button 
                            color="inherit" 
                            size="small" 
                            onClick={fillDemoCredentials}
                            sx={{ 
                              fontWeight: 'bold',
                              color: '#00d4ff'
                            }}
                          >
                            Try Demo
                          </Button>
                        }
                      >
                        <Typography variant="body2">
                          Experience the AI shopping assistant
                        </Typography>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Auth Form */}
                  <Box component="form" noValidate onSubmit={handleAuth} sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)',
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                        },
                      }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)',
                        },
                        '& .MuiOutlinedInput-input': {
                          color: 'white',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Link component="button" variant="body2" sx={{ mt: 1, color: '#00d4ff', float: 'right' }}>
                      Forgot your password?
                    </Link>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                          {isSignUp ? 'Creating Account...' : 'Signing In...'}
                        </Box>
                      ) : (
                        isSignUp ? 'Sign Up' : 'Sign in'
                      )}
                    </Button>

                    <Box textAlign="center">
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                      </Typography>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => setIsSignUp(!isSignUp)}
                        sx={{
                          mt: 1,
                          fontWeight: 'bold',
                          color: '#00d4ff',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                      </Link>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MaterialAuth;