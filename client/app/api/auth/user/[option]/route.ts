import { NextRequest } from 'next/server';

import { getHandler } from '@client-common/routes/auth/user/[option]/route';

import { ROOT_FEATURE } from '@admin/consts/AdminConst';

export async function GET(request: NextRequest, { params }: { params: Promise<{ option: string }> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getHandler(ROOT_FEATURE, request as any, { params } as any);
}
