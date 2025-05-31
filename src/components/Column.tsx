import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const Column = ({
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
    flexDirection: 'column',
  },
});

export default Column;
