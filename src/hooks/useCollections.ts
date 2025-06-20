import { useCallback, useState } from 'react';
import { collectionService } from '../services/CollectionService';
import { usePayWithMonaCollections } from '../provider/PayWithMonaCollectionsContext';
import { generateSessionId } from '../utils/helpers';
import { FirebaseSSE } from '../services/FirebaseSSEStream';
import ReactNativeCustomTabs from 'react-native-custom-tabs';
const useCollections = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { showModal, onHandleAuthUpdate } = usePayWithMonaCollections();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initiate = useCallback(
    async ({ accessRequestId }: { accessRequestId: string }) => {
      try {
        setLoading(true);
        const collection =
          await collectionService.fetchColletionWithId(accessRequestId);
        const sessionId = generateSessionId();

        await FirebaseSSE.listenToAuthnEvents(sessionId, {
          onData: async (event) => {
            ReactNativeCustomTabs.close();
            const token = event.data?.strongAuthToken;

            if (token) {
              await onHandleAuthUpdate(token, sessionId);
            }
          },
          onError: (err) => {
            onError?.(err);
            console.log('🔥 SSE Error:', err);
          },
        });

        const hasKey = await collectionService.initCollection({
          sessionId: sessionId,
        });

        if (!hasKey) return;
        console.log('Has Actually Key here', hasKey, collection);
        showModal(accessRequestId, collection, onSuccess);
      } catch (e) {
        if (e instanceof Error) {
          console.log(e);

          setError(e.message);
          onError?.(Error(e.message));
        } else {
          setError('An error occurred');
          onError?.(e as Error);
        }
      } finally {
        setLoading(false);
      }
    },
    [onHandleAuthUpdate, showModal, onSuccess, onError]
  );
  return { error, loading, initiate };
};

export default useCollections;
