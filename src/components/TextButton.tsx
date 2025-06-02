import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

const TextButton = ({
  text,
  style,
  disabled = false,
  onPress,
}: {
  text: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
    paddingVertical: 20,
    fontWeight: '500',
    fontFamily: 'GeneralSans-Medium',
  },
});
export default TextButton;
