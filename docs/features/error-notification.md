# エラー通知機能

## 概要

エラー通知機能は、アプリケーションで発生したエラーを自動的に検出し、管理者に通知するシステムです。CloudWatch Logs と連携して、リアルタイムでエラーを監視します。

## アーキテクチャ

```
Application Error
       ↓
CloudWatch Logs
       ↓
Lambda Trigger (cloud-watch-trigger)
       ↓
DynamoDB (ErrorNotification)
       ↓
Admin UI (error-notifications page)
```

## データモデル

### ErrorNotificationDataType

```typescript
interface ErrorNotificationDataType extends DataTypeBase {
  id: string;              // エラー通知 ID
  rootFeature: string;     // ルート機能名
  feature: string;         // 機能名
  message: string;         // エラーメッセージ
  stack: string;           // スタックトレース
  analyzeResult?: string;  // AI による分析結果 (オプション)
  create: number;          // 作成日時 (Unix timestamp)
  update: number;          // 更新日時 (Unix timestamp)
}
```

### ErrorNotificationRecordType (DynamoDB)

```typescript
interface ErrorNotificationRecordType extends RecordTypeBase {
  ID: string;              // エラー通知 ID (Partition Key)
  RootFeature: string;     // ルート機能名
  Feature: string;         // 機能名
  Message: string;         // エラーメッセージ
  Stack: string;           // スタックトレース
  AnalyzeResult?: string;  // 分析結果
  Create: number;          // 作成日時
  Update: number;          // 更新日時
}
```

## バックエンドサービス

### ErrorNotificationService

**場所**: `admin/services/ErrorNotification/ErrorNotificationService.ts`

**継承**: `CRUDServiceBase<ErrorNotificationDataType, ErrorNotificationRecordType>`

**特徴**:
- キャッシュを使用しない
- 取得時に作成日時の降順でソート

**主要メソッド**:

#### get()
```typescript
async get(): Promise<ErrorNotificationDataType[]>
```

すべてのエラー通知を作成日時の降順で取得します。

**実装**:
```typescript
public override async get(): Promise<ErrorNotificationDataType[]> {
  const result = await super.get();
  return result.sort((a, b) => b.create - a.create);
}
```

#### getById(id: string)
```typescript
async getById(id: string): Promise<ErrorNotificationDataType | null>
```

特定のエラー通知を取得します。

#### create(data: Partial<ErrorNotificationDataType>)
```typescript
async create(data: Partial<ErrorNotificationDataType>): Promise<void>
```

新しいエラー通知を作成します。

### ErrorNotificationDataAccessor

**場所**: `admin/services/ErrorNotification/ErrorNotificationDataAccessor.ts`

**継承**: `CRUDDataAccessorBase<ErrorNotificationRecordType>`

**責務**:
- DynamoDB との通信
- CRUD 操作の実装

## クライアントサービス

### ErrorNotificationFetchService

**場所**: `client/services/ErrorNotificationFetchService.client.ts`

**責務**:
- クライアントサイドでのデータ取得
- API との通信

**主要メソッド**:

#### get()
```typescript
async get(): Promise<ErrorNotificationDataType[]>
```

すべてのエラー通知を取得します。

#### getById(id: string)
```typescript
async getById(id: string): Promise<ErrorNotificationDataType>
```

特定のエラー通知を取得します。

## UI コンポーネント

### ErrorNotificationsPage

**場所**: `client/app/error-notifications/page.tsx`

**機能**:
- エラー通知の一覧表示
- エラー詳細の表示
- データの更新 (Refresh)
- URL パラメータによる詳細表示

**使用コンポーネント**:
- `BasicTable`: エラー一覧のテーブル表示
- `BasicDialog`: エラー詳細のダイアログ表示
- `ContainedButton`: アクションボタン
- `FeatureGuard`: アクセス制御
- `LoadingContent`: ローディング状態管理

**表示カラム**:

| カラム | 説明 | フォーマット |
|--------|------|-------------|
| Root Feature | ルート機能名 | テキスト |
| Feature | 機能名 | テキスト |
| Message | エラーメッセージ | テキスト |
| Create | 作成日時 | ローカライズされた日時文字列 |
| Action | アクション | Detail ボタン |

**詳細ダイアログ表示項目**:
- ID
- Root Feature
- Feature
- Message
- Stack (複数行テキスト)
- Analyze Result (複数行テキスト、N/A if not available)

**URL パラメータ対応**:
```
/error-notifications?id={error-id}
```

指定された ID のエラー詳細を自動的に表示します。

## Lambda 関数 (Cloud Watch Trigger)

### Lambda ハンドラ

**場所**: `cloud-watch-trigger/index.ts`

**イベント**: CloudWatch Logs

**処理フロー**:
1. CloudWatch Logs イベントを受信
2. ログデータを Base64 デコード & gunzip 展開
3. JSON パースしてエラー情報を抽出
4. ErrorLogEntryService でエラーを記録
5. ErrorNotificationService で通知を送信
6. LogAnalyzerService でログを分析

**実装**:
```typescript
export const handler = async (event: CloudWatchLogsEvent, context: any) => {
  const errorLogEntry = new ErrorLogEntryService();
  const errorNotification = new ErrorNotificationService();
  const logAnalyzer = new LogAnalyzerService();

  try {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const decompressed = await gunzipAsync(payload);
    const logData: CloudWatchLogsDecodedData = JSON.parse(decompressed.toString('utf8'));

    for (const logEvent of logData.logEvents) {
      const message = logEvent.message;
      const errorData: ErrorNotificationDataType = JSON.parse(message);

      const created = await errorLogEntry.entryError(errorData);
      await errorNotification.notify(created);
      await logAnalyzer.analyzeLog(created);
    }
  } catch (err) {
    console.error('Error processing CloudWatch Logs event:', err);
    throw err;
  }
};
```

### ErrorLogEntryService

**場所**: `cloud-watch-trigger/services/ErrorLogEntryService.ts`

**責務**:
- エラーログの解析
- DynamoDB へのエラー情報保存

### ErrorNotificationService (Lambda)

**場所**: `cloud-watch-trigger/services/ErrorNotificationService.ts`

**責務**:
- エラー通知の送信
- 通知チャネルへの配信

### LogAnalyzerService

**場所**: `cloud-watch-trigger/services/LogAnalyzerService.ts`

**責務**:
- ログの AI 分析
- 分析結果の保存

## 使用例

### クライアントサイドでの使用

```typescript
import { ErrorNotificationFetchService } from '@/services/ErrorNotificationFetchService.client';

const fetchService = new ErrorNotificationFetchService();

// すべてのエラー通知を取得
const errors = await fetchService.get();

// 特定のエラー通知を取得
const error = await fetchService.getById('error-001');
```

### React コンポーネントでの使用

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ErrorNotificationFetchService } from '@/services/ErrorNotificationFetchService.client';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';

const fetchService = new ErrorNotificationFetchService();

export default function MyComponent() {
  const [errors, setErrors] = useState<ErrorNotificationDataType[]>([]);

  useEffect(() => {
    (async () => {
      const data = await fetchService.get();
      setErrors(data);
    })();
  }, []);

  return (
    <div>
      {errors.map(error => (
        <div key={error.id}>{error.message}</div>
      ))}
    </div>
  );
}
```

## DynamoDB テーブル設計

### テーブル名

- 開発環境: `DevErrorNotification`
- 本番環境: `ErrorNotification`

### キー構造

- **Partition Key**: `ID` (String)
- **Sort Key**: なし

### 属性

| 属性名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| ID | String | ✓ | エラー通知の一意識別子 |
| RootFeature | String | ✓ | ルート機能名 |
| Feature | String | ✓ | 機能名 |
| Message | String | ✓ | エラーメッセージ |
| Stack | String | ✓ | スタックトレース |
| AnalyzeResult | String |  | AI 分析結果 |
| Create | Number | ✓ | 作成日時 (Unix timestamp) |
| Update | Number | ✓ | 更新日時 (Unix timestamp) |

## CloudWatch Logs 設定

### ログフォーマット

エラーログは以下の JSON フォーマットで CloudWatch Logs に出力します：

```json
{
  "rootFeature": "MyApp",
  "feature": "UserManagement",
  "message": "Failed to update user profile",
  "stack": "Error: Failed to update user profile\n    at UserService.updateProfile (/app/services/UserService.ts:42:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
}
```

### Lambda トリガー設定

1. CloudWatch Logs のロググループを作成
2. サブスクリプションフィルタを設定
3. Lambda 関数をトリガーとして登録
4. フィルタパターン: `{ $.message = "*Error*" }` (オプション)

## セキュリティ

### アクセス制御

- UI へのアクセスは `FeatureGuard` で制御
- 必要な権限: `AdminFeature.ERROR_NOTIFICATION` + `PermissionLevel.VIEW`

### Lambda IAM ロール

必要な権限:
- CloudWatch Logs: 読み取り
- DynamoDB: PutItem, UpdateItem
- (通知先サービスへの権限)

## モニタリング

### CloudWatch メトリクス

- Lambda 実行回数
- Lambda エラー率
- Lambda 実行時間
- DynamoDB スロットリング

### アラート設定

- Lambda エラー率が閾値を超えた場合
- DynamoDB スロットリングが発生した場合

## テスト

### ユニットテスト

```typescript
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';

describe('ErrorNotificationService', () => {
  it('should get errors sorted by create time', async () => {
    const service = new ErrorNotificationService();
    const errors = await service.get();
    
    // 降順ソートの確認
    for (let i = 0; i < errors.length - 1; i++) {
      expect(errors[i].create).toBeGreaterThanOrEqual(errors[i + 1].create);
    }
  });
});
```

### Lambda テスト

**テストファイル**: `cloud-watch-trigger/test.rest`

REST クライアントを使用して Lambda 関数をテストできます。

## トラブルシューティング

### エラーが表示されない

1. CloudWatch Logs にログが出力されているか確認
2. Lambda 関数が正常に実行されているか確認
3. DynamoDB にデータが保存されているか確認

### Lambda タイムアウト

- Lambda のタイムアウト設定を延長
- バッチ処理の最適化

### DynamoDB スロットリング

- WCU (書き込みキャパシティユニット) の増加
- Auto Scaling の設定

## 今後の拡張

- エラーの重要度 (Severity) レベル
- エラー通知のフィルタリング
- エラーの自動分類
- エラー通知先のカスタマイズ (Slack, Email など)
- エラートレンド分析
- エラーの自動解決提案
