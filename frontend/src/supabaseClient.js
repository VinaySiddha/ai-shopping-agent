// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// These environment variables will be loaded from your .env.local file.
// In production, they should be set on your hosting provider.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Ensure that the environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not set in environment variables.");
  // You might want to throw an error or handle this more gracefully in a real app
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);