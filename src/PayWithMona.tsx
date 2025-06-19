import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import BankOptionsTile from './components/BankOptionsTile';
import Column from './components/Column';
import MonaButton from './components/MonaButton';
import SizedBox from './components/SizedBox';
import { useInitializePayment } from './hooks/useInitializePayment';
import useMakePayment from './hooks/useMakePayment';
import { useValidatePII } from './hooks/useValidatePII';
import EntryTaskModal, { type EntryTaskModalRef } from './modals/EntryTaskModal';
import KeyExchangeConfirmationModal from './modals/KeyExchangeConfirmationModal';
import MonaModal from './modals/MonaModal';
import TransactionConfirmationModal from './modals/TransactionConfirmationModal';
import TransactionFailedModal from './modals/transactions/TransactionFailedModal';
import TransactionInitiatedModal from './modals/transactions/TransactionInitiatedModal';
import TransactionSuccessModal from './modals/transactions/TransactionSuccessModal';
import { monaService } from './services/MonaService';
import { paymentServices } from './services/PaymentService';
import {
  TaskType,
  type BankOptions,
  type PayWithMonaProps,
  type PinEntryTask,
  type SavedPaymentOptions
} from './types';
import { PaymentMethod, TransactionStatus } from './utils/enums';
import {
  encryptRequestData,
  isAuthenticated,
} from './utils/helpers';
import { MonaColors } from './utils/theme';
import { useMonaSdkStore } from './hooks/useMonaSdkStore';
import ProgressModal from './modals/ProgressModal';

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

// Make sure to define the ModalState enum as a string enum, if not the !!modalState check will fail for 0 values
enum ModalState {
  keyExchange = 'keyExchange',
  entryTask = 'entryTask',
  initiated = 'initiated',
  success = 'success',
  failure = 'failure',
  confirmation = 'confirmation',
  loading = 'loading',
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
  const entryTaskModalRef = useRef<EntryTaskModalRef>(null);
  const paymentMethodRef = useRef<PaymentMethod>(null);
  const [payload, setPayload] = useState({});

  const [modalState, setModalState] = useState<ModalState>();
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

  const [mainLoading, setMainLoading] = useState<boolean>(false);
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
    () => modalState === ModalState.loading || mainLoading,
    [modalState, mainLoading]
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
        setModalState(ModalState.initiated);
      }
    },
    [handleSetPaymentState, onTransactionUpdate]
  );

  const { initializeEvent } = useInitializePayment({
    transactionId,
    onError: onError,
    onPaymentUpdate: (event) => {
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
      startMainLoading();
      try {
        const response = await monaService.loginWithStrongAuth(
          strongAuthToken,
          null
        );
        handleSetPaymentState({
          deviceAuth: response.deviceAuth,
          sessionId: mainSessionId,
        });
        setModalState(ModalState.keyExchange);
      } catch (error) {
        console.log('🔥 SSE Error:', error);
        onError?.(error as Error);
      } finally {
        stopMainLoading();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signAndMakePaymentRequest = useCallback(async () => {
    try {
      startLoading();
      await monaService.signAndCommitKeys({
        deviceAuth: paymentState.deviceAuth,
        message: 'Authorize set-up',
      });
      await validatePII();
      onAuthUpdate?.();
      stopLoading();
      startMainLoading();

      if (paymentState.bankId && isSavedOptions) {
        setModalState(ModalState.confirmation);
      } else {
        setModalState(undefined);
      }
    } catch (error) {
      console.log('🔥 SSE Error:', error);
      onError?.(error as Error);
    } finally {
      stopLoading();
      stopMainLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentState.bankId, isSavedOptions, paymentState.deviceAuth]);

  const handleRetryPayment = useCallback(async () => {
    try {
      startLoading();
      handleSetPaymentState({
        paymentMethod: null,
        bankId: null,
        bankOptions: null,
      });
      await initializeEvent();
      setModalState(undefined);
    } catch (e) {
      onError?.(e as Error);
    } finally {
      stopLoading();
    }
  }, [
    onError,
    handleSetPaymentState,
    initializeEvent,
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
      setTimeout(() => setModalState(ModalState.entryTask), 200);
    },
    handleAuthEventUpdate: handleAuthEventUpdate,
    handleCloseEventUpdate: () => validatePII(),
  });

  if (paymentLoading && modalState !== ModalState.loading) {
    setModalState(ModalState.loading);
  }

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
      useMonaSdkStore.getState().clearMonaSdkState();
      //Other clean ups
      console.log('PayWithMonaPage unmounted');
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
            setModalState(ModalState.confirmation);
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

      <MonaModal
        visible={!!modalState}
        backgroundColor={modalState === ModalState.confirmation ? MonaColors.white : undefined}
        hasCloseButton={
          modalState === ModalState.keyExchange ||
          modalState === ModalState.confirmation
        }
        onClose={() => {
          setModalState(undefined);
          entryTaskModalRef.current?.clearPin();
        }}
      >
        {modalState === ModalState.entryTask && paymentState.entryTask != null && (
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
                  ...payload,
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
            close={() => setModalState(undefined)}
          />
        )}

        {modalState === ModalState.keyExchange && (
          <KeyExchangeConfirmationModal
            onSubmit={signAndMakePaymentRequest}
          />
        )}

        {modalState === ModalState.confirmation && paymentState.bankOptions && (
          <TransactionConfirmationModal
            amount={amount / 100}
            loading={paymentLoading}
            bank={paymentState.bankOptions}
            onChange={() => {
              setModalState(undefined);
            }}
            onPress={async () => {
              await handlePayment({ isOneTap: true });
            }}
          />
        )}

        {modalState === ModalState.initiated && paymentState.transactionStatus && (
          <TransactionInitiatedModal
            transactionStatus={paymentState.transactionStatus}
            onDone={() => {
              if (
                paymentState.transactionStatus === TransactionStatus.COMPLETED
              ) {
                setModalState(ModalState.success);
              } else if (
                paymentState.transactionStatus === TransactionStatus.FAILED
              ) {
                setModalState(ModalState.failure);
              }
            }}
          />
        )}

        {modalState === ModalState.success && transactionCompleted && (
          <TransactionSuccessModal
            hasTimeout={true}
            amount={amount / 100}
            onTimeout={() => {
              setModalState(undefined);
              onTransactionUpdate?.(paymentState.transactionStatus!);
            }}
            onReturn={() => {
              setModalState(undefined);
              onTransactionUpdate?.(paymentState.transactionStatus!);
            }}
          />
        )}

        {modalState === ModalState.failure && transactionFailed && (
          <TransactionFailedModal
            amount={amount / 100}
            onRetry={handleRetryPayment}
            onTimeout={() => {
              setModalState(undefined);
              onTransactionUpdate?.(paymentState.transactionStatus!);
            }}
          />
        )}

        {modalState === ModalState.loading && (
          <ProgressModal />
        )}
      </MonaModal>
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
