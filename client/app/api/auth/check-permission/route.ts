import { POST as PostBase } from '@client-common/routes/auth/check-permission/route';

import { AdminAuthorizationService } from '@/services/AdminAuthorizationService';

const authorizationService = new AdminAuthorizationService();

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return PostBase(request as any, authorizationService);
}
