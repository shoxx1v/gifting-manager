import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addEngagementDateColumn() {
  console.log('Adding engagement_date column to campaigns table...');

  // Supabaseではクライアントからalter tableは実行できないため、
  // ダッシュボードのSQL Editorで実行する必要があります
  console.log(`
Run this SQL in Supabase Dashboard > SQL Editor:

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS engagement_date DATE;

COMMENT ON COLUMN campaigns.engagement_date IS 'エンゲージメント入力日';
  `);
}

addEngagementDateColumn();
