import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Color';
import AppDropdown from '../../components/AppDropdown';
import SizedBox from '../../components/SizedBox';
import AppButton from '../../components/AppButton';
import AppBar from '../../components/AppBar';
import {
  type BankOptions,
  type FetchCollectionResponse,
  PayWithMonaSDK,
  TimeFactor,
} from 'pay-with-mona-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AnimatedIcon from '../../components/AnimatedIcon';
import { ArrowCircleDown } from 'iconsax-react-native';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { type StackParamList } from '../../App';
import { fetchCollections, triggerCollections } from '../../services/api';

type LoadingState = {
  create: boolean;
  pii: boolean;
  collections: boolean;
};

const CollectionScheduledScreen = () => {
  const timeFactorData = [
    { label: '1 day', value: TimeFactor.DAY },
    {
      label: '1 week',
      value: TimeFactor.WEEK,
    },
    {
      label: '1 month',
      value: TimeFactor.MONTH,
    },
  ];
  const route = useRoute<RouteProp<StackParamList, 'CollectionScheduled'>>();
  const { phoneNumber, dob, bvn } = route.params;
  const [timeFactor, setTimeFactor] = useState<TimeFactor | null>();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    create: false,
    pii: false,
    collections: false,
  });
  const handleSetLoadingState = useCallback(
    (update: Partial<LoadingState>) =>
      setLoadingState((prev) => ({ ...prev, ...update })),
    []
  );
  const [collections, setCollections] =
    useState<FetchCollectionResponse | null>(null);
  const [piiData, setPiiData] = useState<BankOptions[] | null>(null);
  const [selectedPii, setSelectedPii] = useState<any | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const handleTriggerCollection = useCallback(async () => {
    if (timeFactor == null) {
      return;
    }
    handleSetLoadingState({ create: true });
    try {
      let timefactor: number;
      switch (timeFactor) {
        case TimeFactor.DAY:
          timefactor = 24 * 60;
          break;
        case TimeFactor.WEEK:
          timefactor = 7 * 24 * 60;
          break;
        case TimeFactor.MONTH:
          timefactor = 30 * 24 * 60;
          break;
      }
      const response = await triggerCollections({
        timeFactor: timefactor,
      });
      console.log(response);
      Alert.alert('Success', 'Collection triggered successfully');
    } catch (e) {
      Alert.alert('Error', 'Collection triggered failed');
    } finally {
      handleSetLoadingState({ create: false });
    }
  }, [timeFactor, handleSetLoadingState]);

  const handleFetchCollections = useCallback(
    async (bankId: string) => {
      try {
        handleSetLoadingState({ collections: true });
        const response = await fetchCollections(bankId);
        setCollections(response.data);
      } catch (e) {
        console.log('NGdeals', e);
        setFetchError(' No entries for this colleciton.');
      } finally {
        handleSetLoadingState({ collections: false });
      }
    },
    [handleSetLoadingState]
  );

  const handleValidatePII = useCallback(async () => {
    try {
      handleSetLoadingState({ pii: true });
      const response = await PayWithMonaSDK.validatePII({
        phoneNumber: phoneNumber,
        bvn,
        dob,
      });
      if (response?.success) {
        setPiiData(response?.data.savedPaymentOptions.bank ?? []);
      }
    } catch (e) {
      console.log('NGdeals', e);
    } finally {
      handleSetLoadingState({ pii: false });
    }
  }, [phoneNumber, dob, bvn, handleSetLoadingState]);

  useEffect(() => {
    handleValidatePII();
  }, [handleValidatePII]);
  console.log(loadingState.pii);

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Collection scheduled" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <>
          {loadingState.pii && <ActivityIndicator />}
          {piiData && (
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={piiData.map((pii) => ({
                value: pii.bankId,
                logo: pii.logo,
                label: `${pii.bankName} - ${pii.accountNumber}`,
              }))}
              renderItem={(item, _) => (
                <View style={{ flexDirection: 'row', padding: 20 }}>
                  <Image
                    source={{ uri: item.logo }}
                    style={{
                      height: 20,
                      width: 20,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'GeneralSans-Medium',
                      lineHeight: 20,
                      letterSpacing: -0.48,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Bank"
              value={selectedPii}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setIsFocus(false);
                setSelectedPii(item);
                handleFetchCollections(item.value);
              }}
              renderRightIcon={() => (
                <AnimatedIcon animatedToValue={isFocus ? 1 : 0}>
                  <ArrowCircleDown size={20} color={Colors.primary} />
                </AnimatedIcon>
              )}
            />
          )}
          <SizedBox height={20} />
        </>

        {loadingState.collections && (
          <ActivityIndicator style={{ marginBottom: 20 }} />
        )}
        {!loadingState.collections && collections && (
          <>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 20,
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#F2F3F3',
                }}
              >
                <Text>#</Text>
                <Text>Amount</Text>
                <Text>Reference</Text>
                <Text>Date and Time</Text>
              </View>

              {collections.requests.map((value, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F2F3F3',
                  }}
                >
                  <Text>{index + 1}</Text>
                  <Text>₦{Number(value.collection.maxAmount) / 100}</Text>
                  <Text>{value.collection.reference}</Text>
                  <Text>{new Date(value.createdAt).toLocaleString()}</Text>
                </View>
              ))}
            </View>
            <SizedBox height={30} />
          </>
        )}
        {fetchError && !collections && !loadingState.collections && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'GeneralSans-Medium',
              lineHeight: 20,
              letterSpacing: -0.48,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {fetchError}
          </Text>
        )}

        {collections && (
          <View style={styles.merchantSettings}>
            <AppDropdown
              title="1 minutes is equal to"
              data={timeFactorData}
              value={timeFactor}
              placeholder="Scheduled"
              onChanged={setTimeFactor}
            />
            <SizedBox height={20} />
            <AppButton
              text="Continue"
              isLoading={loadingState.create}
              onPress={handleTriggerCollection}
            />
          </View>
        )}
        {!collections && !piiData && (
          <Text
            style={{
              flex: 1,
              alignSelf: 'center',
              fontSize: 14,
              fontFamily: 'GeneralSans-Medium',
              lineHeight: 20,
              letterSpacing: -0.48,
            }}
          >
            No Collections Available
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  merchantSettings: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 8,
  },

  dropdown: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F7F8',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
  selectedTextStyle: {
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'GeneralSans-Medium',
    lineHeight: 20,
    letterSpacing: -0.48,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default CollectionScheduledScreen;
