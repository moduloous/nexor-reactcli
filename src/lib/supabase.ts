import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://mtxqrudcbctmjtrotuyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eHFydWRjYmN0bWp0cm90dXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTA4MjcsImV4cCI6MjA5ODYyNjgyN30.Ka2TDmy6rxIjZJEfZT5Hut1gugTnMe7NvixZWFbpFuM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
