import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qvtinhyhlyiacqmefiug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dGluaHlobHlpYWNxbWVmaXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4OTUyNTIsImV4cCI6MjA0NjQ3MTI1Mn0.4jfsqmTpYcwZBHZ1DSUgA5-Yr2vUeV2xHkA9kA9FEPQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});