import { CloudWatchLogsEvent, CloudWatchLogsDecodedData } from 'aws-lambda';

import { promisify } from 'util';
import { gunzip } from 'zlib';

import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import { ErrorLogEntryService } from '@/services/ErrorLogEntryService';
interface ErrorNotificationDataType extends DataTypeBase {
  rootFeature: string;
  feature: string;
  message: string;
  stack: string;
}

const gunzipAsync = promisify(gunzip);

export const handler = async (event: CloudWatchLogsEvent, context: any) => {
  const service = new ErrorLogEntryService();

  try {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const decompressed = await gunzipAsync(payload);
    const logData: CloudWatchLogsDecodedData = JSON.parse(decompressed.toString('utf8'));

    for (const logEvent of logData.logEvents) {
      const message = logEvent.message;

      try {
        const errorData: ErrorNotificationDataType = JSON.parse(message);

        await service.entryError(errorData);

        console.log('Logged error data:', errorData);
      } catch (err) {
        console.error('Error parsing log event message:', err);
      }
    }
  } catch (err) {
    console.error('Error decoding log event:', err);
    throw err;
  }
};
