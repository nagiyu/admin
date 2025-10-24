import { AdminAuthDataType } from "@admin/interfaces/data/AdminAuthDataType";
import { AdminAuthRecordType } from "@admin/interfaces/records/AdminAuthRecordType";
import { AuthDataAccessor } from "@common/services/auth/AuthDataAccessor.v2";
import { AuthService } from "@common/services/auth/AuthService.v2";

export class AdminAuthService extends AuthService<AdminAuthDataType, AdminAuthRecordType> {
  public constructor(
    dataAccessor?: AuthDataAccessor<AdminAuthRecordType>
  ) {
    if (!dataAccessor) {
      dataAccessor = new AuthDataAccessor<AdminAuthRecordType>();
    }

    super(dataAccessor);
  }

  protected override dataToRecord(data: Partial<AdminAuthDataType>): Partial<AdminAuthRecordType> {
    const baseRecord = super.dataToRecord(data);

    return {
      ...baseRecord,
      Admin: data.admin,
    };
  }

  protected override recordToData(record: AdminAuthRecordType): AdminAuthDataType {
    const baseData = super.recordToData(record);

    return {
      ...baseData,
      admin: record.Admin,
    };
  }
}
