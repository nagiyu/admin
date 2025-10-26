import CRUDServiceBase from '@common/services/CRUDServiceBase';

import { FeatureInfoDataAccessor } from '@admin/services/featureInfo/FeatureInfoDataAccessor';
import { FeatureInfoDataType } from '@admin/interfaces/data/FeatureInfoDataType';
import { FeatureInfoRecordType } from '@admin/interfaces/records/FeatureInfoRecordType';

export class FeatureInfoService extends CRUDServiceBase<FeatureInfoDataType, FeatureInfoRecordType> {
  constructor(dataAccessor?: FeatureInfoDataAccessor) {
    if (!dataAccessor) {
      dataAccessor = new FeatureInfoDataAccessor();
    }

    // 手動の書き換えの可能性があるため、キャッシュは使用しない
    super(dataAccessor, false);
  }

  protected dataToRecord(data: Partial<FeatureInfoDataType>): Partial<FeatureInfoRecordType> {
    return {
      FeatureInfoList: data.featureInfoList || [],
    }
  }

  protected recordToData(record: FeatureInfoRecordType): FeatureInfoDataType {
    return {
      id: record.ID || '',
      featureInfoList: record.FeatureInfoList || [],
      create: record.Create || 0,
      update: record.Update || 0,
    }
  }
}
