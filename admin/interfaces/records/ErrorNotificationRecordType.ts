import { RecordTypeBase } from '@common/interfaces/record/RecordTypeBase';

export interface ErrorNotificationRecordType extends RecordTypeBase {
  DataType: 'ErrorNotification';
  RootFeature: string;
  Feature: string;
  Message: string;
  Stack: string;
  AnalyzeResult?: string;
}
