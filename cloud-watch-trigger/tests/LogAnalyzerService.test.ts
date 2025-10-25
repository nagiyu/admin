import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';
import { AdminFeature, ROOT_FEATURE } from '@admin/consts/AdminConst';

import { LogAnalyzerService } from '@/services/LogAnalyzerService';

describe('LogAnalyzerService', () => {
  describe.skip('Real Log Analyze Test', () => {
    const errorNotification = new ErrorNotificationService();
    const logAnalyzer = new LogAnalyzerService();

    it('Analyze Log', async () => {
      const error = new Error('Log Analyze Test Error');

      const data: Partial<ErrorNotificationDataType> = {
        rootFeature: ROOT_FEATURE,
        feature: AdminFeature.CLOUD_WATCH_TRIGGER,
        message: error.message,
        stack: error.stack || '',
      };

      const created = await errorNotification.create(data);

      await logAnalyzer.analyzeLog(created);

      const updated = await errorNotification.getById(created.id);

      console.log('Analyze Result:', updated?.analyzeResult);

      expect(updated).toBeDefined();
      expect(updated?.analyzeResult).toBeDefined();
    }, 30000);
  });
});
