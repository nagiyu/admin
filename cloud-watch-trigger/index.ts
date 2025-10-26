import { CloudWatchLogsEvent, CloudWatchLogsDecodedData } from 'aws-lambda';
import { promisify } from 'util';
import { gunzip } from 'zlib';

import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import { ErrorLogEntryService } from '@/services/ErrorLogEntryService';
import { ErrorNotificationService } from '@/services/ErrorNotificationService';
import { LogAnalyzerService } from '@/services/LogAnalyzerService';

interface ErrorNotificationDataType extends DataTypeBase {
  rootFeature: string;
  feature: string;
  message: string;
  stack: string;
}

const gunzipAsync = promisify(gunzip);

export const handler = async (event: CloudWatchLogsEvent, context: any) => {
  const errorLogEntry = new ErrorLogEntryService();
  const errorNotification = new ErrorNotificationService();
  const logAnalyzer = new LogAnalyzerService();

  try {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const decompressed = await gunzipAsync(payload);
    const logData: CloudWatchLogsDecodedData = JSON.parse(decompressed.toString('utf8'));

    for (const logEvent of logData.logEvents) {
      const message = logEvent.message;
      const errorData: ErrorNotificationDataType = JSON.parse(message);

      const created = await errorLogEntry.entryError(errorData);

      await errorNotification.notify(created);

      await logAnalyzer.analyzeLog(created);
    }
  } catch (err) {
    console.error('Error processing CloudWatch Logs event:', err);
    throw err;
  }
};
