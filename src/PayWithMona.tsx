import { StyleSheet, Text, View } from 'react-native';
import { MonaColors } from './constants/MonaColors';
import Row from './components/Row';
import Column from './components/Column';
// import MoneyIcon from './components/MoneyIcon';

const PayWithMona = () => {
  return (
    <View style={styles.container}>
      <Text>Payment Methods</Text>
      <Column>
        <Row>
          {/* <MoneyIcon /> */}
          <Column>
            <Text>Pay by Transfer</Text>
            <Text>Pay for your order with cash on delivery</Text>
          </Column>
          <View
            style={{
              borderColor: 'grey',
              borderWidth: 1,
              borderRadius: 50,
              padding: 5,
            }}
          >
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: MonaColors.primary,
                borderRadius: 50,
              }}
            ></View>
          </View>
        </Row>
      </Column>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonaColors.white,
  },
});

export default PayWithMona;
