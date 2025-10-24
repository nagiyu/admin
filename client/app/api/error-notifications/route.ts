import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import { AdminFeature } from '@admin/consts/AdminConst';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';

import { AdminAuthorizationService } from '@/services/AdminAuthorizationService.server';

const service = new ErrorNotificationService();

const authorizationService = new AdminAuthorizationService();

const options: APIResponseOptions = {
  noCache: true,
  authorization: {
    authorizationService,
    feature: AdminFeature.ERROR_NOTIFICATION,
    requiredLevel: PermissionLevel.VIEW,
  }
};

export interface ErrorNotificationGetResponse {
  errorList: ErrorNotificationDataType[];
}

export async function GET() {
  return APIUtil.apiHandler(async () => {
    return await service.get();
  }, options);
}
