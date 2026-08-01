const url = 'https://mtxqrudcbctmjtrotuyk.supabase.co/rest/v1/medicine_products';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eHFydWRjYmN0bWp0cm90dXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTA4MjcsImV4cCI6MjA5ODYyNjgyN30.Ka2TDmy6rxIjZJEfZT5Hut1gugTnMe7NvixZWFbpFuM';

const medicines = [
  {
    item_code: 'F0007',
    name: 'SINAREST TAB',
    company: 'CENTAUR PHARMA',
    packing: "10'S",
    price: 65.00,
    dosage_form: 'Tablet'
  },
  {
    item_code: 'F0008',
    name: 'SINAREST SYRUP 60ML',
    company: 'CENTAUR PHARMA',
    packing: "60ML",
    price: 90.00,
    dosage_form: 'Syrup'
  }
];

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(medicines)
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Error:', err));
