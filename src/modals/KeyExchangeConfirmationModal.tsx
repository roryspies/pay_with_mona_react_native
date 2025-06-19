import { Image, StyleSheet, Text, View } from 'react-native';
import CircularAvatar from '../components/CircularAvatar';
import SvgSecuritySafe from '../components/icons/SecuritySafe';
import MerchantLogo from '../components/MerchantLogo';
import MonaButton from '../components/MonaButton';
import { lighten, MonaColors } from '../utils/theme';

const KeyExchangeConfirmationModal = (
  {
    onSubmit,
  }: {
    onSubmit?: () => void;
  },
) => {

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CircularAvatar backgroundColor={MonaColors.secondary} size={48}>
          <Image
            source={require('../assets/mona_logo.png')}
            style={styles.headerLogo}
          />
        </CircularAvatar>
        <Image
          source={require('../assets/checkmark_container.png')}
          style={{
            width: 48,
            height: 16,
          }}
        />
        <MerchantLogo />
      </View>
      <Text style={styles.title}>One Last Thing!</Text>
      <Text style={styles.subtitle}>
        Set up biometrics for faster, one-tap{'\n'}payments — every time you
        check out.
      </Text>
      <View style={styles.infoContainer}>
        <SvgSecuritySafe width={20} height={20} color={lighten(MonaColors.primary, 35)} />
        <Text style={[styles.infoText, { color: lighten(MonaColors.primary, 35) }]}>
          This is to make sure that you are the only one who can authorize
          payments.
        </Text>
      </View>
      <MonaButton
        style={styles.button}
        text="Setup"
        onPress={onSubmit}
      />
    </View>
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.48,
    lineHeight: 28,
    color: '#131503',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 30,
    letterSpacing: -0.48,
    lineHeight: 24,
    color: '#6A6C60',
    textAlign: 'center',
  },
  checkIcon: {
    width: 8,
    height: 8,
  },
  headerLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: MonaColors.neutral,
    marginBottom: 24,
  },
  button: { width: '100%' },
  infoContainer: {
    backgroundColor: '#F4F4FE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.48,
    lineHeight: 16,
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
});

export default KeyExchangeConfirmationModal;
