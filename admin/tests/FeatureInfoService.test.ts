import { FeatureInfoService } from '@admin/services/featureInfo/FeatureInfoService';

describe('FeatureInfoService', () => {
  describe.skip('Real FeatureInfo Test', () => {
    const featureInfoService = new FeatureInfoService();

    it('Get FeatureInfo', async () => {
      const records = await featureInfoService.get();

      console.log('FeatureInfo List:', records[0].featureInfoList);

      expect(records).toBeDefined();
    });

    it('Get Admin URL', async () => {
      const records = await featureInfoService.get();
      const adminInfo = records[0].featureInfoList.find((info) => info.rootFeature === 'Admin');

      console.log('Admin URL:', adminInfo?.url);

      expect(adminInfo).toBeDefined();
    });
  });
});
