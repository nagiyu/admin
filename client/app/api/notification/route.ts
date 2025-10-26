import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import { AdminFeature, ROOT_FEATURE } from '@admin/consts/AdminConst';

export async function GET() {
  const options: APIResponseOptions = {
    rootFeature: ROOT_FEATURE,
    feature: AdminFeature.ERROR_NOTIFICATION,
    noCache: true,
  };

  return APIUtil.apiHandler(async () => {
    const VAPID_PUBLIC_KEY = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'VAPID_PUBLIC_KEY');

    return {
      VAPID_PUBLIC_KEY
    };
  }, options);
}
