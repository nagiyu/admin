import DataAccessorBase from '@common/services/DataAccessorBase';
import DynamoDBService from '@common/services/aws/DynamoDBService';
import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';

import { ErrorNotificationRecordType } from '@admin/interfaces/records/ErrorNotificationRecordType';

export class ErrorNotificationDataAccessor extends DataAccessorBase<ErrorNotificationRecordType> {
  constructor(
    dynamoDBService?: DynamoDBService<ErrorNotificationRecordType>
  ) {
    const tableName = ErrorNotificationDataAccessor.getAuthTableName();

    if (!dynamoDBService) {
      dynamoDBService = new DynamoDBService<ErrorNotificationRecordType>(tableName);
    }

    super(tableName, 'ErrorNotification', dynamoDBService);
  }

  private static getAuthTableName(): string {
    switch (EnvironmentalUtil.GetProcessEnv()) {
      case 'local':
      case 'development':
        return 'DevAdmin';
      case 'production':
        return 'Admin';
      default:
        return 'DevAdmin';
    }
  }
}
