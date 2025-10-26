import DataAccessorBase from '@common/services/DataAccessorBase';
import DynamoDBService from '@common/services/aws/DynamoDBService';

import { AdminRecordType } from '@admin/interfaces/records/AdminRecordType';
import { AdminUtil } from '@admin/utils/AdminUtil';

export class AdminDataAccessor extends DataAccessorBase<AdminRecordType> {
  constructor(dynamoDBService?: DynamoDBService<AdminRecordType>) {
    const tableName = AdminUtil.getAuthTableName();

    if (!dynamoDBService) {
      dynamoDBService = new DynamoDBService<AdminRecordType>(tableName);
    }

    super(tableName, 'Admin', dynamoDBService);
  }
}
