import { Pressable, StyleSheet, Text, View } from 'react-native';
import CircularAvatar from './CircularAvatar';
import Row from './Row';
import SizedBox from './SizedBox';
import Column from './Column';
import { MonaColors } from '../utils/config';

const CardTile = ({
  name,
  subTitle,
  isSelected = false,
  onPress,
}: {
  name: string;
  subTitle: string;
  isSelected: boolean;
  onPress?: () => void;
}) => {
  return (
    <Pressable onPress={onPress}>
      <Row>
        <CircularAvatar size={36}>
          <View />
          {/* <Image source={{ uri: logo }} style={{ width: 36, height: 36 }} /> */}
        </CircularAvatar>
        <SizedBox width={20} />
        <Column style={{ flex: 1 }}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subTitle}> Account - {subTitle}</Text>
        </Column>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner}></View>}
        </View>
      </Row>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonaColors.white,
    padding: 20,
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
});

export default CardTile;
