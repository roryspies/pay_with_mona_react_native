import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import MonaModal from './MonaModal';
import MonaButton from '../components/MonaButton';
import CircularAvatar from '../components/CircularAvatar';
import { MonaColors, PAYMENT_BASE_URL } from '../utils/config';
import SizedBox from '../components/SizedBox';
import type { BankOptions, ModalType, SavedPaymentOptions } from '../types';
import BankOptionsTile from '../components/BankOptionsTile';
import { PaymentMethod } from '../utils/enums';
import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ForwardedRef,
} from 'react';
import Row from '../components/Row';
import { launchSdkUrl } from '../utils/helpers';

const CollectionAccountSelectionDialog = forwardRef(
  (
    {
      loading,
      savedPaymentOptions,
      onSubmit,
      accessRequestId,
    }: {
      loading: boolean;
      savedPaymentOptions: SavedPaymentOptions | null;
      accessRequestId: string;
      onSubmit?: (bank: BankOptions) => void;
    },
    ref: ForwardedRef<ModalType>
  ) => {
    const [bank, setBank] = useState<BankOptions | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const open = () => {
      setShowModal(true);
    };
    const close = () => {
      setShowModal(false);
    };
    useImperativeHandle(ref, () => ({
      open,
      close,
    }));
    return (
      <MonaModal visible={showModal} setVisible={setShowModal}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <CircularAvatar size={48} backgroundColor={'#3045FB1A'}>
              <Image
                source={require('../assets/collection_bank.png')}
                style={styles.headerLogo}
              />
            </CircularAvatar>
            <Image
              source={require('../assets/directions.png')}
              style={{
                width: 22,
                height: 22,
              }}
            />
            <Image
              source={require('../assets/ng_deals_logo.png')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                resizeMode: 'cover',
              }}
            />
          </View>
          <Text style={styles.title}>Select Payment Account</Text>
          <Text style={styles.subtitle}>
            There are the account you linked, select the ones you'd like to link
            to NGdeals for repayments.
          </Text>
          {savedPaymentOptions?.bank != null &&
            savedPaymentOptions?.bank.map((value) => {
              //TODO! Alert them on backend to creeat an endpoint specific to collection
              //Implemented based on what they have Flutter
              if (
                value.bankName!.toLowerCase().includes('opay') ||
                value.bankName!.toLowerCase().includes('palm') ||
                value.bankName!.toLowerCase().includes('kuda') ||
                value.bankName!.toLowerCase().includes('monie')
              ) {
                return <View key={value.bankId} />;
              }
              return (
                <View key={value.bankId}>
                  <BankOptionsTile
                    bank={value}
                    isSelected={value.bankId === bank?.bankId}
                    paymentMethod={PaymentMethod.SAVEDBANK}
                    onPress={() => {
                      setBank(value);
                    }}
                  />
                  <SizedBox height={20} />
                </View>
              );
            })}
          <SizedBox height={10} />
          <Pressable
            onPress={async () => {
              const url = `${PAYMENT_BASE_URL}/collections/enrollment?collectionId=${accessRequestId}`;
              await launchSdkUrl(url);
            }}
          >
            <Row style={{ flex: 0 }}>
              <Image
                source={require('../assets/add.png')}
                style={{ width: 20, height: 20 }}
              />

              <Text style={styles.textButtonText}>Add Account</Text>
            </Row>
          </Pressable>
          <SizedBox height={10} />
          <MonaButton
            style={styles.button}
            text="Approve debiting"
            isLoading={loading}
            enabled={bank !== null}
            onPress={() => onSubmit?.(bank!)}
          />
        </View>
      </MonaModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  tileTitle: {
    fontSize: 10,
    fontWeight: '300',
  },
  tileSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.48,
    lineHeight: 28,
    color: '#131503',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 30,
    letterSpacing: -0.03,
    lineHeight: 22,
    color: '#6A6C60',
    textAlign: 'center',
  },
  checkIcon: {
    width: 8,
    height: 8,
  },
  headerLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  textButtonText: {
    // flex: 1,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
    paddingVertical: 20,
    fontWeight: '500',
    fontFamily: 'GeneralSans-Medium',
  },
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: MonaColors.neutral,
    marginBottom: 24,
  },
  button: { width: '100%' },
  infoContainer: {
    backgroundColor: '#F4F4FE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E94F1',
    letterSpacing: -0.48,
    lineHeight: 16,
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
});

export default CollectionAccountSelectionDialog;
