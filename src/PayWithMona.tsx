import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Column from './components/Column';
import SizedBox from './components/SizedBox';
import MonaButton from './components/MonaButton';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BankOptionsTile from './components/BankOptionsTile';
import { PaymentMethod, TransactionStatus } from './utils/enums';
import {
  TaskType,
  type BankOptions,
  type ModalType,
  type PayWithMonaProps,
  type PinEntryTask,
  type SavedPaymentOptions,
} from './types';
import { useInitializePayment } from './hooks/useInitializePayment';
import EntryTaskModal from './modals/EntryTaskModal';
import useMakePayment from './hooks/useMakePayment';
import TransactionInitiatedModal from './modals/transactions/TransactionInitiatedModal';
import TransactionSuccessModal from './modals/transactions/TransactionSuccessModal';
import TransactionFailedModal from './modals/transactions/TransactionFailedModal';
import TransactionConfirmationModal from './modals/TransactionConfirmationModal';
import KeyExchangeConfirmationModal from './modals/KeyExchangeConfirmationModal';
import {
  clearMonaSdkState,
  encryptRequestData,
  isAuthenticated,
} from './utils/helpers';
import { monaService } from './services/MonaService';
import { paymentServices } from './services/PaymentService';
import { useValidatePII } from './hooks/useValidatePII';
import { MonaColors } from './utils/theme';

interface ModalState {
  showInitiated: boolean;
  showSuccess: boolean;
  showFailure: boolean;
  showConfirmation: boolean;
}
interface LoadingState {
  main: boolean;
  setup: boolean;
  retry: boolean;
}

interface PaymentState {
  paymentOptions: SavedPaymentOptions | null;
  paymentMethod: PaymentMethod | null;
  bankOptions: BankOptions | null;
  bankId: string | null;
  deviceAuth: any | null;
  sessionId: string | null;
  transactionStatus: TransactionStatus | null;
  entryTask: PinEntryTask | null;
}

const PayWithMona: React.FC<PayWithMonaProps> = ({
  config,
  onTransactionUpdate,
  onError,
  onAuthUpdate,
}) => {
  const {
    amountInKobo: amount,
    merchantKey,
    transactionId,
    savedPaymentOptions,
  } = config;
  const keyExchangeModalRef = useRef<ModalType>(null);
  const entryTaskModalRef = useRef<ModalType>(null);
  const paymentMethodRef = useRef<PaymentMethod>(null);
  const [paylod, setPayload] = useState({});
  const [modalState, setModalState] = useState({
    showInitiated: false,
    showSuccess: false,
    showFailure: false,
    showConfirmation: false,
  });
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentOptions: null,
    paymentMethod: null,
    bankOptions: null,
    bankId: null,
    deviceAuth: null,
    sessionId: null,
    transactionStatus: null,
    entryTask: null,
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: false,
    setup: false,
    retry: false,
  });

  const handleSetModalState = useCallback((update: Partial<ModalState>) => {
    setModalState((prev) => ({ ...prev, ...update }));
  }, []);

  const handleSetLoadingState = useCallback(
    (field: keyof LoadingState, value: LoadingState[keyof LoadingState]) => {
      setLoadingState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSetPaymentState = useCallback(
    (update: Partial<PaymentState>) =>
      setPaymentState((prev) => ({
        ...prev,
        ...update,
      })),
    []
  );
  const isSavedOptions = useMemo(
    () =>
      paymentState.paymentMethod === PaymentMethod.SAVEDBANK ||
      paymentState.paymentMethod === PaymentMethod.SAVEDCARD,
    [paymentState.paymentMethod]
  );
  const transactionCompleted = useMemo(
    () => paymentState.transactionStatus === TransactionStatus.COMPLETED,
    [paymentState.transactionStatus]
  );

  const transactionFailed = useMemo(
    () => paymentState.transactionStatus === TransactionStatus.FAILED,
    [paymentState.transactionStatus]
  );
  const isLoading = useMemo(
    () => Object.values(loadingState).some(Boolean),
    [loadingState]
  );

  useEffect(() => {
    paymentServices.initialize(merchantKey);
    monaService.initialize(merchantKey);
  }, [merchantKey]);

  useEffect(() => {
    paymentMethodRef.current = paymentState.paymentMethod;
  }, [paymentState.paymentMethod]);

  //TODO! Somehow this can't access the state outside listner
  //TODO! Check if this is an issue or just the normal behavior
  const handleTransactionUpdate = useCallback(
    (status: TransactionStatus, paymentMethod: PaymentMethod | null) => {
      const isSavedOption =
        paymentMethod === PaymentMethod.SAVEDBANK ||
        paymentMethod === PaymentMethod.SAVEDCARD;

      if (!isSavedOption) {
        onTransactionUpdate?.(status);
      } else {
        handleSetPaymentState({ transactionStatus: status });
      }
      if (
        (status === TransactionStatus.INITIATED ||
          status === TransactionStatus.PROGRESSUPDATE) &&
        isSavedOption
      ) {
        handleSetModalState({ showInitiated: true });
      }
    },
    [handleSetModalState, handleSetPaymentState, onTransactionUpdate]
  );

  const { initializeEvent } = useInitializePayment({
    transactionId,
    onError: onError,
    onTransactionUpdate: (event) => {
      if (!event.data.event) {
        return;
      }
      console.log(
        'Payment method needed here!!!',
        paymentState,
        paymentState.paymentMethod
      );
      handleTransactionUpdate(event.data.event, paymentMethodRef.current);
    },
  });

  const {
    loading: piiLoading,
    validate: validatePII,
    validationData: piiData,
  } = useValidatePII();

  const handleAuthEventUpdate = useCallback(
    async (strongAuthToken: string, mainSessionId: string) => {
      handleSetLoadingState('main', true);
      try {
        const response = await monaService.loginWithStrongAuth(
          strongAuthToken,
          null
        );
        handleSetPaymentState({
          deviceAuth: response.deviceAuth,
          sessionId: mainSessionId,
        });
        keyExchangeModalRef.current?.open();
      } catch (error) {
        console.log('🔥 SSE Error:', error);
        onError?.(error as Error);
      } finally {
        handleSetLoadingState('main', false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signAndMakePaymentRequest = useCallback(async () => {
    try {
      handleSetLoadingState('setup', true);
      await monaService.signAndCommitKeys({
        deviceAuth: paymentState.deviceAuth,
        message: 'Authorize set-up',
      });
      await validatePII();
      onAuthUpdate?.();
      handleSetLoadingState('setup', false);
      handleSetLoadingState('main', true);
      keyExchangeModalRef.current?.close();
      if (paymentState.bankId && isSavedOptions) {
        handleSetModalState({ showConfirmation: true });
      }
      handleSetLoadingState('main', false);
    } catch (error) {
      console.log('🔥 SSE Error:', error);
      onError?.(error as Error);
    } finally {
      handleSetLoadingState('setup', false);
      handleSetLoadingState('main', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentState.bankId, isSavedOptions, paymentState.deviceAuth]);

  const handleRetryPayment = useCallback(async () => {
    try {
      handleSetLoadingState('retry', true);
      handleSetPaymentState({
        paymentMethod: null,
        bankId: null,
        bankOptions: null,
      });
      await initializeEvent();
      handleSetModalState({ showFailure: false });
      handleSetLoadingState('retry', false);
    } catch (e) {
      handleSetLoadingState('retry', false);
      onError?.(e as Error);
    }
  }, [
    onError,
    handleSetLoadingState,
    handleSetPaymentState,
    initializeEvent,
    handleSetModalState,
  ]);

  const { loading: paymentLoading, handlePayment } = useMakePayment({
    amount,
    bankId: paymentState.bankId,
    transactionId,
    paymentMethod: paymentState.paymentMethod,
    merchantKey,
    onEntryTaskUpdate: (entryTask: PinEntryTask | null) => {
      console.log('🔑 entryTask:', entryTask);
      handleSetPaymentState({ entryTask: entryTask });
      setTimeout(() => entryTaskModalRef.current?.open(), 200);
    },
    handleAuthEventUpdate: handleAuthEventUpdate,
    handleCloseEventUpdate: () => validatePII(),
  });

  useEffect(() => {
    validatePII();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('PayWithMona mounted');

    return () => {
      // ✅ Clean up subscriptions and listeners
      // FirebaseSSE.disconnectAll();
      // ✅ Close any open browser tabs
      // ReactNativeCustomTabs.close();
      // ✅ Clear sdk data
      clearMonaSdkState();
      //Other clean ups
      console.log('MPayWithMonayPage unmounted');
    };
  }, []);

  useEffect(() => {
    // console.log('🔑 Validation Data:', validationData);
    if (piiData) {
      handleSetPaymentState({ paymentOptions: piiData });
    }

    if (savedPaymentOptions) {
      handleSetPaymentState({ paymentOptions: savedPaymentOptions });
    }
  }, [piiData, handleSetPaymentState, savedPaymentOptions]);

  const renderButton = useCallback(() => {
    if (isLoading || piiLoading) {
      return <ActivityIndicator size="large" />;
    }
    return (
      <MonaButton
        isLoading={paymentLoading}
        text={isSavedOptions ? 'OneTap' : 'Proceed to Pay'}
        imageUrl={paymentState.bankOptions?.logo}
        subText={paymentState.bankOptions?.accountNumber}
        enabled={paymentState.paymentMethod != null}
        onPress={async () => {
          initializeEvent();
          if (isSavedOptions && isAuthenticated()) {
            handleSetModalState({ showConfirmation: true });
          } else {
            await handlePayment({
              isOneTap: isSavedOptions,
            });
          }
        }}
      />
    );
  }, [
    initializeEvent,
    isLoading,
    piiLoading,
    handlePayment,
    handleSetModalState,
    isSavedOptions,
    paymentLoading,
    paymentState.bankOptions,
    paymentState.paymentMethod,
  ]);

  return (
    <Column style={styles.container}>
      <Text style={styles.mainTitle}>Payment Methods</Text>
      <SizedBox height={40} />

      <SavedPaymentOptionsList
        paymentOptions={paymentState.paymentOptions}
        paymentMethod={paymentState.paymentMethod}
        bankOptions={paymentState.bankOptions}
        onSelected={(bankOptions, paymentMethod) => {
          handleSetPaymentState({
            bankId: bankOptions.bankId,
            bankOptions,
            paymentMethod,
          });
        }}
      />
      <BankOptionsTile
        title="Pay by Transfer"
        subtitle="Pay by bank transfer"
        isSelected={paymentState.paymentMethod === PaymentMethod.TRANSFER}
        paymentMethod={PaymentMethod.TRANSFER}
        onPress={(paymentMethod, bankOptions) =>
          handleSetPaymentState({
            paymentMethod: paymentMethod,
            bankId: bankOptions?.bankId,
            bankOptions: bankOptions,
          })
        }
      />
      <SizedBox height={30} />
      <BankOptionsTile
        title="Pay with Card"
        subtitle="Visa, Verve and Mastercard accepted"
        isSelected={paymentState.paymentMethod === PaymentMethod.CARD}
        paymentMethod={PaymentMethod.CARD}
        onPress={(paymentMethod, bankOptions) =>
          handleSetPaymentState({
            paymentMethod: paymentMethod,
            bankId: bankOptions?.bankId,
            bankOptions: bankOptions,
          })
        }
      />
      <SizedBox height={30} />
      {renderButton()}

      {paymentState.entryTask != null && (
        <EntryTaskModal
          ref={entryTaskModalRef}
          pinEntryTask={paymentState.entryTask}
          onSubmit={async (data) => {
            let requestPayload;
            if (
              paymentState.entryTask?.fieldName != null &&
              (paymentState.entryTask?.fieldType === TaskType.OTP ||
                paymentState.entryTask?.fieldType === TaskType.PIN)
            ) {
              const isEncrypted = paymentState.entryTask.encrypted;
              const encryptedData = await encryptRequestData(data);
              requestPayload = {
                ...paylod,
                [paymentState.entryTask.fieldName]: isEncrypted
                  ? encryptedData
                  : data,
              };
              setPayload(requestPayload);
            } else {
              requestPayload = undefined;
            }

            handlePayment({
              isOneTap: true,
              payload: requestPayload,
            });
          }}
        />
      )}

      <KeyExchangeConfirmationModal
        loading={loadingState.setup}
        ref={keyExchangeModalRef}
        onSubmit={async () => {
          await signAndMakePaymentRequest();
        }}
      />

      {paymentState.bankOptions && (
        <TransactionConfirmationModal
          visible={modalState.showConfirmation}
          setVisible={(value) =>
            handleSetModalState({ showConfirmation: value })
          }
          amount={amount / 100}
          loading={paymentLoading}
          bank={paymentState.bankOptions}
          onChange={() => {
            handleSetModalState({ showConfirmation: false });
          }}
          onPress={async () => {
            await handlePayment({ isOneTap: true });
            handleSetModalState({ showConfirmation: false });
          }}
        />
      )}

      {paymentState.transactionStatus && modalState.showInitiated && (
        <TransactionInitiatedModal
          visible={modalState.showInitiated}
          setVisible={(value) => handleSetModalState({ showInitiated: value })}
          transactionStatus={paymentState.transactionStatus}
          onDone={() => {
            if (
              paymentState.transactionStatus === TransactionStatus.COMPLETED
            ) {
              handleSetModalState({ showSuccess: true });
            } else if (
              paymentState.transactionStatus === TransactionStatus.FAILED
            ) {
              handleSetModalState({ showFailure: true });
            }
            handleSetModalState({ showInitiated: false });
          }}
        />
      )}

      {transactionCompleted && modalState.showSuccess && (
        <TransactionSuccessModal
          visible={modalState.showSuccess}
          setVisible={(value) => handleSetModalState({ showSuccess: value })}
          hasTimeout={true}
          amount={amount / 100}
          onTimeout={() => {
            handleSetModalState({ showSuccess: false });
            onTransactionUpdate?.(paymentState.transactionStatus!);
          }}
          onReturn={() => {
            handleSetModalState({ showSuccess: false });
            onTransactionUpdate?.(paymentState.transactionStatus!);
          }}
        />
      )}

      {transactionFailed && modalState.showFailure && (
        <TransactionFailedModal
          visible={modalState.showFailure}
          setVisible={(value) => handleSetModalState({ showFailure: value })}
          amount={amount / 100}
          loading={loadingState.retry}
          onRetry={handleRetryPayment}
          onTimeout={() => {
            handleSetModalState({ showFailure: false });
            onTransactionUpdate?.(paymentState.transactionStatus!);
          }}
        />
      )}
    </Column>
  );
};

const SavedPaymentOptionsList = ({
  paymentOptions,
  onSelected,
  paymentMethod,
  bankOptions,
}: {
  paymentOptions: SavedPaymentOptions | null;
  paymentMethod: PaymentMethod | null;
  bankOptions: BankOptions | null;
  onSelected: (bankOptions: BankOptions, paymentMethod: PaymentMethod) => void;
}) => {
  return (
    <>
      {paymentOptions != null &&
        paymentOptions.card?.map((bank) => (
          <React.Fragment key={bank.bankId}>
            <BankOptionsTile
              bank={bank}
              isSelected={
                paymentMethod === PaymentMethod.SAVEDCARD &&
                bankOptions?.bankId === bank.bankId
              }
              paymentMethod={PaymentMethod.SAVEDCARD}
              onPress={(selectedPaymentMethod, selectedBankOptions) =>
                onSelected(selectedBankOptions!, selectedPaymentMethod!)
              }
            />
            <SizedBox height={20} />
          </React.Fragment>
        ))}

      {paymentOptions != null &&
        paymentOptions.bank.map((bank) => (
          <React.Fragment key={bank.bankId}>
            <BankOptionsTile
              bank={bank}
              isSelected={
                paymentMethod === PaymentMethod.SAVEDBANK &&
                bankOptions?.bankId === bank.bankId
              }
              paymentMethod={PaymentMethod.SAVEDBANK}
              onPress={(selectedPaymentMethod, selectedBankOptions) =>
                onSelected(selectedBankOptions!, selectedPaymentMethod!)
              }
            />
            <SizedBox height={20} />
          </React.Fragment>
        ))}
    </>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonaColors.white,
    padding: 20,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default memo(PayWithMona);
