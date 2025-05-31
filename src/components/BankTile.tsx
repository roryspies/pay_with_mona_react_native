import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CircularAvatar from './CircularAvatar';
import SizedBox from './SizedBox';
import Column from './Column';
import { MonaColors } from '../utils/config';
import type { BankOptions } from '../types';
import { PaymentMethod } from '../utils/enums';

const BankTile = ({
  bank,
  isSelected = false,
  trailing,
  paymentMethod,
  hasRadio = true,
  onPress,
}: {
  bank: BankOptions;
  isSelected?: boolean;
  trailing?: React.ReactNode;
  hasRadio?: boolean;
  paymentMethod?: PaymentMethod;
  onPress?: () => void;
}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.leftContent}>
        <CircularAvatar size={36}>
          <Image source={{ uri: bank.logo }} style={styles.logo} />
          <CircularAvatar
            size={14}
            backgroundColor={MonaColors.white}
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              borderRadius: 12 / 2,
            }}
          >
            <Image
              source={
                paymentMethod === PaymentMethod.SAVEDCARD
                  ? require('../assets/card_icon.png')
                  : require('../assets/bank_icon.png')
              }
              style={{ width: 10, height: 10 }}
            />
          </CircularAvatar>
        </CircularAvatar>
        <SizedBox width={20} />
        <Column>
          <Text style={styles.title} numberOfLines={1}>
            {bank.bankName}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {paymentMethod === PaymentMethod.SAVEDCARD ? 'Card' : 'Account'} •{' '}
            {bank.accountNumber}
          </Text>
        </Column>
      </View>
      {!trailing && hasRadio && (
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      )}
      {trailing}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: { flexDirection: 'row' },
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
  bankDetails: {
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
  },
});

export default BankTile;
