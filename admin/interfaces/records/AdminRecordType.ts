import { RecordTypeBase } from '@common/interfaces/record/RecordTypeBase';

export interface AdminRecordType extends RecordTypeBase {
  DataType: 'Admin';
  TerminalIDList: string[];
}
