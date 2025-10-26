import { NextRequest } from 'next/server';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import NotificationUtil, { PayloadType } from '@client-common/utils/NotificationUtil.server';

import { AdminFeature, ROOT_FEATURE } from '@admin/consts/AdminConst';
import { SendNotificationRequest } from '@admin/interfaces/data/SendNotificationRequest';

interface ErrorNotificationPayloadType extends PayloadType {
  data: {
    id: string;
  };
}

export async function POST(request: NextRequest) {
  const options: APIResponseOptions = {
    rootFeature: ROOT_FEATURE,
    feature: AdminFeature.ERROR_NOTIFICATION,
    noCache: true,
  };

  return APIUtil.apiHandler(async () => {
    const requestData = await request.json();

    const parsed: SendNotificationRequest = JSON.parse(requestData.message);

    const payload: ErrorNotificationPayloadType = {
      title: 'Error Notification',
      body: `Error Occurred with ID: ${parsed.id}`,
      icon: "/logo.png",
      data: {
        id: parsed.id,
      },
    };

    return NotificationUtil.sendNotification(requestData.subscription, payload);
  }, options);
}
