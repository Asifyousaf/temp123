
import { createClient } from '@supabase/supabase-js';

// Supabase connection configuration
const SUPABASE_URL = 'https://knlcoxqeqhrcvqsussca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubGNveHFlcWhyY3Zxc3Vzc2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODQ0NTYsImV4cCI6MjA1OTg2MDQ1Nn0.uUeamU7pEUz-KNTGs5liang-XPmiyBSjpP1KHG945ms';

// Create Supabase client with explicit session persistence settings
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  }
});

// Export for use throughout the application
export default supabase;
