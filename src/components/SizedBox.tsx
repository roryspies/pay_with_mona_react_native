import { View } from 'react-native';

const SizedBox = ({ width, height }: { width?: number; height?: number }) => {
  return <View style={{ height: height, width: width }} />;
};
export default SizedBox;
