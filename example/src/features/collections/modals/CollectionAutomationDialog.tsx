import { View, Text, StyleSheet, Image } from 'react-native';
import CollectionSubscriptionView from '../components/CollectionSubscriptionView';
import {
  type CollectionResponse,
  CollectionType,
  MonaModal,
} from 'pay-with-mona-react-native';
import CircularAvatar from '../../../components/CircularAvatar';
import CollectionScheduledView from '../components/CollectionScheduledView';
import AppButton from '../../../components/AppButton';
import SizedBox from '../../../components/SizedBox';
import { Colors } from '../../../constants/Color';

const CollectionAutomationDialog = ({
  visible,
  onClose,
  loading,
  collection,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  collection: CollectionResponse & {
    merchantName: string;
    type: CollectionType;
  };
  onSubmit?: () => void;
}) => {
  return (
    <MonaModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <CircularAvatar size={48} backgroundColor={'#3045FB1A'}>
            <Image
              source={require('../../../assets/collection_bank.png')}
              style={styles.headerLogo}
            />
          </CircularAvatar>
          <Image
            source={require('../../../assets/directions.png')}
            style={{
              width: 22,
              height: 22,
            }}
          />
          <Image
            source={require('../../../assets/ng_deals_logo.png')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 50,
              resizeMode: 'cover',
            }}
          />
        </View>
        <Text style={styles.title}>NGdeals wants to automate repayments</Text>
        <Text style={styles.subtitle}>Please verify the details below</Text>

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
            amount={collection.schedule.amount ?? '0'}
            reference={collection.reference}
          />
        )}
        <SizedBox height={10} />
        <AppButton
          style={styles.button}
          text="Continue to Mona"
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
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: Colors.neutral,
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

export default CollectionAutomationDialog;
