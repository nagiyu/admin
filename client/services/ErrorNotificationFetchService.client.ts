import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';

export class ErrorNotificationFetchService extends FetchServiceBase<ErrorNotificationDataType> {
  constructor() {
    super('/api/error-notifications');
  }
}
