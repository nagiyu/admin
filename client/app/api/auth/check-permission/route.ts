import { postHandler } from '@client-common/routes/auth/check-permission/route';

import { AdminAuthorizationService } from '@/services/AdminAuthorizationService.server';

import { ROOT_FEATURE } from '@admin/consts/AdminConst';

const authorizationService = new AdminAuthorizationService();

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return postHandler(ROOT_FEATURE, request as any, authorizationService);
}
