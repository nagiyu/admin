import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';

export class ErrorLogEntryService {
  private service: ErrorNotificationService;

  constructor(service?: ErrorNotificationService) {
    if (!service) {
      service = new ErrorNotificationService();
    }

    this.service = service;
  }

  public async entryError(data: ErrorNotificationDataType): Promise<ErrorNotificationDataType> {
    return await this.service.create(data);
  }
}
