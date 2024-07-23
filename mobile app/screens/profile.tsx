import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import axiosInstance from '../axios-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShapesIcon from '../components/ShapesIcon';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    _id: '',
    name: '',
    email: '',
    profile: {
      address: '',
      city: '',
      pincode: '',
      phone: '',
      qualifications: '',
      skills: '',
      idOptions: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false); // Flag for edit mode
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('Error fetching profile. Token is missing.');
        setLoading(false);
        return;
      }
      const response = await axiosInstance.get('/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProfileData(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setMessage('Error fetching profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setMessage('Error updating profile. Token is missing.');
        setLoading(false);
        return;
      }
      const response = await axiosInstance.put('/profile/me', profileData.profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProfileData(response.data);
      setEditMode(false); // Exit edit mode after successful update
      setMessage('Profile updated successfully.');
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setProfileData({
      ...profileData,
      profile: {
        ...profileData.profile,
        [key]: value,
      },
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#69DCCE" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
      <Text style={styles.title}>Profile</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          editable={editMode}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          editable={editMode}
        />
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={profileData.profile.address}
          onChangeText={(value) => handleInputChange('address', value)}
          editable={editMode}
        />
        {/* Add other profile fields here */}
      </View>
      {!editMode ? (
        <Pressable style={styles.button} onPress={() => setEditMode(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={handleSaveProfile} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </Pressable>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#69DCCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    color: 'red',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default Profile;
