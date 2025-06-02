import { StyleSheet, Text, View } from 'react-native';
import SizedBox from '../../../components/SizedBox';
import { TransactionStatus } from 'pay-with-mona-react-native';
import AppButton from '../../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StackParamList } from '../../../App';

const TransactionSummary = ({
  transactionStatus,
  amount,
  transactionId,
}: {
  transactionStatus: TransactionStatus;
  amount: string;
  transactionId: string;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Summary</Text>
      <SizedBox height={20} />
      <TransactionTile title="Payment Amount" subtitle={`₦${amount}`} />
      <SizedBox height={20} />
      <TransactionTile title="Transaction ID" subtitle={transactionId} />
      <SizedBox height={20} />
      <TransactionTile
        title="Payment Status"
        subtitle={
          transactionStatus === TransactionStatus.FAILED
            ? 'Failed'
            : 'Successful'
        }
      />
      <SizedBox height={30} />
      <AppButton text="Return to Home" onPress={() => navigation.pop()} />
    </View>
  );
};

const TransactionTile = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Bold',
    alignSelf: 'center',
  },
  title: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default TransactionSummary;
