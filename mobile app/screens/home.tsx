import React, { useState, useEffect, useRef } from 'react';
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
  SafeAreaView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import ShapesIcon from '../components/ShapesIcon';
import instance from '../axios-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import SignatureScreen from 'react-native-signature-canvas';
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
  const [colorText, setPenColor] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');

  const signatureRef = useRef<any>(null);

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const allJobs = response.data;

        const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');
        const completedJobs = allJobs.filter((job: JobPost) => job.status === 'completed');
        const upcomingJobs = allJobs.filter((job: JobPost) => job.status === 'upcoming');
        const checkedInJobs = allJobs.filter((job: JobPost) => job.status === 'checkedIn');

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
            setFilteredJobPosts(openJobs);
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
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    } else {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
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
        const updatedJobPosts = jobPosts.map((job) =>
          job._id === jobId ? { ...job, status: 'upcoming' } : job
        );
        setJobPosts(updatedJobPosts);

        const openJobsResponse = await instance.get('/jobPosts');
        const allJobs = openJobsResponse.data;
        const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');

        setFilteredJobPosts(openJobs);

        Alert.alert('Success', 'Job accepted successfully!');

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
        setIsCheckingIn(jobId);
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
      const response = await instance.put(`/jobPosts/checkout/${jobId}`, {
        signature: signatureData,
        checkoutInput: checkoutInputs[jobId] || '',
      });

      if (response.status === 200) {
        const updatedJobPosts = jobPosts.map((job) =>
          job._id === jobId ? { ...job, status: 'completed', checkedOut: true } : job
        );
        setJobPosts(updatedJobPosts);
        const filteredJobs = updatedJobPosts.filter((job) => job.status === 'completed');
        setFilteredJobPosts(filteredJobs);
        setIsCheckingIn(null);
        setDescription('');
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
        setFilteredJobPosts(jobPosts.filter((job) => job.status === 'open'));
        break;
    }
  };

  const getShiftIcon = (shift: string) => {
    if (shift.toLowerCase() === 'morning') {
      return <FontAwesome name="sun-o" size={20} color="#ffa500" />;
    } else if (shift.toLowerCase() === 'night') {
      return <FontAwesome name="moon-o" size={20} color="#0000ff" />;
    } else {
      return null;
    }
  };

  const handleSignature = (signature: string) => {
    setSignatureData(signature);
  };

  const handleSignatureOK = () => {
    if (!signatureData) {
      Alert.alert('Error', 'Please provide a signature.');
      return;
    }

    if (selectedJob) {
      checkOutJob(selectedJob._id);
      setShowSignature(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <ShapesIcon shapes={require('../assets/shapes.png')} />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <FontAwesome name="search" size={20} style={styles.searchIcon} />
          <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={toggleModal}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        
        {/* <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
          <FontAwesome name="bell" size={24} color="#000" />
        </TouchableOpacity> */}
      </View>
     
<View style={styles.sectionContainer}>
  <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'open' && styles.activeSection]}
          onPress={() => handleSectionPress('open')}
        >
          <Text style={styles.sectionButtonText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'completed' && styles.activeSection]}
          onPress={() => handleSectionPress('completed')}
        >
          <Text style={styles.sectionButtonText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'upcoming' && styles.activeSection]}
          onPress={() => handleSectionPress('upcoming')}
        >
          <Text style={styles.sectionButtonText}>Upcoming</Text>
        </TouchableOpacity>
</View>
        
      
      <ScrollView style={styles.scrollView}>
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
               {jobPost.status === 'open' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => acceptJob(jobPost._id)}
              >
                <Text style={styles.buttonText}>Accept Job</Text>
              </TouchableOpacity>
            )}
            {jobPost.status === 'upcoming' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => checkInJob(jobPost._id)}
              >
                <Text style={styles.buttonText}>Check In</Text>
              </TouchableOpacity>
            )}
            {jobPost.status === 'checkedIn' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter description"
                  value={checkoutInputs[jobPost._id] || ''}
                  onChangeText={(text) => handleCheckoutInput(jobPost._id, text)}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setSelectedJob(jobPost);
                    setShowSignature(true);
                  }}
                >
                  <Text style={styles.buttonText}>Check Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>
       </View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <FontAwesome name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleModal();
                navigation.navigate('UserProfileScreen');
              }}
            >
              <FontAwesome name="user" size={24} color="#000" />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleModal();
                navigation.navigate('NotificationScreen');
              }}
            >
              <FontAwesome name="bell" size={24} color="#000" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleModal();
                navigation.navigate('JobPostScreen');
              }}
            >
              <FontAwesome name="briefcase" size={24} color="#000" />
              <Text style={styles.menuItemText}>Job Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <FontAwesome name="sign-out" size={24} color="#000" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      {showSignature && (
        <Modal visible={showSignature} animationType="slide" transparent>
          <View style={styles.modalBackground}>
            <View style={styles.signatureContainer}>
              <SignatureScreen
                ref={signatureRef}
                onOK={handleSignature}
                onEnd={handleSignatureOK}
                descriptionText="Sign"
                clearText="Clear"
                confirmText="Save"
                webStyle={`.m-signature-pad {border-radius: 10px;}
                            .m-signature-pad--footer {display: none; margin: 0px;}`}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSignatureOK}>
                <Text style={styles.buttonText}>Save Signature</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSignature(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  
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
  menuButton: {
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginRight: 15,
  },
    searchContainer: {
flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,  },
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
  sectionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  sectionButtonText: {
    fontSize: 16,
    color: '#000',
  },
  activeSection: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
 
  scrollView: {
    flex: 1,
  },
 
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
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
  acceptButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },button: {
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
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  signatureContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  icon: {
    marginRight: 5,
  },
});



export default HomeScreen;
  