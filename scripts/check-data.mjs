import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: campaigns, error: cErr } = await supabase.from('campaigns').select('id');
  const { data: influencers, error: iErr } = await supabase.from('influencers').select('id');

  console.log('Campaigns count:', campaigns?.length || 0);
  console.log('Influencers count:', influencers?.length || 0);

  if (cErr) console.error('Campaign error:', cErr);
  if (iErr) console.error('Influencer error:', iErr);
}

check();
