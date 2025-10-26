import DynamoDBService from '@common/services/aws/DynamoDBService';
import DataAccessorBase from '@common/services/DataAccessorBase';

import { FeatureInfoRecordType } from '@admin/interfaces/records/FeatureInfoRecordType';

export class FeatureInfoDataAccessor extends DataAccessorBase<FeatureInfoRecordType> {
  constructor(dynamoDBService?: DynamoDBService<FeatureInfoRecordType>) {
    // 開発環境と分ける必要はないので、テーブル名は固定
    const tableName = 'Admin';

    if (!dynamoDBService) {
      dynamoDBService = new DynamoDBService(tableName);
    }

    super(tableName, 'FeatureInfo', dynamoDBService);
  }
}
