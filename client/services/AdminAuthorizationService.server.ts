import { AuthorizationServiceBase } from '@common/services/authorization/AuthorizationServiceBase';
import { BadRequestError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';
import { UserType } from '@common/enums/UserType';

import SessionUtil from '@client-common/utils/SessionUtil.server';

import { AdminAuthService } from '@admin/services/AdminAuthService';
import { AdminFeature } from '@admin/consts/AdminConst';
import { AdminAuthDataType } from '@admin/interfaces/data/AdminAuthDataType';

const AdminPermissionMatrix: PermissionMatrix<AdminFeature> = {
  [AdminFeature.HOME]: {
    [UserType.GUEST]: PermissionLevel.NONE,
    [UserType.AUTHENTICATED]: PermissionLevel.NONE,
    [UserType.PREMIUM]: PermissionLevel.NONE,
    [UserType.ADMIN]: PermissionLevel.ADMIN,
  },
  [AdminFeature.ERROR_NOTIFICATION]: {
    [UserType.GUEST]: PermissionLevel.NONE,
    [UserType.AUTHENTICATED]: PermissionLevel.NONE,
    [UserType.PREMIUM]: PermissionLevel.NONE,
    [UserType.ADMIN]: PermissionLevel.ADMIN,
  }
}

const adminAuthService = new AdminAuthService();

export class AdminAuthorizationService extends AuthorizationServiceBase<AdminFeature> {
  public override validate(feature: AdminFeature, level: PermissionLevel): void {
    super.validate(feature, level);

    if (!feature || !Object.values(AdminFeature).includes(feature as AdminFeature)) {
      throw new BadRequestError('Invalid feature');
    }
  }

  protected async getPermissionMatrix(): Promise<PermissionMatrix<AdminFeature>> {
    return AdminPermissionMatrix;
  }

  protected async getUserType(): Promise<UserType> {
    const user = await this.getUser();

    if (!user) {
      return UserType.GUEST;
    }

    return user.admin;
  }

  protected async getUserId(): Promise<string | undefined> {
    const user = await this.getUser();

    if (!user) {
      return undefined;
    }

    return user.id;
  }

  protected async getUser(): Promise<AdminAuthDataType | null> {
    const session = await SessionUtil.getSession();

    if (!session) {
      return null;
    }

    const googleUserId = await SessionUtil.getGoogleUserIdFromSession(session);

    if (!googleUserId) {
      return null;
    }

    return await adminAuthService.getByGoogleUserId(googleUserId);
  }
}
