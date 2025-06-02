import { type ScheduledEntries } from '../../../types/ScheduledEntries';
import { type ScheduledFormData } from '../../../types/ScheduledFormData';
import { Pressable, View } from 'react-native';
import Row from '../../../components/Row';
import { Add } from 'iconsax-react-native';
import ScheduledPaymentTile from './ScheduledPaymentTile';
import AppTextInput from '../../../components/AppTextInput';
import DateInput from '../../../components/DateInput';
import CollectionTextButton from './CollectionTextButton';

const ScheduledCollectionView = ({
  data,
  onChange,
  onAddScheduledEntries,
  onRemoveScheduledEntries,
  onScheduledEntriesChange,
}: {
  data: ScheduledFormData;
  onChange: (
    field: keyof ScheduledFormData,
    value: ScheduledFormData[keyof ScheduledFormData]
  ) => void;
  onAddScheduledEntries: () => void;
  onRemoveScheduledEntries: (index: number) => void;
  onScheduledEntriesChange: (
    index: number,
    field: keyof ScheduledEntries,
    value: ScheduledEntries[keyof ScheduledEntries]
  ) => void;
}) => {
  return (
    <View>
      <AppTextInput
        title="Total debit limit"
        value={data.debitLimit}
        onChangeText={(value) => onChange('debitLimit', value)}
        keyboardType="number-pad"
      />
      <DateInput
        title="Expiration date"
        value={data.expirationDate}
        onChange={(value) => onChange('expirationDate', value)}
      />
      <AppTextInput
        title="Reference"
        value={data.reference}
        onChangeText={(value) => onChange('reference', value)}
      />
      {data.scheduledEntries.map((value, index) => (
        <ScheduledPaymentTile
          key={index}
          index={index + 1}
          data={value}
          onRemove={onRemoveScheduledEntries}
          onChange={onScheduledEntriesChange}
        />
      ))}
      <Pressable
        onPress={onAddScheduledEntries}
        style={{
          padding: 20,
          flex: 1,
        }}
      >
        <Row>
          <Add size={20} color="#000000" />

          <CollectionTextButton text="Add payment" disabled={true} />
        </Row>
      </Pressable>
    </View>
  );
};
export default ScheduledCollectionView;
