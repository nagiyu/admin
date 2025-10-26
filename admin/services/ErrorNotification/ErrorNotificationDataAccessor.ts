import DataAccessorBase from '@common/services/DataAccessorBase';
import DynamoDBService from '@common/services/aws/DynamoDBService';

import { AdminUtil } from '@admin/utils/AdminUtil';
import { ErrorNotificationRecordType } from '@admin/interfaces/records/ErrorNotificationRecordType';

export class ErrorNotificationDataAccessor extends DataAccessorBase<ErrorNotificationRecordType> {
  constructor(
    dynamoDBService?: DynamoDBService<ErrorNotificationRecordType>
  ) {
    const tableName = AdminUtil.getAuthTableName();

    if (!dynamoDBService) {
      dynamoDBService = new DynamoDBService<ErrorNotificationRecordType>(tableName);
    }

    super(tableName, 'ErrorNotification', dynamoDBService);
  }
}
