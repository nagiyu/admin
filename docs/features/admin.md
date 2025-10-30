# Admin 機能

## 概要

Admin 機能は、管理者が管理対象の端末を登録・管理するための機能です。

## データモデル

### AdminDataType

```typescript
interface AdminDataType extends DataTypeBase {
  id: string;              // 管理者 ID
  terminalIdList: string[]; // 管理対象端末 ID リスト
  create: number;          // 作成日時 (Unix timestamp)
  update: number;          // 更新日時 (Unix timestamp)
}
```

### AdminRecordType (DynamoDB)

```typescript
interface AdminRecordType extends RecordTypeBase {
  ID: string;              // 管理者 ID (Partition Key)
  TerminalIDList: string[]; // 管理対象端末 ID リスト
  Create: number;          // 作成日時
  Update: number;          // 更新日時
}
```

## サービス実装

### AdminService

**場所**: `admin/services/admin/AdminService.ts`

**継承**: `CRUDServiceBase<AdminDataType, AdminRecordType>`

**特徴**:
- キャッシュを使用しない (手動書き換えの可能性があるため)
- CRUD 操作を提供

**主要メソッド**:

#### get()
```typescript
async get(): Promise<AdminDataType[]>
```
すべての管理者情報を取得します。

#### getById(id: string)
```typescript
async getById(id: string): Promise<AdminDataType | null>
```
指定された ID の管理者情報を取得します。

#### create(data: Partial<AdminDataType>)
```typescript
async create(data: Partial<AdminDataType>): Promise<void>
```
新しい管理者情報を作成します。

#### update(id: string, data: Partial<AdminDataType>)
```typescript
async update(id: string, data: Partial<AdminDataType>): Promise<void>
```
既存の管理者情報を更新します。

#### delete(id: string)
```typescript
async delete(id: string): Promise<void>
```
管理者情報を削除します。

### AdminDataAccessor

**場所**: `admin/services/admin/AdminDataAccessor.ts`

**継承**: `CRUDDataAccessorBase<AdminRecordType>`

**責務**:
- DynamoDB との直接的なやり取り
- CRUD 操作の実装

## ユーティリティ

### AdminUtil

**場所**: `admin/utils/AdminUtil.ts`

**主要メソッド**:

#### getAuthTableName()
```typescript
static getAuthTableName(): string
```

環境に応じた DynamoDB テーブル名を返します。

**返却値**:
- `local`, `development`: `"DevAdmin"`
- `production`: `"Admin"`
- その他: `"DevAdmin"` (デフォルト)

**使用例**:
```typescript
const tableName = AdminUtil.getAuthTableName();
```

## 定数

### ROOT_FEATURE

**場所**: `admin/consts/AdminConst.ts`

```typescript
export const ROOT_FEATURE = 'Admin';
```

全ての Admin 機能のルート機能名を定義します。

### AdminFeature Enum

**場所**: `admin/consts/AdminConst.ts`

```typescript
export enum AdminFeature {
  HOME = 'Home',
  ERROR_NOTIFICATION = 'ErrorNotification',
  CLOUD_WATCH_TRIGGER = 'CloudWatchTrigger',
}
```

Admin システム内の各機能を識別するための列挙型です。

**使用例**:
```typescript
<FeatureGuard
  feature={AdminFeature.ERROR_NOTIFICATION}
  level={PermissionLevel.VIEW}
>
  {/* コンテンツ */}
</FeatureGuard>
```

## 使用例

### 管理者情報の取得

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

const adminService = new AdminService();

// すべての管理者情報を取得
const admins = await adminService.get();

// 特定の管理者情報を取得
const admin = await adminService.getById('admin-001');
```

### 管理者情報の作成

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

const adminService = new AdminService();

// 新しい管理者を作成
await adminService.create({
  id: 'admin-001',
  terminalIdList: ['terminal-001', 'terminal-002', 'terminal-003'],
});
```

### 管理者情報の更新

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

const adminService = new AdminService();

// 端末リストを更新
await adminService.update('admin-001', {
  terminalIdList: ['terminal-001', 'terminal-002', 'terminal-004'],
});
```

## DynamoDB テーブル設計

### テーブル名

- 開発環境: `DevAdmin`
- 本番環境: `Admin`

### キー構造

- **Partition Key**: `ID` (String)
- **Sort Key**: なし

### 属性

| 属性名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| ID | String | ✓ | 管理者の一意識別子 |
| TerminalIDList | List (String) | ✓ | 管理対象端末の ID リスト |
| Create | Number | ✓ | 作成日時 (Unix timestamp) |
| Update | Number | ✓ | 更新日時 (Unix timestamp) |

### インデックス

現在、グローバルセカンダリインデックス (GSI) は使用していません。

## セキュリティ

### アクセス制御

- AdminService へのアクセスは認証済みユーザーに限定
- FeatureGuard コンポーネントで機能レベルのアクセス制御
- 権限レベルに応じた操作制限

### データ検証

- 入力データの型チェック (TypeScript)
- 必須フィールドの検証
- データ整合性の確保

## エラーハンドリング

### サービス層でのエラー

```typescript
try {
  const admin = await adminService.getById('admin-001');
} catch (error) {
  console.error('管理者情報の取得に失敗しました:', error);
  // エラー処理
}
```

### データアクセス層でのエラー

- DynamoDB エラーは上位層に伝播
- 適切なエラーメッセージの生成
- CloudWatch Logs へのエラーログ出力

## テスト

### ユニットテスト

テストファイル: `admin/tests/AdminService.test.ts` (必要に応じて追加)

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

describe('AdminService', () => {
  it('should get admin data', async () => {
    const service = new AdminService();
    const data = await service.get();
    expect(data).toBeDefined();
  });
});
```

## 今後の拡張

- 管理者の役割 (Role) 管理
- 管理者グループ機能
- 管理履歴の記録
- 詳細な権限管理
