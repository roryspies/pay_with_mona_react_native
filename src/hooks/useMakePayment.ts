import { useCallback, useState } from 'react';
import { FirebaseSSE } from '../services/FirebaseSSEStream';
import { paymentServices } from '../services/PaymentService';
import { buildSdkUrl, generateSessionId, launchSdkUrl } from '../utils/helpers';
import { TaskType, type PinEntryTask } from '../types';
import { PaymentMethod } from '../utils/enums';
import { MMKV } from 'react-native-mmkv';
import ReactNativeCustomTabs from 'react-native-custom-tabs';

const useMakePayment = ({
  amount,
  bankId,
  transactionId,
  paymentMethod,
  handleAuthEventUpdate,
  handleCloseEventUpdate,
  onEntryTaskUpdate,
  merchantKey,
}: {
  amount: number;
  bankId?: string | null;
  transactionId: string;
  paymentMethod?: PaymentMethod | null;
  merchantKey: string;
  onEntryTaskUpdate?: (entryTask: PinEntryTask | null) => void;
  handleCloseEventUpdate?: () => void;
  handleAuthEventUpdate?: (strongAuthToken: string, sessionId: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const handlePayment = useCallback(
    async ({
      isOneTap,
      onInitialize,
      payload,
    }: {
      isOneTap?: boolean;
      onInitialize?: () => void;
      payload?: Record<string, string>;
    }) => {
      try {
        if (amount / 100 < 20) {
          throw new Error('Transaction amount cannot be less than ₦20');
        }
        setLoading(true);
        onInitialize?.();
        const sessionId = generateSessionId();

        try {
          await FirebaseSSE.listenToCloseTabEvents(transactionId, {
            onData: async (event) => {
              if (event.data.success) {
                ReactNativeCustomTabs.close();
                handleCloseEventUpdate?.();
              }
            },
            onError: (error) => {
              console.log('🔥 SSE Error:', error);
            },
          });
          await FirebaseSSE.listenToAuthnEvents(sessionId, {
            onData: async (event) => {
              if (
                event.data.strongAuthToken &&
                event.data.strongAuthToken !== null
              ) {
                ReactNativeCustomTabs.close();
                handleAuthEventUpdate?.(event.data.strongAuthToken, sessionId);
              }
            },
            onError: (error) => {
              console.log('🔥 SSE Error:', error);
            },
          });
        } catch (e) {
          console.log('Unable to listen to authn event');
        }

        if (isOneTap) {
          //Instead of handler method, depend on the async/await response
          await paymentServices.makePaymentRequest({
            amount: amount,
            bankId: bankId ?? '',
            transactionId: transactionId,
            paymentMethod: paymentMethod ?? undefined,
            signedRequest: false,
            sessionId: sessionId,
            extraPayload: {
              ...payload,
            },
            onTaskUpdate: (task) => {
              console.log('🔑 Task:', task);
              if (
                [
                  TaskType.ENTRY,
                  TaskType.PIN,
                  TaskType.OTP,
                  TaskType.PHONE,
                ].includes(task.fieldType)
              ) {
                onEntryTaskUpdate?.(task);
              }
            },
          });
        } else {
          const storage = new MMKV();
          const monaCheckoutID = storage.getString('monaCheckoutID') ?? '';
          const url = buildSdkUrl({
            transactionId,
            sessionId,
            paymentMethod,
            bankId,
            isAuthenticated: monaCheckoutID !== '',
            merchantKey,
          });

          launchSdkUrl(url);
        }
        setLoading(false);
      } catch (error) {
        console.log(`Unable to make payment`, error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactionId, paymentMethod, bankId]
  );

  return {
    loading,
    handlePayment,
  };
};

export default useMakePayment;
