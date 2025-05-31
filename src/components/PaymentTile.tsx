import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Row from './Row';
import SizedBox from './SizedBox';
import Column from './Column';
import { MonaColors } from '../utils/config';
import { PaymentMethod } from '../utils/enums';

const PaymentMethodTile = ({
  title,
  subTitle,
  isSelected = false,
  paymentMethod,
  onPress,
}: {
  title: string;
  subTitle: string;
  isSelected: boolean;
  paymentMethod?: PaymentMethod;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Row>
        <Image
          source={
            paymentMethod === PaymentMethod.CARD
              ? require('../assets/card.png')
              : require('../assets/money.png')
          }
          style={styles.icon}
        />
        <SizedBox width={20} />
        <Column style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subTitle}>{subTitle}</Text>
        </Column>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner}></View>}
        </View>
      </Row>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonaColors.white,
    padding: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  subTitle: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
    lineHeight: 20,
  },
  radio: {
    borderColor: '#F2F2F3',
    borderWidth: 1,
    borderRadius: 50,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: MonaColors.primary,
  },
  radioInner: {
    height: 12,
    width: 12,
    backgroundColor: MonaColors.primary,
    borderRadius: 50,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default PaymentMethodTile;
