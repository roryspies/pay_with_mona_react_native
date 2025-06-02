/**
 * ⚠️ SECURITY NOTICE - DEMONSTRATION CODE ONLY
 *
 * This implementation is provided for demonstration purposes only.
 * DO NOT use this code directly in production environments.
 *
 * 🔒 SECURITY REQUIREMENTS FOR PRODUCTION:
 *
 * 1. SERVER-SIDE PROCESSING ONLY
 *    - All payment and collection logic must be handled on your secure backend
 *    - Never process sensitive operations on the client-side (browser/mobile app)
 *
 * 2. API KEY PROTECTION
 *    - Secret keys must NEVER be exposed in client-side code
 *    - Store all API credentials securely on your server
 *    - Use proper secret management systems in production
 *
 * 3. RECOMMENDED PRODUCTION ARCHITECTURE
 *    - Client → Your Backend API → Payment Provider API
 */
import { MONA_BASE_URL } from '../config';
import { StorageKeys } from '../config/storage-keys';
import type {
  ScheduledCollectionData,
  SubscriptionCollectionData,
} from '../types/ValidateCollectionData';
import CookieManager from '@react-native-cookies/cookies';
import {
  type CheckoutResponse,
  CollectionType,
  type ValidateCollectionResponse,
} from 'pay-with-mona-react-native';
import { MMKV } from 'react-native-mmkv';

/**
 * Retrieves all collections associated with a specific bank account
 *
 * This endpoint fetches comprehensive collection data for a user's bank account,
 * including both active and inactive collections. Use this to display collection
 * history, manage existing collections, or provide account summaries.
 *
 * @param {string} bankId - The unique identifier for the user's bank account
 *                         This should be the bank ID obtained from Mona SavedBankOptions
 *
 * @returns {Promise<Record<string, any>>} Collection data with the following structure:
 *   - collections: Array of collection objects
 *   - totalCount: Total number of collections found
 *   - activeCount: Number of currently active collections
 *   - bankId: The bank ID that was queried
 *   - lastUpdated: Timestamp of when data was last refreshed
 *   - metadata: Additional account information
 *
 * @throws {Error} Throws error with detailed message if:
 *   - Invalid or non-existent bank ID provided
 *   - User doesn't have permission to access the specified bank account
 *   - Bank account is not properly linked or authorized
 *
 */
export const fetchCollections = async (bankId: string) => {
  try {
    await CookieManager.clearAll();
    const storage = new MMKV();
    const monaKeyId = storage.getString(StorageKeys.keyId) ?? '';
    const secretKey = storage.getString(StorageKeys.secretKey) ?? '';
    console.log({
      'x-api-key': secretKey,
      //This is not suppose to be here, keyId should only be use in the SDK
      //TODO! Alert them on backend
      'x-mona-key-id': monaKeyId,
    });
    console.log(`${MONA_BASE_URL}/collections?bankId=${bankId}`);

    const curl = generateRequestCurl(
      `${MONA_BASE_URL}/collections?bankId=${bankId}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'x-api-key': secretKey,
          'x-mona-key-id': monaKeyId,
        },
      }
    );
    console.log(curl);

    const response = await fetch(
      `${MONA_BASE_URL}/collections?bankId=${bankId}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'x-api-key': secretKey,
          'x-mona-key-id': monaKeyId,
        },
      }
    );
    const data = response.json();
    if (response.ok) {
      return data;
    }
    console.log(response.status);

    throw new Error('Unable to fetch collections!!!');
  } catch (error) {
    console.log('Fetch Error:', error);
    throw new Error('Unable to fetch collections');
  }
};

/**
 * Initiates collection processing based on timing criteria
 *
 * This endpoint triggers the execution of validated collections that match
 * the specified time factor. It processes all eligible collections that are
 * due for execution at the given time period.
 *
 * @param {string} timeFactor - The timing criteria for triggering collections
 *                              ("daily", "weekly", "monthly")
 *
 * @returns {Promise<Record<string, any>>} Collection processing results with dynamic response structure:
 *   - processedCount: Number of collections successfully processed
 *   - failedCount: Number of collections that failed
 *   - results: Array of individual collection results
 *   - timestamp: When the trigger was executed
 *   - timeFactor: The time factor that was used
 *
 * @throws {Error} Throws error with detailed message if:
 *   - Invalid time factor format
 *   - No collections found for the specified time factor
 *   - System processing failure
 *   - Network or database connectivity issues
 *
 */
export const triggerCollections = async ({
  timeFactor,
}: {
  timeFactor: number;
}) => {
  await CookieManager.clearAll();
  const storage = new MMKV();
  const monaKeyId = storage.getString(StorageKeys.keyId) ?? '';
  const secretKey = storage.getString(StorageKeys.secretKey) ?? '';

  try {
    const response = await fetch(`${MONA_BASE_URL}/collections/trigger`, {
      method: 'PUT',
      headers: {
        'x-api-key': secretKey,
        //This is not suppose to be here, keyId should only be use in the SDK
        //TODO! Alert them on backend
        'x-mona-key-id': monaKeyId,
      },
      body: JSON.stringify({ timeFactor }),
    });
    const data = response.json();
    if (response.ok) {
      return data;
    }
    throw new Error('Unable to trigger collections');
  } catch (error) {
    throw new Error('Unable to trigger collections');
  }
};

/**
 * Validates collection configuration before processing
 *
 * This endpoint verifies that all collection parameters are properly configured
 * and must be called before initiating any collection process. It ensures data
 * integrity and prevents processing errors downstream.
 *
 * @param {number} maximumAmount - The maximum amount that can be collected
 * @param {Date} expiryDate - When the collection authorization expires
 * @param {Date} startDate - The date when collection should begin
 * @param {number} monthlyLimit - Maximum amount that can be collected per month
 * @param {string} reference - Unique transaction reference identifier
 * @param {string} type - Collection method: "Scheduled" for fixed dates or "Subscription" for recurring intervals
 * @param {string} frequency - How often collections occur (required for Subscription type only)
 * @param {number} amount - The amount to be collected per transaction
 * @param {string} debitType - Source of debit authorization: "Merchant" or "Mona"
 * @param {Array} scheduleEntries - Specific collection dates (required when type is "Scheduled")
 *
 * @returns {Promise<Object>} Resolves with validation response and collection data
 * @throws {Error} Throws validation error with detailed message if any parameter is invalid
 *
 */
export const validateCollections = async ({
  maximumAmount,
  expiryDate,
  startDate,
  monthlyLimit,
  reference,
  type,
  frequency,
  amount,
  debitType,
  scheduleEntries,
}: SubscriptionCollectionData &
  ScheduledCollectionData): Promise<ValidateCollectionResponse> => {
  console.log(monthlyLimit);
  const storage = new MMKV();
  const secretKey = storage.getString(StorageKeys.secretKey) ?? '';

  try {
    const payload = {
      maximumAmount: (Number(maximumAmount) * 100).toString(),
      expiryDate,
      startDate,
      reference,
      debitType,
      schedule: {
        type,
        frequency,
        ...(amount && { amount: (Number(amount) * 100).toString() }),
        entries: type === CollectionType.SCHEDULED ? scheduleEntries : [],
      },
    };
    console.log(payload);

    const response = await fetch(`${MONA_BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': secretKey,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    console.log(data);
    throw new Error(data.message ?? 'Unable to validate collections');
  } catch (error) {
    console.log('Error', error);
    throw new Error('Unable to validate collections');
  }
};

export const initiatePayment = async ({
  amount,
  phoneNumber,
  firstName,
  lastName,
  middleName,
  dob,
  bvn,
  successRate,
  merchantKey,
}: {
  amount: number;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dob?: string;
  bvn?: string;
  successRate: string;
  merchantKey: string;
}): Promise<CheckoutResponse> => {
  try {
    await CookieManager.clearAll();
    const fullName = `${firstName ? firstName : ''}${
      middleName ? ' ' + middleName : ''
    }${lastName ? ' ' + lastName : ''}`;
    if (dob && (!fullName || fullName === '')) {
      throw Error(
        'First Name and Last Name must not be null when DOB is provided.'
      );
    }

    if (fullName !== '' && !dob) {
      throw Error(
        'DOB must not be null when First Name and Last Name is provided.'
      );
    }
    const storage = new MMKV();
    const keyID = storage.getString(StorageKeys.keyId);
    const secretKey = storage.getString(StorageKeys.secretKey) ?? '';

    //CheckoutResponse
    const payload = {
      amount,
      successRateType: successRate,
      ...(phoneNumber && { phone: phoneNumber }),
      ...(bvn && { bvn }),
      ...(dob && { dob }),
      ...(fullName &&
        fullName !== '' && {
          name: fullName,
        }),
    };

    const response = await fetch(
      `${MONA_BASE_URL}/demo/checkout`,

      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': secretKey,
          ...(keyID && { 'x-mona-key-id': keyID }),
          'x-public-key': merchantKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return data as CheckoutResponse;
    }
    throw new Error('Failed to initiate payment. Please try again later.');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to initiate payment. Please try again later.');
  }
};

export const generateRequestCurl = (
  url: string,
  options: RequestInit
): string => {
  const method = options.method || 'GET';

  let curl = [`curl -X ${method} "${url}"`];

  // Headers
  const headers = options.headers;
  for (const [key, value] of Object.entries(headers ?? {})) {
    curl.push(`-H "${key}: ${value}"`);
  }

  // Body
  if (options.body) {
    const isJson =
      headers !== undefined
        ? (headers as Record<string, any>)['Content-Type']?.includes(
            'application/json'
          )
        : false;
    const body = isJson
      ? JSON.stringify(JSON.parse(options.body as string), null, 2) // beautify JSON
      : options.body;
    curl.push(`--data-raw '${body}'`);
  }

  return curl.join(' \\\n  ');
};
