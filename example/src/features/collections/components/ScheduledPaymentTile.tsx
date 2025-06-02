import { type ScheduledEntries } from '../../../types/ScheduledEntries';
import Row from '../../../components/Row';
import AppTextInput from '../../../components/AppTextInput';
import SizedBox from '../../../components/SizedBox';
import DateInput from '../../../components/DateInput';
import { Pressable } from 'react-native';
import { MinusCirlce } from 'iconsax-react-native';
import { Colors } from '../../../constants/Color';

const ScheduledPaymentTile = ({
  index,
  data,
  onChange,
  onRemove,
}: {
  index: number;
  data: ScheduledEntries;
  onChange: (
    index: number,
    field: keyof ScheduledEntries,
    value: ScheduledEntries[keyof ScheduledEntries]
  ) => void;
  onRemove?: (index: number) => void;
}) => {
  console.log('rebuilding!!!tile');
  return (
    <Row>
      <AppTextInput
        title={`Payment ${index}`}
        keyboardType="number-pad"
        style={{
          flex: 1,
        }}
        value={data.amount}
        onChangeText={(value) => onChange(index, 'amount', value)}
      />
      <SizedBox width={20} />
      <DateInput
        title="Date & Time"
        style={{
          flex: 1,
        }}
        value={data.date}
        onChange={(value) => onChange(index, 'date', value)}
      />
      {index !== 1 && (
        <>
          <SizedBox width={10} />
          <Pressable onPress={() => onRemove?.(index)}>
            <MinusCirlce size={20} color={Colors.black} />
          </Pressable>
        </>
      )}
    </Row>
  );
};
export default ScheduledPaymentTile;
