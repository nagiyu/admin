import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import { FeatureInfo } from '@admin/interfaces/FeatureInfo';

export interface FeatureInfoDataType extends DataTypeBase {
  featureInfoList: FeatureInfo[];
}
