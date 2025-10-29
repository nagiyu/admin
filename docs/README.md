# Admin プロジェクトドキュメント

## 概要

Admin プロジェクトは、管理機能を提供するシステムです。以下の3つの主要コンポーネントで構成されています：

- **admin**: バックエンドサービスとビジネスロジック
- **client**: Next.js ベースのフロントエンドアプリケーション
- **cloud-watch-trigger**: AWS CloudWatch Logs からのエラー通知を処理する Lambda 関数

## ドキュメント一覧

### アーキテクチャ
- [システムアーキテクチャ](./architecture/system-architecture.md) - システム全体の構成
- [データフロー](./architecture/data-flow.md) - データの流れと処理フロー

### 機能ドキュメント
- [Admin 機能](./features/admin.md) - 管理者機能の詳細
- [エラー通知機能](./features/error-notification.md) - エラー通知システムの詳細
- [機能情報管理](./features/feature-info.md) - 機能情報の管理

### コンポーネント
- [バックエンドサービス](./components/backend-services.md) - バックエンドサービスの実装
- [フロントエンドコンポーネント](./components/frontend-components.md) - フロントエンドコンポーネントの利用方法
- [Cloud Watch Trigger](./components/cloud-watch-trigger.md) - Lambda 関数の詳細

### 開発ガイド
- [実装ルール](./development/implementation-rules.md) - コーディング規約と実装ルール
- [共通部品利用ガイド](./development/common-components-guide.md) - 共通部品の使い方
- [テストガイド](./development/testing-guide.md) - テストの書き方

### セットアップ
- [基本設定](./settings/baseSetting.md) - GitHub と AWS の基本設定

## クイックスタート

### 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/nagiyu/admin.git
cd admin
git submodule update --init --recursive
```

2. Admin バックエンドのセットアップ
```bash
cd admin
npm install
npm run test
```

3. Client フロントエンドのセットアップ
```bash
cd client
npm install
npm run dev
```

4. Cloud Watch Trigger のセットアップ
```bash
cd cloud-watch-trigger
npm install
npm run test
```

## プロジェクト構成

```
admin/
├── admin/                    # バックエンドサービス
│   ├── consts/              # 定数定義
│   ├── interfaces/          # TypeScript インターフェース
│   ├── services/            # ビジネスロジック
│   ├── utils/               # ユーティリティ関数
│   └── tests/               # テストコード
├── client/                   # Next.js フロントエンド
│   ├── app/                 # Next.js App Router
│   ├── services/            # クライアントサービス
│   └── public/              # 静的ファイル
├── cloud-watch-trigger/      # Lambda 関数
│   ├── services/            # Lambda サービス
│   └── tests/               # テストコード
├── docs/                     # ドキュメント
├── nextjs-common/           # Next.js 共通部品 (submodule)
└── typescript-common/       # TypeScript 共通部品 (submodule)
```

## 技術スタック

### フロントエンド
- **Next.js 15.4.3**: React フレームワーク
- **React 19.1.1**: UI ライブラリ
- **TypeScript 5**: 型安全な JavaScript
- **next-auth 4.24.11**: 認証ライブラリ

### バックエンド
- **TypeScript**: 型安全な開発
- **AWS DynamoDB**: データストア
- **AWS Lambda**: サーバーレス関数

### 開発ツール
- **Jest**: テストフレームワーク
- **ESLint**: コード品質チェック

## ライセンス

このプロジェクトは Apache License 2.0 および MIT License のデュアルライセンスです。
