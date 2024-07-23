import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import ShapesIcon from '../components/ShapesIcon';
import instance from '../axios-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  checkedIn: boolean;
  checkedOut: boolean;
}

type DashboardProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<DashboardProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([]);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('open');

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const allJobs = response.data;

        // Filter job posts based on their status
        const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');
        const completedJobs = allJobs.filter((job: JobPost) => job.status === 'completed');
        const upcomingJobs = allJobs.filter((job: JobPost) => job.status === 'upcoming');

        // Set job posts and filtered job posts based on activeSection
        setJobPosts(allJobs);

        switch (activeSection) {
          case 'open':
            setFilteredJobPosts(openJobs);
            break;
          case 'completed':
            setFilteredJobPosts(completedJobs);
            break;
          case 'upcoming':
            setFilteredJobPosts(upcomingJobs);
            break;
          default:
            setFilteredJobPosts(openJobs); // Default to open jobs
            break;
        }
      } catch (error: any) {
        console.error('Error fetching job posts:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to fetch job posts');
      }
    };

    fetchJobPosts();
  }, [activeSection]);

  const toggleModal = () => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: -300, // Adjust the slide-out value
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    } else {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Adjust the slide-in value
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredJobPosts(jobPosts);
    } else {
      const filtered = jobPosts.filter((post) =>
        post.JobDescription.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredJobPosts(filtered);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      const response = await instance.put(`/jobPosts/accept/${jobId}`);
      if (response.status === 200) {
        // Update job status to 'upcoming' locally
        const updatedJobPosts = jobPosts.map((job) =>
          job._id === jobId ? { ...job, status: 'upcoming' } : job
        );
        setJobPosts(updatedJobPosts);

        // Fetch updated list of open jobs
        const openJobsResponse = await instance.get('/jobPosts');
        const allJobs = openJobsResponse.data;
        const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');

        setFilteredJobPosts(openJobs);

        Alert.alert('Success', 'Job accepted successfully!');
      } else {
        throw new Error('Failed to accept job');
      }
    } catch (error: any) {
      console.error('Error accepting job:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to accept job');
    }
  };

  const checkInJob = async (jobId: string) => {
    try {
      const response = await instance.put(`/jobPosts/checkIn/${jobId}`);
      if (response.status === 200) {
        const updatedJobPosts = jobPosts.map((job) =>
          job._id === jobId ? { ...job, status: 'checkedIn', checkedIn: true } : job
        );
        setJobPosts(updatedJobPosts);
        const filteredJobs = updatedJobPosts.filter((job) => job.status === 'checkedIn');
        setFilteredJobPosts(filteredJobs);
        Alert.alert('Success', 'Checked in successfully!');
      } else {
        throw new Error('Failed to check in job');
      }
    } catch (error: any) {
      console.error('Error checking in job:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to check in job');
    }
  };

  const checkOutJob = async (jobId: string) => {
    try {
      const response = await instance.put(`/jobPosts/checkOut/${jobId}`);
      if (response.status === 200) {
        const updatedJobPosts = jobPosts.map((job) =>
          job._id === jobId ? { ...job, status: 'completed', checkedOut: true } : job
        );
        setJobPosts(updatedJobPosts);
        const filteredJobs = updatedJobPosts.filter((job) => job.status === 'upcoming');
        setFilteredJobPosts(filteredJobs); // Update filtered job list

        Alert.alert('Success', 'Checked out successfully!');
      } else {
        throw new Error('Failed to check out job');
      }
    } catch (error: any) {
      console.error('Error checking out job:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to check out job');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const handleSectionPress = (section: string) => {
    setActiveSection(section);
    // Set filtered job posts based on section
    switch (section) {
      case 'open':
        setFilteredJobPosts(jobPosts.filter((job) => job.status === 'open'));
        break;
      case 'completed':
        setFilteredJobPosts(jobPosts.filter((job) => job.status === 'completed'));
        break;
      case 'upcoming':
        setFilteredJobPosts(jobPosts.filter((job) => job.status === 'upcoming'));
        break;
      default:
        setFilteredJobPosts(jobPosts.filter((job) => job.status === 'open')); // Default to open jobs
        break;
    }
  };

  const getShiftIcon = (shift: string) => {
    if (shift.toLowerCase() === 'morning') {
      return <FontAwesome name="sun-o" size={20} color="#ffa500" />;
    } else if (shift.toLowerCase() === 'night') {
      return <FontAwesome name="moon-o" size={20} color="#0000ff" />;
    } else {
      return null; // Or return a default icon
    }
  };

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <FontAwesome name="search" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.menuIcon} onPress={toggleModal}>
            <FontAwesome name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.sectionsContainer}>
            <TouchableOpacity
              style={[styles.section, activeSection === 'open' && styles.activeSection]}
              onPress={() => handleSectionPress('open')}
            >
              <Text style={[styles.sectionText, activeSection === 'open' && styles.activeSectionText]}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.section, activeSection === 'completed' && styles.activeSection]}
              onPress={() => handleSectionPress('completed')}
            >
              <Text style={[styles.sectionText, activeSection === 'completed' && styles.activeSectionText]}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.section, activeSection === 'upcoming' && styles.activeSection]}
              onPress={() => handleSectionPress('upcoming')}
            >
              <Text style={[styles.sectionText, activeSection === 'upcoming' && styles.activeSectionText]}>Upcoming</Text>
            </TouchableOpacity>
          </View>

          {filteredJobPosts.map((post) => (
            <View key={post._id} style={styles.card}>
              <Text style={styles.cardTitle}> {post.JobDescription}</Text>    
              <Text style={styles.cardText}><Icon name="calendar" size={18} style={styles.icon} /> {post.Date}</Text>
              <Text style={styles.cardText}>{getShiftIcon(post.Shift)} {post.Shift}</Text>
              <Text style={styles.cardText}><Icon name="map-marker" size={18} style={styles.icon} /> {post.Location}</Text>
              <Text style={styles.infoText}><Icon name="clock-o" size={18} style={styles.icon}/> {post.Starttime} - {post.Endtime}</Text>
              <Text style={styles.cardText}><Icon name="dollar" size={18} style={styles.icon} /> {post.Payment}</Text>
              {activeSection === 'open' && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptJob(post._id)}
                >
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                </TouchableOpacity>
              )}
              {activeSection === 'upcoming' && !post.checkedIn && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => checkInJob(post._id)}
                >
                  <Text style={styles.acceptButtonText}>Check In</Text>
                </TouchableOpacity>
              )}
              {activeSection === 'upcoming' && post.checkedIn && !post.checkedOut && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => checkOutJob(post._id)}
                >
                  <Text style={styles.acceptButtonText}>Check Out</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('UserProfile')}>
            <Text style={styles.modalItemText}>User Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.modalItemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('JobPosts')}>
            <Text style={styles.modalItemText}>Job Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalItem} onPress={logout}>
            <Text style={styles.modalItemText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
    infoText: {
    flex: 1,
    marginLeft: 5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
    icon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
  },
  menuIcon: {
    marginLeft: 15,
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalItem: {
    paddingVertical: 15,
  },
  modalItemText: {
    fontSize: 18,
  },
  modalCloseButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  section: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeSection: {
    backgroundColor: '#4CAF50',
  },
  sectionText: {
    fontSize: 16,
  },
  activeSectionText: {
    color: '#fff',
  },
});

export default HomeScreen;
