# Gifting Manager - インフルエンサーギフティング管理システム

アパレルブランドのインフルエンサーギフティング活動を管理するWebアプリケーションです。

## 機能

- **ダッシュボード**: 案件数、支出額、エンゲージメント等の統計をグラフで可視化
- **インフルエンサー管理**: Instagram/TikTokアカウント情報の登録・編集・削除
- **ギフティング案件管理**: 商品提供、金額、ステータス、投稿情報の追跡
- **データインポート**: Excel/CSVファイルからの一括データ取り込み
- **ユーザー認証**: メール/パスワードでのログイン機能

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド/DB**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **チャート**: Recharts
- **Excelパース**: SheetJS (xlsx)

## セットアップ手順

### 1. Node.jsのインストール

Node.js 18以上が必要です。
https://nodejs.org/ からインストールしてください。

### 2. Supabaseプロジェクトの作成

1. https://app.supabase.com にアクセス
2. 新規プロジェクトを作成
3. プロジェクト設定からURL/Anon Keyを取得

### 3. データベースのセットアップ

Supabaseダッシュボードの「SQL Editor」で以下を実行:

```sql
-- src/lib/database.sql の内容をコピー&ペーストして実行
```

### 4. 環境変数の設定

```bash
cd gifting-app
cp .env.local.example .env.local
```

`.env.local` を編集:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. 依存関係のインストールと起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

## 使い方

### 初回利用

1. 認証画面で「新規登録」からアカウント作成
2. 確認メールのリンクをクリック（Supabaseのメール設定による）
3. ログイン

### データインポート

1. サイドメニューの「インポート」をクリック
2. 「テンプレートダウンロード」でExcelテンプレートを取得
3. テンプレートにデータを入力
4. ファイルをアップロード
5. プレビューを確認して「インポート実行」

### 案件管理

- **新規追加**: 「新規案件」ボタンから登録
- **編集**: 各行の編集アイコンをクリック
- **削除**: 各行の削除アイコンをクリック
- **フィルター**: ステータス、ブランドで絞り込み可能

## ディレクトリ構成

```
gifting-app/
├── src/
│   ├── app/                 # Next.js App Router ページ
│   │   ├── auth/           # 認証ページ
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── influencers/    # インフルエンサー管理
│   │   ├── campaigns/      # 案件管理
│   │   └── import/         # データインポート
│   ├── components/         # Reactコンポーネント
│   │   ├── forms/         # フォーム・モーダル
│   │   ├── layout/        # レイアウト
│   │   └── ui/            # UIコンポーネント
│   ├── hooks/             # カスタムフック
│   ├── lib/               # ユーティリティ・設定
│   └── types/             # TypeScript型定義
├── public/                # 静的ファイル
└── package.json
```

## デプロイ

### Vercelへのデプロイ

1. GitHubにリポジトリをプッシュ
2. https://vercel.com でインポート
3. 環境変数を設定
4. デプロイ

## ライセンス

MIT
