import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from './components/Header';
import CircularAvatar from '../../components/CircularAvatar';
import AppButton from '../../components/AppButton';
import { Colors } from '../../constants/Color';
import Row from '../../components/Row';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type StackParamList } from '../../App';
import SizedBox from '../../components/SizedBox';
import { isAuthenticated, PayWithMonaSDK } from 'pay-with-mona-react-native';
import AppDropdown from '../../components/AppDropdown';
import AnimatedIcon from '../../components/AnimatedIcon';
import { ArrowUp2, Edit } from 'iconsax-react-native';
import AppTextInput from '../../components/AppTextInput';
import { MMKV } from 'react-native-mmkv';
import { StorageKeys } from '../../config/storage-keys';
import { initiatePayment } from '../../services/api';

const formatMoney = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

enum MerchantSettings {
  MONA_SUCCESS = 'mona_success',
  DEBIT_SUCCESS = 'debit_success',
  WALLET_RECEIVE_IN_PROGRESS = 'wallet_received',
  WALLET_RECEIVE_COMPLETED = 'wallet_completed',
}

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const [amount, setAmount] = useState('20');
  const [apiKey, setApiKey] = useState<string>(
    __DEV__
      ? '9a8438ef3932de15131c5137c22754366fa7e7678fa6a4a36d3122301c852df4'
      : ''
  );
  const [showMerchantSettings, setShowMerchantSettings] = useState(false);
  const [checkoutSuccessEvent, setCheckoutSuccessEvent] = useState(
    MerchantSettings.WALLET_RECEIVE_COMPLETED
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dob: '',
    bvn: '',
    authenticated: false,
  });
  const checkoutSuccessData = [
    { label: 'Mona success', value: MerchantSettings.MONA_SUCCESS },
    { label: 'Debit success', value: MerchantSettings.DEBIT_SUCCESS },
    {
      label: 'Wallet receive in progress',
      value: MerchantSettings.WALLET_RECEIVE_IN_PROGRESS,
    },
    {
      label: 'Wallet receive completed',
      value: MerchantSettings.WALLET_RECEIVE_COMPLETED,
    },
  ];

  const handleFormDataChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFormDataClear = () => {
    setFormData({
      phoneNumber: '',
      firstName: '',
      lastName: '',
      middleName: '',
      dob: '',
      bvn: '',
      authenticated: false,
    });
  };

  const publicKey = 'mona_pub_5361ecf7';

  const authEventUpdate = useCallback(() => {
    const authenticated = isAuthenticated();
    handleFormDataChange('authenticated', authenticated);
  }, []);

  useEffect(() => {
    authEventUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //22425783414

  const appButtonStyle = [
    [styles.appButton, { opacity: Number(amount) >= 20 ? 1 : 0.5 }],
  ];
  // custom_tab_6839ed8a29782ba71a9af65a
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.subContainer}
        showsVerticalScrollIndicator={false}
      >
        <SizedBox height={20} />
        <Header
          data={formData}
          onChange={handleFormDataChange}
          onClear={handleFormDataClear}
        />
        <View style={styles.body}>
          <Row style={styles.header}>
            <CircularAvatar size={48} backgroundColor={Colors.primary}>
              {/* <Text style={styles.circularAvatarText}>NG</Text> */}
              <Image
                style={styles.circularAvatarImage}
                source={require('../../assets/ng_deals_logo.png')}
              />
            </CircularAvatar>
            <Text style={styles.headerText}>NGdeals</Text>
          </Row>
          <Text style={styles.subHeader}>Products</Text>
          <View style={styles.checkoutRow}>
            <AppButton
              style={appButtonStyle}
              text="Checkout"
              isLoading={loading}
              onPress={
                Number(amount) >= 20
                  ? async () => {

                      if (!apiKey || apiKey === '') {
                        Alert.alert('Error', 'Api Key is missing');
                        return;
                      }
                      setLoading(true);
                      const response = await initiatePayment({
                        amount: Number(amount) * 100,
                        merchantKey: publicKey,
                        phoneNumber: formData.phoneNumber,
                        bvn: formData.bvn,
                        dob: formData.dob,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        middleName: formData.middleName,
                        successRate: checkoutSuccessEvent,
                      });
                      await PayWithMonaSDK.initialize(
                        publicKey,
                        response.savedPaymentOptions
                      );
                      setLoading(false);

                      if (!response.transactionId) {
                        Alert.alert(
                          'Error',
                          'Unable to initialize payment, Try again'
                        );
                        return;
                      }

                      navigation.push('Checkout', {
                        amount,
                        transactionId: response.transactionId,
                        savedPaymentOptions: response.savedPaymentOptions,
                        onAuthUpdate: authEventUpdate,
                      });
                    }
                  : undefined
              }
            />
            <View style={styles.checkoutInputRow}>
              <Text>₦</Text>
              <TextInput
                placeholder="1,000"
                keyboardType="phone-pad"
                value={amount}
                onChangeText={(text) => {
                  const formatted = formatMoney(text);
                  setAmount(formatted);
                }}
                maxLength={7}
                placeholderTextColor={Colors.gray}
                style={styles.checkoutInput}
              />
              <Edit color={Colors.primary} size={20} />
            </View>
          </View>
          <AppButton
            text="Collections"
            onPress={() => {

              if (!apiKey || apiKey === '') {
                Alert.alert('Error', 'Merchant Secret Key is missing');
                return;
              }
              navigation.push('Collections', {
                ...formData,
              });
            }}
          />
        </View>
        <SizedBox height={20} />
        <View style={styles.merchantSettings}>
          <Row style={styles.merchantSettingsRow}>
            <Text style={styles.merchantSettingsText}>Merchant Settings</Text>
            <TouchableOpacity
              onPress={() => setShowMerchantSettings((prev) => !prev)}
            >
              <AnimatedIcon animatedToValue={showMerchantSettings ? 1 : 0}>
                <ArrowUp2 size={20} color={Colors.black} />
              </AnimatedIcon>
            </TouchableOpacity>
          </Row>

          {showMerchantSettings && (
            <View>
              <SizedBox height={20} />

              <AppDropdown
                title="Checkout success event"
                data={checkoutSuccessData}
                value={checkoutSuccessEvent}
                onChanged={setCheckoutSuccessEvent}
              />
              <SizedBox height={20} />
              <AppTextInput
                style={{ flex: 1 }}
                title="API Key"
                hasTrailingIcon={false}
                value={apiKey}
                onChangeText={setApiKey}
              />
              <SizedBox height={10} />
              <AppButton
                text="Submit"
                onPress={() => {
                  if (apiKey.length < 15) {
                    Alert.alert('Error', 'Enter a valid Key');
                    return;
                  }
                  if (apiKey !== '') {
                    const storage = new MMKV();
                    storage.set(StorageKeys.secretKey, apiKey);
                  }
                  Alert.alert('Success', 'Key saved successfully');
                  return;
                }}
              />
            </View>
          )}
        </View>
        <SizedBox height={20} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  subContainer: { backgroundColor: '#F2F2F3', flex: 1 },
  text: {
    fontSize: 25,
    color: '#333',
  },
  body: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
  circularAvatarText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '400',
    fontFamily: 'NeueMontreal-Regular',
    letterSpacing: -0.48,
  },
  circularAvatarImage: {
    height: 48,
    width: 48,
    borderRadius: 48 / 2,
  },
  header: { gap: 20 },
  headerText: {
    fontSize: 36,
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Medium',
  },
  subHeader: {
    fontSize: 16,
    paddingVertical: 40,
    fontWeight: '500',
    fontFamily: 'NeueMontreal-Medium',
  },
  checkoutRow: {
    gap: 10,
    marginBottom: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  checkoutInputRow: {
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
    flex: 1,
  },
  checkoutInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'NeueMontreal-Medium',
    fontWeight: '500',
  },
  appButton: {
    flex: 3,
  },
  merchantSettings: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 8,
  },
  merchantSettingsRow: { justifyContent: 'space-between' },
  merchantSettingsText: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'NeueMontreal-Medium',
    lineHeight: 24,
    letterSpacing: -0.48,
  },
});

export default HomeScreen;
