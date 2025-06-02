import { PAYMENT_BASE_URL } from './config';
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
import type { SavedPaymentOptions } from '../types';
import { PaymentMethod } from './enums';
import React from 'react';

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

  // const url =
  //   'https://pay.development.mona.ng/collections/enrollment?collectionId=$collectionId';

  if (
    isAuthenticated ||
    paymentMethod === PaymentMethod.TRANSFER ||
    paymentMethod === PaymentMethod.CARD
  ) {
    return `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${paymentMethod}&loginScope=${merchantKey}&sessionId=${sessionId}`;
  }
  const redirectUrl = `${PAYMENT_BASE_URL}/${transactionId}?embedding=true&sdk=true&method=${methodParam}&bankId=${bankId || ''}`;

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
        showTitle: true,
        partial: {
          initialHeight: Dimensions.get('window').height * 0.9,
          activityHeightResizeBehavior:
            CustomTabsActivityHeightResizeBehavior.fixed,
          activitySideSheetMaximizationEnabled: true,
          activitySideSheetDecorationType:
            CustomTabsActivitySideSheetDecorationType.shadow,
          activitySideSheetRoundedCornersPosition: CustomTabsActivitySideSheetRoundedCornersPosition.top,
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
