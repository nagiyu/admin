# 機能情報管理

## 概要

機能情報管理 (FeatureInfo) は、システム内の各機能とその URL をマッピングして管理する機能です。動的ルーティングやマルチテナント対応に使用されます。

## データモデル

### FeatureInfo

```typescript
interface FeatureInfo {
  rootFeature: string;  // ルート機能名
  url: string;          // 機能の URL
}
```

**例**:
```typescript
{
  rootFeature: "Admin",
  url: "https://admin.example.com"
}
```

### FeatureInfoDataType

```typescript
interface FeatureInfoDataType extends DataTypeBase {
  id: string;                    // 機能情報 ID
  featureInfoList: FeatureInfo[]; // 機能情報リスト
  create: number;                 // 作成日時 (Unix timestamp)
  update: number;                 // 更新日時 (Unix timestamp)
}
```

### FeatureInfoRecordType (DynamoDB)

```typescript
interface FeatureInfoRecordType extends RecordTypeBase {
  ID: string;                     // 機能情報 ID (Partition Key)
  FeatureInfoList: FeatureInfo[]; // 機能情報リスト
  Create: number;                 // 作成日時
  Update: number;                 // 更新日時
}
```

## サービス実装

### FeatureInfoService

**場所**: `admin/services/featureInfo/FeatureInfoService.ts`

**継承**: `CRUDServiceBase<FeatureInfoDataType, FeatureInfoRecordType>`

**特徴**:
- キャッシュを使用しない (手動書き換えの可能性があるため)
- 機能情報の一元管理

**主要メソッド**:

#### get()
```typescript
async get(): Promise<FeatureInfoDataType[]>
```

すべての機能情報を取得します。

#### getById(id: string)
```typescript
async getById(id: string): Promise<FeatureInfoDataType | null>
```

特定の機能情報を取得します。

#### create(data: Partial<FeatureInfoDataType>)
```typescript
async create(data: Partial<FeatureInfoDataType>): Promise<void>
```

新しい機能情報を作成します。

#### update(id: string, data: Partial<FeatureInfoDataType>)
```typescript
async update(id: string, data: Partial<FeatureInfoDataType>): Promise<void>
```

既存の機能情報を更新します。

### FeatureInfoDataAccessor

**場所**: `admin/services/featureInfo/FeatureInfoDataAccessor.ts`

**継承**: `CRUDDataAccessorBase<FeatureInfoRecordType>`

**責務**:
- DynamoDB との通信
- CRUD 操作の実装

## 使用例

### 機能情報の取得

```typescript
import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

const featureInfoService = new FeatureInfoService();

// すべての機能情報を取得
const featureInfos = await featureInfoService.get();

// Admin 機能の URL を取得
const adminInfo = featureInfos[0].featureInfoList.find(
  (info) => info.rootFeature === 'Admin'
);

console.log('Admin URL:', adminInfo?.url);
```

### 機能情報の作成

```typescript
import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

const featureInfoService = new FeatureInfoService();

// 新しい機能情報を作成
await featureInfoService.create({
  id: 'feature-info-001',
  featureInfoList: [
    { rootFeature: 'Admin', url: 'https://admin.example.com' },
    { rootFeature: 'Dashboard', url: 'https://dashboard.example.com' },
    { rootFeature: 'Analytics', url: 'https://analytics.example.com' },
  ],
});
```

### 機能情報の更新

```typescript
import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

const featureInfoService = new FeatureInfoService();

// 機能リストを更新
await featureInfoService.update('feature-info-001', {
  featureInfoList: [
    { rootFeature: 'Admin', url: 'https://admin-new.example.com' },
    { rootFeature: 'Dashboard', url: 'https://dashboard.example.com' },
    { rootFeature: 'Analytics', url: 'https://analytics.example.com' },
    { rootFeature: 'Reports', url: 'https://reports.example.com' },
  ],
});
```

## DynamoDB テーブル設計

### テーブル名

- 開発環境: `DevFeatureInfo`
- 本番環境: `FeatureInfo`

### キー構造

- **Partition Key**: `ID` (String)
- **Sort Key**: なし

### 属性

| 属性名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| ID | String | ✓ | 機能情報の一意識別子 |
| FeatureInfoList | List (Map) | ✓ | 機能情報のリスト |
| Create | Number | ✓ | 作成日時 (Unix timestamp) |
| Update | Number | ✓ | 更新日時 (Unix timestamp) |

### FeatureInfoList の構造

```json
[
  {
    "rootFeature": "Admin",
    "url": "https://admin.example.com"
  },
  {
    "rootFeature": "Dashboard",
    "url": "https://dashboard.example.com"
  }
]
```

## ユースケース

### 1. 動的ルーティング

機能ごとに異なる URL にリダイレクトする場合：

```typescript
const featureInfoService = new FeatureInfoService();
const featureInfos = await featureInfoService.get();

const getUrlForFeature = (featureName: string): string | undefined => {
  return featureInfos[0].featureInfoList.find(
    (info) => info.rootFeature === featureName
  )?.url;
};

// Admin 機能にリダイレクト
const adminUrl = getUrlForFeature('Admin');
if (adminUrl) {
  window.location.href = adminUrl;
}
```

### 2. マルチテナント対応

テナントごとに異なる機能 URL を管理する場合：

```typescript
const featureInfoService = new FeatureInfoService();

// テナント A の機能情報
await featureInfoService.create({
  id: 'tenant-a',
  featureInfoList: [
    { rootFeature: 'Admin', url: 'https://tenant-a-admin.example.com' },
    { rootFeature: 'Dashboard', url: 'https://tenant-a-dashboard.example.com' },
  ],
});

// テナント B の機能情報
await featureInfoService.create({
  id: 'tenant-b',
  featureInfoList: [
    { rootFeature: 'Admin', url: 'https://tenant-b-admin.example.com' },
    { rootFeature: 'Dashboard', url: 'https://tenant-b-dashboard.example.com' },
  ],
});
```

### 3. 機能の有効/無効化

特定の機能を動的に有効/無効化する場合：

```typescript
const featureInfoService = new FeatureInfoService();
const featureInfos = await featureInfoService.get();

const isFeatureEnabled = (featureName: string): boolean => {
  return featureInfos[0].featureInfoList.some(
    (info) => info.rootFeature === featureName
  );
};

// Analytics 機能が有効かチェック
if (isFeatureEnabled('Analytics')) {
  // Analytics 機能を表示
}
```

## テスト

### ユニットテスト

**場所**: `admin/tests/FeatureInfoService.test.ts`

```typescript
import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

describe('FeatureInfoService', () => {
  describe.skip('Real FeatureInfo Test', () => {
    const featureInfoService = new FeatureInfoService();

    it('Get FeatureInfo', async () => {
      const records = await featureInfoService.get();

      console.log('FeatureInfo List:', records[0].featureInfoList);

      expect(records).toBeDefined();
    });

    it('Get Admin URL', async () => {
      const records = await featureInfoService.get();
      const adminInfo = records[0].featureInfoList.find((info) => info.rootFeature === 'Admin');

      console.log('Admin URL:', adminInfo?.url);

      expect(adminInfo).toBeDefined();
    });
  });
});
```

**注意**: 実際のテストは `describe.skip` されています。実行する場合は、DynamoDB への接続設定が必要です。

### テスト実行

```bash
cd admin
npm run test
```

## セキュリティ

### アクセス制御

- 機能情報の読み取りは認証済みユーザーに限定
- 機能情報の更新は管理者権限が必要

### データ検証

- rootFeature の重複チェック
- URL フォーマットの検証
- 必須フィールドの検証

## エラーハンドリング

```typescript
try {
  const featureInfo = await featureInfoService.getById('feature-info-001');
  if (!featureInfo) {
    console.error('機能情報が見つかりません');
    return;
  }
  // 処理続行
} catch (error) {
  console.error('機能情報の取得に失敗しました:', error);
  // エラー処理
}
```

## パフォーマンス最適化

### キャッシュ戦略

現在はキャッシュを使用していませんが、以下の最適化が可能です：

1. **クライアントサイドキャッシュ**:
```typescript
let cachedFeatureInfo: FeatureInfoDataType[] | null = null;

const getFeatureInfo = async (): Promise<FeatureInfoDataType[]> => {
  if (cachedFeatureInfo) {
    return cachedFeatureInfo;
  }
  
  const featureInfoService = new FeatureInfoService();
  cachedFeatureInfo = await featureInfoService.get();
  return cachedFeatureInfo;
};
```

2. **有効期限付きキャッシュ**:
```typescript
interface CachedData {
  data: FeatureInfoDataType[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5分
let cache: CachedData | null = null;

const getFeatureInfo = async (): Promise<FeatureInfoDataType[]> => {
  const now = Date.now();
  
  if (cache && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data;
  }
  
  const featureInfoService = new FeatureInfoService();
  const data = await featureInfoService.get();
  
  cache = { data, timestamp: now };
  return data;
};
```

## ベストプラクティス

### 1. 機能名の命名規則

- PascalCase を使用: `Admin`, `Dashboard`, `UserManagement`
- 明確で説明的な名前を使用
- 省略形は避ける

### 2. URL の管理

- HTTPS を使用
- 環境ごとに異なる URL を設定
- URL の末尾スラッシュを統一

### 3. データの整合性

- 機能追加時は必ず FeatureInfo を更新
- 機能削除時は FeatureInfo からも削除
- 定期的にデータの整合性をチェック

## 今後の拡張

- 機能ごとのメタデータ (アイコン、説明など)
- 機能の有効/無効フラグ
- 機能の依存関係管理
- バージョン管理
- 機能の権限設定
