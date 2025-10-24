import CRUDServiceBase from '@common/services/CRUDServiceBase';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationRecordType } from '@admin/interfaces/records/ErrorNotificationRecordType';
import { ErrorNotificationDataAccessor } from '@admin/services/ErrorNotification/ErrorNotificationDataAccessor';

export class ErrorNotificationService extends CRUDServiceBase<ErrorNotificationDataType, ErrorNotificationRecordType> {
  constructor(
    dataAccessor?: ErrorNotificationDataAccessor
  ) {
    if (!dataAccessor) {
      dataAccessor = new ErrorNotificationDataAccessor();
    }

    super(dataAccessor, false);
  }

  public override async get(): Promise<ErrorNotificationDataType[]> {
    const result = await super.get();
    return result.sort((a, b) => b.create - a.create);
  }

  protected override dataToRecord(data: Partial<ErrorNotificationDataType>): Partial<ErrorNotificationRecordType> {
    return {
      RootFeature: data.rootFeature,
      Feature: data.feature,
      Message: data.message,
      Stack: data.stack
    }
  }

  protected override recordToData(record: ErrorNotificationRecordType): ErrorNotificationDataType {
    return {
      id: record.ID,
      rootFeature: record.RootFeature,
      feature: record.Feature,
      message: record.Message,
      stack: record.Stack,
      create: record.Create,
      update: record.Update
    }
  }
}
