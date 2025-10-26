import { RecordTypeBase } from '@common/interfaces/record/RecordTypeBase';

import { FeatureInfo } from '@admin/interfaces/FeatureInfo';

export interface FeatureInfoRecordType extends RecordTypeBase {
  DataType: 'FeatureInfo';
  FeatureInfoList: FeatureInfo[];
}
