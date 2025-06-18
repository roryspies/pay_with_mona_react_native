import { useCallback, useState } from 'react';
import { FirebaseSSE, type SSEEvent } from '../services/FirebaseSSEStream';
interface InitializePaymentProps {
  transactionId: string;
  onPaymentUpdate: (event: SSEEvent) => void;
  onTransactionUpdate: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
}

export const useInitializePayment = ({
  transactionId,
  onPaymentUpdate,
  onTransactionUpdate,
  onError,
}: InitializePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const initializeEvent = useCallback(async () => {
    if (!transactionId) return;
    setLoading(true);
    try {

      await FirebaseSSE.listenToPaymentEvents(transactionId, {
        onData: (event) => {
          onPaymentUpdate(event);
        },
        onError: (error) => {
          console.error('🔥 SSE Error:', error);
          onError?.(error as Error);
          setValidationError('An error occur, Try again');
        },
      });
      await FirebaseSSE.listenToTransactionEvents(transactionId, {
        onData: (event) => {
          onTransactionUpdate(event);
        },
        onError: (error) => {
          console.error('🔥 SSE Error:', error);
          onError?.(error as Error);
          setValidationError('An error occur, Try again');
        },
      });
    } catch (error) {
      console.log('Unable to listen to event', error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  return {
    initializeEvent,
    loading,
    validationError,
  };
};
