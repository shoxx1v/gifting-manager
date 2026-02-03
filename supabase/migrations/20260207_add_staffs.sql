-- 社員（担当者）テーブルを作成
CREATE TABLE IF NOT EXISTS staffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- campaignsテーブルにstaff_id（担当者）カラムを追加
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staffs(id);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_staffs_is_active ON staffs(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_staff_id ON campaigns(staff_id);

-- RLSポリシー（staffs）
ALTER TABLE staffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on staffs" ON staffs
  FOR ALL USING (true) WITH CHECK (true);
