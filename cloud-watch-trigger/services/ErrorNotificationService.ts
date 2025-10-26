import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';
import NotificationService from '@common/services/NotificationService';
import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';
import { SubscriptionService } from '@common/services/subscription/SubscriptionService';

import { AdminService } from '@admin/services/admin/AdminService';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { SendNotificationRequest } from '@admin/interfaces/data/SendNotificationRequest';

export class ErrorNotificationService {
  private adminService: AdminService;
  private subscriptionService: SubscriptionService;
  private notificationService: NotificationService;

  constructor(
    adminService?: AdminService,
    subscriptionService?: SubscriptionService,
    notificationService?: NotificationService
  ) {
    if (!adminService) {
      adminService = new AdminService();
    }

    if (!subscriptionService) {
      subscriptionService = new SubscriptionService();
    }

    if (!notificationService) {
      notificationService = new NotificationService();
    }

    this.adminService = adminService;
    this.subscriptionService = subscriptionService;
    this.notificationService = notificationService;
  }

  public async notify(data: ErrorNotificationDataType): Promise<void> {
    const terminalIdList: string[] = [];

    const adminDataList = await this.adminService.get();

    adminDataList.forEach(async (adminData) => {
      for (const terminalId of adminData.terminalIdList) {
        terminalIdList.push(terminalId);
      }
    });

    const endpoint = await this.getEndpoint();

    const request: SendNotificationRequest = {
      id: data.id,
    };
    const message = JSON.stringify(request);

    for (const terminalId of terminalIdList) {
      const subscriptionData = await this.subscriptionService.getByTerminalId(terminalId);
      const subscription = subscriptionData.subscription;

      await this.notificationService.sendPushNotification(`${endpoint}/api/send-notification`, message, subscription);
    }
  }

  private async getEndpoint(): Promise<string> {
    switch (EnvironmentalUtil.GetProcessEnv()) {
      case 'local':
        return 'http://localhost:3000';
      case 'development':
        return await SecretsManagerUtil.getSecretValue('DevAdmin', 'CLIENT_BASE_URL');
      case 'production':
        return await SecretsManagerUtil.getSecretValue('Admin', 'CLIENT_BASE_URL');
      default:
        return 'http://localhost:3000';
    }
  }
}
