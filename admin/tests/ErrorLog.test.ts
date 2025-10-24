import ErrorUtil from '@common/utils/ErrorUtil';

describe.skip('ErrorLog', () => {
  const rootFeature = 'Admin';
  const feature = 'FeatureA';

  it('entry', async () => {
    await ErrorUtil.logError(rootFeature, feature, new Error('Test Error'));
  });
});
