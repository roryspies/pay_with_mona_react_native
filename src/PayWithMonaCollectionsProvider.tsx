import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { collectionService } from './services/CollectionService';
import { monaService } from './services/MonaService';
import KeyExchangeConfirmationModal from './modals/KeyExchangeConfirmationModal';
import CollectionAccountSelectionDialog from './modals/CollectionAccoutSelectionDialog';
import {
  type BankOptions,
  type ModalType,
  type PayWithMonaCollectionsContextType,
} from './types';
import { handleSetState } from './utils/helpers';
import { useValidatePII } from './hooks/useValidatePII';

const PayMonaCollectionsContext =
  createContext<PayWithMonaCollectionsContextType | null>(null);

type LoadingState = {
  main: boolean;
  collectionConsent: boolean;
  keyExchange: boolean;
};

type CollectionState = {
  deviceAuth: any | null;
  sessionId: string | null;
  bank: BankOptions | null;
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
  const {
    loading: validatePIILoading,
    validate: validatePII,
    validationData,
  } = useValidatePII();

  const showModal = useCallback(
    (
      propsRequestId: string,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      onSuccessRef.current = onSuccess || null;
      onErrorRef.current = onError || null;
      setRequestId(propsRequestId);
      validatePII();
      collectionAccountModalRef?.current?.open();
    },
    [validatePII]
  );
  const hideModal = useCallback(
    () => collectionAccountModalRef?.current?.close(),
    []
  );

  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: false,
    collectionConsent: false,
    keyExchange: false,
  });
  const [bank, setBank] = useState<BankOptions>();
  const [collectionState, setCollectionState] = useState<CollectionState>({
    deviceAuth: null,
    sessionId: null,
    bank: null,
  });

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
      // onAuthUpdate?.();
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
      handleSetState(setLoadingState, { collectionConsent: true });
      //
      setBank(value);
      console.log(bank, value);

      try {
        await collectionService.createCollectionConsentRequest({
          bankId: value.bankId,
          accessRequestId: requestId,
        });
        onSuccessRef.current?.();
      } catch (e) {
        console.log('Create collection error', e);
        onErrorRef.current?.(e as Error);
      } finally {
        handleSetState(setLoadingState, { collectionConsent: false });
        collectionAccountModalRef?.current?.close();
      }
    },
    [requestId]
  );

  useEffect(() => {
    collectionService.initialize(merchantKey);
    monaService.initialize(merchantKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PayMonaCollectionsContext.Provider
      value={{
        showModal,
        hideModal,
        onHandleAuthUpdate: handleAuthEventUpdate,
      }}
    >
      {children}

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
