import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Row from '../../../components/Row';

const CollectionDetailTile = ({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: ImageSourcePropType;
}) => {
  return (
    <Row style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Row>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
});

export default CollectionDetailTile;
