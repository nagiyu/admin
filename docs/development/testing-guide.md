# テストガイド

## 概要

このドキュメントでは、Admin プロジェクトにおけるテストの書き方とベストプラクティスを説明します。

## テストフレームワーク

### Jest

**用途**: TypeScript/JavaScript のユニットテスト

**設定ファイル**: `jest.config.js`

**実行コマンド**:
```bash
npm run test
```

## テスト構成

### ディレクトリ構造

```
admin/
├── services/
│   └── admin/
│       └── AdminService.ts
└── tests/
    └── AdminService.test.ts

cloud-watch-trigger/
├── services/
│   └── LogAnalyzerService.ts
└── tests/
    └── LogAnalyzerService.test.ts
```

### ファイル命名規則

- テストファイル: `{テスト対象}.test.ts`
- テスト対象と同じ名前 + `.test.ts` サフィックス

## テストの基本構造

### describe と it

```typescript
import { AdminService } from '@admin/services/admin/AdminService';

describe('AdminService', () => {
  // テストグループ
  describe('get', () => {
    it('should get all admin data', async () => {
      // Arrange (準備)
      const service = new AdminService();

      // Act (実行)
      const result = await service.get();

      // Assert (検証)
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no data exists', async () => {
      // テスト実装
    });
  });

  describe('getById', () => {
    it('should get admin data by id', async () => {
      // テスト実装
    });

    it('should return null when id does not exist', async () => {
      // テスト実装
    });
  });
});
```

### AAA パターン

テストは **Arrange-Act-Assert** パターンで記述します：

```typescript
it('should create admin data', async () => {
  // Arrange: テストデータを準備
  const service = new AdminService();
  const testData = {
    id: 'test-001',
    terminalIdList: ['terminal-001'],
  };

  // Act: テスト対象の処理を実行
  await service.create(testData);

  // Assert: 結果を検証
  const created = await service.getById('test-001');
  expect(created).toBeDefined();
  expect(created?.id).toBe('test-001');
});
```

## モックの使用

### 依存関係のモック

```typescript
import { AdminService } from '@admin/services/admin/AdminService';
import { AdminDataAccessor } from '@admin/services/admin/AdminDataAccessor';

// モジュール全体をモック
jest.mock('@admin/services/admin/AdminDataAccessor');

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

    // サービスにモックを注入
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

### 関数のモック

```typescript
// 個別の関数をモック
const mockFetchData = jest.fn();
mockFetchData.mockResolvedValue({ id: '123', name: 'Test' });

// 実行
const result = await mockFetchData();

// 検証
expect(mockFetchData).toHaveBeenCalled();
expect(result.id).toBe('123');
```

### モック実装のパターン

#### 成功ケース
```typescript
mockDataAccessor.getById.mockResolvedValue({
  ID: 'test-001',
  TerminalIDList: ['terminal-001'],
  Create: Date.now(),
  Update: Date.now(),
});
```

#### 失敗ケース
```typescript
mockDataAccessor.getById.mockRejectedValue(new Error('Not found'));
```

#### 条件付き戻り値
```typescript
mockDataAccessor.getById.mockImplementation((id: string) => {
  if (id === 'exists') {
    return Promise.resolve({ ID: id, /* ... */ });
  }
  return Promise.resolve(null);
});
```

## 非同期テスト

### async/await の使用

```typescript
it('should fetch data asynchronously', async () => {
  const service = new MyService();
  
  // await を使用
  const result = await service.fetchData();
  
  expect(result).toBeDefined();
});
```

### Promise の使用

```typescript
it('should fetch data', () => {
  const service = new MyService();
  
  return service.fetchData().then(result => {
    expect(result).toBeDefined();
  });
});
```

### エラーのテスト

```typescript
it('should throw error when data not found', async () => {
  const service = new MyService();
  
  await expect(service.getById('invalid-id'))
    .rejects
    .toThrow('Not found');
});
```

## テストの種類

### ユニットテスト

**目的**: 個々の関数やクラスの動作を検証

**例**: サービスクラスのメソッドテスト
```typescript
describe('AdminService', () => {
  describe('dataToRecord', () => {
    it('should convert data to record format', () => {
      const service = new AdminService();
      const data = { terminalIdList: ['terminal-001'] };
      
      // protected メソッドをテストする場合
      const result = (service as any).dataToRecord(data);
      
      expect(result.TerminalIDList).toEqual(['terminal-001']);
    });
  });
});
```

### 統合テスト

**目的**: 複数のコンポーネントが連携して動作することを検証

**例**: サービスと DataAccessor の統合テスト
```typescript
describe('AdminService Integration', () => {
  it('should create and retrieve admin data', async () => {
    const service = new AdminService();
    
    // 作成
    await service.create({
      id: 'integration-test-001',
      terminalIdList: ['terminal-001'],
    });
    
    // 取得
    const result = await service.getById('integration-test-001');
    
    // 検証
    expect(result).toBeDefined();
    expect(result?.id).toBe('integration-test-001');
    
    // クリーンアップ
    await service.delete('integration-test-001');
  });
});
```

### エンドツーエンドテスト

**目的**: ユーザーのワークフロー全体を検証

**例**: API からUIまでの全フロー
```typescript
describe('Error Notification E2E', () => {
  it('should display error notification in UI', async () => {
    // 1. エラーをログに出力
    await logError({
      rootFeature: 'TestApp',
      feature: 'TestFeature',
      message: 'Test error',
      stack: 'Error: Test error...',
    });
    
    // 2. Lambda が処理するまで待機
    await wait(5000);
    
    // 3. API で取得
    const errors = await fetchService.get();
    
    // 4. 検証
    expect(errors.some(e => e.message === 'Test error')).toBe(true);
  });
});
```

## テストデータ

### テストデータの作成

```typescript
// ファクトリー関数を使用
function createTestAdminData(overrides = {}): AdminDataType {
  return {
    id: 'test-' + Math.random().toString(36).substr(2, 9),
    terminalIdList: ['terminal-001'],
    create: Date.now(),
    update: Date.now(),
    ...overrides,
  };
}

// 使用例
it('should process admin data', async () => {
  const testData = createTestAdminData({ terminalIdList: ['custom-terminal'] });
  
  await service.create(testData);
  
  // ...
});
```

### テストデータのクリーンアップ

```typescript
describe('AdminService', () => {
  const testIds: string[] = [];

  afterEach(async () => {
    // 各テスト後にクリーンアップ
    const service = new AdminService();
    for (const id of testIds) {
      await service.delete(id);
    }
    testIds.length = 0;
  });

  it('should create admin data', async () => {
    const service = new AdminService();
    const testId = 'test-001';
    testIds.push(testId);
    
    await service.create({ id: testId, terminalIdList: [] });
    
    // ...
  });
});
```

## テストのベストプラクティス

### 1. 独立性

各テストは他のテストに依存しないようにします。

```typescript
// Bad ❌
let sharedData: AdminDataType;

it('should create data', async () => {
  sharedData = await service.create({ /* ... */ });
});

it('should update data', async () => {
  // sharedData に依存
  await service.update(sharedData.id, { /* ... */ });
});

// Good ✅
it('should create data', async () => {
  const data = await service.create({ /* ... */ });
  expect(data).toBeDefined();
});

it('should update data', async () => {
  // テスト内でデータを作成
  const data = await service.create({ /* ... */ });
  await service.update(data.id, { /* ... */ });
});
```

### 2. 明確なテスト名

テスト名は何をテストしているか明確にします。

```typescript
// Bad ❌
it('test1', () => { });
it('works', () => { });

// Good ✅
it('should return empty array when no data exists', () => { });
it('should throw error when id is invalid', () => { });
```

### 3. 1つのテストで1つのことを検証

```typescript
// Bad ❌
it('should work', async () => {
  const data = await service.create({ /* ... */ });
  expect(data).toBeDefined();
  
  const updated = await service.update(data.id, { /* ... */ });
  expect(updated).toBeDefined();
  
  await service.delete(data.id);
  const deleted = await service.getById(data.id);
  expect(deleted).toBeNull();
});

// Good ✅
it('should create data', async () => {
  const data = await service.create({ /* ... */ });
  expect(data).toBeDefined();
});

it('should update data', async () => {
  const data = await service.create({ /* ... */ });
  const updated = await service.update(data.id, { /* ... */ });
  expect(updated).toBeDefined();
});

it('should delete data', async () => {
  const data = await service.create({ /* ... */ });
  await service.delete(data.id);
  const deleted = await service.getById(data.id);
  expect(deleted).toBeNull();
});
```

### 4. エッジケースのテスト

```typescript
describe('AdminService', () => {
  it('should handle empty terminal list', async () => {
    const service = new AdminService();
    await service.create({ id: 'test', terminalIdList: [] });
    
    const result = await service.getById('test');
    expect(result?.terminalIdList).toEqual([]);
  });

  it('should handle very long terminal list', async () => {
    const longList = Array(1000).fill('terminal').map((v, i) => `${v}-${i}`);
    
    const service = new AdminService();
    await service.create({ id: 'test', terminalIdList: longList });
    
    const result = await service.getById('test');
    expect(result?.terminalIdList).toHaveLength(1000);
  });

  it('should handle null values gracefully', async () => {
    const service = new AdminService();
    const result = await service.getById('non-existent-id');
    expect(result).toBeNull();
  });
});
```

### 5. テストカバレッジ

重要な機能は必ずテストします：
- 正常系
- 異常系
- エッジケース
- エラーハンドリング

## スキップとフォーカス

### テストのスキップ

```typescript
// 特定のテストをスキップ
it.skip('should be skipped', () => {
  // このテストは実行されない
});

// テストグループをスキップ
describe.skip('Skipped tests', () => {
  it('test1', () => { });
  it('test2', () => { });
});
```

### テストのフォーカス

```typescript
// 特定のテストのみ実行
it.only('should run only this test', () => {
  // このテストのみ実行される
});

// テストグループのみ実行
describe.only('Focused tests', () => {
  it('test1', () => { });
  it('test2', () => { });
});
```

**注意**: `only` や `skip` をコミットしないようにしましょう。

## 既存のテスト例

### FeatureInfoService.test.ts

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

**注意**: 
- `describe.skip` で実DynamoDB にアクセスするテストをスキップ
- 実行するにはDynamoDB 接続設定が必要

## テスト実行

### すべてのテスト

```bash
npm run test
```

### 特定のテストファイル

```bash
npm run test AdminService.test.ts
```

### Watch モード

```bash
npm run test -- --watch
```

### カバレッジ

```bash
npm run test -- --coverage
```

## CI/CD でのテスト

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test
```

## トラブルシューティング

### テストがタイムアウトする

```typescript
// タイムアウトを延長
it('should complete long operation', async () => {
  // ...
}, 10000); // 10秒
```

### モックがリセットされない

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // すべてのモックをクリア
});
```

### DynamoDB 接続エラー

- AWS 認証情報を設定
- ローカル DynamoDB を使用
- モックを使用

## まとめ

良いテストを書くことで:
- ✅ バグを早期に発見
- ✅ リファクタリングを安全に実施
- ✅ コードの品質を維持
- ✅ ドキュメントとしても機能

継続的にテストを追加・改善していきましょう。
