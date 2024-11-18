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
import voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { usePushNotifications } from './Notification';
import * as Notifications from 'expo-notifications';
import { useNotification } from './NotificationContext';

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
  CRID: string; 
}

type DashboardProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<DashboardProps> = ({ navigation }) => {
   const { expoPushToken } = usePushNotifications();
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
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null); // State to manage checking in
  const [description, setDescription] = useState('');
  const { addNotification } = useNotification();
  const signatureRef = useRef<any>(null);
 const [PatientWeight, setPatientWeight] = useState('');
  const [Temperature, setTemperature] = useState('');
  const [BloodPressure, setBloodPressure] = useState('');
  const [showCheckoutSection, setShowCheckoutSection] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

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
         await Notifications.scheduleNotificationAsync({
        content: {
          title: ' Job Accepted!',
          body: 'You have been assigned a new job.',
        },
        trigger: null,
      });
       const notification = {
        title: 'Job Accepted',
        body: 'You have been assigned a new job.',
        date: new Date().toISOString(),
      };
      addNotification(notification);

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
        setIsCheckingIn(jobId); // Set the job ID that is being checked in
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
    setIsCheckingIn(jobId); // Set the job ID that is being checked out
     const updatedJobPosts = jobPosts.map((job) =>
        job._id === isCheckingIn ? { ...job, status: 'completed', checkedOut: true } : job
      );
    const filteredJobs = updatedJobPosts.filter((job) => job.status === 'completed');
      setFilteredJobPosts(filteredJobs);
      setIsCheckingIn(null); // Clear the checked-in job
      setDescription(''); // Clear the description input
      Alert.alert('Success', 'Checked out successfully!'); // Open the signature modal
  } catch (error: any) {
    console.error('Error preparing checkout:', error.message);
    Alert.alert('Error', 'Failed to prepare for checkout');
  }
};


 const handleNext = () => {
    setShowCheckoutSection(true);
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
      return null;// return <ShapesIcon name="square" size={20} color="#ffa500" />;
    }
  };
 const handleSignatureSave = async (signature: string) => {
  const patientWeight = PatientWeight;
    const temperature = Temperature;
    const bloodPressure = BloodPressure;
    

  if (isCheckingIn === null) {
    Alert.alert('Error', 'No job selected for checkout');
    return;
  }
  try {
    // Save the signature to the server and perform the checkout
    const response = await instance.put(`/jobPosts/checkout/${isCheckingIn}`, {
      signature: signature,
      checkoutInput: checkoutInputs[isCheckingIn] || '',
      patientWeight,
      temperature,
      bloodPressure,
     
    });
 Alert.alert(
      "Signature Saved",
      "Your signature has been successfully saved.",
       )
    if (response.status === 200) {
      
      checkOutJob(isCheckingIn); 
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
  

  return (
    <SafeAreaView style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, activeSection === 'open' && styles.activeFilter]}
            onPress={() => handleSectionPress('open')}
          >
            <Text style={styles.filterText}>Open Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeSection === 'completed' && styles.activeFilter]}
            onPress={() => handleSectionPress('completed')}
          >
            <Text style={styles.filterText}>Completed Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeSection === 'upcoming' && styles.activeFilter]}
            onPress={() => handleSectionPress('upcoming')}
          >
            <Text style={styles.filterText}>Upcoming Jobs</Text>
          </TouchableOpacity>
        </View>
        {filteredJobPosts.map((job) => (
          <View key={job._id} style={styles.jobCard}>
             <Text style={styles.jobTitle}>CRID: {job.CRID}</Text>
            <Text style={styles.jobDetail}>JobDescription: {job.JobDescription}</Text>
            <Text style={styles.jobDetail}><Icon name="calendar" size={18} style={styles.icon} /> {job.Date}</Text>
           <Text style={styles.jobDetail}>
              {getShiftIcon(job.Shift)} {job.Shift}
            </Text>
            <Text style={styles.jobDetail}><Icon name="map-marker" size={18} style={styles.icon} /> {job.Location}</Text>
           <Text style={styles.jobDetail}> <Icon name="clock-o" size={18} style={styles.icon}/> {job.Starttime} - {job.Endtime}</Text>
            <Text style={styles.jobDetail}><Icon name="dollar" size={18} style={styles.icon} /> {job.Payment}</Text>
            {activeSection === 'open' && (
              <TouchableOpacity style={styles.button} onPress={() => acceptJob(job._id)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            )}
            {activeSection === 'upcoming' && (
              <>
                {isCheckingIn === job._id ? (
                  <>
                    {showAdditionalInfo && (
                      <>
                        
                        <Text style={styles.title}> Weight</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Patient Weight"
                          value={PatientWeight}
                          onChangeText={setPatientWeight}
                        />
                        <Text style={styles.title}>Temperature</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Temperature"
                          value={Temperature}
                          onChangeText={setTemperature}
                        />
                         <Text style={styles.title}>Blood Pressure</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter Blood Pressure"
                          value={BloodPressure}
                          onChangeText={setBloodPressure}
                        />
                        
                        {/* <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => setIsTemplate(!isTemplate)}
                        >
                          <Text style={styles.checkboxText}>{isTemplate ? '✓' : ''} </Text>
                        </TouchableOpacity> */}
                        {/* <Text style={styles.checkboxText}>Complete Feedback</Text>
                        <TouchableOpacity style={styles.button} onPress={() => setShowSignature(true)}>
                          <Text style={styles.buttonText}>Signature</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => {
                            setShowAdditionalInfo(false);
                            setShowCheckout(true);
                          }}
                        >
                          <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {showCheckout && (
                      <>
                        <TextInput
                          style={styles.input}
                          multiline
                          numberOfLines={4}
                          placeholder="Enter checkout details"
                          onChangeText={(text) => handleCheckoutInput(job._id, text)}
                          value={checkoutInputs[job._id] || ''}
                        />
                        <TouchableOpacity style={styles.button} onPress={() => setShowSignature(true)}>
                          <Text style={styles.buttonText}>Signature</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => checkOutJob(job._id)}>
                          <Text style={styles.buttonText}>Check Out</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                ) : (
                  <TouchableOpacity style={styles.button} onPress={() => checkInJob(job._id)}>
                    <Text style={styles.buttonText}>Check In</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {activeSection === 'completed' && (
              <Text style={styles.jobDetail}>This job is completed</Text>
            )}
          </View>
        ))}
        <Modal visible={showSignature} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <SignatureScreen
      ref={signatureRef}
      onOK={handleSignatureSave}
      onEmpty={() => console.log('Empty')}
      descriptionText="Sign here"
      clearText="Clear"
      confirmText="Save"
    />
    <TouchableOpacity style={styles.closeButton} onPress={() => setShowSignature(false)}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>
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
      </ScrollView>
       <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('sign')}>
          <FontAwesome name="home" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>sign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <FontAwesome name="calendar" size={20} style={styles.footerIcon} onPress={() => navigation.navigate('Calendar')}/>
          <Text style={styles.footerText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Notificationscreen')}>
          <FontAwesome name="bell" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <FontAwesome name="user" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
  },
  activeFilter: {
    backgroundColor: '#d0eaff',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
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
 searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
 
  menuIcon: {
    marginLeft: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
 searchIcon: {
    marginRight: 10,
  },
  jobCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
   modalItem: {
    paddingVertical: 15,
  },
  modalItemText: {
    fontSize: 18,
  },
  jobDetail: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalCloseButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalCloseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF5733',
    padding: 10,
    borderRadius: 5,
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
  logoutText: {
    color: '#fff',
  },
  toggleModalButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  toggleModalText: {
    color: '#fff',
  },
  icon: {
    marginRight: 5,
  },
});

export default HomeScreen;






















// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Modal,
//   Animated,
//   Alert,
//   TextInput,
//   SafeAreaView
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import ShapesIcon from '../components/ShapesIcon';
// import instance from '../axios-instance';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NavigationProp, ParamListBase } from '@react-navigation/native';
// import SignatureScreen from 'react-native-signature-canvas';
// import voice from '@react-native-voice/voice';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { usePushNotifications } from './Notification';
// import * as Notifications from 'expo-notifications';
// import { useNotification } from './NotificationContext';

// interface JobPost {
//   _id: string;
//   Date: string;
//   Shift: string;
//   Location: string;
//   Starttime: string;
//   Endtime: string;
//   JobDescription: string;
//   Payment: string;
//   assignedTo?: string;
//   status?: string;
//   checkedIn: boolean;
//   checkedOut: boolean;
//   CRID: string; 
// }

// type DashboardProps = {
//   navigation: NavigationProp<ParamListBase>;
// };

// const HomeScreen: React.FC<DashboardProps> = ({ navigation }) => {
//    const { expoPushToken } = usePushNotifications();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
//   const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([]);
//   const slideAnim = useState(new Animated.Value(-300))[0];
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeSection, setActiveSection] = useState('open');
//   const [checkoutInputs, setCheckoutInputs] = useState<{ [key: string]: string }>({});
//   const [isTemplate, setIsTemplate] = useState(false);
//   const [colorText, setPenColor] = useState('');
//   const [showSignature, setShowSignature] = useState(false);
//   const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
//   const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null); // State to manage checking in
//   const [description, setDescription] = useState('');
//   const [started, setStarted] = useState(false);
//   const [results, setResults] = useState([]);
// const { addNotification } = useNotification();
//   const signatureRef = useRef<any>(null);

//   useEffect(() => {
//     const fetchJobPosts = async () => {
//       try {
//         const response = await instance.get('/jobPosts');
//         const allJobs = response.data;

//         const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');
//         const completedJobs = allJobs.filter((job: JobPost) => job.status === 'completed');
//         const upcomingJobs = allJobs.filter((job: JobPost) => job.status === 'upcoming');
//         const checkedInJobs = allJobs.filter((job: JobPost) => job.status === 'checkedIn');

//         setJobPosts(allJobs);

//         switch (activeSection) {
//           case 'open':
//             setFilteredJobPosts(openJobs);
//             break;
//           case 'completed':
//             setFilteredJobPosts(completedJobs);
//             break;
//           case 'upcoming':
//             setFilteredJobPosts(upcomingJobs);
//             break;
//           case 'checkedIn':
//             setFilteredJobPosts(checkedInJobs);
//             break;
//           default:
//             setFilteredJobPosts(openJobs);
//             break;
//         }
//       } catch (error: any) {
//         console.error('Error fetching job posts:', error.response ? error.response.data : error.message);
//         Alert.alert('Error', 'Failed to fetch job posts');
//       }
//     };

//     fetchJobPosts();
//   }, [activeSection]);

//   const toggleModal = () => {
//     if (modalVisible) {
//       Animated.timing(slideAnim, {
//         toValue: -300,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setModalVisible(false));
//     } else {
//       setModalVisible(true);
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     if (query.trim() === '') {
//       setFilteredJobPosts(jobPosts);
//     } else {
//       const filtered = jobPosts.filter((post) =>
//         post.JobDescription.toLowerCase().includes(query.toLowerCase())
//       );
//       setFilteredJobPosts(filtered);
//     }
//   };

//   const sendNotification = async (userId: string, message: string) => {
//     try {
//       await instance.post('/notifications', { userId, message });
//     } catch (error) {
//       console.error('Error sending notification:', error);
//     }
//   };

//   const acceptJob = async (jobId: string) => {
//     try {
//       const response = await instance.put(`/jobPosts/accept/${jobId}`);
//       if (response.status === 200) {
//         const updatedJobPosts = jobPosts.map((job) =>
//           job._id === jobId ? { ...job, status: 'upcoming' } : job
//         );
//         setJobPosts(updatedJobPosts);
//          await Notifications.scheduleNotificationAsync({
//         content: {
//           title: ' Job Accepted!',
//           body: 'You have been assigned a new job.',
//         },
//         trigger: null,
//       });
//        const notification = {
//         title: 'Job Accepted',
//         body: 'You have been assigned a new job.',
//         date: new Date().toISOString(),
//       };
//       addNotification(notification);

//         const openJobsResponse = await instance.get('/jobPosts');
//         const allJobs = openJobsResponse.data;
//         const openJobs = allJobs.filter((job: JobPost) => job.status === 'open');

//         setFilteredJobPosts(openJobs);

//         Alert.alert('Success', 'Job accepted successfully!');

//         const acceptedJob = jobPosts.find((job) => job._id === jobId);
//         if (acceptedJob && acceptedJob.assignedTo) {
//           sendNotification(acceptedJob.assignedTo, 'You have been assigned a new job.');
//         }
//       } else {
//         throw new Error('Failed to accept job');
//       }
//     } catch (error: any) {
//       console.error('Error accepting job:', error.response ? error.response.data : error.message);
//       Alert.alert('Error', 'Failed to accept job');
//     }
//   };

//   const checkInJob = async (jobId: string) => {
//     try {
//       const response = await instance.put(`/jobPosts/checkIn/${jobId}`);
//       if (response.status === 200) {
//         const updatedJobPosts = jobPosts.map((job) =>
//           job._id === jobId ? { ...job, status: 'checkedIn', checkedIn: true } : job
//         );
//         setJobPosts(updatedJobPosts);
//         const filteredJobs = updatedJobPosts.filter((job) => job.status === 'checkedIn');
//         setFilteredJobPosts(filteredJobs);
//         setIsCheckingIn(jobId); // Set the job ID that is being checked in
//         Alert.alert('Success', 'Checked in successfully!');
//       } else {
//         throw new Error('Failed to check in job');
//       }
//     } catch (error: any) {
//       console.error('Error checking in job:', error.response ? error.response.data : error.message);
//       Alert.alert('Error', 'Failed to check in job');
//     }
//   };

// const checkOutJob = async (jobId: string) => {
//   try {
//     setIsCheckingIn(jobId); // Set the job ID that is being checked out
//     setShowSignature(true); // Open the signature modal
//   } catch (error: any) {
//     console.error('Error preparing checkout:', error.message);
//     Alert.alert('Error', 'Failed to prepare for checkout');
//   }
// };

//   const handleCheckoutInput = (jobId: string, text: string) => {
//     setCheckoutInputs((prevInputs) => ({
//       ...prevInputs,
//       [jobId]: text,
//     }));
//   };
  


//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       navigation.navigate('Login');
//     } catch (error: any) {
//       console.error('Error logging out:', error.message);
//       Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
//     }
//   };

//   const handleSectionPress = (section: string) => {
//     setActiveSection(section);
//     switch (section) {
//       case 'open':
//         setFilteredJobPosts(jobPosts.filter((job) => job.status === 'open'));
//         break;
//       case 'completed':
//         setFilteredJobPosts(jobPosts.filter((job) => job.status === 'completed'));
//         break;
//       case 'upcoming':
//         setFilteredJobPosts(jobPosts.filter((job) => job.status === 'upcoming'));
//         break;
//       default:
//         setFilteredJobPosts(jobPosts.filter((job) => job.status === 'open'));
//         break;
//     }
//   };
// const getShiftIcon = (shift: string) => {
//     if (shift.toLowerCase() === 'morning') {
//       return <FontAwesome name="sun-o" size={20} color="#ffa500" />;
//     } else if (shift.toLowerCase() === 'night') {
//       return <FontAwesome name="moon-o" size={20} color="#0000ff" />;
//     } else {
//       return null;// return <ShapesIcon name="square" size={20} color="#ffa500" />;
//     }
//   };
//  const handleSignatureSave = async (signature: string) => {
//    if (isCheckingIn === null) {
//     Alert.alert('Error', 'No job selected for checkout');
//     return;
//   }
//   try {
//     // Save the signature to the server and perform the checkout
//     const response = await instance.put(`/jobPosts/checkout/${isCheckingIn}`, {
//       signature: signature,
//       checkoutInput: checkoutInputs[isCheckingIn] || '', // Get the description from state
//     });

//     if (response.status === 200) {
//       const updatedJobPosts = jobPosts.map((job) =>
//         job._id === isCheckingIn ? { ...job, status: 'completed', checkedOut: true } : job
//       );
//       setJobPosts(updatedJobPosts);
//       const filteredJobs = updatedJobPosts.filter((job) => job.status === 'completed');
//       setFilteredJobPosts(filteredJobs);
//       setIsCheckingIn(null); // Clear the checked-in job
//       setDescription(''); // Clear the description input
//       Alert.alert('Success', 'Checked out successfully!');
//     } else {
//       throw new Error('Failed to check out job');
//     }
//   } catch (error: any) {
//     console.error('Error checking out job:', error.response ? error.response.data : error.message);
//     Alert.alert('Error', 'Failed to check out job');
//   } 
// };


// useEffect(() => {
//   voice.onSpeechError = onSpeechError;
//   voice.onSpeechResults = onSpeechResults;

//   return() => {
//     voice.destroy().then(voice.removeAllListeners);
//   }
// }, [])
// const startSpeechToText = async () => {
//     try {
//       await voice.start("en-NZ");
//       setStarted(true);
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//     }
//   };

// const stopSpeechToText = async () => {
//     try {
//       await voice.stop();
//       setStarted(false);
//     } catch (error) {
//       console.error('Error stopping speech recognition:', error);
//     }
//   };

// const onSpeechResults = (result:any) => {
//   setResults(result.value);
// }; 

// const onSpeechError = (error:any) =>{
//   console.log(error);
// };
//   return (
//     <SafeAreaView style={styles.container}>
//       <ShapesIcon shapes={require('../assets/shapes.png')} />
//       <View style={styles.searchContainer}>
//           <View style={styles.searchBox}>
//             <FontAwesome name="search" size={20} style={styles.searchIcon} />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search..."
//               value={searchQuery}
//               onChangeText={handleSearch}
//             />
//           </View>
//       <TouchableOpacity style={styles.menuIcon} onPress={toggleModal}>
//             <FontAwesome name="bars" size={24} color="black" />
//           </TouchableOpacity>
//           </View>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.filterContainer}>
//           <TouchableOpacity
//             style={[styles.filterButton, activeSection === 'open' && styles.activeFilter]}
//             onPress={() => handleSectionPress('open')}
//           >
//             <Text style={styles.filterText}>Open Jobs</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.filterButton, activeSection === 'completed' && styles.activeFilter]}
//             onPress={() => handleSectionPress('completed')}
//           >
//             <Text style={styles.filterText}>Completed Jobs</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.filterButton, activeSection === 'upcoming' && styles.activeFilter]}
//             onPress={() => handleSectionPress('upcoming')}
//           >
//             <Text style={styles.filterText}>Upcoming Jobs</Text>
//           </TouchableOpacity>
//         </View>
//         {filteredJobPosts.map((job) => (
//           <View key={job._id} style={styles.jobCard}>
//              <Text style={styles.jobTitle}>CRID: {job.CRID}</Text>
//             <Text style={styles.jobDetail}>JobDescription: {job.JobDescription}</Text>
//             <Text style={styles.jobDetail}><Icon name="calendar" size={18} style={styles.icon} /> {job.Date}</Text>
//            <Text style={styles.jobDetail}>
//               {getShiftIcon(job.Shift)} {job.Shift}
//             </Text>
//             <Text style={styles.jobDetail}><Icon name="map-marker" size={18} style={styles.icon} /> {job.Location}</Text>
//            <Text style={styles.jobDetail}> <Icon name="clock-o" size={18} style={styles.icon}/> {job.Starttime} - {job.Endtime}</Text>
//             <Text style={styles.jobDetail}><Icon name="dollar" size={18} style={styles.icon} /> {job.Payment}</Text>
//             {activeSection === 'open' && (
//               <TouchableOpacity style={styles.button} onPress={() => acceptJob(job._id)}>
//                 <Text style={styles.buttonText}>Accept</Text>
//               </TouchableOpacity>
//             )}
//             {activeSection === 'upcoming' && (
//               <>
//                 {isCheckingIn === job._id ? (
//                   <>
//                     <TextInput
//                       style={styles.input}
//                        multiline numberOfLines={4}
//                       placeholder="Enter checkout details"
//                       onChangeText={(text) => handleCheckoutInput(job._id, text)}
//                       value={checkoutInputs[job._id] || ''}
//                     />
//                     {!started ? (
//             <TouchableOpacity onPress={startSpeechToText}>
//               <Text>Start Speech</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={stopSpeechToText}>
//               <Text>Stop Speech</Text>
//             </TouchableOpacity>
//           )}
//           {results.map((result, index) => (
//             <Text key={index}>{result}</Text>
//           ))}
//               <TouchableOpacity
//                     style={styles.checkbox}
//                     onPress={() => setIsTemplate(!isTemplate)}
//                   >
//                     <Text style={styles.checkboxText}>{isTemplate ? '✓' : ''} </Text>
//                   </TouchableOpacity>
//                   <Text style={styles.checkboxText}>Complete Feedback</Text>
//                     <TouchableOpacity style={styles.button} onPress={() => setShowSignature(true)}>
//                       <Text style={styles.buttonText}>Signature</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.button} onPress={() => checkOutJob(job._id)}>
//                       <Text style={styles.buttonText}>Check Out</Text>
//                     </TouchableOpacity>
//                   </>
//                 ) : (
//                   <TouchableOpacity style={styles.button} onPress={() => checkInJob(job._id)}>
//                     <Text style={styles.buttonText}>Check In</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//             {activeSection === 'completed' && (
//               <Text style={styles.jobDetail}>This job is completed</Text>
//             )}
//           </View>
//         ))}
//         <Modal visible={showSignature} transparent={true} animationType="slide">
//   <View style={styles.modalContainer}>
//     <SignatureScreen
//       ref={signatureRef}
//       onOK={handleSignatureSave}
//       onEmpty={() => console.log('Empty')}
//       descriptionText="Sign here"
//       clearText="Clear"
//       confirmText="Save"
//     />
//     <TouchableOpacity style={styles.closeButton} onPress={() => setShowSignature(false)}>
//       <Text style={styles.closeButtonText}>Close</Text>
//     </TouchableOpacity>
//   </View>
// </Modal>
//         <Modal visible={modalVisible} animationType="slide" transparent={true}>
//         <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
//           <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('UserProfile')}>
//             <Text style={styles.modalItemText}>User Profile</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Notifications')}>
//             <Text style={styles.modalItemText}>Notifications</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('JobPosts')}>
//             <Text style={styles.modalItemText}>Job Posts</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.modalItem} onPress={logout}>
//             <Text style={styles.modalItemText}>Logout</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
//             <Text style={styles.modalCloseButtonText}>Close</Text>
//             </TouchableOpacity>
//           </Animated.View>
        
//       </Modal>
//       </ScrollView>
//        <View style={styles.footer}>
//         <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('sign')}>
//           <FontAwesome name="home" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>sign</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <FontAwesome name="calendar" size={20} style={styles.footerIcon} onPress={() => navigation.navigate('Calendar')}/>
//           <Text style={styles.footerText}>Calendar</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Notificationscreen')}>
//           <FontAwesome name="bell" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Notifications</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <FontAwesome name="user" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollView: {
//     flex: 1,
//   },
//    searchBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     flex: 1,
//     marginRight: 10,
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 10,
//   },
//   filterButton: {
//     padding: 10,
//   },
//   activeFilter: {
//     backgroundColor: '#d0eaff',
//   },
//   filterText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   footerItem: {
//     alignItems: 'center',
//   },
//   footerIcon: {
//     marginBottom: 5,
//   },
//   footerText: {
//     fontSize: 12,
//   },
//  searchContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 20,
//     paddingHorizontal: 20,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 10,
//   },
 
//   menuIcon: {
//     marginLeft: 15,
//   },
//  searchIcon: {
//     marginRight: 10,
//   },
//   jobCard: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   jobTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//    modalItem: {
//     paddingVertical: 15,
//   },
//   modalItemText: {
//     fontSize: 18,
//   },
//   jobDetail: {
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginVertical: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   closeButton: {
//     backgroundColor: '#007BFF',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   modalCloseButton: {
//     backgroundColor: '#E0E0E0',
//     borderRadius: 10,
//     paddingVertical: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   modalCloseButtonText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   logoutButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     backgroundColor: '#FF5733',
//     padding: 10,
//     borderRadius: 5,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderColor: '#007bff',
//     borderWidth: 1,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   checkboxText: {
//     fontSize: 18,
//     color: '#007bff',
//   },
//   logoutText: {
//     color: '#fff',
//   },
//   toggleModalButton: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     backgroundColor: '#007BFF',
//     padding: 10,
//     borderRadius: 5,
//   },
//   toggleModalText: {
//     color: '#fff',
//   },
//   icon: {
//     marginRight: 5,
//   },
// });

// export default HomeScreen;






































