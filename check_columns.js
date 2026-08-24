const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mtxqrudcbctmjtrotuyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eHFydWRjYmN0bWp0cm90dXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTA4MjcsImV4cCI6MjA5ODYyNjgyN30.Ka2TDmy6rxIjZJEfZT5Hut1gugTnMe7NvixZWFbpFuM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('medicine_products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data');
  }
}

check();
