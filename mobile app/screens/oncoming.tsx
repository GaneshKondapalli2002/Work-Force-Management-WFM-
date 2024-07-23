import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
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

type UpcomingProps = {
  navigation: NavigationProp<ParamListBase>;
};

const Upcoming: React.FC<UpcomingProps> = ({ navigation }) => {
  const [upcomingJobPosts, setUpcomingJobPosts] = useState<JobPost[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUpcomingJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const upcomingJobs = response.data.filter(
          (job: JobPost) => job.status === 'upcoming'
        );
        setUpcomingJobPosts(upcomingJobs);
      } catch (error: any) {
        console.error('Error fetching upcoming job posts:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to fetch upcoming job posts');
      }
    };
    fetchUpcomingJobPosts();
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
    // Filter upcomingJobPosts based on search query
    const filtered = upcomingJobPosts.filter((post) =>
      post.JobDescription.toLowerCase().includes(query.toLowerCase())
    );
    setUpcomingJobPosts(filtered);
  };

  const checkIn = async (jobId: string) => {
    try {
      await instance.post(`/jobPosts/${jobId}/checkIn`);
      setUpcomingJobPosts(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId ? { ...job, status: 'checkedIn' } : job
        )
      );
    } catch (error: any) {
      console.error('Error checking in:', error.message);
      Alert.alert('Check In Failed', 'Failed to check in. Please try again.');
    }
  };

  const checkOut = async (jobId: string) => {
    try {
      await instance.post(`/jobPosts/${jobId}/checkOut`);
      setUpcomingJobPosts(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId ? { ...job, status: 'completed' } : job
        )
      );
    } catch (error: any) {
      console.error('Error checking out:', error.message);
      Alert.alert('Check Out Failed', 'Failed to check out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.jobListContainer}>
        {upcomingJobPosts.length > 0 ? (
          upcomingJobPosts.map((post, index) => (
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
              {post.status === 'upcoming' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.checkInButton}
                    onPress={() => checkIn(post._id)}
                  >
                    <Text style={styles.buttonText}>Check In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkOutButton}
                    onPress={() => checkOut(post._id)}
                  >
                    <Text style={styles.buttonText}>Check Out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text>No upcoming job posts found</Text>
        )}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
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
  jobListContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  checkOutButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    padding: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
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
});

export default Upcoming;
