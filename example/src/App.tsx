import { Text, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PayWithMona } from 'pay-with-mona-react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <Text>Back</Text>
        <Text style={styles.title}>Checkout</Text>
      </View>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerText}>Payment Summary</Text>
          <View style={styles.heightSpacer} />
          <View style={styles.headerBottom}>
            <Text>Total</Text>
            <Text>₦1,000</Text>
          </View>
        </View>
        <View style={styles.heightSpacer} />
        <PayWithMona
          merchantKey=";"
          transactionId="1234567890"
          amount={2000}
          // onSuccess={() => {}}
          // onError={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F3',
  },
  nav: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  heightSpacer: {
    height: 10,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
