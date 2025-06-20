import {
  useState
} from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import BankOptionsTile from '../components/BankOptionsTile';
import CircularAvatar from '../components/CircularAvatar';
import BankIcon from '../components/icons/Bank';
import DirectionsIcon from '../components/icons/Directions';
import MonaButton from '../components/MonaButton';
import SizedBox from '../components/SizedBox';
import type { BankOptions, SavedPaymentOptions } from '../types';
import { PAYMENT_BASE_URL } from '../utils/config';
import { PaymentMethod } from '../utils/enums';
import { launchSdkUrl } from '../utils/helpers';
import { MonaColors } from '../utils/theme';

const CollectionAccountSelectionDialog = (
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
) => {
  const [bank, setBank] = useState<BankOptions | null>(null);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CircularAvatar size={48} backgroundColor={'#3045FB1A'}>
          <BankIcon
            // source={require('../assets/bank.png')}
            style={styles.headerLogo}
          />
        </CircularAvatar>
        <DirectionsIcon
          // source={require('../assets/directions.png')}
          style={styles.directionsIcon}
        />
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
        />
      </View>
      <Text style={styles.title}>Select Payment Account</Text>
      <Text style={styles.subtitle}>
        There are the account you linked, select the ones you'd like to link
        to NGdeals for repayments.
      </Text>
      {savedPaymentOptions?.bank != null &&
        savedPaymentOptions?.bank.map((value) => {
          //TODO: This is not advisable
          //TODO: This is Implemented based on what they have Flutter
          //TODO! Alert them on backend to creeat an endpoint specific to collection

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
        style={styles.addAccountButton}
      >
        <Image
          source={require('../assets/add.png')}
          style={styles.addIcon}
        />
        <Text style={styles.textButtonText}>Add Account</Text>
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
  );
};

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
  directionsIcon: {
    width: 22,
    height: 22,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  addAccountButton: {
    flexDirection: 'row',
  },
  addIcon: {
    width: 20,
    height: 20,
    alignSelf: 'center',
  },
  textButtonText: {
    flex: 1,
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
