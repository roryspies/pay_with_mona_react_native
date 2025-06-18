import { View, Text, StyleSheet } from 'react-native';
import MonaModal from './MonaModal';
import MonaButton from '../components/MonaButton';
import { MonaColors } from '../utils/theme';
import type { BankOptions } from '../types';
import BankOptionsTile from '../components/BankOptionsTile';
import SizedBox from '../components/SizedBox';
import ArrowRight from '../components/icons/ArrowRight';

const TransactionConfirmationModal = ({
  visible,
  setVisible,
  amount,
  bank,
  loading,
  onPress,
  onChange,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  bank: BankOptions;
  amount: number;
  loading: boolean;
  onPress?: () => void;
  onChange?: () => void;
}) => {
  return (
    <MonaModal
      visible={visible}
      setVisible={setVisible}
      backgroundColor={MonaColors.white}
      usePoweredByMona={true}
    >
      <View style={styles.amountContainer}>
        <Text style={styles.subtitle}>Amount to pay</Text>
        <Text style={styles.amount}>₦{amount}</Text>
      </View>
      <Text style={styles.title}>Payment Method</Text>
      <BankOptionsTile
        bank={bank}
        onPress={() => onChange?.()}
        trailing={
          <View style={styles.changeContainer}>
            <Text style={[styles.changeText, { color: MonaColors.primary }]}>
              Change
            </Text>
            <ArrowRight width={12} height={12} color={MonaColors.primary} />
          </View>
        }
      />
      <SizedBox height={24} />
      <MonaButton
        style={{ width: '100%' }}
        text="Pay"
        isLoading={loading}
        onPress={() => onPress?.()}
      />
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
    marginBottom: 24,
    letterSpacing: -0.48,
    lineHeight: 24,
    color: '#131503',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.48,
    lineHeight: 16,
    color: '#9A9A93',
    textAlign: 'center',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.48,
    lineHeight: 16,
  },
  arrowRightIcon: {
    width: 12,
    height: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default TransactionConfirmationModal;
