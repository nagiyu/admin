# 共通部品利用ガイド

## 概要

Admin プロジェクトでは、コードの再利用性と保守性を高めるため、共通部品を積極的に使用します。共通部品は Git submodule として管理されています。

## 共通部品の種類

### 1. typescript-common

**場所**: `typescript-common/` (Git submodule)

**リポジトリ**: https://github.com/nagiyu/nagiyu-typescript-common.git

**用途**: TypeScript プロジェクト全般で使用する共通機能

**主要コンポーネント**:
- 基底クラス (CRUDServiceBase, CRUDDataAccessorBase)
- 共通インターフェース (DataTypeBase, RecordTypeBase)
- ユーティリティ (EnvironmentalUtil)
- Enums (PermissionLevel)

### 2. nextjs-common

**場所**: `nextjs-common/` (Git submodule)

**リポジトリ**: https://github.com/nagiyu/nagiyu-nextjs-common.git

**用途**: Next.js プロジェクトで使用する UI コンポーネント

**主要コンポーネント**:
- レイアウトコンポーネント (CommonLayout, BasicStack, DirectionStack)
- データ表示コンポーネント (BasicTable)
- 入力コンポーネント (ContainedButton, BasicTextField, MultilineTextField)
- フィードバックコンポーネント (BasicDialog, LoadingContent)
- 認証コンポーネント (FeatureGuard)

## Submodule の管理

### 初期化

リポジトリをクローンした後、submodule を初期化します：

```bash
git submodule update --init --recursive
```

### 更新

Submodule を最新版に更新：

```bash
# すべての submodule を更新
git submodule update --remote --recursive

# 特定の submodule を更新
cd typescript-common
git pull origin main
cd ..

# 更新をコミット
git add typescript-common
git commit -m "Update typescript-common to latest version"
```

### 状態確認

```bash
# submodule の状態確認
git submodule status

# submodule の変更確認
git diff --submodule
```

## typescript-common の使用

### CRUDServiceBase

**用途**: CRUD 操作を提供するサービスの基底クラス

**使用例**:
```typescript
import CRUDServiceBase from '@common/services/CRUDServiceBase';
import { MyDataType } from '@admin/interfaces/data/MyDataType';
import { MyRecordType } from '@admin/interfaces/records/MyRecordType';

export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  constructor(dataAccessor?: MyDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new MyDataAccessor();
    }
    
    // 第2引数: キャッシュの使用
    super(dataAccessor, false);
  }

  // Data → Record 変換
  protected dataToRecord(data: Partial<MyDataType>): Partial<MyRecordType> {
    return {
      MyField: data.myField || '',
    };
  }

  // Record → Data 変換
  protected recordToData(record: MyRecordType): MyDataType {
    return {
      id: record.ID || '',
      myField: record.MyField || '',
      create: record.Create || 0,
      update: record.Update || 0,
    };
  }
}
```

**提供メソッド**:
- `get()`: すべてのデータを取得
- `getById(id: string)`: ID でデータを取得
- `create(data: Partial<TData>)`: データを作成
- `update(id: string, data: Partial<TData>)`: データを更新
- `delete(id: string)`: データを削除

### CRUDDataAccessorBase

**用途**: DynamoDB へのアクセスを提供する基底クラス

**使用例**:
```typescript
import CRUDDataAccessorBase from '@common/services/CRUDDataAccessorBase';
import { MyRecordType } from '@admin/interfaces/records/MyRecordType';

export class MyDataAccessor extends CRUDDataAccessorBase<MyRecordType> {
  constructor() {
    // DynamoDB テーブル名を指定
    super('MyTable');
  }
}
```

**提供メソッド**:
- `getAll()`: すべてのレコードを取得
- `getById(id: string)`: ID でレコードを取得
- `put(record: TRecord)`: レコードを作成/更新
- `delete(id: string)`: レコードを削除

### DataTypeBase

**用途**: アプリケーションデータの基底インターフェース

**使用例**:
```typescript
import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

export interface MyDataType extends DataTypeBase {
  myField: string;
  myList: string[];
}
```

**定義**:
```typescript
interface DataTypeBase {
  id: string;      // 一意識別子
  create: number;  // 作成日時 (Unix timestamp)
  update: number;  // 更新日時 (Unix timestamp)
}
```

### RecordTypeBase

**用途**: DynamoDB レコードの基底インターフェース

**使用例**:
```typescript
import { RecordTypeBase } from '@common/interfaces/records/RecordTypeBase';

export interface MyRecordType extends RecordTypeBase {
  MyField: string;
  MyList: string[];
}
```

**定義**:
```typescript
interface RecordTypeBase {
  ID: string;      // 一意識別子 (Partition Key)
  Create: number;  // 作成日時
  Update: number;  // 更新日時
}
```

### EnvironmentalUtil

**用途**: 環境変数の取得と環境判定

**使用例**:
```typescript
import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';

// 現在の環境を取得
const env = EnvironmentalUtil.GetProcessEnv();
// 'local' | 'development' | 'production'

// 環境に応じた処理
switch (env) {
  case 'local':
  case 'development':
    console.log('開発環境で実行中');
    break;
  case 'production':
    console.log('本番環境で実行中');
    break;
}
```

### PermissionLevel

**用途**: 権限レベルの定義

**使用例**:
```typescript
import { PermissionLevel } from '@common/enums/PermissionLevel';

// 権限チェック
if (userPermission >= PermissionLevel.EDIT) {
  // 編集可能
}

// FeatureGuard での使用
<FeatureGuard
  feature={AdminFeature.ERROR_NOTIFICATION}
  level={PermissionLevel.VIEW}
>
  {/* コンテンツ */}
</FeatureGuard>
```

**定義**:
```typescript
enum PermissionLevel {
  VIEW = 'VIEW',      // 閲覧権限
  EDIT = 'EDIT',      // 編集権限
  ADMIN = 'ADMIN',    // 管理者権限
}
```

## nextjs-common の使用

### CommonLayout

**用途**: アプリケーション全体のレイアウト

**使用例**:
```typescript
import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

const menuItems: MenuItemData[] = [
  { title: 'Home', url: '/' },
  { title: 'Settings', url: '/settings' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommonLayout
      title='My App'
      menuItems={menuItems}
      enableAuthentication={true}
      enableNotification={true}
    >
      {children}
    </CommonLayout>
  );
}
```

**Props**:
- `title`: アプリケーション名
- `menuItems`: メニュー項目
- `enableAuthentication`: 認証の有効化
- `enableNotification`: 通知の有効化

### BasicStack

**用途**: 縦方向のスタックレイアウト

**使用例**:
```typescript
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';

<BasicStack>
  <Header />
  <Content />
  <Footer />
</BasicStack>
```

**特徴**:
- 子要素を縦方向に配置
- 適切な間隔を自動設定

### DirectionStack

**用途**: 横方向のスタックレイアウト

**使用例**:
```typescript
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';

<DirectionStack>
  <Button1 />
  <Button2 />
  <Button3 />
</DirectionStack>
```

**特徴**:
- 子要素を横方向に配置
- レスポンシブ対応

### BasicTable

**用途**: データテーブルの表示

**使用例**:
```typescript
import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';

interface UserData {
  id: string;
  name: string;
  email: string;
  create: number;
}

const columns: Column<UserData>[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  {
    id: 'create',
    label: 'Created',
    format: (value) => new Date(value).toLocaleDateString(),
  },
];

<BasicTable
  columns={columns}
  data={userData}
  loading={isLoading}
/>
```

**Props**:
- `columns`: カラム定義
- `data`: 表示データ
- `loading`: ローディング状態

**カスタムフォーマット**:
```typescript
{
  id: 'status',
  label: 'Status',
  format: (value) => (
    <span style={{ color: value === 'active' ? 'green' : 'red' }}>
      {value}
    </span>
  ),
}
```

### ContainedButton

**用途**: プライマリアクションボタン

**使用例**:
```typescript
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';

<ContainedButton
  label='Submit'
  onClick={handleSubmit}
  disabled={isSubmitting}
/>
```

**Props**:
- `label`: ボタンラベル
- `onClick`: クリックハンドラ
- `disabled`: 無効化フラグ

### BasicTextField

**用途**: 単一行テキスト入力

**使用例**:
```typescript
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';

<BasicTextField
  label='Username'
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  readonly={false}
  placeholder='Enter username'
/>
```

**Props**:
- `label`: フィールドラベル
- `value`: 値
- `onChange`: 変更ハンドラ
- `readonly`: 読み取り専用
- `placeholder`: プレースホルダー

### MultilineTextField

**用途**: 複数行テキスト入力

**使用例**:
```typescript
import MultilineTextField from '@client-common/components/inputs/TextFields/MultilineTextField';

<MultilineTextField
  label='Description'
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  readonly={false}
  rows={5}
  placeholder='Enter description'
/>
```

**Props**:
- `label`: フィールドラベル
- `value`: 値
- `onChange`: 変更ハンドラ
- `readonly`: 読み取り専用
- `rows`: 行数
- `placeholder`: プレースホルダー

### BasicDialog

**用途**: モーダルダイアログ

**使用例**:
```typescript
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';

const [open, setOpen] = useState(false);

<BasicDialog
  open={open}
  title="Confirm Action"
  onClose={() => setOpen(false)}
  closeText='Cancel'
  onConfirm={handleConfirm}
  confirmText='OK'
>
  {() => (
    <div>Are you sure you want to proceed?</div>
  )}
</BasicDialog>
```

**Props**:
- `open`: 表示状態
- `title`: タイトル
- `onClose`: 閉じるハンドラ
- `closeText`: 閉じるボタンのテキスト
- `onConfirm`: 確認ハンドラ (オプション)
- `confirmText`: 確認ボタンのテキスト (オプション)
- `paperProps`: スタイル設定
- `children`: コンテンツレンダー関数

### LoadingContent

**用途**: ローディング状態の管理

**使用例**:
```typescript
import LoadingContent from '@client-common/components/content/LoadingContent';

<LoadingContent>
  {(loading, runWithLoading) => (
    <>
      <ContainedButton
        label='Load Data'
        onClick={() => runWithLoading(async () => {
          await fetchData();
        })}
        disabled={loading}
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataDisplay data={data} />
      )}
    </>
  )}
</LoadingContent>
```

**Render Props**:
- `loading`: ローディング状態 (boolean)
- `runWithLoading`: 非同期処理を実行する関数

### FeatureGuard

**用途**: 機能レベルのアクセス制御

**使用例**:
```typescript
import FeatureGuard from '@client-common/components/authorization/FeatureGuard';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { AdminFeature } from '@admin/consts/AdminConst';

<FeatureGuard
  feature={AdminFeature.ERROR_NOTIFICATION}
  level={PermissionLevel.VIEW}
>
  <ErrorNotificationContent />
</FeatureGuard>
```

**Props**:
- `feature`: 機能名
- `level`: 必要な権限レベル
- `children`: 保護されるコンテンツ

**権限がない場合**: 何も表示されない

## 共通部品を使用する利点

### 1. コードの再利用

同じ機能を何度も実装する必要がありません。

```typescript
// 共通部品を使用 ✅
export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  // 最小限の実装のみ
}

// 自前で実装 ❌
export class MyService {
  async get() { /* 実装 */ }
  async getById(id: string) { /* 実装 */ }
  async create(data: MyDataType) { /* 実装 */ }
  async update(id: string, data: MyDataType) { /* 実装 */ }
  async delete(id: string) { /* 実装 */ }
}
```

### 2. 一貫性

すべてのサービスが同じインターフェースを持ちます。

```typescript
// すべて同じメソッドを提供
const adminService = new AdminService();
const featureInfoService = new FeatureInfoService();
const errorNotificationService = new ErrorNotificationService();

await adminService.get();
await featureInfoService.get();
await errorNotificationService.get();
```

### 3. 保守性

共通部品を修正すれば、すべての使用箇所に反映されます。

### 4. テスタビリティ

共通部品は十分にテストされています。

## 実装パターン

### パターン 1: CRUD サービスの実装

```typescript
// 1. Data 型を定義
export interface MyDataType extends DataTypeBase {
  myField: string;
}

// 2. Record 型を定義
export interface MyRecordType extends RecordTypeBase {
  MyField: string;
}

// 3. DataAccessor を実装
export class MyDataAccessor extends CRUDDataAccessorBase<MyRecordType> {
  constructor() {
    super('MyTable');
  }
}

// 4. Service を実装
export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  constructor(dataAccessor?: MyDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new MyDataAccessor();
    }
    super(dataAccessor, false);
  }

  protected dataToRecord(data: Partial<MyDataType>): Partial<MyRecordType> {
    return { MyField: data.myField || '' };
  }

  protected recordToData(record: MyRecordType): MyDataType {
    return {
      id: record.ID || '',
      myField: record.MyField || '',
      create: record.Create || 0,
      update: record.Update || 0,
    };
  }
}
```

### パターン 2: フォームページの実装

```typescript
'use client';

import { useState } from 'react';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import LoadingContent from '@client-common/components/content/LoadingContent';

export default function MyFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async () => {
    // フォーム送信処理
  };

  return (
    <LoadingContent>
      {(loading, runWithLoading) => (
        <BasicStack>
          <BasicTextField
            label='Name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <BasicTextField
            label='Email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          
          <ContainedButton
            label='Submit'
            onClick={() => runWithLoading(handleSubmit)}
            disabled={loading}
          />
        </BasicStack>
      )}
    </LoadingContent>
  );
}
```

### パターン 3: データ一覧ページの実装

```typescript
'use client';

import { useEffect, useState } from 'react';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import LoadingContent from '@client-common/components/content/LoadingContent';

export default function MyListPage() {
  const [data, setData] = useState([]);

  const columns: Column<MyData>[] = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name' },
  ];

  const fetchData = async () => {
    // データ取得
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  return (
    <LoadingContent>
      {(loading, runWithLoading) => (
        <BasicStack>
          <ContainedButton
            label='Refresh'
            onClick={() => runWithLoading(fetchData)}
            disabled={loading}
          />
          
          <BasicTable
            columns={columns}
            data={data}
            loading={loading}
          />
        </BasicStack>
      )}
    </LoadingContent>
  );
}
```

## トラブルシューティング

### Submodule が空の場合

```bash
git submodule update --init --recursive
```

### Submodule の変更が反映されない

```bash
cd typescript-common
git pull origin main
cd ..
git add typescript-common
git commit -m "Update submodule"
```

### Import エラー

`tsconfig.json` のパス設定を確認:

```json
{
  "compilerOptions": {
    "paths": {
      "@common/*": ["../typescript-common/src/*"],
      "@client-common/*": ["../nextjs-common/src/*"]
    }
  }
}
```

## ベストプラクティス

1. **共通部品を優先的に使用**
   - 自前で実装する前に共通部品を確認

2. **カスタマイズが必要な場合**
   - 継承やコンポジションを使用
   - 共通部品を直接修正しない

3. **共通部品の更新**
   - 定期的に最新版に更新
   - 破壊的変更に注意

4. **フィードバック**
   - 共通部品の改善提案を積極的に行う
