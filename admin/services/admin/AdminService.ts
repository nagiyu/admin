import CRUDServiceBase from '@common/services/CRUDServiceBase';

import { AdminDataAccessor } from '@admin/services/admin/AdminDataAccessor';
import { AdminDataType } from '@admin/interfaces/data/AdminDataType';
import { AdminRecordType } from '@admin/interfaces/records/AdminRecordType';

export class AdminService extends CRUDServiceBase<AdminDataType, AdminRecordType> {
  constructor(dataAccessor?: AdminDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new AdminDataAccessor();
    }

    // 手動の書き換えの可能性があるため、キャッシュは使用しない
    super(dataAccessor, false);
  }

  protected dataToRecord(data: Partial<AdminDataType>): Partial<AdminRecordType> {
    return {
      TerminalIDList: data.terminalIdList || [],
    }
  }

  protected recordToData(record: AdminRecordType): AdminDataType {
    return {
      id: record.ID || '',
      terminalIdList: record.TerminalIDList || [],
      create: record.Create || 0,
      update: record.Update || 0,
    }
  }
}
