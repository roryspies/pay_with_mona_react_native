import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../constants/Color';

const AppButton = ({
  style,
  text,
  isLoading = false,
  onPress,
}: {
  style?: StyleProp<ViewStyle>;
  text: string;
  isLoading?: boolean;
  onPress?: () => void;
}) => {
  const containerStyle = [
    styles.container,
    style,
    { opacity: isLoading ? 0.5 : 1 },
  ];
  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#F4FCF5" />
      ) : (
        <Text style={styles.text}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#F4FCF5',
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Medium',
    lineHeight: 20,
  },
  body: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default AppButton;
