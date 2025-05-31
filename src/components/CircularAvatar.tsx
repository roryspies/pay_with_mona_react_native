import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const CircularAvatar = ({
  children,
  style,
  size = 40,
  backgroundColor = '#ccc',
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  size?: number;
  backgroundColor?: string;
}) => {
  return (
    <View
      style={[
        styles.container,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 25,
    color: '#333',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackgroud: {
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default CircularAvatar;
