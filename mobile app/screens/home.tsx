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
  const [checkoutInputs, setCheckoutInputs] = useState<{ [key: string]: string }>({});
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const allJobs = response.data;

        // Filter job posts based on their status
        const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');
        const completedJobs = allJobs.filter((job: JobPost) => job.status === 'completed');
        const upcomingJobs = allJobs.filter((job: JobPost) => job.status === 'upcoming');
        const checkedInJobs = allJobs.filter((job: JobPost) => job.status === 'checkedIn');

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
          case 'checkedIn':
            setFilteredJobPosts(checkedInJobs);
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

  const sendNotification = async (userId: string, message: string) => {
    try {
      await instance.post('/notifications', { userId, message });
    } catch (error) {
      console.error('Error sending notification:', error);
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

        // Send notification to the assigned user
        const acceptedJob = jobPosts.find((job) => job._id === jobId);
        if (acceptedJob && acceptedJob.assignedTo) {
          sendNotification(acceptedJob.assignedTo, 'You have been assigned a new job.');
        }
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

  const handleCheckoutInput = (jobId: string, text: string) => {
    setCheckoutInputs((prevInputs) => ({
      ...prevInputs,
      [jobId]: text,
    }));
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
      return null;// return <ShapesIcon name="square" size={20} color="#ffa500" />;
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
          placeholder="Search by job description"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <TouchableOpacity style={styles.menuIcon} onPress={toggleModal}>
            <FontAwesome name="bars" size={24} color="black" />
          </TouchableOpacity>
          </View>
      
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'open' && styles.activeSectionButton]}
          onPress={() => handleSectionPress('open')}
        >
          <Text style={styles.sectionButtonText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'completed' && styles.activeSectionButton]}
          onPress={() => handleSectionPress('completed')}
        >
          <Text style={styles.sectionButtonText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'upcoming' && styles.activeSectionButton]}
          onPress={() => handleSectionPress('upcoming')}
        >
          <Text style={styles.sectionButtonText}>Upcoming</Text>
        </TouchableOpacity>
        
        
      </View>
      <ScrollView style={styles.jobList}>
        {filteredJobPosts.map((jobPost) => (
          <View key={jobPost._id} style={styles.jobPost}>
            <Text style={styles.jobTitle}>{jobPost.JobDescription}</Text>
             <Text style={styles.cardText}><Icon name="calendar" size={18} style={styles.icon} /> {jobPost.Date}</Text>
            <Text style={styles.jobDetails}>{jobPost.Shift}
              {getShiftIcon(jobPost.Shift)} 
            </Text>
            <Text style={styles.cardText}><Icon name="map-marker" size={18} style={styles.icon} /> {jobPost.Location}</Text>
              <Text style={styles.infoText}><Icon name="clock-o" size={18} style={styles.icon}/> {jobPost.Starttime} - {jobPost.Endtime}</Text>
              <Text style={styles.cardText}><Icon name="dollar" size={18} style={styles.icon} /> {jobPost.Payment}</Text>
            {jobPost.status === 'checkedIn' && (
              <View style={styles.checkedInContainer}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setIsTemplate(!isTemplate)}
                  >
                    <Text style={styles.checkboxText}>{isTemplate ? '✓' : ''}</Text>
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>Complete Feedback</Text>
                </View>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Enter feedback here"
                  onChangeText={(text) => handleCheckoutInput(jobPost._id, text)}
                />
              </View>
            )}
            <View style={styles.buttonsContainer}>
              {jobPost.status === 'open' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => acceptJob(jobPost._id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
              )}
              {jobPost.status === 'upcoming' && !jobPost.checkedIn && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => checkInJob(jobPost._id)}
                >
                  <Text style={styles.buttonText}>Check In</Text>
                </TouchableOpacity>
              )}
              {/* {jobPost.status === 'checkedIn' && !jobPost.checkedOut && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => checkOutJob(jobPost._id)}
                >
                  <Text style={styles.buttonText}>Check Out</Text>
                </TouchableOpacity>
              )} */}
            </View>
          </View>
        ))}
      </ScrollView>
      
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,  },
  searchInput: {
    flex: 1,
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
  menuIcon: {
    marginLeft: 15,
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
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  sectionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  activeSectionButton: {
    backgroundColor: '#007bff',
  },
  sectionButtonText: {
    fontSize: 16,
    color: '#000',
  },
  jobList: {
    flex: 1,
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
  jobPost: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  jobDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
   cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  checkedInContainer: {
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 18,
    color: '#007bff',
  },
  feedbackInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
   icon: {
    marginRight: 5,
  },
});

export default HomeScreen;
