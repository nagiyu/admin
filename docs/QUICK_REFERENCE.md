# クイックリファレンス

## はじめに

このドキュメントは、Admin プロジェクトの開発を始める際のクイックリファレンスです。

## 新規開発者向け

### 最初に読むべきドキュメント

1. [README.md](../README.md) - プロジェクト概要とクイックスタート
2. [システムアーキテクチャ](../docs/architecture/system-architecture.md) - 全体構成の理解
3. [実装ルール](../docs/development/implementation-rules.md) - コーディング規約

### セットアップ手順

```bash
# 1. クローン
git clone https://github.com/nagiyu/admin.git
cd admin

# 2. Submodule 初期化
git submodule update --init --recursive

# 3. 依存関係インストール
cd admin && npm install
cd ../client && npm install
cd ../cloud-watch-trigger && npm install

# 4. 開発サーバー起動
cd client && npm run dev
```

## タスク別ガイド

### 新しい CRUD サービスを追加したい

1. [バックエンドサービス](./components/backend-services.md#新しいサービスの作成) を参照
2. 以下の手順で実装:
   - Data 型の定義
   - Record 型の定義
   - DataAccessor の作成
   - Service の作成
   - テストの作成

**所要時間**: 約30分

### 新しい画面を追加したい

1. [フロントエンドコンポーネント](./components/frontend-components.md) を参照
2. 共通コンポーネントを活用
3. `app/` ディレクトリに `page.tsx` を追加

**所要時間**: 約1時間

### エラー通知を設定したい

1. [エラー通知機能](./features/error-notification.md) を参照
2. CloudWatch Logs 設定
3. Lambda トリガー設定

**所要時間**: 約2時間

### テストを書きたい

1. [テストガイド](./development/testing-guide.md) を参照
2. `tests/` ディレクトリに `{テスト対象}.test.ts` を作成

**所要時間**: 約20分/テスト

## よくある質問

### Q: 共通部品はどこにありますか？

A: Git submodule として管理されています:
- `typescript-common/`: TypeScript 共通部品
- `nextjs-common/`: Next.js UI コンポーネント

詳細: [共通部品利用ガイド](./development/common-components-guide.md)

### Q: DynamoDB テーブル名はどう決まりますか？

A: 環境変数 `PROCESS_ENV` に基づいて決定されます:
- `local`, `development`: `Dev{TableName}`
- `production`: `{TableName}`

詳細: [Admin機能 - DynamoDBテーブル設計](./features/admin.md#dynamodb-テーブル設計)

### Q: 認証はどのように実装されていますか？

A: NextAuth.js と FeatureGuard コンポーネントを使用:
```typescript
<FeatureGuard
  feature={AdminFeature.MY_FEATURE}
  level={PermissionLevel.VIEW}
>
  {/* コンテンツ */}
</FeatureGuard>
```

詳細: [フロントエンドコンポーネント - 認証設定](./components/frontend-components.md#認証設定)

### Q: キャッシュは使うべきですか？

A: 以下の場合はキャッシュ無効:
- 手動でのデータ書き換えの可能性がある
- リアルタイム性が重要

それ以外はキャッシュ有効を推奨。

詳細: [バックエンドサービス - キャッシュ管理](./components/backend-services.md#キャッシュ管理)

### Q: エラーハンドリングはどうすればいいですか？

A: try-catch を使用し、明確なエラーメッセージを提供:
```typescript
try {
  const data = await service.get();
} catch (error) {
  console.error('データ取得エラー:', error);
  throw error;
}
```

詳細: [実装ルール - エラーハンドリング](./development/implementation-rules.md#エラーハンドリングルール)

## コマンド一覧

### 開発

```bash
# フロントエンド開発サーバー
cd client && npm run dev

# バックエンドテスト
cd admin && npm run test

# Lambda テスト
cd cloud-watch-trigger && npm run test
```

### ビルド

```bash
# フロントエンドビルド
cd client && npm run build

# Lambda ビルド
cd cloud-watch-trigger && ./build.sh
```

### Lint

```bash
# フロントエンド Lint
cd client && npm run lint
```

### Git

```bash
# Submodule 更新
git submodule update --remote --recursive

# 変更確認
git --no-pager status
git --no-pager diff

# コミット
git add .
git commit -m "メッセージ"
git push
```

## ディレクトリ構造

```
admin/
├── admin/                    # バックエンド
│   ├── consts/              # 定数
│   ├── interfaces/          # 型定義
│   │   ├── data/           # Data型
│   │   └── records/        # Record型
│   ├── services/            # サービス
│   ├── utils/               # ユーティリティ
│   └── tests/               # テスト
├── client/                   # フロントエンド
│   ├── app/                 # Next.js App Router
│   └── services/            # クライアントサービス
├── cloud-watch-trigger/      # Lambda
│   ├── services/            # Lambda サービス
│   └── tests/               # テスト
├── docs/                     # ドキュメント
│   ├── architecture/        # アーキテクチャ
│   ├── components/          # コンポーネント
│   ├── development/         # 開発ガイド
│   ├── features/            # 機能
│   └── settings/            # 設定
├── nextjs-common/           # Next.js共通部品
└── typescript-common/       # TypeScript共通部品
```

## 主要な型定義

### DataTypeBase

```typescript
interface DataTypeBase {
  id: string;      // 一意識別子
  create: number;  // 作成日時
  update: number;  // 更新日時
}
```

### RecordTypeBase

```typescript
interface RecordTypeBase {
  ID: string;      // 一意識別子 (Partition Key)
  Create: number;  // 作成日時
  Update: number;  // 更新日時
}
```

### PermissionLevel

```typescript
enum PermissionLevel {
  VIEW = 'VIEW',    // 閲覧
  EDIT = 'EDIT',    // 編集
  ADMIN = 'ADMIN',  // 管理者
}
```

## 環境変数

### 共通

- `PROCESS_ENV`: 環境 (`local`, `development`, `production`)
- `AWS_REGION`: AWS リージョン

### Lambda

- `DYNAMODB_TABLE_PREFIX`: テーブルプレフィックス
- `NOTIFICATION_WEBHOOK_URL`: 通知先 URL
- `LLM_API_KEY`: AI 分析用 API キー

## トラブルシューティング

### Submodule が空

```bash
git submodule update --init --recursive
```

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### テストが失敗する

- AWS 認証情報を確認
- DynamoDB 接続を確認
- モックを使用

### Import エラー

`tsconfig.json` のパス設定を確認:
```json
{
  "compilerOptions": {
    "paths": {
      "@common/*": ["../typescript-common/src/*"],
      "@client-common/*": ["../nextjs-common/src/*"],
      "@admin/*": ["./admin/*"]
    }
  }
}
```

## 参考リンク

### 公式ドキュメント

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Material-UI](https://mui.com/)
- [Jest](https://jestjs.io/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)

### プロジェクトドキュメント

- [システムアーキテクチャ](./architecture/system-architecture.md)
- [データフロー](./architecture/data-flow.md)
- [実装ルール](./development/implementation-rules.md)
- [共通部品利用ガイド](./development/common-components-guide.md)
- [テストガイド](./development/testing-guide.md)

## サポート

質問や問題がある場合:
1. ドキュメントを検索
2. チームメンバーに相談
3. [Issue](https://github.com/nagiyu/admin/issues) を作成

## 更新履歴

- 2025-10-29: 初版作成
