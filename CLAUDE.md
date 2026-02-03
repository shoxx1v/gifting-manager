# Gifting App 開発進捗状況

最終更新: 2026-02-03

## 完了したタスク

### 1. UI配色のグレースケール化
- [x] ダッシュボードのステータス色をグレースケールに変更
- [x] Tailwind設定のprimaryカラーをグレースケールに統一
- [x] globals.cssのボタン・ステータスバッジをグレースケール化
- [x] サイドバーのブランドカラーをグレー系に変更
- [x] AIチャットウィジェットをgray-800に変更
- [x] トースト通知をグレースケールに統一

### 2. 案件登録フォームの仕様変更
- [x] 通知仕様（未入力通知）を削除
- [x] 必須項目の追加（いいね数、コメント数、検討コメント、入力日、品番、枚数、セール日、打診日）
- [x] 「回数」フィールドの自動計算化
- [x] 「合意日」を「打診日」にリネーム
- [x] ブランドを固定選択に変更

### 3. AIアシスタント機能修正
- [x] APIエンドポイントでデータベースから直接コンテキストを取得
- [x] トップインフルエンサーを自動計算
- [x] エラーハンドリング強化

### 4. ブランド別データ分離機能（2026-02-02）
- [x] ブランド選択画面（/brand-select）の実装
- [x] BrandContextによるブランド状態管理
- [x] インフルエンサーテーブルにbrand列追加
- [x] 全ページでブランドフィルタリング対応
- [x] InfluencerModalで新規登録時にブランド自動設定
- [x] インポート機能でブランド別インフルエンサー管理

### 5. 認証・権限管理機能（2026-02-02）
- [x] 強制ログアウト機能（ForceRelogin.tsx）
- [x] ログイン後のブランド選択画面遷移
- [x] 管理者権限チェック（useAdminAuth.ts）
- [x] 管理者専用メニュー（社員管理、管理者ダッシュボード）
- [x] AccessDeniedコンポーネント

### 6. 社員管理機能（2026-02-02）
- [x] staffsテーブルにteam列追加（TL, BE, AM, ADMIN）
- [x] staffsテーブルにis_admin列追加
- [x] 社員一覧でチーム表示・フィルタリング

### 7. UX改善・自動化（2026-02-03）
- [x] カレンダーページにブランドフィルター追加
- [x] AI Insightsページにブランドフィルター追加
- [x] 通知ページ（/notifications）を削除
- [x] **打診日の自動入力**: 新規案件作成時に当日日付を自動設定
- [x] **入力日の自動入力**: いいね/コメント/検討コメント入力時に当日を自動設定
- [x] **投稿日の自動設定**: 投稿URL入力時に当日を自動設定
- [x] **ステータス自動更新**: いいね数入力時にステータスを「合意」に自動変更
- [x] **インフルエンサー新規登録ボタン**: 案件モーダル内で直接追加可能（UserPlusアイコン）

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
- [ ] **Supabaseマイグレーション適用**（未実行）
  - influencersテーブルにbrand列追加
  - staffsテーブルにteam, is_admin列追加
  - SQLファイル: `supabase/migrations/007_add_brand_to_influencers.sql`

### 優先度: 中
- [ ] パフォーマンス最適化 - React Query/SWR導入、ページネーション
- [ ] UI/UX改善 - ダークモード完全対応、レスポンシブ最適化
- [ ] 一括エンゲージメント入力画面

### 優先度: 低
- [ ] キーボードショートカット（Cmd+S保存、Escape閉じる）
- [ ] 最近使ったインフルエンサーをドロップダウン上位に表示
- [ ] ドラッグ&ドロップでExcelインポート
- [ ] リアルタイムバリデーション

## 次にやるべきこと

### 1. Supabaseでマイグレーション実行（最優先）

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

### 2. 本番環境テスト
- 各ブランドでのログイン・データ分離確認
- 自動入力機能の動作確認
- 新規インフルエンサー追加機能の動作確認

### 3. 既存データのブランド振り分け
- 現在全てTLに設定されるため、必要に応じて既存インフルエンサーのブランド更新

## 自動化機能の動作説明

| 機能 | トリガー | 動作 |
|------|---------|------|
| 打診日自動設定 | 新規案件作成 | 当日日付を自動入力 |
| 入力日自動設定 | いいね/コメント/検討コメント入力 | 当日日付を自動入力（未設定時のみ） |
| 投稿日自動設定 | 投稿URL入力 | 当日日付を自動入力（未設定時のみ） |
| ステータス自動変更 | いいね数入力（>0） | 「保留」→「合意」に自動変更 |
| インフルエンサー追加 | +ボタンクリック | モーダル内で即時登録・選択 |

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
- `/src/app/calendar/page.tsx` - カレンダー
- `/src/app/ai-insights/page.tsx` - AI分析

### 認証・権限
- `/src/components/ForceRelogin.tsx` - 強制ログアウト管理
- `/src/hooks/useAuth.ts` - 認証フック
- `/src/hooks/useAdminAuth.ts` - 管理者権限フック
- `/src/contexts/BrandContext.tsx` - ブランド状態管理

### 管理者
- `/src/app/admin/page.tsx` - 管理者ダッシュボード
- `/src/app/staffs/page.tsx` - 社員管理

### フォーム
- `/src/components/forms/CampaignModal.tsx` - 案件登録モーダル（自動化機能含む）
- `/src/components/forms/InfluencerModal.tsx` - インフルエンサー登録モーダル

### 設定
- `/src/types/index.ts` - 型定義・管理者メール一覧
- `/tailwind.config.ts` - Tailwind設定

## localStorage キー

| キー | 用途 |
|-----|------|
| `gifting_session_version` | セッションバージョン管理（強制ログアウト用） |
| `selectedBrand` | 選択中のブランド（TL/BE/AM） |
| `brandSelected` | ブランド選択済みフラグ |
| `favoriteInfluencers` | お気に入りインフルエンサーID配列 |
| `blacklistedInfluencers` | ブラックリストID配列 |

## 本番URL

https://gifting-app-seven.vercel.app

## 開発メモ

### セッションバージョン
現在のバージョン: `2026-02-02-v3`
変更するとすべてのユーザーが強制ログアウトされる

### ブランドフィルタリング
すべてのページで`.eq('brand', currentBrand)`を使用
例外: admin/page.tsx, audit-log/page.tsx（全データ表示）
