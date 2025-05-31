import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

const AppButton = ({ style, text }: { style?: ViewStyle; text: string }) => {
  return (
    <TouchableOpacity style={[styles.container, style]}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4FCF5',
    padding: 20,
    borderRadius: 4,
    alignItems: 'center',
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
