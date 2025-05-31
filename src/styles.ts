import { StyleSheet } from 'react-native';
import { MonaColors } from './utils/config';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonaColors.white,
    padding: 20,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  subTitle: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
    lineHeight: 20,
  },
  radio: {
    borderColor: '#F2F2F3',
    borderWidth: 1,
    borderRadius: 50,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: MonaColors.primary,
  },
  radioInner: {
    height: 12,
    width: 12,
    backgroundColor: MonaColors.primary,
    borderRadius: 50,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  progressBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
