import { View, Text, StyleSheet, Image } from 'react-native';
import CircularAvatar from '../../../components/CircularAvatar';
import SizedBox from '../../../components/SizedBox';
import CollectionScheduledView from '../components/CollectionScheduledView';
import CollectionSubscriptionView from '../components/CollectionSubscriptionView';
import {
  type BankOptions,
  BankTile,
  type CollectionResponse,
  CollectionType,
  MonaModal,
} from 'pay-with-mona-react-native';
import AppButton from '../../../components/AppButton';

const CollectionSuccessDialog = ({
  visible,
  setVisible,
  loading,
  collection,
  bank,
  onSubmit,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  loading: boolean;
  collection: CollectionResponse & {
    merchantName: string;
    type: CollectionType;
  };
  bank?: BankOptions;
  onSubmit?: () => void;
}) => {
  return (
    <MonaModal visible={visible} setVisible={setVisible}>
      <View style={styles.container}>
        <CircularAvatar
          style={styles.logo}
          size={48}
          backgroundColor={'#3045FB1A'}
        >
          <Image
            source={require('../../../assets/success_confetti.png')}
            style={styles.headerLogo}
          />
        </CircularAvatar>
        <Text style={styles.title}>Your automatic payments are confirmed</Text>
        <Text style={styles.subtitle}>See the details below</Text>

        {bank && (
          <>
            <Text style={styles.paymentAccount}>Payment Account</Text>
            <BankTile bank={bank} hasRadio={false} />
            <SizedBox height={20} />
          </>
        )}

        {collection.type === CollectionType.SCHEDULED && (
          <CollectionScheduledView
            merchantName={collection.merchantName}
            duration={
              collection.expiryDate instanceof Date
                ? collection.expiryDate.toLocaleDateString('en-Us')
                : new Date(collection.expiryDate).toLocaleDateString('en-Us')
            }
            debitLimit={collection.maxAmount}
            monthlyLimit={collection.monthlyLimit}
            reference={collection.reference}
          />
        )}
        {collection.type === CollectionType.SUBSCRIPTION && (
          <CollectionSubscriptionView
            merchantName={collection.merchantName}
            frequency={collection.schedule?.frequency ?? ''}
            startDate={
              collection.startDate instanceof Date
                ? collection.startDate.toLocaleDateString('en-Us')
                : new Date(collection.startDate).toLocaleDateString('en-Us')
            }
            amount={collection?.schedule.amount ?? '0'}
            reference={collection.reference}
          />
        )}
        <SizedBox height={10} />
        <AppButton
          style={styles.button}
          text="Continue"
          isLoading={loading}
          onPress={() => onSubmit?.()}
        />
      </View>
    </MonaModal>
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
  paymentAccount: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 5,
    letterSpacing: -0.48,
    lineHeight: 16,
    color: '#6A6C60',
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
  logo: {
    marginBottom: 24,
    alignSelf: 'center',
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

export default CollectionSuccessDialog;
