# Gifting App 開発進捗状況

最終更新: 2026-02-02

## 完了したタスク

### 1. UI配色のグレースケール化
- [x] ダッシュボードのステータス色をグレースケールに変更
- [x] Tailwind設定のprimaryカラーをグレースケールに統一
- [x] globals.cssのボタン・ステータスバッジをグレースケール化
- [x] サイドバー（Sidebar.tsx）のブランドカラーをグレー系に変更
- [x] AIチャットウィジェットをviolet/purpleからgray-800に変更
- [x] campaigns/page.tsxの統計カード・UIをグレースケール化
- [x] トースト通知をグレースケールに統一
- [x] CampaignModalの海外発送設定・ボタンをグレースケール化

### 2. 案件登録フォームの仕様変更
- [x] 通知仕様（未入力通知）を削除
- [x] 必須項目の追加（いいね数、コメント数、検討コメント、入力日、品番、枚数、セール日、打診日）
- [x] 「回数」フィールドの自動計算化
- [x] 「合意日」を「打診日」にリネーム
- [x] ブランドを固定選択に変更（自由記述不可）

### 3. AIアシスタント機能修正
- [x] APIエンドポイントでデータベースから直接コンテキストを取得
- [x] トップインフルエンサーを自動計算
- [x] エラーハンドリング強化

### 4. ブランド別データ分離機能（2026-02-02）
- [x] ブランド選択画面（/brand-select）の実装
- [x] BrandContextによるブランド状態管理
- [x] インフルエンサーテーブルにbrand列追加
- [x] 全ページでブランドフィルタリング対応
  - dashboard, campaigns, influencers, reports, import, influencers/[id]
- [x] InfluencerModalで新規登録時にブランド自動設定
- [x] インポート機能でブランド別インフルエンサー管理

### 5. 認証・権限管理機能（2026-02-02）
- [x] 強制ログアウト機能（ForceRelogin.tsx）
  - セッションバージョン管理でユーザーの強制再ログイン
  - localStorage: `gifting_session_version`, `selectedBrand`, `brandSelected`
- [x] ログイン後のブランド選択画面遷移
- [x] 管理者権限チェック（useAdminAuth.ts）
- [x] 管理者専用メニュー（社員管理、管理者ダッシュボード）
- [x] AccessDeniedコンポーネント

### 6. 社員管理機能（2026-02-02）
- [x] staffsテーブルにteam列追加（TL, BE, AM, ADMIN）
- [x] staffsテーブルにis_admin列追加
- [x] 社員一覧でチーム表示・フィルタリング

### 7. UI整理（2026-02-02）
- [x] 通知設定メニューを削除

## 管理者アカウント

```
taishi.sawada@clout.co.jp
hideaki.kudo@clout.co.jp
s@clout.co.jp
```

## 使用カラーパレット（3色制限）

| 用途 | カラーコード | Tailwindクラス |
|------|-------------|----------------|
| メイン（濃） | #1f2937 | gray-800 |
| サブ（中） | #6b7280 | gray-500 |
| 背景（淡） | #f9fafb | gray-50 |

## 残りのタスク

### 優先度: 高
- [ ] **Supabaseマイグレーション適用**
  - influencersテーブルにbrand列追加（現在フォールバック処理中）
  - staffsテーブルにteam, is_admin列追加
  - SQLファイル: `supabase/migrations/007_add_brand_to_influencers.sql`

### 優先度: 中
- [ ] データベーススキーマ整合性 - `agreed_date`を`inquiry_date`に変更検討
- [ ] パフォーマンス最適化 - React Query/SWR導入、ページネーション
- [ ] UI/UX改善 - ダークモード完全対応、レスポンシブ最適化

### 優先度: 低
- [ ] 通知ページ（/notifications）の削除（ルート自体は残存）

## 次にやるべきこと

1. **Supabaseでマイグレーション実行**（最優先）
   ```sql
   -- インフルエンサーテーブルにブランドカラムを追加
   ALTER TABLE influencers ADD COLUMN IF NOT EXISTS brand VARCHAR(10);
   UPDATE influencers SET brand = 'TL' WHERE brand IS NULL;

   -- 社員テーブルにチームカラムを追加
   ALTER TABLE staffs ADD COLUMN IF NOT EXISTS team VARCHAR(10) DEFAULT 'TL';
   ALTER TABLE staffs ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

   -- インデックス作成
   CREATE INDEX IF NOT EXISTS idx_influencers_brand ON influencers(brand);
   CREATE INDEX IF NOT EXISTS idx_staffs_team ON staffs(team);
   ```

2. **本番環境テスト**
   - 各ブランドでのログイン・データ分離確認
   - 管理者メニューの表示確認
   - インポート機能のブランド別動作確認

3. **既存データのブランド振り分け**
   - 現在全てTLに設定されるため、必要に応じて既存インフルエンサーのブランド更新

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase
- **チャート**: Recharts
- **バリデーション**: react-hook-form + zod
- **デプロイ**: Vercel

## 主要ファイル

### コア
- `/src/app/dashboard/page.tsx` - ダッシュボード
- `/src/app/campaigns/page.tsx` - ギフティング案件一覧
- `/src/app/influencers/page.tsx` - インフルエンサー一覧
- `/src/app/import/page.tsx` - Excelインポート

### 認証・権限
- `/src/components/ForceRelogin.tsx` - 強制ログアウト管理
- `/src/hooks/useAuth.ts` - 認証フック
- `/src/hooks/useAdminAuth.ts` - 管理者権限フック
- `/src/contexts/BrandContext.tsx` - ブランド状態管理

### 管理者
- `/src/app/admin/page.tsx` - 管理者ダッシュボード
- `/src/app/staffs/page.tsx` - 社員管理

### フォーム
- `/src/components/forms/CampaignModal.tsx` - 案件登録モーダル
- `/src/components/forms/InfluencerModal.tsx` - インフルエンサー登録モーダル

### 設定
- `/src/types/index.ts` - 型定義・管理者メール一覧
- `/tailwind.config.ts` - Tailwind設定

## localStorage キー

| キー | 用途 |
|-----|------|
| `gifting_session_version` | セッションバージョン管理 |
| `selectedBrand` | 選択中のブランド |
| `brandSelected` | ブランド選択済みフラグ |
| `favoriteInfluencers` | お気に入りインフルエンサー |
| `blacklistedInfluencers` | ブラックリスト |

## 本番URL

https://gifting-app-seven.vercel.app
