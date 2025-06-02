import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import BackButton from './BackButton';

const AppBar = ({title}: {title: string}) => {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    padding: 20,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GeneralSans-SemiBold',
    lineHeight: 24,
    letterSpacing: -0.48,
  },
});

export default AppBar;
