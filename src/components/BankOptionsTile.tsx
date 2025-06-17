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
import type { BankOptions } from '../types';
import { PaymentMethod } from '../utils/enums';
import { useEffect, useMemo } from 'react';
import BankIcon from './icons/Bank';
import CardIcon from './icons/Card';
import { MonaColors } from '../utils/theme';
import { withAlpha } from '../../example/src/constants/Color';

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
  }, [isSelected, animatedValue]);

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
      onPress={() => (bank?.activeIn ? {} : onPress?.(paymentMethod, bank))}
      style={styles.container}
    >
      <View style={styles.leftContent}>
        {(paymentMethod === PaymentMethod.SAVEDCARD ||
          paymentMethod === PaymentMethod.SAVEDBANK ||
          bank?.logo != null) && (
            <CircularAvatar size={36}>
              <Image source={{ uri: bank!.logo }} style={styles.logo} />
              <CircularAvatar
                size={14}
                backgroundColor={MonaColors.white}
                style={styles.smallAvatar}
              >
                <Image
                  source={
                    paymentMethod === PaymentMethod.SAVEDCARD
                      ? require('../assets/cards.png')
                      : require('../assets/bank-icon.png')
                  }
                  style={styles.smallIcon}
                />
              </CircularAvatar>
            </CircularAvatar>
          )}
        {(paymentMethod === PaymentMethod.TRANSFER ||
          paymentMethod === PaymentMethod.CARD) && (
            <CircularAvatar
              size={36}
              style={{ backgroundColor: withAlpha(MonaColors.primary, 0.1) }}
            >
              {paymentMethod === PaymentMethod.TRANSFER && (
                <BankIcon style={styles.icon} />
              )}
              {paymentMethod === PaymentMethod.CARD && (
                <CardIcon style={styles.icon} />
              )}
            </CircularAvatar>
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
      {!trailing && hasRadio && !bank?.activeIn && (
        <Animated.View
          style={[
            styles.radio,
            {
              borderColor: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['#F2F2F3', MonaColors.primary],
              }),
            },
            isSelected && { borderColor: MonaColors.primary },
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
      {!trailing && bank?.activeIn && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active in {bank.activeIn} hours</Text>
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
  leftContent: {
    flexDirection: 'row',
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

  badge: {
    backgroundColor: '#E7E8E6',
    borderRadius: 8,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.48,
    color: '#C6C7C3',
  },
  radio: {
    borderWidth: 1,
    borderRadius: 50,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 12,
    width: 12,
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
  smallAvatar: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 12 / 2,
  },
  smallIcon: {
    width: 10,
    height: 10,
  },
});

export default BankOptionsTile;
