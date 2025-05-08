import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const Row = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Row;
