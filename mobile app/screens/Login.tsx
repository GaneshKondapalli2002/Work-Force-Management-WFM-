import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import axiosInstance from '../axios-instance'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "expo-image";
import ShapesIcon from '../components/ShapesIcon';

const Login = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
const handleLogin = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Check if user and role exist before storing
    if (user && user.role) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', user.role);

      // Navigate based on user role
      if (user.role === 'admin') {
        navigation.navigate('Admin'); // Replace with your admin screen name
      } else {
        navigation.navigate('Home'); // Replace with your home screen name
      }
    } else {
      console.error('User or role not found in login response:', response.data);
      setMessage('Invalid login response. Please try again.');
    }

  } catch (error: any) {
    console.error('Login failed:', error.response ? error.response.data.msg : error.message);
    setMessage('Invalid credentials. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
      <Image
        style={styles.undrawMobileContentXvgr1Icon}
        source={require("../assets/image.png")}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.link}>Don't have an account? Register here</Text>
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
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 100, // Rounded edges
    paddingLeft: 10,
    marginBottom: 10,
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

export default Login;
