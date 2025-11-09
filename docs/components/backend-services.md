# バックエンドサービス

## 概要

Admin プロジェクトのバックエンドサービスは、ビジネスロジックとデータアクセスを提供します。すべてのサービスは `CRUDServiceBase` を継承し、一貫したインターフェースを提供します。

## アーキテクチャパターン

### サービス層パターン

```
Controller/API Route
       ↓
Service Layer (ビジネスロジック)
       ↓
Data Accessor (データアクセス)
       ↓
DynamoDB
```

### CRUD サービスの基本構造

すべてのサービスは以下の構造を持ちます：

```typescript
export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  constructor(dataAccessor?: MyDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new MyDataAccessor();
    }
    
    // キャッシュの使用を指定
    super(dataAccessor, useCache);
  }

  // Data → Record 変換
  protected dataToRecord(data: Partial<MyDataType>): Partial<MyRecordType> {
    // 変換ロジック
  }

  // Record → Data 変換
  protected recordToData(record: MyRecordType): MyDataType {
    // 変換ロジック
  }
}
```

## 共通基底クラス

### CRUDServiceBase

**場所**: `typescript-common` (submodule)

**型パラメータ**:
- `TData`: アプリケーションデータ型
- `TRecord`: DynamoDB レコード型

**提供メソッド**:

#### get()
```typescript
async get(): Promise<TData[]>
```
すべてのデータを取得します。

#### getById(id: string)
```typescript
async getById(id: string): Promise<TData | null>
```
指定された ID のデータを取得します。

#### create(data: Partial<TData>)
```typescript
async create(data: Partial<TData>): Promise<void>
```
新しいデータを作成します。

#### update(id: string, data: Partial<TData>)
```typescript
async update(id: string, data: Partial<TData>): Promise<void>
```
既存のデータを更新します。

#### delete(id: string)
```typescript
async delete(id: string): Promise<void>
```
データを削除します。

### CRUDDataAccessorBase

**場所**: `typescript-common` (submodule)

**型パラメータ**:
- `TRecord`: DynamoDB レコード型

**提供メソッド**:
- `getAll()`: すべてのレコードを取得
- `getById(id: string)`: 特定のレコードを取得
- `put(record: TRecord)`: レコードを作成/更新
- `delete(id: string)`: レコードを削除

## サービス一覧

### 1. AdminService

**目的**: 管理者情報の管理

**場所**: `admin/services/admin/AdminService.ts`

**データ型**: `AdminDataType` ↔ `AdminRecordType`

**特徴**:
- キャッシュ無効 (手動書き換えの可能性)
- 端末 ID リストの管理

**使用例**:
```typescript
import { AdminService } from '@admin/services/admin/AdminService';

const service = new AdminService();

// 取得
const admins = await service.get();

// 作成
await service.create({
  id: 'admin-001',
  terminalIdList: ['terminal-001', 'terminal-002'],
});

// 更新
await service.update('admin-001', {
  terminalIdList: ['terminal-001', 'terminal-002', 'terminal-003'],
});
```

### 2. FeatureInfoService

**目的**: 機能情報の管理

**場所**: `admin/services/featureInfo/FeatureInfoService.ts`

**データ型**: `FeatureInfoDataType` ↔ `FeatureInfoRecordType`

**特徴**:
- キャッシュ無効
- 機能とURL のマッピング

**使用例**:
```typescript
import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

const service = new FeatureInfoService();

// 取得
const infos = await service.get();

// 特定機能の URL を取得
const adminUrl = infos[0].featureInfoList.find(
  (info) => info.rootFeature === 'Admin'
)?.url;
```

### 3. ErrorNotificationService

**目的**: エラー通知の管理

**場所**: `admin/services/ErrorNotification/ErrorNotificationService.ts`

**データ型**: `ErrorNotificationDataType` ↔ `ErrorNotificationRecordType`

**特徴**:
- キャッシュ無効
- 取得時に作成日時降順ソート

**カスタマイズ**:
```typescript
public override async get(): Promise<ErrorNotificationDataType[]> {
  const result = await super.get();
  return result.sort((a, b) => b.create - a.create);
}
```

**使用例**:
```typescript
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';

const service = new ErrorNotificationService();

// 最新のエラーを取得
const errors = await service.get();

// 特定のエラーを取得
const error = await service.getById('error-001');
```

### 4. AdminAuthService

**目的**: 管理者認証の管理

**場所**: `admin/services/AdminAuthService.ts`

**データ型**: `AdminAuthDataType` ↔ `AdminAuthRecordType`

**特徴**:
- 認証情報の管理
- セキュアなデータ処理

## データ変換パターン

### Data ↔ Record 変換の実装

すべてのサービスは `dataToRecord()` と `recordToData()` を実装する必要があります。

#### 基本的な変換例

```typescript
protected dataToRecord(data: Partial<AdminDataType>): Partial<AdminRecordType> {
  return {
    TerminalIDList: data.terminalIdList || [],
  }
}

protected recordToData(record: AdminRecordType): AdminDataType {
  return {
    id: record.ID || '',
    terminalIdList: record.TerminalIDList || [],
    create: record.Create || 0,
    update: record.Update || 0,
  }
}
```

#### 複雑なデータ構造の変換

```typescript
protected dataToRecord(data: Partial<FeatureInfoDataType>): Partial<FeatureInfoRecordType> {
  return {
    FeatureInfoList: data.featureInfoList || [],
  }
}

protected recordToData(record: FeatureInfoRecordType): FeatureInfoDataType {
  return {
    id: record.ID || '',
    featureInfoList: record.FeatureInfoList || [],
    create: record.Create || 0,
    update: record.Update || 0,
  }
}
```

### 変換時の注意点

1. **null/undefined の処理**
   - デフォルト値を必ず設定
   - `||` 演算子を使用

2. **命名規則の変換**
   - Data: camelCase
   - Record: PascalCase

3. **型安全性**
   - TypeScript の型推論を活用
   - 必須フィールドの検証

## サービスのカスタマイズ

### メソッドのオーバーライド

基底クラスのメソッドをオーバーライドして、カスタムロジックを追加できます。

#### 例: ソート処理の追加

```typescript
public override async get(): Promise<ErrorNotificationDataType[]> {
  const result = await super.get();
  // 作成日時降順でソート
  return result.sort((a, b) => b.create - a.create);
}
```

#### 例: フィルタリングの追加

```typescript
public async getByFeature(feature: string): Promise<ErrorNotificationDataType[]> {
  const allErrors = await this.get();
  return allErrors.filter(error => error.feature === feature);
}
```

#### 例: 集計処理の追加

```typescript
public async getErrorCount(): Promise<number> {
  const errors = await this.get();
  return errors.length;
}

public async getErrorCountByFeature(): Promise<Map<string, number>> {
  const errors = await this.get();
  const countMap = new Map<string, number>();
  
  errors.forEach(error => {
    const count = countMap.get(error.feature) || 0;
    countMap.set(error.feature, count + 1);
  });
  
  return countMap;
}
```

## キャッシュ管理

### キャッシュの有効化

```typescript
constructor(dataAccessor?: MyDataAccessor) {
  if (!dataAccessor) {
    dataAccessor = new MyDataAccessor();
  }
  
  // キャッシュを有効化
  super(dataAccessor, true);
}
```

### キャッシュの無効化

```typescript
constructor(dataAccessor?: MyDataAccessor) {
  if (!dataAccessor) {
    dataAccessor = new MyDataAccessor();
  }
  
  // キャッシュを無効化
  super(dataAccessor, false);
}
```

### キャッシュ使用の判断基準

**キャッシュを有効にする場合**:
- 読み取り頻度が高い
- 更新頻度が低い
- データの即時性が重要でない

**キャッシュを無効にする場合**:
- 手動でのデータ書き換えの可能性がある
- リアルタイム性が重要
- データの整合性が最優先

## エラーハンドリング

### サービス層でのエラー処理

```typescript
try {
  const data = await service.get();
  // 処理続行
} catch (error) {
  console.error('データ取得エラー:', error);
  // エラーハンドリング
}
```

### カスタムエラークラス

```typescript
export class ServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

// 使用例
throw new ServiceError('データが見つかりません', 'NOT_FOUND');
```

## テスト

### サービスのユニットテスト

```typescript
import { AdminService } from '@admin/services/admin/AdminService';
import { AdminDataAccessor } from '@admin/services/admin/AdminDataAccessor';

describe('AdminService', () => {
  let service: AdminService;
  let mockDataAccessor: jest.Mocked<AdminDataAccessor>;

  beforeEach(() => {
    mockDataAccessor = {
      getAll: jest.fn(),
      getById: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new AdminService(mockDataAccessor);
  });

  it('should get all admin data', async () => {
    const mockRecords = [
      { ID: 'admin-001', TerminalIDList: ['terminal-001'], Create: 0, Update: 0 }
    ];
    
    mockDataAccessor.getAll.mockResolvedValue(mockRecords);

    const result = await service.get();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('admin-001');
    expect(result[0].terminalIdList).toEqual(['terminal-001']);
  });
});
```

## ベストプラクティス

### 1. 単一責任の原則

各サービスは一つの責任のみを持つべきです。

**良い例**:
```typescript
// AdminService は管理者情報のみを扱う
class AdminService extends CRUDServiceBase<AdminDataType, AdminRecordType> {
  // ...
}

// ErrorNotificationService はエラー通知のみを扱う
class ErrorNotificationService extends CRUDServiceBase<ErrorNotificationDataType, ErrorNotificationRecordType> {
  // ...
}
```

### 2. 依存性注入

DataAccessor は依存性注入で提供します。

```typescript
constructor(dataAccessor?: MyDataAccessor) {
  if (!dataAccessor) {
    dataAccessor = new MyDataAccessor();
  }
  super(dataAccessor, false);
}
```

これにより、テスト時にモックを注入できます。

### 3. 型安全性の確保

TypeScript の型推論を最大限活用します。

```typescript
// 明示的な型定義
const service: AdminService = new AdminService();
const data: AdminDataType[] = await service.get();
```

### 4. エラーメッセージの充実

```typescript
if (!data) {
  throw new Error(`Admin data not found: ${id}`);
}
```

## 新しいサービスの作成

### ステップ 1: データ型の定義

```typescript
// interfaces/data/MyDataType.ts
import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

export interface MyDataType extends DataTypeBase {
  myField: string;
}
```

### ステップ 2: レコード型の定義

```typescript
// interfaces/records/MyRecordType.ts
import { RecordTypeBase } from '@common/interfaces/records/RecordTypeBase';

export interface MyRecordType extends RecordTypeBase {
  MyField: string;
}
```

### ステップ 3: DataAccessor の作成

```typescript
// services/my/MyDataAccessor.ts
import CRUDDataAccessorBase from '@common/services/CRUDDataAccessorBase';
import { MyRecordType } from '@admin/interfaces/records/MyRecordType';

export class MyDataAccessor extends CRUDDataAccessorBase<MyRecordType> {
  constructor() {
    super('MyTable'); // DynamoDB テーブル名
  }
}
```

### ステップ 4: Service の作成

```typescript
// services/my/MyService.ts
import CRUDServiceBase from '@common/services/CRUDServiceBase';
import { MyDataType } from '@admin/interfaces/data/MyDataType';
import { MyRecordType } from '@admin/interfaces/records/MyRecordType';
import { MyDataAccessor } from './MyDataAccessor';

export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  constructor(dataAccessor?: MyDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new MyDataAccessor();
    }
    super(dataAccessor, false);
  }

  protected dataToRecord(data: Partial<MyDataType>): Partial<MyRecordType> {
    return {
      MyField: data.myField || '',
    }
  }

  protected recordToData(record: MyRecordType): MyDataType {
    return {
      id: record.ID || '',
      myField: record.MyField || '',
      create: record.Create || 0,
      update: record.Update || 0,
    }
  }
}
```

### ステップ 5: テストの作成

```typescript
// tests/MyService.test.ts
import { MyService } from '@admin/services/my/MyService';

describe('MyService', () => {
  it('should work', async () => {
    const service = new MyService();
    const data = await service.get();
    expect(data).toBeDefined();
  });
});
```
