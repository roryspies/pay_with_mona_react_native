import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import AppTextInput from '../../components/AppTextInput';
import SizedBox from '../../components/SizedBox';
import AppButton from '../../components/AppButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SegmentedButton, {
  type SegmentedButtonTab,
} from '../../components/SegmentedButton';
import {
  type CollectionResponse,
  CollectionType,
  DebitType,
  SubscriptionFrequency,
  useCollections,
} from 'pay-with-mona-react-native';
import { type SubscriptionFormData } from '../../types/SubscriptionFormData';
import SubscriptionCollectionView from './components/SubscriptionCollectionView';
import CollectionTextButton from './components/CollectionTextButton';
import ScheduledCollectionView from './components/ScheduledCollectionView';
import { type ScheduledEntries } from '../../types/ScheduledEntries';
import { type ScheduledFormData } from '../../types/ScheduledFormData';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type StackParamList } from '../../App';
import AppBar from '../../components/AppBar';
import {
  type ScheduledCollectionData,
  type SubscriptionCollectionData,
} from '../../types/ValidateCollectionData';
import { validateCollections } from '../../services/api';
import CollectionAutomationDialog from './modals/CollectionAutomationDialog';
import CollectionSuccessDialog from './modals/CollectionSuccessDialog';

const CollectionScreen = () => {
  const route = useRoute<RouteProp<StackParamList, 'Collections'>>();
  const { phoneNumber, dob, bvn } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const debitTypes: SegmentedButtonTab<DebitType>[] = useMemo(
    () => [
      { label: 'Merchant Initiated', value: DebitType.MERCHANT },
      { label: 'Mona Initiated', value: DebitType.MONA },
    ],
    []
  );

  const collectionTypes: SegmentedButtonTab<CollectionType>[] = useMemo(
    () => [
      { label: 'Scheduled', value: CollectionType.SCHEDULED },
      { label: 'Subscription', value: CollectionType.SUBSCRIPTION },
    ],
    []
  );
  const [selectedDebitType, setSelectedDebitType] = useState<DebitType>(
    DebitType.MERCHANT
  );
  const [selectedCollectionTab, setSelectedCollectionTab] =
    useState<CollectionType>(CollectionType.SCHEDULED);
  const [showAllFields, setShowAllFields] = useState(false);
  const [merchantName, setMerchantName] = useState('NGdeals');
  const [loading, setLoading] = useState(false);
  const [showCollectionSummary, setShowCollectionSummary] = useState(false);
  const [collection, setCollection] = useState<CollectionResponse | null>(null);
  const [accessRequestId, setAccessRequestId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const { initiate: initiateCollection, loading: collectionLoading } =
    useCollections({
      onDone: () => {
        setShowSuccess(true);
      },
    });

  const [scheduledFormData, setScheduledFormData] = useState<ScheduledFormData>(
    {
      debitLimit: '',
      expirationDate: null,
      reference: '',
      scheduledEntries: [
        {
          amount: '',
          date: null,
        },
      ],
    }
  );

  const [subscriptionFormData, setSubscriptionFormData] =
    useState<SubscriptionFormData>({
      amount: '',
      debitLimit: '',
      frequency: null,
      startDate: null,
      expirationDate: null,
      reference: '',
    });

  const handleSubscriptionChange = (
    field: keyof SubscriptionFormData,
    value: SubscriptionFormData[keyof SubscriptionFormData]
  ) => setSubscriptionFormData((prev) => ({ ...prev, [field]: value }));

  const handleScheduledFormDataChange = useCallback(
    (
      field: keyof ScheduledFormData,
      value: ScheduledFormData[keyof ScheduledFormData]
    ) => setScheduledFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleAddScheduledEntries = useCallback(() => {
    setScheduledFormData((prev) => ({
      ...prev,
      scheduledEntries: [
        ...prev.scheduledEntries,
        {
          amount: '',
          date: null,
        },
      ],
    }));
  }, []);
  const handleRemoveScheduledEntries = useCallback(
    (index: number) =>
      setScheduledFormData((prev) => ({
        ...prev,
        scheduledEntries: prev.scheduledEntries.filter(
          (_, i) => i + 1 !== index
        ),
      })),
    []
  );

  const handleScheduledEntriesChange = useCallback(
    (
      index: number,
      field: keyof ScheduledEntries,
      value: ScheduledEntries[keyof ScheduledEntries]
    ) => {
      setScheduledFormData((prev) => {
        const updatedEntries = [...prev.scheduledEntries];
        const currentEntry = updatedEntries[index - 1];

        if (!currentEntry) {
          return prev;
        }
        updatedEntries[index - 1] = {
          ...currentEntry,
          [field]: value,
        };
        return {
          ...prev,
          scheduledEntries: updatedEntries,
        };
      });
    },
    []
  );

  // const handleSDKDone = useCallback(() => {
  //   navigation.replace('CollectionScheduled', {
  //     phoneNumber,
  //     dob,
  //     bvn,
  //   });
  // }, [navigation, phoneNumber, dob, bvn]);

  const handleValidateCollection = useCallback(async () => {
    try {
      setLoading(true);
      const schExpiryDate = scheduledFormData.expirationDate;
      const schStartDate = scheduledFormData.scheduledEntries[0]?.date;

      const subExpiryDate = subscriptionFormData.expirationDate;
      const subStartDate = subscriptionFormData.startDate;

      const expiryDate =
        selectedCollectionTab === CollectionType.SCHEDULED
          ? schExpiryDate
          : subExpiryDate;
      const startDate =
        selectedCollectionTab === CollectionType.SCHEDULED
          ? schStartDate
          : subStartDate;
      const maximumAmount =
        selectedCollectionTab === CollectionType.SCHEDULED
          ? scheduledFormData.debitLimit
          : subscriptionFormData.debitLimit;
      const reference =
        selectedCollectionTab === CollectionType.SCHEDULED
          ? scheduledFormData.reference
          : subscriptionFormData.reference;
      const scheduledConfig: ScheduledCollectionData = {
        maximumAmount: maximumAmount,
        expiryDate: expiryDate!.toISOString(),
        startDate: startDate!.toISOString(),
        monthlyLimit: scheduledFormData.scheduledEntries[0]?.amount as string,
        reference: reference,
        type: selectedCollectionTab,
        amount: subscriptionFormData.amount,
        debitType: selectedDebitType,
        scheduleEntries: scheduledFormData.scheduledEntries,
      };

      const subscriptionConfig: SubscriptionCollectionData = {
        maximumAmount: maximumAmount,
        expiryDate: expiryDate!.toISOString(),
        startDate: startDate!.toISOString(),
        reference: reference,
        type: selectedCollectionTab,
        frequency:
          subscriptionFormData.frequency ?? SubscriptionFrequency.WEEKLY,
        amount: subscriptionFormData.amount,
        debitType: selectedDebitType,
      };
      const response = await validateCollections({
        ...subscriptionConfig,
        ...scheduledConfig,
      });
      if (response.success) {
        console.log(response.data.collection);

        setCollection(response.data.collection);
        setAccessRequestId(response.data.id);
        setShowCollectionSummary(true);
      } else {
        Alert.alert('Error', 'Unable to validate collections');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Unable to validate collections'
      );
    } finally {
      setLoading(false);
    }
  }, [
    scheduledFormData.debitLimit,
    scheduledFormData.expirationDate,
    scheduledFormData.reference,
    scheduledFormData.scheduledEntries,
    selectedCollectionTab,
    selectedDebitType,
    subscriptionFormData.amount,
    subscriptionFormData.debitLimit,
    subscriptionFormData.expirationDate,
    subscriptionFormData.frequency,
    subscriptionFormData.reference,
    subscriptionFormData.startDate,
  ]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subContainer}>
        <AppBar title="Collections" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <AppTextInput
                title="Merchant Name"
                hasTrailingIcon={false}
                value={merchantName}
                onChangeText={setMerchantName}
              />
              <SizedBox height={5} />
              <CollectionInputTitle title="Debit Type" />
              <SegmentedButton
                tabs={debitTypes}
                onTabChanged={(value, _) => setSelectedDebitType(value)}
                selectedTab={selectedDebitType}
              />
              <SizedBox height={10} />
              <CollectionInputTitle title="Collection Type" />
              <SegmentedButton
                tabs={collectionTypes}
                onTabChanged={(value, _) => setSelectedCollectionTab(value)}
                selectedTab={selectedCollectionTab}
              />
              <SizedBox height={5} />
              {showAllFields &&
                selectedCollectionTab === CollectionType.SCHEDULED && (
                  <ScheduledCollectionView
                    data={scheduledFormData}
                    onChange={handleScheduledFormDataChange}
                    onAddScheduledEntries={handleAddScheduledEntries}
                    onRemoveScheduledEntries={handleRemoveScheduledEntries}
                    onScheduledEntriesChange={handleScheduledEntriesChange}
                  />
                )}
              {showAllFields &&
                selectedCollectionTab === CollectionType.SUBSCRIPTION && (
                  <SubscriptionCollectionView
                    data={subscriptionFormData}
                    onChange={handleSubscriptionChange}
                  />
                )}

              <SizedBox height={20} />
              <AppButton
                text="Continue"
                isLoading={loading}
                onPress={async () => {
                  if (!showAllFields) {
                    setShowAllFields(true);
                    return;
                  }
                  await handleValidateCollection();
                }}
              />
              <CollectionTextButton
                text="See existing collections"
                onPress={() =>
                  navigation.push('CollectionScheduled', {
                    phoneNumber,
                    dob,
                    bvn,
                  })
                }
              />
            </View>
            <SizedBox height={50} />
          </ScrollView>
        </KeyboardAvoidingView>

        {showCollectionSummary && collection && (
          <CollectionAutomationDialog
            visible={showCollectionSummary}
            setVisible={setShowCollectionSummary}
            loading={collectionLoading}
            collection={{
              ...collection,
              merchantName,
              type: selectedCollectionTab,
            }}
            onSubmit={async () => {
              if (!accessRequestId) {
                return;
              }

              await initiateCollection({ accessRequestId: accessRequestId! });
              setShowCollectionSummary(false);
            }}
          />
        )}

        {showSuccess && collection && (
          <CollectionSuccessDialog
            visible={showSuccess}
            setVisible={setShowSuccess}
            loading={false}
            collection={{
              ...collection,
              merchantName,
              type: selectedCollectionTab,
            }}
            onSubmit={() => {
              navigation.replace('CollectionScheduled', {
                phoneNumber,
                dob,
                bvn,
              });
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const CollectionInputTitle = ({ title }: { title: string }) => {
  return <Text style={styles.inputTitle}>{title}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  subContainer: { backgroundColor: '#F2F2F3', flex: 1 },

  contentContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputTitle: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '400',
    fontFamily: 'GeneralSans-Light',
  },
});

export default CollectionScreen;
