import { type SubscriptionFormData } from '../../../types/SubscriptionFormData';
import AppDropdown, { type AppDropdownType } from '../../../components/AppDropdown';
import AppTextInput from '../../../components/AppTextInput';
import DateInput from '../../../components/DateInput';
import { View } from 'react-native';
import { SubscriptionFrequency } from 'pay-with-mona-react-native';

const SubscriptionCollectionView = ({
  data,
  onChange,
}: {
  data: SubscriptionFormData;
  onChange: (
    field: keyof SubscriptionFormData,
    value: SubscriptionFormData[keyof SubscriptionFormData]
  ) => void;
}) => {
  const frequencyOptions: AppDropdownType<SubscriptionFrequency>[] = [
    { label: 'Weekly', value: SubscriptionFrequency.WEEKLY },
    { label: 'Monthly', value: SubscriptionFrequency.MONTHLY },
    { label: 'Quarterly', value: SubscriptionFrequency.QUARTERLY },
    { label: 'Semiannual', value: SubscriptionFrequency.SEMIANNUAL },
    { label: 'Annual', value: SubscriptionFrequency.ANNUAL },
  ];

  return (
    <View>
      <AppDropdown
        title="Frequency"
        data={frequencyOptions}
        value={data.frequency}
        onChanged={(value) => onChange('frequency', value)}
      />
      <AppTextInput
        title="Total debit limit"
        keyboardType="number-pad"
        value={data.debitLimit}
        onChangeText={(value) => onChange('debitLimit', value)}
      />
      <AppTextInput
        title="Amount"
        keyboardType="number-pad"
        value={data.amount}
        onChangeText={(value) => onChange('amount', value)}
      />
      <DateInput
        title="Start date"
        value={data.startDate}
        onChange={(value) => onChange('startDate', value)}
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
    </View>
  );
};
export default SubscriptionCollectionView;
