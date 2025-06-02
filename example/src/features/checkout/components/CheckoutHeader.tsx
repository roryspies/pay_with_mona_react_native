import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/Color';
import { TransactionStatus } from 'pay-with-mona-react-native';
import TransactionSuccessful from './TransactionSuccessful';
import TransactionFailed from './TransactionFailed';
import SizedBox from '../../../components/SizedBox';

const formatMoney = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const CheckoutHeader = ({
  status,
  amount,
}: {
  status: TransactionStatus | null;
  amount: string;
}) => {
  if (status === TransactionStatus.COMPLETED) {
    return (
      <>
        <View style={styles.successHeaderContainer}>
          <TransactionSuccessful />
        </View>
        <Text style={styles.transactionText}>Transaction Completed</Text>
      </>
    );
  } else if (status === TransactionStatus.FAILED) {
    return (
      <>
        <View style={styles.failedHeaderContainer}>
          <TransactionFailed />
        </View>
        <Text style={styles.transactionText}>Transaction Failed</Text>
      </>
    );
  }
  return (
    <>
      <Text style={styles.headerText}>Payment Summary</Text>
      <SizedBox height={30} />
      <View style={styles.headerBottom}>
        <Text style={styles.headerSubText}>Total</Text>
        <Text style={styles.headerSubText}>₦{formatMoney(amount)}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Medium',
    lineHeight: 24,
    letterSpacing: -0.48,
  },
  headerSubText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Medium',
    lineHeight: 20,
  },

  transactionText: {
    fontSize: 14,
    fontFamily: 'NeueMontreal-Bold',
    lineHeight: 24,
    fontWeight: '700',
    marginTop: 5,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  successHeaderContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 40 / 2,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedHeaderContainer: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 40 / 2,
    justifyContent: 'center',
    padding: 10,
    width: 40,
    height: 40,
  },
});
export default CheckoutHeader;
