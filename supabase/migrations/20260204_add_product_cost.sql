-- Add product_cost column to campaigns table
-- Default value is 800 (shipping + product cost)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS product_cost INTEGER DEFAULT 800;
