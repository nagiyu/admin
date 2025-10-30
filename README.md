# Admin プロジェクト

## 概要

Admin は、管理機能を提供するフルスタック Web アプリケーションです。Next.js、TypeScript、AWS サービスを活用した、スケーラブルで保守性の高いシステムです。

## 主要機能

- **エラー通知管理**: CloudWatch Logs と連携した自動エラー検出・通知システム
- **管理者機能**: 管理者と管理対象端末の管理
- **機能情報管理**: 機能とURLのマッピング管理

## プロジェクト構成

```
admin/
├── admin/                    # バックエンドサービス (TypeScript)
├── client/                   # フロントエンド (Next.js)
├── cloud-watch-trigger/      # Lambda 関数
├── docs/                     # ドキュメント
├── nextjs-common/           # Next.js 共通部品 (submodule)
└── typescript-common/       # TypeScript 共通部品 (submodule)
```

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/nagiyu/admin.git
cd admin
git submodule update --init --recursive
```

### 2. Admin バックエンド

```bash
cd admin
npm install
npm run test
```

### 3. Client フロントエンド

```bash
cd client
npm install
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### 4. Cloud Watch Trigger

```bash
cd cloud-watch-trigger
npm install
npm run test
```

## ドキュメント

詳細なドキュメントは [docs/README.md](./docs/README.md) を参照してください。

### 主要ドキュメント

- [システムアーキテクチャ](./docs/architecture/system-architecture.md)
- [データフロー](./docs/architecture/data-flow.md)
- [実装ルール](./docs/development/implementation-rules.md)
- [共通部品利用ガイド](./docs/development/common-components-guide.md)
- [テストガイド](./docs/development/testing-guide.md)

### 機能ドキュメント

- [Admin 機能](./docs/features/admin.md)
- [エラー通知機能](./docs/features/error-notification.md)
- [機能情報管理](./docs/features/feature-info.md)

### コンポーネントドキュメント

- [バックエンドサービス](./docs/components/backend-services.md)
- [フロントエンドコンポーネント](./docs/components/frontend-components.md)
- [Cloud Watch Trigger](./docs/components/cloud-watch-trigger.md)

## 技術スタック

### フロントエンド
- Next.js 15.4.3
- React 19.1.1
- TypeScript 5
- Material-UI (共通部品より提供)

### バックエンド
- TypeScript
- AWS DynamoDB
- AWS Lambda
- AWS CloudWatch Logs

### 開発ツール
- Jest (テスト)
- ESLint (コード品質)

## 開発ガイド

### コーディング規約

[実装ルール](./docs/development/implementation-rules.md) を参照してください。

主要な規約:
- 宣言型プログラミングを心掛ける
- TypeScript の型システムを最大限活用
- 共通部品を積極的に使用
- 読みやすいコードを書く

### テスト

```bash
# Admin バックエンドのテスト
cd admin
npm run test

# Cloud Watch Trigger のテスト
cd cloud-watch-trigger
npm run test
```

### ビルド

```bash
# Client のビルド
cd client
npm run build

# Cloud Watch Trigger のビルド
cd cloud-watch-trigger
./build.sh
```

## デプロイ

GitHub Actions による CI/CD を使用します。

- `develop` ブランチ: 開発環境へ自動デプロイ
- `main/master` ブランチ: 本番環境へ自動デプロイ

詳細は `.github/workflows/` を参照してください。

## ライセンス

このプロジェクトは Apache License 2.0 および MIT License のデュアルライセンスです。

- [Apache License 2.0](./Apache_LICENSE)
- [MIT License](./MIT_LICENSE)

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まず Issue を開いて変更内容を議論してください。

## サポート

質問や問題がある場合は、[Issue](https://github.com/nagiyu/admin/issues) を作成してください。
