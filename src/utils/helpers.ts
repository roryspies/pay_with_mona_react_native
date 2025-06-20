import forge from 'node-forge';
import React from 'react';
import { Dimensions } from 'react-native';
import ReactNativeCustomTabs, {
  CustomTabsActivityHeightResizeBehavior,
  CustomTabsActivitySideSheetDecorationType,
  CustomTabsActivitySideSheetRoundedCornersPosition,
  CustomTabsShareState,
  SafariViewControllerDismissButtonStyle,
  SheetPresentationControllerDetent,
  ViewControllerModalPresentationStyle,
} from 'react-native-custom-tabs';
import { MMKV } from 'react-native-mmkv';
import type { MerchantSettings } from '../types';
import { PAYMENT_BASE_URL } from './config';
import { PaymentMethod } from './enums';
import { defaultTheme } from './theme';

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

/**
 * Generate a signin URL for in-app browser authentication
 * @param transactionId - Transaction identifier
 * @param sessionId - Session identifier
 * @param paymentMethod - Selected payment method
 * @param bankId - Optional bank identifier
 * @param isAuthenticated
 * @param isCollection
 * @param merchantKey
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
  if (
    isAuthenticated ||
    paymentMethod === PaymentMethod.TRANSFER ||
    paymentMethod === PaymentMethod.CARD
  ) {
    return `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${paymentMethod}&loginScope=${merchantKey}&sessionId=${sessionId}`;
  }
  const redirectUrl = `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${methodParam}&bankId=${bankId || ''}`;
  return `${PAYMENT_BASE_URL}/login?loginScope=${merchantKey}&redirect=${encodeURIComponent(redirectUrl)}&sessionId=${sessionId}&transactionId=${transactionId}`;
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
        showTitle: true,
        partial: {
          initialHeight: Dimensions.get('window').height * 0.9,
          activityHeightResizeBehavior:
            CustomTabsActivityHeightResizeBehavior.fixed,
          activitySideSheetMaximizationEnabled: true,
          activitySideSheetDecorationType:
            CustomTabsActivitySideSheetDecorationType.shadow,
          activitySideSheetRoundedCornersPosition:
            CustomTabsActivitySideSheetRoundedCornersPosition.top,
          cornerRadius: 16,
        },
      },
      safariVCOptions: {
        modalPresentationStyle: ViewControllerModalPresentationStyle.pageSheet,
        dismissButtonStyle: SafariViewControllerDismissButtonStyle.close,
        pageSheet: {
          detents: [SheetPresentationControllerDetent.large],
          preferredCornerRadius: 16,
          prefersGrabberVisible: true,
        },
      },
    });
  } catch (error) {
    console.error(error);
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

  // const cookies = await CookieManager.getAll();

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

export const encryptRequestData = async (data: string) => {
  //TODO!: Create a file for this, or alert the team to send it from server
  const pemPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApXwFU8YtCfLGnE/YcgRK
JcL2G8aDM50f5blhgujFeLTrMxhQCLoO9HWOL9zcr+DyjVLxoNWvF2RAfJCWrMkv
6a3u21W19VkuHCKMsT872QHo2F8U+NmXXwzjIAElYqgUal0/2BHuvG9ko+azvMk2
RLGK5sZyJKK7iYZN0kosPtrHfEdUXm2eRy/9MKlTTqRx3UmdD4jTlvVEKjIzkKfM
to26uGrhBC1rGapeSPUHs0EoGXrzFzAn47Ua94Dg7TxlrwfRk2SfsCe7fQLma+mK
JokqEQibKB1XcWFSa6BoSrqQEdDLLHoASXgW0A3btPsK71v6c7F0E2zNlBV6D9Ka
aQIDAQAB
-----END PUBLIC KEY-----`;
  const key = forge.pki.publicKeyFromPem(pemPublicKey);
  const encryptedBytes = key.encrypt(data, 'RSA-OAEP');
  const hex = forge.util.bytesToHex(encryptedBytes);

  return hex;
};

export const getMerchantColors = (
  merchant?: MerchantSettings
): Partial<typeof defaultTheme> => {
  if (merchant && merchant.colors) {
    const colors = merchant.colors;
    console.log('Mona colors', colors.primaryColour);
    return {
      primary: colors.primaryColour,
      //TODO!: Add other colors here
    };
  }
  return defaultTheme;
};
