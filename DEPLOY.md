# Vercelデプロイ手順

## 前提条件

- GitHubアカウント（tairu07）
- Vercelアカウント（GitHubでログイン済み）

## デプロイ手順

### 1. Vercelダッシュボードにアクセス

https://vercel.com/new にアクセスしてログイン

### 2. GitHubリポジトリをインポート

1. 「Import Git Repository」セクションで `jquants-chart-player` を検索
2. 「Import」ボタンをクリック

### 3. プロジェクト設定

#### ブランチ選択
- **重要**: デフォルトの `main` ブランチではなく、`static-frontend` ブランチを選択してください
- ブランチ選択ドロップダウンから `static-frontend` を選択

#### プロジェクト名
- デフォルト: `jquants-chart-player`（変更可能）

#### Framework Preset
- 自動検出: `Vite`（そのまま）

#### Root Directory
- デフォルト: `./`（そのまま）

#### Build and Output Settings
- **Build Command**: `cd client && pnpm install && pnpm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `pnpm install --filter client`

これらの設定は `vercel.json` に記載されているため、自動的に適用されます。

#### Environment Variables
- 静的フロントエンドのみのため、環境変数は不要です

### 4. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

### 5. デプロイ完了

デプロイが完了すると、以下のような URL が発行されます：
- Production: `https://jquants-chart-player.vercel.app`
- Preview: `https://jquants-chart-player-<hash>.vercel.app`

## 注意事項

### ブランチについて

- **main ブランチ**: フルスタック版（サーバー + データベース + 認証）
- **static-frontend ブランチ**: 静的フロントエンドのみ（Vercel向け）

Vercelでは必ず `static-frontend` ブランチをデプロイしてください。

### 機能制限

静的版では以下の機能が利用できません：
- ユーザー認証
- お気に入り機能（データベース連携）

代わりに、以下の機能が利用可能です：
- チャート巡回機能（モックデータ）
- 移動平均線表示
- 出来高表示
- 対数スケール切替
- 再生速度調整

### カスタムドメイン

Vercelダッシュボードから独自ドメインを設定可能です：
1. プロジェクト設定 → Domains
2. カスタムドメインを追加
3. DNS設定を更新

## トラブルシューティング

### ビルドエラーが発生する場合

1. ブランチが `static-frontend` になっているか確認
2. Build Command が正しく設定されているか確認：
   ```
   cd client && pnpm install && pnpm run build
   ```
3. Output Directory が `client/dist` になっているか確認

### ページが表示されない場合

1. Vercelの「Deployments」タブでビルドログを確認
2. 404エラーが出る場合は、`vercel.json` の rewrites 設定を確認

## 参考リンク

- Vercel公式ドキュメント: https://vercel.com/docs
- Viteデプロイガイド: https://vitejs.dev/guide/static-deploy.html
- GitHubリポジトリ: https://github.com/tairu07/jquants-chart-player

