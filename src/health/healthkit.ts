import { Platform } from 'react-native';
import { ImportedBodyRecord, mergeBodySamples } from './bodySamples';

type HealthKitModule = typeof import('@kingstinct/react-native-healthkit');

// Expo Go にはこのネイティブモジュールが入っていないので、require が失敗したら null にして機能を無効化する
function loadHealthKit(): HealthKitModule | null {
  if (Platform.OS !== 'ios') return null;
  try {
    return require('@kingstinct/react-native-healthkit') as HealthKitModule;
  } catch {
    return null;
  }
}

const healthKit = loadHealthKit();

export const healthKitSupported = Platform.OS === 'ios' && healthKit !== null;

export async function requestBodyPermissions(): Promise<boolean> {
  if (!healthKitSupported || !healthKit) return false;
  if (!healthKit.isHealthDataAvailable()) return false;
  return healthKit.requestAuthorization({
    toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKQuantityTypeIdentifierBodyFatPercentage'],
  });
}

export async function fetchBodyRecords(days = 90): Promise<ImportedBodyRecord[]> {
  if (!healthKitSupported || !healthKit) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [weights, fats] = await Promise.all([
    healthKit.queryQuantitySamples('HKQuantityTypeIdentifierBodyMass', { ascending: true, filter: { date: { startDate } }, limit: 0, unit: 'kg' }),
    healthKit.queryQuantitySamples('HKQuantityTypeIdentifierBodyFatPercentage', { ascending: true, filter: { date: { startDate } }, limit: 0, unit: '%' }),
  ]);
  return mergeBodySamples([...weights], [...fats]);
}
