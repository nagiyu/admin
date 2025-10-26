import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';

export class AdminUtil {
  public static getAuthTableName(): string {
    switch (EnvironmentalUtil.GetProcessEnv()) {
      case 'local':
      case 'development':
        return 'DevAdmin';
      case 'production':
        return 'Admin';
      default:
        return 'DevAdmin';
    }
  }
}
