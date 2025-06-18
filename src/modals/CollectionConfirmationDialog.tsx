import {
  type CollectionResponse,
  CollectionType
} from 'pay-with-mona-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import CircularAvatar from '../components/CircularAvatar';
import CollectionScheduledView from '../components/CollectionScheduledView';
import CollectionSubscriptionView from '../components/CollectionSubscriptionView';
import BankIcon from '../components/icons/Bank';
import DirectionsIcon from '../components/icons/Directions';
import MonaButton from '../components/MonaButton';
import SizedBox from '../components/SizedBox';
import { useMonaSdkStore } from '../hooks/useMonaSdkStore';
import { MonaColors } from '../utils/theme';

const CollectionConfirmationDialog = (
  {
    loading,
    collection,
    onSubmit,
  }: {
    loading: boolean;
    collection: CollectionResponse;
    onSubmit?: () => void;
  }
) => {
  const sdkState = useMonaSdkStore();
  const merchant = sdkState.merchantSdk;
  return (

    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CircularAvatar size={48} backgroundColor={'#3045FB1A'}>
          <BankIcon />
        </CircularAvatar>
        <DirectionsIcon height={22} width={22} />
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>NGdeals wants to automate repayments</Text>
      <Text style={styles.subtitle}>Please verify the details below</Text>

      {collection.schedule &&
        collection.schedule.type === CollectionType.SCHEDULED && (
          <CollectionScheduledView
            merchantName={merchant?.name ?? 'N/A'}
            duration={
              collection.expiryDate instanceof Date
                ? collection.expiryDate.toLocaleDateString('en-Us')
                : new Date(collection.expiryDate).toLocaleDateString(
                  'en-Us'
                )
            }
            debitLimit={collection.maxAmount}
            monthlyLimit={collection.monthlyLimit}
            reference={collection.reference}
          />
        )}
      {collection.schedule &&
        collection.schedule.type === CollectionType.SUBSCRIPTION && (
          <CollectionSubscriptionView
            merchantName={merchant?.name ?? 'N/A'}
            frequency={collection.schedule?.frequency ?? ''}
            startDate={
              collection.startDate instanceof Date
                ? collection.startDate.toLocaleDateString('en-Us')
                : new Date(collection.startDate).toLocaleDateString('en-Us')
            }
            amount={collection.schedule.amount ?? '0'}
            reference={collection.reference}
          />
        )}
      <SizedBox height={10} />
      <MonaButton
        style={styles.button}
        text="Continue to Mona"
        isLoading={loading}
        onPress={() => onSubmit?.()}
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
  logo: {
    width: 48,
    height: 48,
    borderRadius: 50,
    resizeMode: 'cover',
  },
});

export default CollectionConfirmationDialog;
