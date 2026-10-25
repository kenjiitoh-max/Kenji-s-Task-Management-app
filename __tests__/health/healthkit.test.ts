type HealthKitApi = typeof import('../../src/health/healthkit');

function loadWith(os: string, healthKitFactory: () => unknown): HealthKitApi {
  let api: HealthKitApi | undefined;
  jest.isolateModules(() => {
    jest.doMock('react-native', () => ({ Platform: { OS: os } }), { virtual: true });
    jest.doMock('@kingstinct/react-native-healthkit', healthKitFactory, { virtual: true });
    api = require('../../src/health/healthkit') as HealthKitApi;
  });
  return api!;
}

describe('healthkit fallback', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('disables HealthKit when the native module cannot load (Expo Go)', async () => {
    const api = loadWith('ios', () => {
      throw new Error('NitroModules not found');
    });
    expect(api.healthKitSupported).toBe(false);
    await expect(api.requestBodyPermissions()).resolves.toBe(false);
    await expect(api.fetchBodyRecords()).resolves.toEqual([]);
  });

  it('disables HealthKit on non-iOS platforms', async () => {
    const factory = jest.fn(() => ({}));
    const api = loadWith('android', factory);
    expect(api.healthKitSupported).toBe(false);
    expect(factory).not.toHaveBeenCalled();
    await expect(api.fetchBodyRecords()).resolves.toEqual([]);
  });

  it('uses the native module when it is available', async () => {
    const requestAuthorization = jest.fn(async () => true);
    const queryQuantitySamples = jest.fn(async (id: string) =>
      id === 'HKQuantityTypeIdentifierBodyMass'
        ? [{ quantity: 70.4, endDate: '2026-10-02T07:00:00' }]
        : [{ quantity: 18.2, endDate: '2026-10-02T07:00:00' }],
    );
    const api = loadWith('ios', () => ({ isHealthDataAvailable: () => true, requestAuthorization, queryQuantitySamples }));
    expect(api.healthKitSupported).toBe(true);
    await expect(api.requestBodyPermissions()).resolves.toBe(true);
    expect(requestAuthorization).toHaveBeenCalledWith({ toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKQuantityTypeIdentifierBodyFatPercentage'] });
    const records = await api.fetchBodyRecords();
    expect(queryQuantitySamples).toHaveBeenCalledTimes(2);
    expect(records).toHaveLength(1);
    expect(records[0].weightKg).toBe(70.4);
  });
});
