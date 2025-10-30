# Cloud Watch Trigger

## 概要

Cloud Watch Trigger は、AWS CloudWatch Logs からのエラーログを自動的に処理し、エラー通知を生成する Lambda 関数です。

## アーキテクチャ

```
Application Error
       ↓
CloudWatch Logs (ログ出力)
       ↓
CloudWatch Logs Subscription Filter
       ↓
Lambda Function (cloud-watch-trigger)
       ↓
┌──────────────────────────────────┐
│ ErrorLogEntryService             │ → DynamoDB に保存
├──────────────────────────────────┤
│ ErrorNotificationService         │ → 通知送信
├──────────────────────────────────┤
│ LogAnalyzerService               │ → ログ分析 & 結果保存
└──────────────────────────────────┘
```

## プロジェクト構成

```
cloud-watch-trigger/
├── index.ts                  # Lambda ハンドラ
├── services/
│   ├── ErrorLogEntryService.ts       # エラーログ記録
│   ├── ErrorNotificationService.ts   # 通知送信
│   └── LogAnalyzerService.ts         # ログ分析
├── tests/
│   └── LogAnalyzerService.test.ts    # テスト
├── package.json
├── tsconfig.json
├── Dockerfile                # Lambda コンテナイメージ
├── build.sh                  # ビルドスクリプト
└── test.rest                 # REST クライアント用テストファイル
```

## Lambda ハンドラ

### index.ts

**イベント型**: `CloudWatchLogsEvent`

**処理フロー**:

1. CloudWatch Logs イベントを受信
2. Base64 エンコードされたデータをデコード
3. gzip 圧縮されたデータを展開
4. JSON パースしてログイベントを抽出
5. 各ログイベントを処理:
   - ErrorLogEntryService でエラーを記録
   - ErrorNotificationService で通知を送信
   - LogAnalyzerService でログを分析

**実装**:
```typescript
import { CloudWatchLogsEvent, CloudWatchLogsDecodedData } from 'aws-lambda';
import { promisify } from 'util';
import { gunzip } from 'zlib';

const gunzipAsync = promisify(gunzip);

export const handler = async (event: CloudWatchLogsEvent, context: any) => {
  const errorLogEntry = new ErrorLogEntryService();
  const errorNotification = new ErrorNotificationService();
  const logAnalyzer = new LogAnalyzerService();

  try {
    // Base64 デコード
    const payload = Buffer.from(event.awslogs.data, 'base64');
    
    // gzip 展開
    const decompressed = await gunzipAsync(payload);
    
    // JSON パース
    const logData: CloudWatchLogsDecodedData = JSON.parse(decompressed.toString('utf8'));

    // 各ログイベントを処理
    for (const logEvent of logData.logEvents) {
      const message = logEvent.message;
      const errorData: ErrorNotificationDataType = JSON.parse(message);

      // エラー記録
      const created = await errorLogEntry.entryError(errorData);

      // 通知送信
      await errorNotification.notify(created);

      // ログ分析
      await logAnalyzer.analyzeLog(created);
    }
  } catch (err) {
    console.error('Error processing CloudWatch Logs event:', err);
    throw err;
  }
};
```

## サービス実装

### ErrorLogEntryService

**場所**: `cloud-watch-trigger/services/ErrorLogEntryService.ts`

**責務**:
- エラーログの解析
- ErrorNotificationDataType への変換
- DynamoDB への保存

**主要メソッド**:

#### entryError(errorData: ErrorNotificationDataType)
```typescript
async entryError(errorData: ErrorNotificationDataType): Promise<ErrorNotificationDataType>
```

エラーログを DynamoDB に保存し、作成されたエラー通知データを返します。

**処理内容**:
1. エラーデータの検証
2. ID の生成 (UUID など)
3. タイムスタンプの設定
4. DynamoDB への保存
5. 作成されたデータを返却

**使用例**:
```typescript
const errorLogEntry = new ErrorLogEntryService();

const errorData = {
  rootFeature: 'MyApp',
  feature: 'UserService',
  message: 'Failed to update user',
  stack: 'Error: Failed to update user\n    at UserService.update...',
};

const created = await errorLogEntry.entryError(errorData);
console.log('Created error ID:', created.id);
```

### ErrorNotificationService

**場所**: `cloud-watch-trigger/services/ErrorNotificationService.ts`

**責務**:
- エラー通知の送信
- 通知チャネルへの配信 (Slack, Email など)

**主要メソッド**:

#### notify(errorData: ErrorNotificationDataType)
```typescript
async notify(errorData: ErrorNotificationDataType): Promise<void>
```

エラー通知を送信します。

**処理内容**:
1. 通知メッセージの生成
2. 通知先の決定 (機能や重要度に基づく)
3. 通知の送信 (Slack, Email など)

**使用例**:
```typescript
const notificationService = new ErrorNotificationService();

await notificationService.notify({
  id: 'error-123',
  rootFeature: 'MyApp',
  feature: 'UserService',
  message: 'Failed to update user',
  stack: '...',
  create: Date.now(),
  update: Date.now(),
});
```

**通知フォーマット例**:
```
⚠️ Error Notification

Root Feature: MyApp
Feature: UserService
Message: Failed to update user

View Details: https://admin.example.com/error-notifications?id=error-123
```

### LogAnalyzerService

**場所**: `cloud-watch-trigger/services/LogAnalyzerService.ts`

**責務**:
- ログの AI 分析
- エラーの原因分析
- 解決策の提案
- 分析結果の保存

**主要メソッド**:

#### analyzeLog(errorData: ErrorNotificationDataType)
```typescript
async analyzeLog(errorData: ErrorNotificationDataType): Promise<void>
```

ログを分析し、結果を DynamoDB に保存します。

**処理内容**:
1. エラーメッセージとスタックトレースの解析
2. AI による原因分析
3. 解決策の生成
4. 分析結果を DynamoDB に保存 (AnalyzeResult フィールド)

**使用例**:
```typescript
const logAnalyzer = new LogAnalyzerService();

await logAnalyzer.analyzeLog({
  id: 'error-123',
  rootFeature: 'MyApp',
  feature: 'UserService',
  message: 'Cannot read property "id" of undefined',
  stack: 'TypeError: Cannot read property "id" of undefined\n    at...',
  create: Date.now(),
  update: Date.now(),
});
```

**分析結果例**:
```
原因: user オブジェクトが undefined です。

推奨対応:
1. user オブジェクトの null チェックを追加
2. Optional Chaining (?.) の使用を検討
3. デフォルト値の設定

例:
const userId = user?.id ?? 'default-id';
```

## CloudWatch Logs 設定

### ログフォーマット

エラーログは以下の JSON フォーマットで出力する必要があります：

```json
{
  "rootFeature": "MyApp",
  "feature": "UserManagement",
  "message": "Failed to update user profile",
  "stack": "Error: Failed to update user profile\n    at UserService.updateProfile (/app/services/UserService.ts:42:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
}
```

### サブスクリプションフィルタの設定

1. **CloudWatch Logs コンソール**にアクセス
2. ロググループを選択
3. **アクション** → **サブスクリプションフィルタの作成**
4. **Lambda 関数**を選択
5. フィルタパターンを設定 (オプション):
   ```
   { $.message = "*Error*" || $.message = "*Exception*" }
   ```
6. Lambda 関数を選択: `cloud-watch-trigger`

### フィルタパターンの例

#### すべてのログを処理
```
(フィルタパターンなし)
```

#### エラーのみを処理
```
{ $.message = "*Error*" }
```

#### 複数条件
```
{ $.message = "*Error*" || $.message = "*Exception*" || $.message = "*Fatal*" }
```

#### 特定の機能のみ
```
{ $.rootFeature = "MyApp" && $.message = "*Error*" }
```

## Lambda 設定

### 環境変数

Lambda 関数に設定する環境変数：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |
| `DYNAMODB_TABLE_PREFIX` | DynamoDB テーブルプレフィックス | `Dev` または `Prod` |
| `NOTIFICATION_WEBHOOK_URL` | 通知先 Webhook URL | `https://hooks.slack.com/...` |
| `LLM_API_KEY` | AI 分析用 API キー | `sk-...` |

### IAM ロール

Lambda 実行ロールに必要な権限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/ErrorNotification*"
    }
  ]
}
```

### タイムアウト設定

- **推奨値**: 30秒
- **最小値**: 10秒 (ログ分析に時間がかかる場合)
- **最大値**: 60秒

### メモリ設定

- **推奨値**: 256 MB
- **AI 分析を使用する場合**: 512 MB

## デプロイ

### Docker イメージビルド

```bash
cd cloud-watch-trigger
./build.sh
```

**build.sh の内容**:
```bash
#!/bin/bash

# Docker イメージビルド
docker build -t cloud-watch-trigger .

# ECR にプッシュ
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag cloud-watch-trigger:latest <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/cloud-watch-trigger:latest
docker push <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/cloud-watch-trigger:latest
```

### Lambda 更新

```bash
aws lambda update-function-code \
  --function-name cloud-watch-trigger \
  --image-uri <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/cloud-watch-trigger:latest
```

## テスト

### ユニットテスト

**テストファイル**: `cloud-watch-trigger/tests/LogAnalyzerService.test.ts`

```typescript
import { LogAnalyzerService } from '../services/LogAnalyzerService';

describe('LogAnalyzerService', () => {
  it('should analyze log', async () => {
    const service = new LogAnalyzerService();
    
    const errorData = {
      id: 'test-123',
      rootFeature: 'TestApp',
      feature: 'TestFeature',
      message: 'Test error',
      stack: 'Error: Test error\n    at test...',
      create: Date.now(),
      update: Date.now(),
    };

    await service.analyzeLog(errorData);
    
    // 分析結果が保存されたことを確認
    // ...
  });
});
```

### テスト実行

```bash
cd cloud-watch-trigger
npm run test
```

### 統合テスト

**REST クライアント**: `cloud-watch-trigger/test.rest`

```http
### Test Lambda Function
POST https://<api-gateway-url>/test
Content-Type: application/json

{
  "awslogs": {
    "data": "<base64-encoded-gzipped-data>"
  }
}
```

### ローカルテスト

```bash
# Lambda をローカルで実行
docker run -p 9000:8080 cloud-watch-trigger:latest

# テストイベントを送信
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d @test-event.json
```

**test-event.json**:
```json
{
  "awslogs": {
    "data": "H4sIAAAAAAAAAHWPwQqCQBCGX0Xm7EFtK+smZBEUgXoLEreV..."
  }
}
```

## モニタリング

### CloudWatch メトリクス

Lambda 関数の主要メトリクス：

- **Invocations**: 実行回数
- **Errors**: エラー回数
- **Duration**: 実行時間
- **Throttles**: スロットリング回数
- **ConcurrentExecutions**: 同時実行数

### CloudWatch Logs

Lambda 実行ログ：
```
/aws/lambda/cloud-watch-trigger
```

### カスタムメトリクス

```typescript
// カスタムメトリクスの記録
console.log('MONITORING|ErrorProcessed|Count=1');
console.log('MONITORING|AnalysisTime|Value=' + analysisTime);
```

### アラート設定

推奨アラート：

1. **エラー率が高い**
   - メトリクス: `Errors / Invocations`
   - 閾値: > 5%

2. **実行時間が長い**
   - メトリクス: `Duration`
   - 閾値: > 25秒

3. **スロットリング発生**
   - メトリクス: `Throttles`
   - 閾値: > 0

## トラブルシューティング

### Lambda がトリガーされない

**原因**:
- サブスクリプションフィルタが正しく設定されていない
- IAM ロールに権限がない

**対応**:
1. サブスクリプションフィルタの設定を確認
2. Lambda 実行ロールに CloudWatch Logs 読み取り権限を追加

### DynamoDB への保存が失敗する

**原因**:
- IAM ロールに DynamoDB 書き込み権限がない
- テーブル名が間違っている

**対応**:
1. IAM ロールに DynamoDB PutItem 権限を追加
2. 環境変数 `DYNAMODB_TABLE_PREFIX` を確認

### タイムアウトエラー

**原因**:
- AI 分析に時間がかかりすぎる
- ネットワーク遅延

**対応**:
1. Lambda タイムアウトを延長 (60秒)
2. AI API のタイムアウト設定を調整
3. バッチ処理の最適化

### メモリ不足

**原因**:
- 大量のログを一度に処理している
- AI 分析でメモリを大量に使用

**対応**:
1. Lambda メモリを増やす (512 MB 以上)
2. ログのバッチサイズを調整

## ベストプラクティス

### 1. エラーハンドリング

```typescript
try {
  await errorLogEntry.entryError(errorData);
} catch (error) {
  console.error('Failed to entry error:', error);
  // Dead Letter Queue に送信
  throw error;
}
```

### 2. リトライ制御

Lambda の非同期呼び出しでリトライを設定：
- 最大リトライ回数: 2
- 最大イベント保持時間: 6時間

### 3. Dead Letter Queue の設定

失敗したイベントを DLQ に送信：
```json
{
  "DeadLetterConfig": {
    "TargetArn": "arn:aws:sqs:region:account:dlq-name"
  }
}
```

### 4. ログの構造化

```typescript
console.log(JSON.stringify({
  level: 'INFO',
  message: 'Error processed',
  errorId: created.id,
  timestamp: Date.now(),
}));
```

## 今後の拡張

- エラーの重要度レベル判定
- 類似エラーのグルーピング
- エラートレンド分析
- 自動復旧アクション
- カスタム通知ルール
- マルチリージョン対応
