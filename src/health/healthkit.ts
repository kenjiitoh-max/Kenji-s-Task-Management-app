import { isHealthDataAvailable, queryQuantitySamples, requestAuthorization } from '@kingstinct/react-native-healthkit';
import { Platform } from 'react-native';
import { ImportedBodyRecord, mergeBodySamples } from './bodySamples';

export const healthKitSupported = Platform.OS === 'ios';

export async function requestBodyPermissions(): Promise<boolean> {
  if (!healthKitSupported) return false;
  if (!isHealthDataAvailable()) return false;
  return requestAuthorization({
    toRead: ['HKQuantityTypeIdentifierBodyMass', 'HKQuantityTypeIdentifierBodyFatPercentage'],
  });
}

export async function fetchBodyRecords(days = 90): Promise<ImportedBodyRecord[]> {
  if (!healthKitSupported) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [weights, fats] = await Promise.all([
    queryQuantitySamples('HKQuantityTypeIdentifierBodyMass', { ascending: true, filter: { date: { startDate } }, limit: 0, unit: 'kg' }),
    queryQuantitySamples('HKQuantityTypeIdentifierBodyFatPercentage', { ascending: true, filter: { date: { startDate } }, limit: 0, unit: '%' }),
  ]);
  return mergeBodySamples([...weights], [...fats]);
}
