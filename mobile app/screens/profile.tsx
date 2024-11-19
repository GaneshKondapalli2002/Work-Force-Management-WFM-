import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [skills, setSkills] = useState('');
  const [idOptions, setIdOptions] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedAddress = await AsyncStorage.getItem('userAddress');
      const storedCity = await AsyncStorage.getItem('userCity');
      const storedPincode = await AsyncStorage.getItem('userPincode');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedQualifications = await AsyncStorage.getItem('userQualifications');
      const storedSkills = await AsyncStorage.getItem('userSkills');
      const storedIdOptions = await AsyncStorage.getItem('userIdOptions');

      setName(storedName || '');
      setEmail(storedEmail || '');
      setAddress(storedAddress || '');
      setCity(storedCity || '');
      setPincode(storedPincode || '');
      setPhone(storedPhone || '');
      setQualifications(storedQualifications || '');
      setSkills(storedSkills || '');
      setIdOptions(storedIdOptions || '');
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userAddress', address);
    await AsyncStorage.setItem('userCity', city);
    await AsyncStorage.setItem('userPincode', pincode);
    await AsyncStorage.setItem('userPhone', phone);
    await AsyncStorage.setItem('userQualifications', qualifications);
    await AsyncStorage.setItem('userSkills', skills);
    await AsyncStorage.setItem('userIdOptions', idOptions);
    alert('Profile saved');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Address:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      <Text style={styles.label}>City:</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
      />
      <Text style={styles.label}>Pincode:</Text>
      <TextInput
        style={styles.input}
        value={pincode}
        onChangeText={setPincode}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Phone:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Qualifications:</Text>
      <TextInput
        style={styles.input}
        value={qualifications}
        onChangeText={setQualifications}
      />
      <Text style={styles.label}>Skills:</Text>
      <TextInput
        style={styles.input}
        value={skills}
        onChangeText={setSkills}
      />
      <Text style={styles.label}>ID Options:</Text>
      <TextInput
        style={styles.input}
        value={idOptions}
        onChangeText={setIdOptions}
      />
      <Pressable style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#69DCCE',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Profile;
