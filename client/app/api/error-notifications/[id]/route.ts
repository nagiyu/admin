import { NextRequest } from 'next/server';

import { NotFoundError } from '@common/errors';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';
import { AdminFeature, ROOT_FEATURE } from '@admin/consts/AdminConst';

const service = new ErrorNotificationService();

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const options: APIResponseOptions = {
    rootFeature: ROOT_FEATURE,
    feature: AdminFeature.ERROR_NOTIFICATION,
    noCache: true,
  };

  return APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const error = await service.getById(id);

    if (!error) {
      throw new NotFoundError(`Error Notification with ID ${id} not found`);
    }

    return error;
  }, options);
}
