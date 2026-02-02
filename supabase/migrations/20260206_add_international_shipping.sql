-- BEブランド用の海外発送フィールドを追加
-- campaigns テーブルに新しいカラムを追加

-- 海外発送フラグ
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_international_shipping BOOLEAN DEFAULT FALSE;

-- 発送先国
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100);

-- 海外発送送料（国内と異なる場合）
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS international_shipping_cost DECIMAL(10, 2);

-- 通貨コード（海外の場合、USDなど）
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'JPY';

-- インデックス追加（海外発送案件のフィルタリング用）
CREATE INDEX IF NOT EXISTS idx_campaigns_international ON campaigns(is_international_shipping) WHERE is_international_shipping = TRUE;
