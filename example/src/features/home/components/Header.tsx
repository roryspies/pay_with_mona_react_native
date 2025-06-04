import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import CircularAvatar from '../../../components/CircularAvatar';
import { ArrowUp2, User } from 'iconsax-react-native';
import { Colors } from '../../../constants/Color';
import Row from '../../../components/Row';
import Column from '../../../components/Column';
import AppTextInput from '../../../components/AppTextInput';
import { PayWithMonaSDK } from 'pay-with-mona-react-native';
import AnimatedIcon from '../../../components/AnimatedIcon';

const formatDob = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 10); // remove non-digits and limit to 10
  const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);

  if (!match) {
    return text;
  }

  let formatted = '';
  if (match[1]) {
    formatted += match[1];
  }
  if (match[2]) {
    formatted += '-' + match[2];
  }
  if (match[3]) {
    formatted += '-' + match[3];
  }
  return formatted;
};

type HeaderFormData = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  bvn: string;
  authenticated: boolean;
};

const Header = ({
  data,
  onChange,
  onClear,
}: {
  data: HeaderFormData;
  onChange: (
    field: keyof HeaderFormData,
    value: HeaderFormData[keyof HeaderFormData]
  ) => void;
  onClear: () => void;
}) => {
  const initialFields = {
    phoneNumber: data.phoneNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    middleName: data.middleName,
    dob: data.dob,
    bvn: data.bvn,
  };
  const [counter, setCounter] = useState(
    Object.values(initialFields).filter((value) => value !== '').length
  );
  const [showInputs, setShowInputs] = React.useState(false);

  const preFilledStatus = useRef<any>(
    Object.fromEntries(
      Object.entries(initialFields).map(([key, value]) => [key, value !== ''])
    )
  );

  useEffect(() => {
    const fields = {
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      dob: data.dob,
      bvn: data.bvn,
    };

    let updated = false;
    let delta = 0;

    for (const [key, value] of Object.entries(fields)) {
      const isFilled = value !== '';
      const wasFilled = preFilledStatus.current[key];

      if (isFilled !== wasFilled) {
        delta += isFilled ? 1 : -1;
        preFilledStatus.current[key] = isFilled;
        updated = true;
      }
    }

    if (updated && delta !== 0) {
      setCounter((prev) => prev + delta);
    }
  }, [data]);

  return (
    <Column style={styles.container}>
      <Row style={styles.header}>
        <Row style={styles.headerAvatar}>
          <CircularAvatar>
            <User color={Colors.primary} size={30} />
          </CircularAvatar>
          <Text style={styles.text}>
            {data.authenticated ? 'Signed in' : 'Not Signed in'}
          </Text>
        </Row>
        <TouchableOpacity
          onPress={() => {
            if (data.authenticated) {
              PayWithMonaSDK.signOut();
              onChange('authenticated', PayWithMonaSDK.isAuthenticated());
            } else {
              onClear();
            }
          }}
        >
          <Text style={styles.clearOrSignoutText}>
            {data.authenticated ? 'Sign out' : 'Clear'}
          </Text>
        </TouchableOpacity>
      </Row>
      {!data.authenticated && (
        <TouchableWithoutFeedback onPress={() => setShowInputs(!showInputs)}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 20,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '600',
                fontFamily: 'NeueMontreal-Bold',
              }}
            >
              Customer Info Provided
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CircularAvatar size={24} backgroundColor="#E7F5EC">
                <Text style={{ fontSize: 10 }}>{counter}</Text>
              </CircularAvatar>
              <AnimatedIcon animatedToValue={showInputs ? 1 : 0}>
                <ArrowUp2 color="#292D32" size={12} />
              </AnimatedIcon>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {showInputs && (
        <View>
          <AppTextInput
            title="Phone number"
            keyboardType="phone-pad"
            value={data.phoneNumber}
            maxLength={11}
            onChangeText={(value) => onChange('phoneNumber', value)}
          />
          <AppTextInput
            title="First name"
            value={data.firstName}
            onChangeText={(value) => onChange('firstName', value)}
          />
          <AppTextInput
            title="Middle name (optional)"
            value={data.middleName}
            onChangeText={(value) => onChange('middleName', value)}
          />
          <AppTextInput
            title="Last name"
            value={data.lastName}
            onChangeText={(value) => onChange('lastName', value)}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AppTextInput
              title="Date of Birth"
              keyboardType="numeric"
              value={data.dob}
              placeholder="DD/MM/YYYY"
              onChangeText={(value) => {
                const formatted = formatDob(value);
                onChange('dob', formatted);
              }}
              style={{ flex: 1 }}
              maxLength={10}
            />
            <AppTextInput
              title="BVN"
              keyboardType="numeric"
              maxLength={11}
              value={data.bvn}
              onChangeText={(value) => onChange('bvn', value)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </Column>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'NeueMontreal-Regular',
    lineHeight: 24,
    letterSpacing: -0.48,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  headerAvatar: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  clearOrSignoutText: {
    textDecorationLine: 'underline',
    fontFamily: 'NeueMontreal-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.48,
    color: '#131503',
    fontWeight: '400',
  },
});

export default Header;
