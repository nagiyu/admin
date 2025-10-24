import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import { AdminFeature } from '@admin/consts/AdminConst';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';
import { ROOT_FEATURE } from '@admin/consts/AdminConst';

import { AdminAuthorizationService } from '@/services/AdminAuthorizationService.server';

const service = new ErrorNotificationService();

const authorizationService = new AdminAuthorizationService();

export interface ErrorNotificationGetResponse {
  errorList: ErrorNotificationDataType[];
}

export async function GET() {
  const options: APIResponseOptions = {
    rootFeature: ROOT_FEATURE,
    feature: AdminFeature.ERROR_NOTIFICATION,
    noCache: true,
    authorization: {
      authorizationService,
      requiredLevel: PermissionLevel.VIEW,
    }
  };

  return APIUtil.apiHandler(async () => {
    return await service.get();
  }, options);
}
