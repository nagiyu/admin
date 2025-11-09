# 実装ルール

## 概要

Admin プロジェクトの実装ルールとコーディング規約を定義します。すべての開発者はこれらのルールに従ってコードを記述してください。

## 基本原則

### 1. 宣言型プログラミング

手続き型ではなく、宣言型のコードを書くことを心掛けてください。

**悪い例** (手続き型):
```typescript
const result = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].age >= 18) {
    result.push(users[i].name);
  }
}
```

**良い例** (宣言型):
```typescript
const result = users
  .filter(user => user.age >= 18)
  .map(user => user.name);
```

### 2. 読みやすいコード

- 明確な変数名・関数名を使用
- 適切なコメントを追加 (コードで表現できない意図を説明)
- 関数は1つの責務のみを持つ
- ネストを深くしない (最大3レベル)

### 3. 型安全性

TypeScript の型システムを最大限活用してください。

```typescript
// any は使用しない
const data: any = fetchData(); // ❌

// 明示的な型定義
const data: UserData = fetchData(); // ✅

// 型推論を活用
const name = user.name; // string と推論される ✅
```

## 命名規則

### TypeScript/JavaScript

#### 変数・関数

- **camelCase** を使用
- 意味のある名前を付ける
- boolean は `is`, `has`, `should` などで始める

```typescript
// 変数
const userName = 'John';
const userCount = 10;
const isActive = true;
const hasPermission = false;

// 関数
function getUserName() { }
function calculateTotal() { }
function shouldDisplayError() { }
```

#### クラス・インターフェース・型

- **PascalCase** を使用

```typescript
// クラス
class UserService { }
class AdminDataAccessor { }

// インターフェース
interface User { }
interface AdminData { }

// 型エイリアス
type UserId = string;
type UserCallback = (user: User) => void;
```

#### 定数

- **UPPER_SNAKE_CASE** を使用

```typescript
// 定数
export const MAX_RETRY_COUNT = 3;
export const DEFAULT_TIMEOUT = 5000;
export const API_VERSION = 'v1';
```

#### Enum

- **PascalCase** を使用
- メンバーは **PascalCase** を使用

```typescript
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST',
}

enum PermissionLevel {
  View = 'VIEW',
  Edit = 'EDIT',
  Admin = 'ADMIN',
}
```

### ファイル・ディレクトリ

- **PascalCase** を使用 (TypeScript/TSX ファイル)
- **kebab-case** を使用 (設定ファイル、ドキュメントなど)

```
services/
  AdminService.ts          ✅
  admin-service.ts         ❌
  
components/
  UserProfile.tsx          ✅
  user-profile.tsx         ❌

docs/
  implementation-rules.md  ✅
  Implementation-Rules.md  ❌
```

## コーディングスタイル

### インデント

- **2スペース** を使用
- タブは使用しない

```typescript
function example() {
  if (condition) {
    doSomething();
  }
}
```

### セミコロン

- **必ず使用する**

```typescript
const name = 'John';  // ✅
const age = 30;       // ✅

const name = 'John'   // ❌
const age = 30        // ❌
```

### クォート

- **シングルクォート** を厳守
- テンプレートリテラルは必要な時のみ使用

```typescript
const name = 'John';                    // ✅
const message = `Hello, ${name}`;       // ✅ (補間が必要)

const name = "John";                    // ❌
const message = `Hello, World`;         // ❌ (補間不要)
```

### アロー関数 vs 通常の関数

- **アロー関数を優先**
- `this` のバインドが必要な場合は通常の関数

```typescript
// アロー関数 (推奨)
const add = (a: number, b: number) => a + b;

const users = data.map(item => ({
  name: item.name,
  age: item.age,
}));

// 通常の関数 (this が必要な場合)
class MyClass {
  method() {
    // this を使用
  }
}
```

### 非同期処理

- **async/await を優先**
- Promise チェーンは避ける

```typescript
// Good ✅
async function fetchUser(id: string) {
  try {
    const user = await userService.getById(id);
    const profile = await profileService.getByUserId(user.id);
    return { user, profile };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Bad ❌
function fetchUser(id: string) {
  return userService.getById(id)
    .then(user => profileService.getByUserId(user.id))
    .then(profile => ({ user, profile }))
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}
```

## プロジェクト構成ルール

### ディレクトリ構造

```
admin/
├── consts/          # 定数のみ
├── interfaces/      # 型定義のみ
│   ├── data/       # Data 型
│   └── records/    # Record 型
├── services/        # ビジネスロジック
│   └── {feature}/  # 機能ごとにディレクトリ
│       ├── {Feature}Service.ts
│       └── {Feature}DataAccessor.ts
├── utils/           # ユーティリティ関数
└── tests/           # テストコード
```

### ファイル配置ルール

#### 1. 1ファイル = 1クラス/インターフェース

```typescript
// AdminService.ts
export class AdminService { }

// AdminDataType.ts
export interface AdminDataType { }
```

#### 2. 関連ファイルはディレクトリにまとめる

```
services/
  admin/
    AdminService.ts
    AdminDataAccessor.ts
  featureInfo/
    FeatureInfoService.ts
    FeatureInfoDataAccessor.ts
```

#### 3. インポートの順序

1. 外部ライブラリ
2. 共通モジュール (`@common`, `@common-client`)
3. プロジェクト内モジュール (`@admin`, `@/`)

**注意**: 相対パスは基本的に避け、エイリアスパスを使用してください。

```typescript
// 外部ライブラリ
import { CloudWatchLogsEvent } from 'aws-lambda';
import { gunzip } from 'zlib';

// 共通モジュール
import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';
import CRUDServiceBase from '@common/services/CRUDServiceBase';
import BasicTable from '@common-client/components/data/table/BasicTable';

// プロジェクト内モジュール
import { AdminDataType } from '@admin/interfaces/data/AdminDataType';
import { AdminRecordType } from '@admin/interfaces/records/AdminRecordType';
import { ErrorNotificationFetchService } from '@/services/ErrorNotificationFetchService.client';
```

## データ型の定義ルール

### Data vs Record

- **Data**: アプリケーション層で使用 (camelCase)
- **Record**: データアクセス層で使用 (PascalCase)

```typescript
// Data 型 (アプリケーション層)
interface AdminDataType extends DataTypeBase {
  id: string;
  terminalIdList: string[];
  create: number;
  update: number;
}

// Record 型 (DynamoDB)
interface AdminRecordType extends RecordTypeBase {
  ID: string;
  TerminalIDList: string[];
  Create: number;
  Update: number;
}
```

### 必須フィールドとオプションフィールド

```typescript
interface UserData {
  id: string;           // 必須
  name: string;         // 必須
  email?: string;       // オプション
  phoneNumber?: string; // オプション
}
```

## サービス実装ルール

### 1. CRUDServiceBase の継承

すべての CRUD サービスは `CRUDServiceBase` を継承してください。

```typescript
export class MyService extends CRUDServiceBase<MyDataType, MyRecordType> {
  constructor(dataAccessor?: MyDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new MyDataAccessor();
    }
    super(dataAccessor, useCache);
  }

  protected dataToRecord(data: Partial<MyDataType>): Partial<MyRecordType> {
    // 実装
  }

  protected recordToData(record: MyRecordType): MyDataType {
    // 実装
  }
}
```

### 2. データ変換の実装

- `dataToRecord`: Data → Record
- `recordToData`: Record → Data
- デフォルト値を必ず設定

```typescript
protected dataToRecord(data: Partial<AdminDataType>): Partial<AdminRecordType> {
  return {
    TerminalIDList: data.terminalIdList || [], // デフォルト値
  }
}

protected recordToData(record: AdminRecordType): AdminDataType {
  return {
    id: record.ID || '',                      // デフォルト値
    terminalIdList: record.TerminalIDList || [], // デフォルト値
    create: record.Create || 0,               // デフォルト値
    update: record.Update || 0,               // デフォルト値
  }
}
```

### 3. キャッシュの使用判断

- 手動書き換えの可能性がある → キャッシュ無効
- 頻繁に読み取る参照データ → キャッシュ有効

```typescript
// キャッシュ無効 (手動書き換えの可能性)
constructor(dataAccessor?: AdminDataAccessor) {
  super(dataAccessor, false);
}

// キャッシュ有効 (参照データ)
constructor(dataAccessor?: ReferenceDataAccessor) {
  super(dataAccessor, true);
}
```

## React/Next.js ルール

### 1. Client Component vs Server Component

#### Client Component ('use client')

以下の場合に使用:
- State を使用
- イベントハンドラを使用
- ブラウザ API を使用
- React Hooks を使用

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
- サーバーサイドでのデータフェッチ
- バックエンド API へのアクセス
- 環境変数の使用
- 機密情報の扱い

```typescript
import { MyService } from '@admin/services/my/MyService';

export default async function MyServerComponent() {
  const service = new MyService();
  const data = await service.get();
  return <div>{/* データ表示 */}</div>;
}
```

### 2. Props の型定義

Props は継承できるよう、**必ず `interface` を使用**してください。

```typescript
// Good ✅
interface MyComponentProps {
  title: string;
  count?: number;           // オプション
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, count = 0, onSubmit }: MyComponentProps) {
  // ...
}

// Bad ❌ - type は継承できないため使用しない
type MyComponentProps = {
  title: string;
  count?: number;
  onSubmit: (data: FormData) => void;
};
```

**理由**: `interface` は `extends` で拡張可能ですが、`type` は拡張できません。

```typescript
// 拡張例
interface ExtendedProps extends MyComponentProps {
  subtitle: string;
}
```

### 3. useState の使用

```typescript
// 初期値を明示
const [name, setName] = useState<string>('');
const [count, setCount] = useState<number>(0);
const [users, setUsers] = useState<User[]>([]);

// 複雑な状態は分割
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');

// 関連する状態はオブジェクトにまとめる
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
});
```

### 4. useEffect の使用

```typescript
// 依存配列を必ず指定
useEffect(() => {
  fetchData();
}, []); // 初回のみ実行

useEffect(() => {
  fetchData();
}, [userId]); // userId が変わったら実行

// クリーンアップが必要な場合
useEffect(() => {
  const subscription = subscribeToData();
  return () => subscription.unsubscribe();
}, []);
```

## エラーハンドリングルール

### 1. try-catch の使用

```typescript
async function fetchData() {
  try {
    const data = await service.get();
    return data;
  } catch (error) {
    console.error('データ取得エラー:', error);
    // エラーを上位に伝播するか、適切に処理
    throw error;
  }
}
```

### 2. エラーメッセージ

- 明確で具体的なメッセージ
- デバッグ情報を含める

```typescript
// Good ✅
throw new Error(`User not found: ${userId}`);

// Bad ❌
throw new Error('Error');
```

### 3. エラーログ

```typescript
console.error('エラーが発生しました:', {
  error,
  userId,
  timestamp: new Date().toISOString(),
});
```

## テストルール

### 1. テストファイルの配置

- `tests/` ディレクトリに配置
- ファイル名: `{テスト対象}.test.ts`

```
admin/
  services/
    admin/
      AdminService.ts
  tests/
    AdminService.test.ts
```

### 2. テストの構成

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

describe('AdminService', () => {
  describe('get', () => {
    it('should get all admin data', async () => {
      // Arrange
      const service = new AdminService();

      // Act
      const result = await service.get();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should get admin data by id', async () => {
      // テスト実装
    });
  });
});
```

### 3. モックの使用

**依存性注入 (DI) を使用したモック**を可能な限り目指してください。

```typescript
import { AdminService } from '@admin/services/admin/AdminService';
import { AdminDataAccessor } from '@admin/services/admin/AdminDataAccessor';

describe('AdminService', () => {
  let service: AdminService;
  let mockDataAccessor: jest.Mocked<AdminDataAccessor>;

  beforeEach(() => {
    // モックインスタンスを作成
    mockDataAccessor = {
      getAll: jest.fn(),
      getById: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    // DI でモックを注入
    service = new AdminService(mockDataAccessor);
  });

  it('should get all admin data', async () => {
    // モックの戻り値を設定
    const mockRecords = [
      { ID: 'admin-001', TerminalIDList: ['terminal-001'], Create: 0, Update: 0 }
    ];
    mockDataAccessor.getAll.mockResolvedValue(mockRecords);

    // テスト実行
    const result = await service.get();

    // 検証
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('admin-001');
    expect(mockDataAccessor.getAll).toHaveBeenCalledTimes(1);
  });
});
```

**jest.mock() の使用は最小限に**:

```typescript
// DI が使えない場合のみ使用
jest.mock('@admin/services/admin/AdminDataAccessor');

describe('AdminService', () => {
  // テスト実装
});
```

## コメントルール

### 1. コメントが必要な場合

- コードで表現できない意図や背景
- 複雑なアルゴリズムの説明
- TODO や FIXME

```typescript
// 手動の書き換えの可能性があるため、キャッシュは使用しない
super(dataAccessor, false);

// TODO: エラー通知機能を追加
// FIXME: パフォーマンス改善が必要
```

### 2. コメントが不要な場合

- コードを見れば分かること
- 自明な処理

```typescript
// Bad ❌
// ユーザー名を取得
const name = user.name;

// Good ✅
const name = user.name;
```

### 3. JSDoc コメント

公開 API には JSDoc を追加:

```typescript
/**
 * 管理者情報を取得します。
 * @param id 管理者 ID
 * @returns 管理者データ。見つからない場合は null
 * @throws {Error} データベースエラーが発生した場合
 */
async getById(id: string): Promise<AdminDataType | null> {
  // 実装
}
```

## Git コミットルール

### 1. コミットメッセージ

- 日本語で記述
- 明確で簡潔に
- 変更内容を説明

```
Good ✅
エラー通知機能を追加

Bad ❌
update
fix
```

### 2. コミット単位

- 1つの変更 = 1つのコミット
- 無関係な変更は分ける

### 3. コミット前のチェック

- ビルドエラーがないか
- テストが通るか
- Lint エラーがないか

## 禁止事項

### 1. 絶対に避けるべきこと

- ❌ `any` 型の使用 (やむを得ない場合を除く)
- ❌ `console.log` のコミット (デバッグ用は削除)
- ❌ 未使用のインポート・変数
- ❌ ハードコードされた機密情報
- ❌ 動作しないコードのコミット

### 2. 慎重に使用すべきもの

- ⚠️ `as` 型アサーション
- ⚠️ `!` non-null アサーション
- ⚠️ `eval` の使用
- ⚠️ グローバル変数

## パフォーマンスルール

### 1. 不要な再レンダリングを避ける

```typescript
// React.memo の使用
const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

// useCallback の使用
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// useMemo の使用
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### 2. 効率的なデータ処理

```typescript
// Good ✅
const activeUsers = users.filter(u => u.isActive);

// Bad ❌
const activeUsers = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i]);
  }
}
```

## セキュリティルール

### 1. 機密情報の扱い

- 環境変数を使用
- ハードコードしない
- Git にコミットしない

```typescript
// Good ✅
const apiKey = process.env.API_KEY;

// Bad ❌
const apiKey = 'sk-1234567890abcdef';
```

### 2. 入力検証

```typescript
function updateUser(userId: string, data: UserData) {
  // 入力検証
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Invalid email');
  }
  
  // 処理続行
}
```

## まとめ

これらのルールに従うことで:
- ✅ 一貫性のあるコードベース
- ✅ 保守しやすいコード
- ✅ バグの少ないコード
- ✅ チーム開発の効率化

疑問点がある場合は、チームメンバーに相談してください。
