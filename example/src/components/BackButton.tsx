import { type StackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft2 } from 'iconsax-react-native';
import { TouchableOpacity } from 'react-native';

const BackButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <ArrowLeft2 size={24} color="#090901" />
    </TouchableOpacity>
  );
};

export default BackButton;
