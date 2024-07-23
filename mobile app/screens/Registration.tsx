import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import ShapesIcon from '../components/ShapesIcon';
import Notifications from '../components/Notifications';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Image } from "expo-image";

const Registration = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user'); // Default role is 'user'

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://192.168.29.184:5000/api/auth/register', {
        name,
        email,
        password,
        confirmPassword,
        role, // Include role in the request payload
      });

      console.log(response.data);
      navigation.navigate('OTPVerification', { email });
    } catch (error: any) {
      console.error('Registration failed:', error.response ? error.response.data.msg : error.message);
      setMessage('Registration failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setMessage('');
    if (!name || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    handleRegister();
  };

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
      <Notifications />
      <Image
        style={styles.undrawMobileContentXvgr1Icon}
        source={require("../assets/register.svg")}
      />
      <Text style={styles.title}>Register</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input]}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input]}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input]}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input]}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Select Role:</Text>
          <View style={styles.radioOption}>
            <Text>User</Text>
            <Pressable onPress={() => setRole('user')} style={[styles.radioButton, role === 'user' && styles.radioButtonSelected]} />
          </View>
          <View style={styles.radioOption}>
            <Text>Admin</Text>
            <Pressable onPress={() => setRole('admin')} style={[styles.radioButton, role === 'admin' && styles.radioButtonSelected]} />
          </View>
        </View>
      </View>
      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 100, // Rounded edges
    paddingLeft: 10,
    marginBottom: 10,
  },
  radioContainer: {
    marginBottom: 20,
  },
  radioLabel: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#1FBAA7',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#69DCCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Rounded edges
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    color: 'red', // Use your error message color
  },
  link: {
    marginTop: 20,
    color: '#1E90FF', // Use your link color
    textDecorationLine: 'underline',
  },
  undrawMobileContentXvgr1Icon: {
    width: 245,
    height: 233,
    marginBottom: 20,
  },
});

export default Registration;
