import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://guxsxswirlcxuqtdxqoc.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1eHN4c3dpcmxjeHVxdGR4cW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzY2NzgsImV4cCI6MjA3MDQxMjY3OH0.aXsSqLBA7qaG36b1nSHOfIdbm1jDwvbUoUqa51zg7s4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});