import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import MonaModal from '../MonaModal';
import MonaButton from '../../components/MonaButton';
import CircularAvatar from '../../components/CircularAvatar';
import { MonaColors } from '../../utils/theme';

const TransactionFailedModal = ({
  visible,
  setVisible,
  amount,
  onRetry,
  loading,
  hasTimeout = false,
  timeoutDuration = 10000,
  onTimeout,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  amount: number;
  loading?: boolean;
  hasTimeout?: boolean;
  timeoutDuration?: number;
  onRetry?: () => void;
  onTimeout?: () => void;
}) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (hasTimeout) {
      timeoutRef.current = setTimeout(() => {
        onTimeout?.();
        setVisible(false);
      }, timeoutDuration);
    }
  }, [hasTimeout, onTimeout, setVisible, timeoutDuration]);
  return (
    <MonaModal visible={visible} setVisible={setVisible} hasCloseButton={false}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <CircularAvatar backgroundColor={MonaColors.error} size={40}>
            <Image
              source={require('../../assets/failed.png')}
              style={styles.image}
            />
          </CircularAvatar>
        </View>
        <Text style={styles.title}>Payment Failed!</Text>
        <Text style={styles.subtitle}>
          Your payment of ₦{amount} failed! Please try again or use a different
          payment method.
        </Text>
        <MonaButton
          style={styles.button}
          text="Try Again"
          isLoading={loading}
          onPress={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            onRetry?.();
          }}
        />
      </View>
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
    marginBottom: 8,
    letterSpacing: -0.48,
    lineHeight: 24,
    color: '#131503',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
    letterSpacing: -0.4,
    lineHeight: 16,
    color: '#6A6C60',
    textAlign: 'center',
  },
  checkIcon: {
    width: 8,
    height: 8,
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar1: {
    width: '20%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
  },
  progressBar2: {
    width: '50%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar3: {
    width: '20%',
    height: 8,
    backgroundColor: '#E7F5EC',
    borderRadius: 4,
  },
  image: {
    width: 26,
    height: 26,
    color: '#FFFFFF',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: MonaColors.neutral,
    borderWidth: 1,
    borderRadius: 48 / 2,
    marginBottom: 16,
  },
  button: { width: '100%' },
});

export default TransactionFailedModal;
