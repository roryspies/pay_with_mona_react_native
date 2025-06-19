import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { MonaColors, withAlpha } from '../utils/theme';

const ProgressModal = () => {
  return (
    <View style={styles.container}>
      <ProgressBar
        size={70}
        strokeWidth={8}
        progressColor={MonaColors.primary}
        backgroundColor={withAlpha(MonaColors.primary, 0.1)}
        arcLength={30} // 30% of the circle
      />
      <Text style={styles.title}>Processing</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  title: {
    marginTop: 13,
    fontSize: 16,
    letterSpacing: -0.48,
    lineHeight: 24,
    color: '#6A6C60',
  },
});

export default ProgressModal;
