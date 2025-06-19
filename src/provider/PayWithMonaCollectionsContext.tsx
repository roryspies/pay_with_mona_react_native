import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useValidatePII } from '../hooks/useValidatePII';
import CollectionAccountSelectionDialog from '../modals/CollectionAccoutSelectionDialog';
import CollectionConfirmationDialog from '../modals/CollectionConfirmationDialog';
import CollectionSuccessDialog from '../modals/CollectionSuccessDialog';
import KeyExchangeConfirmationModal from '../modals/KeyExchangeConfirmationModal';
import MonaModal from '../modals/MonaModal';
import ProgressModal from '../modals/ProgressModal';
import { collectionService } from '../services/CollectionService';
import { monaService } from '../services/MonaService';
import {
  type BankOptions,
  type CollectionResponse,
  type PayWithMonaCollectionsContextType,
} from '../types';
import { handleSetState } from '../utils/helpers';

const PayMonaCollectionsContext =
  createContext<PayWithMonaCollectionsContextType | null>(null);

// Make sure to define the ModalState enum as a string enum, if not the !!modalState check will fail for 0 values
enum ModalState {
  collectionConfirmation = 'collectionConfirmation',
  collectionAccountSelection = 'collectionAccountSelection',
  keyExchangeConfirmation = 'keyExchangeConfirmation',
  collectionSuccess = 'collectionSuccess',
  loading = 'loading',
}

// type Collection = CollectionResponse & {
//   merchantName: string;
//   type: CollectionType;
// };

type CollectionState = {
  deviceAuth: any | null;
  sessionId: string | null;
  bank: BankOptions | null;
  collectionResponse: CollectionResponse | null;
};

export const PayWithMonaCollectionsProvider = ({
  children,
  merchantKey,
}: {
  children: React.ReactNode;
  merchantKey: string;
}) => {
  const [requestId, setRequestId] = useState<string>('');
  const onSuccessRef = useRef<(() => void) | null>(null);
  const onErrorRef = useRef<((error: Error) => void) | null>(null);
  const [modalState, setModalState] = useState<ModalState>();
  const [_, setMainLoading] = useState<boolean>(false);
  const [collectionState, setCollectionState] = useState<CollectionState>({
    deviceAuth: null,
    sessionId: null,
    bank: null,
    collectionResponse: null,
  });

  const startLoading = useCallback(
    () => setModalState(ModalState.loading),
    []
  );
  const startMainLoading = useCallback(
    () => setMainLoading(true),
    []
  );
  const stopLoading = useCallback(
    () => setModalState((prev) => (prev === ModalState.loading ? undefined : prev)),
    []
  );
  const stopMainLoading = useCallback(
    () => setMainLoading(false),
    []
  );

  const {
    loading: validatePIILoading,
    validate: validatePII,
    validationData,
  } = useValidatePII();

  const showModal = useCallback(
    (
      propsRequestId: string,
      collection: CollectionResponse,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      onSuccessRef.current = onSuccess || null;
      onErrorRef.current = onError || null;
      setRequestId(propsRequestId);
      handleSetState(setCollectionState, { collectionResponse: collection });
      validatePII();
      setTimeout(() => {
        setModalState(ModalState.collectionConfirmation);
      }, 200);
    },
    [validatePII]
  );
  const hideModal = useCallback(
    () => setModalState(undefined),
    []
  );

  const handleAuthEventUpdate = useCallback(
    async (strongAuthToken: string, mainSessionId: string) => {
      startMainLoading();
      try {
        const response = await monaService.loginWithStrongAuth(
          strongAuthToken,
          null
        );
        setModalState(ModalState.keyExchangeConfirmation);
        handleSetState(setCollectionState, {
          sessionId: mainSessionId,
          deviceAuth: response.deviceAuth,
        });
      } catch (error) {
        console.log('🔥 SSE Error:', error);
        onErrorRef.current?.(error as Error);
      } finally {
        stopMainLoading();
      }
    },
    []
  );

  const signAndCommitKeys = useCallback(async () => {
    try {
      startLoading();
      await monaService.signAndCommitKeys({
        deviceAuth: collectionState.deviceAuth,
        message: 'Authorize Collection',
      });
      await validatePII();
      setModalState(ModalState.collectionAccountSelection);
    } catch (error) {
      console.log('🔥 SSE Error:', error);
      onErrorRef.current?.(error as Error);
    } finally {
      stopLoading();
    }
  }, [collectionState.deviceAuth, validatePII]);

  const createCollectionConsentRequest = useCallback(
    async (value: BankOptions) => {
      if (validationData && Array.isArray(validationData.bank)) {
        const bank = validationData.bank.find(
          (data) => data.bankId === value.bankId
        );

        handleSetState(setCollectionState, { bank: bank });
      }
      startLoading();

      try {
        await collectionService.createCollectionConsentRequest({
          bankId: value.bankId,
          accessRequestId: requestId,
        });
        setModalState(ModalState.collectionSuccess);
      } catch (e) {
        console.log('Create collection error', e);
        onErrorRef.current?.(e as Error);
      } finally {
        stopLoading();
      }
    },
    [requestId, validationData]
  );

  useEffect(() => {
    collectionService.initialize(merchantKey);
    monaService.initialize(merchantKey);
  }, [merchantKey]);

  return (
    <PayMonaCollectionsContext.Provider
      value={{
        showModal,
        hideModal,
        onHandleAuthUpdate: handleAuthEventUpdate,
      }}
    >
      {children}

      <MonaModal
        visible={!!modalState}
        onClose={() => setModalState(undefined)}
      >
        {collectionState.collectionResponse && modalState === ModalState.collectionConfirmation && (
          <CollectionConfirmationDialog
            loading={false}
            collection={collectionState.collectionResponse}
            onSubmit={() => setModalState(ModalState.collectionAccountSelection)}
          />
        )}

        {
          modalState === ModalState.collectionAccountSelection && (
            <CollectionAccountSelectionDialog
              loading={validatePIILoading}
              savedPaymentOptions={validationData}
              accessRequestId={requestId}
              onSubmit={createCollectionConsentRequest}
            />
          )
        }

        {
          modalState === ModalState.keyExchangeConfirmation && (
            <KeyExchangeConfirmationModal
              onSubmit={signAndCommitKeys}
            />
          )
        }

        {
          collectionState.collectionResponse && collectionState?.bank && modalState === ModalState.collectionSuccess && (
            <CollectionSuccessDialog
              loading={false}
              bank={collectionState?.bank}
              collection={collectionState.collectionResponse}
              onSubmit={() => {
                setModalState(undefined);
                onSuccessRef.current?.();
              }}
            />
          )
        }

        {modalState === ModalState.loading && (
          <ProgressModal />
        )}
      </MonaModal>
    </PayMonaCollectionsContext.Provider>
  );
};

export const usePayWithMonaCollections = () => {
  const context = useContext(PayMonaCollectionsContext);
  if (!context) {
    throw new Error(
      'usePayWithMonaCollections must be used within a PayWithMonaCollectionsProvider'
    );
  }
  return context;
};
