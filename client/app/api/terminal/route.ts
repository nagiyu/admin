import { getHandler } from '@client-common/routes/terminal/route';

import { ROOT_FEATURE } from '@admin/consts/AdminConst';

export async function GET() {
  return getHandler(ROOT_FEATURE);
}
