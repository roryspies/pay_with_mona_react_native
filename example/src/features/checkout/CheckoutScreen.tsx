import { type StackParamList } from '../../App';
import Column from '../../components/Column';
import { Colors } from '../../constants/Color';
import { type RouteProp, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  PayWithMona,
  TransactionStatus,
  type PayWithMonaConfig,
} from 'pay-with-mona-react-native';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import TransactionSummary from './components/TransactionSummary';
import AppBar from '../../components/AppBar';
import SizedBox from '../../components/SizedBox';
import CheckoutHeader from './components/CheckoutHeader';

const CheckoutScreen = () => {
  const route = useRoute<RouteProp<StackParamList, 'Checkout'>>();
  const { amount, onAuthUpdate, transactionId, savedPaymentOptions } =
    route.params;
  const [transactionStatus, setTransactionStatus] =
    React.useState<TransactionStatus | null>(null);
  const publicKey = 'mona_pub_5361ecf7';

  const payWithMonaConfig: PayWithMonaConfig = useMemo(() => {
    return {
      merchantKey: publicKey,
      amountInKobo: Number(amount) * 100,
      transactionId,
      savedPaymentOptions,
    };
  }, [publicKey, amount, transactionId, savedPaymentOptions]);

  return (
    <SafeAreaView style={styles.container}>
      <Column style={styles.subContainer}>
        <AppBar title="Checkout" />
        <ScrollView>
          <View style={styles.header}>
            <CheckoutHeader amount={amount} status={transactionStatus} />
          </View>
          <SizedBox height={15} />
          {transactionStatus != null && (
            <TransactionSummary
              transactionId={transactionId}
              transactionStatus={transactionStatus}
              amount={amount}
            />
          )}
          {transactionStatus == null && (
            <PayWithMona
              config={payWithMonaConfig}
              onTransactionUpdate={(status: TransactionStatus) =>
                setTransactionStatus(status)
              }
              onAuthUpdate={onAuthUpdate}
            />
          )}
        </ScrollView>
      </Column>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  subContainer: { backgroundColor: '#F2F2F3', flex: 1 },
  header: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default CheckoutScreen;
