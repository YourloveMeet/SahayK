require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Note: For row inserts, we might need a Service Role Key if RLS prevents inserts. But let's check if anon key works if we don't have an insert policy. Wait, we ONLY have SELECT policies on these tables right now!
