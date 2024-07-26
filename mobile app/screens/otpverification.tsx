import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import axios from 'axios';
import ShapesIcon from '../components/ShapesIcon';
import Notifications from '../components/Notifications';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';

const OTPVerification = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const { email } = route.params as { email: string };

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://192.168.230.5:5000/api/auth/verify-otp', {
        email,
        otp,
      });

      console.log(response.data);
      if (response.status === 200) {
        setMessage('OTP verified successfully');
        navigation.navigate('Login'); // Navigate to Login screen after successful OTP verification
      } else {
        setMessage('OTP verification failed. Please try again.');
      }
    } catch (error:any) {
      console.error('OTP verification failed:', error.response ? error.response.data.msg : error.message);
      setMessage('OTP verification failed. Please try again.');
    }
  };

  const handleSubmit = () => {
    setMessage('');
    if (!otp || otp.length !== 4) {
      setMessage('Please enter a valid OTP');
      return;
    }
    handleVerifyOTP();
  };

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
      <Notifications />
      <Text style={styles.verificationCode}>Verification Code</Text>
      <Text style={styles.instruction}>
        We have sent the verification code to {email}
      </Text>
      <View style={styles.otpContainer}>
        {[1, 2, 3, 4].map((index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(text) => {
              if (/^\d+$/.test(text)) {
                setOtp((prevOtp) => prevOtp + text);
              }
            }}
          />
        ))}
      </View>
      <Pressable style={styles.rectangleButton} onPress={handleSubmit}>
        <Text style={styles.confirm}>Confirm</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
  },
  verificationCode: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  instruction: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 260,
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderColor: '#69DCCE',
    borderWidth: 1.6,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#323232',
  },
  rectangleButton: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#69DCCE',
    borderRadius: 25,
    shadowColor: 'rgba(255, 140.76, 76.50, 0.20)',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 14,
    marginBottom: 20,
  },
  confirm: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  message: {
    color: 'red',
    marginTop: 10,
  },
});

export default OTPVerification;
