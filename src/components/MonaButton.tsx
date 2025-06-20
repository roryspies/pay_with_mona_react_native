import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { MonaColors } from '../utils/theme';
import Row from './Row';

const MonaButton = ({
  style,
  text,
  isLoading = false,
  onPress,
  imageUrl,
  subText,
  enabled = true,
}: {
  style?: ViewStyle;
  text: string;
  isLoading?: boolean;
  onPress?: () => void;
  imageUrl?: string;
  subText?: string;
  enabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        enabled && !isLoading ? styles.enabled : styles.disabled,
        { backgroundColor: MonaColors.primary },
      ]}
      activeOpacity={0.9}
      disabled={!enabled || isLoading}
      onPress={enabled ? onPress : undefined}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#F4FCF5" />
      ) : (
        <Row>
          <Text style={styles.text}>{text}</Text>
          {imageUrl != null && subText != null && (
            <View style={styles.imageContainer}>
              <View style={styles.divider} />
              <View style={styles.subTextContainer}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <Text style={styles.subText}>{subText}</Text>
              </View>
            </View>
          )}
        </Row>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enabled: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    color: '#F4FCF5',
    fontWeight: '500',
    lineHeight: 20,
  },
  subText: {
    fontSize: 12,
    color: '#E7E8E6',
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.03,
  },
  body: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 26,
    marginHorizontal: 10,
    backgroundColor: MonaColors.white,
  },
  subTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
});

export default MonaButton;
