import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import instance from '../axios-instance'; // Make sure axios-instance is correctly configured
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface JobPost {
  _id: string;
  Date: string;
  Shift: string;
  Location: string;
  Starttime: string;
  Endtime: string;
  JobDescription: string;
  Payment: string;
  assignedTo?: string;
  status?: string;
}

type CompletedProps = {
  navigation: NavigationProp<ParamListBase>;
};

const Completed: React.FC<CompletedProps> = ({ navigation }) => {
  const [completedJobPosts, setCompletedJobPosts] = useState<JobPost[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCompletedJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const completedJobs = response.data.filter(
          (job: JobPost) => job.status === 'completed'
        );
        setCompletedJobPosts(completedJobs);
      } catch (error: any) {
        console.error('Error fetching completed job posts:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to fetch completed job posts');
      }
    };
    fetchCompletedJobPosts();
  }, []);
  
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter completedJobPosts based on search query
    const filtered = completedJobPosts.filter((post) =>
      post.JobDescription.toLowerCase().includes(query.toLowerCase())
    );
    setCompletedJobPosts(filtered);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.menuIcon} onPress={toggleModal}>
            <FontAwesome name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {completedJobPosts.length > 0 ? (
          completedJobPosts.map((post, index) => (
            <View key={index} style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoText}>{new Date(post.Date).toDateString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shift:</Text>
                <Text style={styles.infoText}>{post.Shift}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoText}>{post.Location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start time:</Text>
                <Text style={styles.infoText}>{post.Starttime}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>End time:</Text>
                <Text style={styles.infoText}>{post.Endtime}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Job Description:</Text>
                <Text style={styles.infoText}>{post.JobDescription}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment:</Text>
                <Text style={styles.infoText}>{post.Payment}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text>No completed job posts found</Text>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableOpacity style={styles.modalOverlay} onPress={toggleModal}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.modalItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.modalItemText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={logout}>
                <Text style={styles.modalItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Dashboard')}>
          <FontAwesome name="home" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <FontAwesome name="search" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('JobPostForm')}>
          <FontAwesome name="plus" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Post Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <FontAwesome name="user" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
 searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
   flex: 1,
    paddingVertical: 10,
  },
  menuIcon: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  infoContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  infoText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerIcon: {
    marginBottom: 5,
  },
  footerText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  modalItem: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontWeight: 'bold',
  },
});

export default Completed;
