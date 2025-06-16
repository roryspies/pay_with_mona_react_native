import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { collectionService } from '../services/CollectionService';
import { monaService } from '../services/MonaService';
import KeyExchangeConfirmationModal from '../modals/KeyExchangeConfirmationModal';
import CollectionAccountSelectionDialog from '../modals/CollectionAccoutSelectionDialog';
import {
  type BankOptions,
  type CollectionResponse,
  type ModalType,
  type PayWithMonaCollectionsContextType,
} from '../types';
import { handleSetState } from '../utils/helpers';
import { useValidatePII } from '../hooks/useValidatePII';
import CollectionConfirmationDialog from '../modals/CollectionConfirmationDialog';
import CollectionSuccessDialog from '../modals/CollectionSuccessDialog';

const PayMonaCollectionsContext =
  createContext<PayWithMonaCollectionsContextType | null>(null);

type LoadingState = {
  main: boolean;
  collectionConsent: boolean;
  keyExchange: boolean;
};

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
  const keyExchangeModalRef = useRef<ModalType>(null);
  const collectionAccountModalRef = useRef<ModalType>(null);
  const collectionConfirmationRef = useRef<ModalType>(null);
  const collectionSuccessRef = useRef<ModalType>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: false,
    collectionConsent: false,
    keyExchange: false,
  });
  const [collectionState, setCollectionState] = useState<CollectionState>({
    deviceAuth: null,
    sessionId: null,
    bank: null,
    collectionResponse: null,
  });
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
      setTimeout(() => collectionConfirmationRef.current?.open(), 200);
    },
    [validatePII]
  );
  const hideModal = useCallback(
    () => collectionAccountModalRef?.current?.close(),
    []
  );

  const handleAuthEventUpdate = useCallback(
    async (strongAuthToken: string, mainSessionId: string) => {
      handleSetState(setLoadingState, { main: true });
      try {
        const response = await monaService.loginWithStrongAuth(
          strongAuthToken,
          null
        );
        keyExchangeModalRef.current?.open();
        handleSetState(setCollectionState, {
          sessionId: mainSessionId,
          deviceAuth: response.deviceAuth,
        });
      } catch (error) {
        console.log('🔥 SSE Error:', error);
        onErrorRef.current?.(error as Error);
      } finally {
        handleSetState(setLoadingState, { main: false });
      }
    },
    []
  );

  const signAndCommitKeys = useCallback(async () => {
    try {
      handleSetState(setLoadingState, { keyExchange: true });
      await monaService.signAndCommitKeys({
        deviceAuth: collectionState.deviceAuth,
        message: 'Authorize Collection',
      });
      await validatePII();
      keyExchangeModalRef.current?.close();
      collectionAccountModalRef?.current?.open();
    } catch (error) {
      console.log('🔥 SSE Error:', error);
      onErrorRef.current?.(error as Error);
    } finally {
      handleSetState(setLoadingState, { keyExchange: false });
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
      handleSetState(setLoadingState, { collectionConsent: true });

      try {
        await collectionService.createCollectionConsentRequest({
          bankId: value.bankId,
          accessRequestId: requestId,
        });
        collectionSuccessRef.current?.open();
      } catch (e) {
        console.log('Create collection error', e);
        onErrorRef.current?.(e as Error);
      } finally {
        handleSetState(setLoadingState, { collectionConsent: false });
        collectionAccountModalRef?.current?.close();
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

      {collectionState.collectionResponse && (
        <CollectionConfirmationDialog
          ref={collectionConfirmationRef}
          loading={false}
          collection={collectionState.collectionResponse}
          onSubmit={() => {
            collectionConfirmationRef.current?.close();
            collectionAccountModalRef?.current?.open();
          }}
        />
      )}

      <CollectionAccountSelectionDialog
        ref={collectionAccountModalRef}
        loading={loadingState.collectionConsent || validatePIILoading}
        savedPaymentOptions={validationData}
        accessRequestId={requestId}
        onSubmit={createCollectionConsentRequest}
      />

      <KeyExchangeConfirmationModal
        loading={loadingState.keyExchange}
        ref={keyExchangeModalRef}
        onSubmit={signAndCommitKeys}
      />

      {collectionState.collectionResponse && collectionState?.bank && (
        <CollectionSuccessDialog
          ref={collectionSuccessRef}
          loading={false}
          bank={collectionState?.bank}
          collection={collectionState.collectionResponse}
          onSubmit={() => {
            collectionSuccessRef.current?.close();
            onSuccessRef.current?.();
          }}
        />
      )}
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
