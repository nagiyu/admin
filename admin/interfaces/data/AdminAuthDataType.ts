import { AuthDataType } from '@common/interfaces/data/AuthDataType';
import { UserType } from '@common/enums/UserType';

export interface AdminAuthDataType extends AuthDataType {
  admin: UserType;
}
