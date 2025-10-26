import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';

import { LogAnalyzerService } from '@/services/LogAnalyzerService';

describe('LogAnalyzerService', () => {
  describe.skip('Real Log Analyze Test', () => {
    const errorNotification = new ErrorNotificationService();
    const logAnalyzer = new LogAnalyzerService();

    it('Analyze Log', async () => {
      const records = await errorNotification.get();

      await logAnalyzer.analyzeLog(records[0]);

      const updated = await errorNotification.getById(records[0].id);

      console.log('Analyze Result:', updated?.analyzeResult);

      expect(updated).toBeDefined();
      expect(updated?.analyzeResult).toBeDefined();
    }, 90000);
  });
});
