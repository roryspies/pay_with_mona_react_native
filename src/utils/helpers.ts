import { PAYMENT_BASE_URL } from './config';
import { Dimensions } from 'react-native';
import ReactNativeCustomTabs, {
  CustomTabsActivityHeightResizeBehavior,
  CustomTabsShareState,
  SheetPresentationControllerDetent,
  ViewControllerModalPresentationStyle,
} from 'react-native-custom-tabs';
import { MMKV } from 'react-native-mmkv';
import type { SavedPaymentOptions } from '../types';
import dayjs from 'dayjs';
import { PaymentMethod } from './enums';

export const generateSessionId = (length = 10): string => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

export function handleSetState<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  update: Partial<T>
) {
  setState((prev) => ({ ...prev, ...update }));
}

// const getPaymentUrl = (
//   transactionId: string,
//   sessionId: string,
//   paymentMethod?: string
// ): string => {
//   const storage = new MMKV();
//   const monaCheckoutID = storage.getString('monaCheckoutID');

//   const redirectUrl = `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${paymentMethod}`;

//   if (monaCheckoutID && monaCheckoutID !== undefined) {
//     return redirectUrl;
//   }
//   console.log(sessionId);

//   return `${PAYMENT_BASE_URL}/login?loginScope=
//         67e41f884126830aded0b43c&redirect=${encodeURIComponent(
//           redirectUrl
//         )}&sessionId=${sessionId}&transactionId=${transactionId}`;
// };

/**
 * Generate a signin URL for in-app browser authentication
 * @param transactionId - Transaction identifier
 * @param sessionId - Session identifier
 * @param paymentMethod - Selected payment method
 * @param bankId - Optional bank identifier
 * @returns Fully formed URL
 */
export const buildSdkUrl = ({
  sessionId,
  transactionId,
  paymentMethod,
  bankId,
  isAuthenticated = false,
  isCollection = false,
  merchantKey,
}: {
  sessionId: string;
  transactionId?: string;
  paymentMethod?: string | null;
  bankId?: string | null;
  isAuthenticated?: boolean | null;
  isCollection?: boolean | null;
  merchantKey: string;
}): string => {
  const isBank = paymentMethod === PaymentMethod.SAVEDBANK;
  const methodParam = isBank ? 'bank' : 'card';

  if (isCollection) {
    return `${PAYMENT_BASE_URL}/collections?loginScope=${merchantKey}&sessionId=${sessionId}`;
  }
  const redirectUrl = `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${methodParam}&bankId=${bankId || ''}`;

  if (
    isAuthenticated ||
    paymentMethod === PaymentMethod.TRANSFER ||
    paymentMethod === PaymentMethod.CARD
  ) {
    console.log(
      `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${paymentMethod}&loginScope=${merchantKey}&sessionId=${sessionId}`
    );

    return `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${paymentMethod}&loginScope=${merchantKey}&sessionId=${sessionId}`;
  }
  console.log(
    `${PAYMENT_BASE_URL}/login?loginScope=${merchantKey}&redirect=${encodeURIComponent(redirectUrl)}&sessionId=${sessionId}`
  );

  return `${PAYMENT_BASE_URL}/login?loginScope=${merchantKey}&redirect=${encodeURIComponent(redirectUrl)}&sessionId=${sessionId}`;
};

export const isAuthenticated = (): boolean => {
  const storage = new MMKV();
  const monaCheckoutID = storage.getString('monaCheckoutID');
  const keyID = storage.getString('keyID');

  return monaCheckoutID !== undefined && keyID !== undefined;
};

export const signOut = () => {
  const storage = new MMKV();
  storage.delete('monaCheckoutID');
  storage.delete('keyID');
};

export const launchSdkUrl = async (url: string): Promise<void> => {
  try {
    await ReactNativeCustomTabs.launch(url, {
      customTabsOptions: {
        shareState: CustomTabsShareState.off,
        partial: {
          initialHeight: Dimensions.get('window').height * 0.97,
          activityHeightResizeBehavior:
            CustomTabsActivityHeightResizeBehavior.fixed,
        },
      },
      safariVCOptions: {
        modalPresentationStyle: ViewControllerModalPresentationStyle.pageSheet,
        pageSheet: {
          detents: [SheetPresentationControllerDetent.large],
          preferredCornerRadius: 16,
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export function parseToISOString(input: string | Date): string | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input.toISOString();
  }
  const parsed = dayjs(input);
  if (!parsed.isValid()) {
    console.log('[parseToISOString] Invalid date input:', input);
    return null;
  }
  return parsed.toISOString();
}

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

let monaSdkState: {
  savedPaymentOptions?: SavedPaymentOptions | null;
} = {};

export const setMonaSdkState = (data: {
  savedPaymentOptions?: SavedPaymentOptions | null;
}) => {
  monaSdkState = { ...monaSdkState, ...data };
};

export const getMonaSdkState = () => {
  return monaSdkState;
};

export const clearMonaSdkState = () => {
  monaSdkState = {};
};
