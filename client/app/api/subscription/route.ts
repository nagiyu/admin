import { NextRequest } from 'next/server';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import { SubscriptionAPIHelper } from '@client-common/helpers/api/SubscriptionAPIHelper';

import { AdminFeature, ROOT_FEATURE } from '@admin/consts/AdminConst';

import { AdminAuthorizationService } from '@/services/AdminAuthorizationService.server';
import { PermissionLevel } from '@common/enums/PermissionLevel';

const authorizationService = new AdminAuthorizationService();

const getOptions = (level: PermissionLevel): APIResponseOptions => ({
  rootFeature: ROOT_FEATURE,
  feature: AdminFeature.ERROR_NOTIFICATION,
  noCache: true,
  authorization: {
    authorizationService,
    requiredLevel: level,
  }
});

export async function GET(request: NextRequest) {
  const options = getOptions(PermissionLevel.VIEW);

  return APIUtil.apiHandler(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await SubscriptionAPIHelper.get(request as any);
  }, options);
}

export async function POST(request: NextRequest) {
  const options = getOptions(PermissionLevel.EDIT);

  return APIUtil.apiHandler(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await SubscriptionAPIHelper.post(request as any);
  }, options);
}

export async function PUT(request: NextRequest) {
  const options = getOptions(PermissionLevel.EDIT);

  return APIUtil.apiHandler(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await SubscriptionAPIHelper.put(request as any);
  }, options);
}

export async function DELETE(request: NextRequest) {
  const options = getOptions(PermissionLevel.DELETE);

  return APIUtil.apiHandler(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await SubscriptionAPIHelper.delete(request as any);
  }, options);
}
