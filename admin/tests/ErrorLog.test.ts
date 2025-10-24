import CloudWatchLogService, { LogEvent } from '@common/services/aws/CloudWatchLogsService';
import CommonUtil from '@common/utils/CommonUtil';
import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

interface ErrorNotificationDataType extends DataTypeBase {
  rootFeature: string;
  feature: string;
  message: string;
  stack: string;
}

describe.skip('ErrorLog', () => {
  const rootFeature = 'Admin';
  const feature = 'FeatureA';
  const logService = new CloudWatchLogService(`/nagiyu/${rootFeature}/test`, feature);

  it('entry', async () => {
    const error = new Error('Test error');

    const errorData: ErrorNotificationDataType = {
      id: CommonUtil.generateUUID(),
      rootFeature: rootFeature,
      feature: feature,
      message: error.message,
      stack: error.stack || '',
      create: Date.now(),
      update: Date.now(),
    };

    await logService.createLogStream();

    const events: LogEvent[] = [
      {
        message: JSON.stringify(errorData),
        timestamp: Date.now(),
      }
    ];

    await logService.putLogEvents(events);
  });
});
