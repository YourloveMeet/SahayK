const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key) acc[key] = values.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'testpassword123';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: password,
    options: {
      data: {
        full_name: 'Test User',
        role: 'seeker'
      }
    }
  });

  console.log("=== authError ===");
  console.log(JSON.stringify(authError, null, 2));

  console.log("\n=== authData ===");
  console.log(JSON.stringify(authData, null, 2));
}

testTrigger();
