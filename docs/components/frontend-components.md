# フロントエンドコンポーネント

## 概要

Admin プロジェクトのフロントエンドは、Next.js 15 (App Router) と React 19 を使用して構築されています。共通コンポーネントは `nextjs-common` submodule から提供されます。

## 技術スタック

- **Next.js 15.4.3**: React フレームワーク (App Router)
- **React 19.1.1**: UI ライブラリ
- **TypeScript 5**: 型安全な開発
- **next-auth 4.24.11**: 認証ライブラリ
- **Material-UI**: UI コンポーネントライブラリ (nextjs-common より提供)

## プロジェクト構成

```
client/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホームページ
│   ├── api/                 # API Routes
│   │   └── subscription/    # サブスクリプション API
│   └── error-notifications/ # エラー通知ページ
│       └── page.tsx
├── services/                 # クライアントサービス
│   ├── AdminAuthorizationService.server.ts
│   └── ErrorNotificationFetchService.client.ts
├── public/                   # 静的ファイル
└── package.json
```

## 共通コンポーネント (nextjs-common)

### レイアウトコンポーネント

#### CommonLayout

**場所**: `@client-common/components/layout/CommonLayout`

**用途**: アプリケーション全体のレイアウト

**使用例**:
```typescript
import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

const menuItems: MenuItemData[] = [
  { title: 'Home', url: '/' },
  { title: 'Error Notifications', url: '/error-notifications' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommonLayout
      title='Admin'
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
- `menuItems`: メニュー項目の配列
- `enableAuthentication`: 認証の有効化
- `enableNotification`: 通知の有効化
- `children`: ページコンテンツ

#### BasicStack

**場所**: `@client-common/components/Layout/Stacks/BasicStack`

**用途**: 縦方向のスタックレイアウト

**使用例**:
```typescript
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';

<BasicStack>
  <Component1 />
  <Component2 />
  <Component3 />
</BasicStack>
```

#### DirectionStack

**場所**: `@client-common/components/Layout/Stacks/DirectionStack`

**用途**: 横方向のスタックレイアウト

**使用例**:
```typescript
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';

<DirectionStack>
  <Button1 />
  <Button2 />
</DirectionStack>
```

### データ表示コンポーネント

#### BasicTable

**場所**: `@client-common/components/data/table/BasicTable`

**用途**: データテーブルの表示

**使用例**:
```typescript
import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';

interface MyData {
  id: string;
  name: string;
  create: number;
}

const columns: Column<MyData>[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'create', label: 'Created', format: (value) => new Date(value).toLocaleString() },
];

<BasicTable
  columns={columns}
  data={myData}
  loading={isLoading}
/>
```

**Props**:
- `columns`: カラム定義の配列
- `data`: 表示するデータの配列
- `loading`: ローディング状態

**Column 型**:
```typescript
interface Column<T> {
  id: keyof T;              // データのキー
  label: string;            // カラムのラベル
  format?: (value: any) => React.ReactNode; // カスタムフォーマット関数
}
```

### 入力コンポーネント

#### ContainedButton

**場所**: `@client-common/components/inputs/Buttons/ContainedButton`

**用途**: プライマリボタン

**使用例**:
```typescript
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';

<ContainedButton
  label='Submit'
  onClick={handleClick}
  disabled={isLoading}
/>
```

**Props**:
- `label`: ボタンラベル
- `onClick`: クリックハンドラ
- `disabled`: 無効化フラグ

#### BasicTextField

**場所**: `@client-common/components/inputs/TextFields/BasicTextField`

**用途**: 単一行テキスト入力

**使用例**:
```typescript
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';

<BasicTextField
  label='Username'
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  readonly={false}
/>
```

**Props**:
- `label`: フィールドラベル
- `value`: 値
- `onChange`: 変更ハンドラ
- `readonly`: 読み取り専用フラグ

#### MultilineTextField

**場所**: `@client-common/components/inputs/TextFields/MultilineTextField`

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
/>
```

**Props**:
- `label`: フィールドラベル
- `value`: 値
- `onChange`: 変更ハンドラ
- `readonly`: 読み取り専用フラグ
- `rows`: 行数

### フィードバックコンポーネント

#### BasicDialog

**場所**: `@client-common/components/feedback/dialog/BasicDialog`

**用途**: モーダルダイアログ

**使用例**:
```typescript
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';

<BasicDialog
  open={isOpen}
  title="Confirm"
  onClose={() => setIsOpen(false)}
  closeText='Close'
  onConfirm={handleConfirm}
  confirmText='Confirm'
  paperProps={{ sx: { minWidth: '500px' } }}
>
  {() => (
    <div>Dialog content</div>
  )}
</BasicDialog>
```

**Props**:
- `open`: ダイアログの表示状態
- `title`: ダイアログタイトル
- `onClose`: 閉じるハンドラ
- `closeText`: 閉じるボタンのテキスト
- `onConfirm`: 確認ハンドラ (オプション)
- `confirmText`: 確認ボタンのテキスト (オプション)
- `paperProps`: ダイアログのスタイル設定
- `children`: コンテンツレンダー関数

#### LoadingContent

**場所**: `@client-common/components/content/LoadingContent`

**用途**: ローディング状態の管理

**使用例**:
```typescript
import LoadingContent from '@client-common/components/content/LoadingContent';

<LoadingContent>
  {(loading, runWithLoading) => (
    <>
      <ContainedButton
        label='Load Data'
        onClick={() => runWithLoading(async () => await fetchData())}
        disabled={loading}
      />
      {loading ? <p>Loading...</p> : <DataDisplay />}
    </>
  )}
</LoadingContent>
```

**Render Props**:
- `loading`: ローディング状態 (boolean)
- `runWithLoading`: 非同期処理を実行する関数

### 認証・認可コンポーネント

#### FeatureGuard

**場所**: `@client-common/components/authorization/FeatureGuard`

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
  {/* 権限があるユーザーのみ表示されるコンテンツ */}
  <ErrorNotificationContent />
</FeatureGuard>
```

**Props**:
- `feature`: 機能名 (AdminFeature enum)
- `level`: 必要な権限レベル (PermissionLevel enum)
- `children`: 保護されるコンテンツ

**PermissionLevel**:
```typescript
enum PermissionLevel {
  VIEW = 'VIEW',       // 閲覧権限
  EDIT = 'EDIT',       // 編集権限
  ADMIN = 'ADMIN',     // 管理者権限
}
```

## ページコンポーネント

### ErrorNotificationsPage

**場所**: `client/app/error-notifications/page.tsx`

**機能**:
- エラー通知の一覧表示
- エラー詳細の表示 (ダイアログ)
- データの更新 (Refresh)
- URL パラメータによる詳細表示 (`?id={error-id}`)

**使用コンポーネント**:
- `BasicTable`: 一覧表示
- `BasicDialog`: 詳細表示
- `ContainedButton`: アクションボタン
- `FeatureGuard`: アクセス制御
- `LoadingContent`: ローディング管理
- `BasicTextField`: 詳細表示フィールド
- `MultilineTextField`: スタック・分析結果表示

**実装パターン**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorNotificationsPage() {
  const searchParams = useSearchParams();
  const [errorList, setErrorList] = useState([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // データ取得
  const fetchData = async () => {
    const data = await fetchService.get();
    setErrorList(data);
  };

  // 初期ロード
  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  // URL パラメータ処理
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      // 詳細表示
    }
  }, [searchParams]);

  return (
    <FeatureGuard feature={AdminFeature.ERROR_NOTIFICATION} level={PermissionLevel.VIEW}>
      <LoadingContent>
        {(loading, runWithLoading) => (
          <>
            {/* コンテンツ */}
          </>
        )}
      </LoadingContent>
    </FeatureGuard>
  );
}
```

## サービスクラス

### ErrorNotificationFetchService

**場所**: `client/services/ErrorNotificationFetchService.client.ts`

**用途**: クライアントサイドでのデータ取得

**実装パターン**:
```typescript
export class ErrorNotificationFetchService {
  async get(): Promise<ErrorNotificationDataType[]> {
    const response = await fetch('/api/error-notifications');
    return await response.json();
  }

  async getById(id: string): Promise<ErrorNotificationDataType> {
    const response = await fetch(`/api/error-notifications/${id}`);
    return await response.json();
  }
}
```

### AdminAuthorizationService

**場所**: `client/services/AdminAuthorizationService.server.ts`

**用途**: サーバーサイドでの認証・認可

**特徴**:
- `.server.ts` サフィックスで Server Component 専用
- NextAuth と連携

## ベストプラクティス

### 1. Client/Server Components の使い分け

#### Client Component ('use client')

以下の場合に使用:
- State を使用する
- イベントハンドラを使用する
- ブラウザ API を使用する
- React Hooks を使用する

```typescript
'use client';

import { useState } from 'react';

export default function MyClientComponent() {
  const [count, setCount] = useState(0);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### Server Component (デフォルト)

以下の場合に使用:
- データフェッチ (サーバーサイド)
- バックエンド API へのアクセス
- 機密情報の扱い

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

export default async function MyServerComponent() {
  const adminService = new AdminService();
  const data = await adminService.get();
  
  return <div>{/* データ表示 */}</div>;
}
```

### 2. データフェッチパターン

#### クライアントサイド

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const fetchService = new MyFetchService();
      const result = await fetchService.get();
      setData(result);
    })();
  }, []);

  return <div>{/* データ表示 */}</div>;
}
```

#### サーバーサイド

```typescript
import { MyService } from '@admin/services/my/MyService';

export default async function MyComponent() {
  const service = new MyService();
  const data = await service.get();

  return <div>{/* データ表示 */}</div>;
}
```

### 3. ローディング状態の管理

LoadingContent コンポーネントを使用:

```typescript
<LoadingContent>
  {(loading, runWithLoading) => (
    <>
      <ContainedButton
        label='Action'
        onClick={() => runWithLoading(async () => await performAction())}
        disabled={loading}
      />
      {loading && <p>Loading...</p>}
    </>
  )}
</LoadingContent>
```

### 4. エラーハンドリング

```typescript
const fetchData = async () => {
  try {
    const data = await fetchService.get();
    setData(data);
  } catch (error) {
    console.error('データ取得エラー:', error);
    // エラー表示
  }
};
```

### 5. TypeScript の活用

```typescript
// 型定義
interface MyComponentProps {
  title: string;
  onSubmit: (data: MyData) => void;
}

// 型安全なコンポーネント
export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  // ...
}
```

## スタイリング

### Material-UI の使用

共通コンポーネントは Material-UI をベースにしています。

```typescript
import { Button, TextField } from '@mui/material';

<Button variant="contained" onClick={handleClick}>
  Click me
</Button>
```

### カスタムスタイル

```typescript
<div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
  Content
</div>
```

### CSS Modules (オプション)

```typescript
import styles from './MyComponent.module.css';

<div className={styles.container}>
  Content
</div>
```

## ルーティング

### App Router の使用

```
app/
├── page.tsx                 # /
├── about/
│   └── page.tsx            # /about
└── error-notifications/
    └── page.tsx            # /error-notifications
```

### 動的ルート

```
app/
└── error-notifications/
    └── [id]/
        └── page.tsx        # /error-notifications/:id
```

```typescript
export default function ErrorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // id を使用
}
```

### URL パラメータ

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export default function MyPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // ?id=123
  
  // ...
}
```

## メニュー設定

```typescript
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

const menuItems: MenuItemData[] = [
  {
    title: 'Home',
    url: '/',
  },
  {
    title: 'Error Notifications',
    url: '/error-notifications',
  },
  // 追加のメニュー項目
];
```

## 認証設定

### NextAuth の設定

CommonLayout で認証を有効化:

```typescript
<CommonLayout
  title='Admin'
  menuItems={menuItems}
  enableAuthentication={true}  // 認証有効化
  enableNotification={true}
>
  {children}
</CommonLayout>
```

### 保護されたページ

```typescript
<FeatureGuard
  feature={AdminFeature.MY_FEATURE}
  level={PermissionLevel.VIEW}
>
  {/* 認証済みユーザーのみアクセス可能 */}
</FeatureGuard>
```

## パフォーマンス最適化

### 1. React.memo の使用

```typescript
import { memo } from 'react';

const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### 2. useCallback の使用

```typescript
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);
```

### 3. 遅延ローディング

```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./MyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## テスト

### コンポーネントテスト

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```
