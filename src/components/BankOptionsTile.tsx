import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
  View,
} from 'react-native';
import CircularAvatar from './CircularAvatar';
import SizedBox from './SizedBox';
import Column from './Column';
import { MonaColors } from '../utils/config';
import type { BankOptions } from '../types';
import { PaymentMethod } from '../utils/enums';
import { useEffect, useMemo } from 'react';

const BankOptionsTile = ({
  title,
  subtitle,
  bank,
  isSelected = false,
  trailing,
  paymentMethod,
  hasRadio = true,
  onPress,
}: {
  title?: string;
  subtitle?: string;
  bank?: BankOptions | null;
  isSelected?: boolean;
  trailing?: React.ReactNode;
  hasRadio?: boolean;
  paymentMethod?: PaymentMethod;
  onPress?: (
    paymentMethod: PaymentMethod | undefined,
    bankOptions?: BankOptions | null
  ) => void;
}) => {
  const animatedValue = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const subtitlePrefix = useMemo(() => {
    if (paymentMethod === PaymentMethod.SAVEDCARD) {
      return 'Card • ';
    } else if (paymentMethod === PaymentMethod.SAVEDBANK) {
      return 'Account • ';
    } else {
      return '';
    }
  }, [paymentMethod]);

  return (
    <Pressable
      onPress={() => onPress?.(paymentMethod, bank)}
      style={styles.container}
    >
      <View style={styles.leftContent}>
        {(paymentMethod === PaymentMethod.SAVEDCARD ||
          paymentMethod === PaymentMethod.SAVEDBANK) && (
          <CircularAvatar size={36}>
            <Image source={{ uri: bank!.logo }} style={styles.logo} />
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
        )}
        {(paymentMethod === PaymentMethod.TRANSFER ||
          paymentMethod === PaymentMethod.CARD) && (
          <Image
            source={
              paymentMethod === PaymentMethod.CARD
                ? require('../assets/card.png')
                : require('../assets/money.png')
            }
            style={styles.icon}
          />
        )}
        <SizedBox width={20} />
        <Column>
          <Text style={styles.title} numberOfLines={1}>
            {title ?? bank?.bankName}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subtitlePrefix}
            {subtitle ?? bank?.accountNumber}
          </Text>
        </Column>
      </View>
      {!trailing && hasRadio && (
        // <View style={[styles.radio, isSelected && styles.radioSelected]}>
        //   {isSelected && <View style={styles.radioInner} />}
        // </View>
        <Animated.View
          style={[
            styles.radio,
            {
              borderColor: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['#F2F2F3', MonaColors.primary],
              }),
            },
            isSelected && styles.radioSelected,
          ]}
        >
          <Animated.View
            style={[
              styles.radioInner,
              {
                backgroundColor: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['transparent', MonaColors.primary],
                }),
              },
            ]}
          />
        </Animated.View>
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
    // borderColor: '#F2F2F3',
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
    // backgroundColor: MonaColors.primary,
    borderRadius: 50,
  },
  bankDetails: {
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
  },
  logo: {
    width: 36,
    height: 36,
  },
});

export default BankOptionsTile;
