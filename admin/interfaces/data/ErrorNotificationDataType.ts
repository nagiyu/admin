import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

export interface ErrorNotificationDataType extends DataTypeBase {
  rootFeature: string;
  feature: string;
  message: string;
  stack: string;
}
