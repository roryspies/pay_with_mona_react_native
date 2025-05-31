import { useCallback, useState } from 'react';
import { collectionService } from '../services/CollectionService';
import { usePayWithMonaCollections } from '../PayWithMonaCollectionsProvider';
import { generateSessionId } from '../utils/helpers';
import { ApiError } from '../services/ApiService';
import { FirebaseSSE } from '../services/FirebaseSSEStream';
import ReactNativeCustomTabs from 'react-native-custom-tabs';

const useCollections = ({ onDone }: { onDone?: () => void }) => {
  const { showModal, onHandleAuthUpdate } = usePayWithMonaCollections();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initiate = useCallback(
    async ({ accessRequestId }: { accessRequestId: string }) => {
      try {
        setLoading(true);
        const sessionId = generateSessionId();

        await FirebaseSSE.listenToAuthnEvents(sessionId, {
          onData: async (event) => {
            ReactNativeCustomTabs.close();
            const token = event.data?.strongAuthToken;

            if (token) {
              await onHandleAuthUpdate(token, sessionId);
            }
          },
          onError: (err) => console.log('🔥 SSE Error:', err),
        });

        const hasKey = await collectionService.initCollection({
          sessionId: sessionId,
        });

        if (!hasKey) return;
        showModal(accessRequestId, onDone);
      } catch (e) {
        if (e instanceof ApiError) {
          setError(e.message);
        } else {
          setError('An error occur');
        }
      } finally {
        setLoading(false);
      }
    },
    [onHandleAuthUpdate, showModal, onDone]
  );
  return { error, loading, initiate };
};

export default useCollections;
