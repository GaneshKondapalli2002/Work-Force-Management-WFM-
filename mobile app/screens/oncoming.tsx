import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import axios from 'axios';

const Oncoming: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [checkoutInputs, setCheckoutInputs] = useState<{ [key: string]: string }>({});
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showSignature, setShowSignature] = useState(false);
  const signatureRef = useRef<any>(null);

  useEffect(() => {
    // Fetch jobs data from API
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/jobPosts');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleCheckoutInput = (jobId: string, text: string) => {
    setCheckoutInputs(prevInputs => ({
      ...prevInputs,
      [jobId]: text,
    }));
  };

  const handleCheckIn = async (job: any) => {
    try {   //jobPosts/${job._Id}/checkIn 
      await axios.post(`/api/jobPosts/checkIn/${job._id}`);
      Alert.alert('Success', 'Checked in successfully!');
      // Optionally update state to reflect changes
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Failed to check in');
    }
  };

 const handleSignature = async (signature: string) => {
    try {
      if (selectedJob) {
        await axios.put(`/api/jobPosts/checkout/${selectedJob._id}`, {
          checkoutInput: checkoutInputs[selectedJob._id],
          signature,
        });
        setShowSignature(false);
        Alert.alert('Success', 'Feedback and signature saved successfully!');
        // Optionally update state to reflect changes
      }
    } catch (error) {
      console.error('Error saving feedback and signature:', error);
      Alert.alert('Error', 'Failed to save feedback and signature');
    }
  };
  const handleSubmitFeedback = (job: any) => {
    setSelectedJob(job);
    setShowSignature(true);
  };

  return (
    <ScrollView style={styles.container}>
      {jobs.map(job => (
        <View key={job._id} style={styles.jobContainer}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobDetails}>Location: {job.location}</Text>
          <Text style={styles.jobDetails}>Start Time: {job.startTime}</Text>
          <Text style={styles.jobDetails}>End Time: {job.endTime}</Text>
          
          <TextInput
            style={styles.feedbackInput}
            placeholder="Enter feedback"
            value={checkoutInputs[job._id] || ''}
            onChangeText={text => handleCheckoutInput(job._id, text)}
          />
          
          <TouchableOpacity style={styles.button} onPress={() => handleCheckIn(job)}>
            <Text style={styles.buttonText}>Check In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={() => handleSubmitFeedback(job)}>
            <Text style={styles.buttonText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      ))}

      {showSignature && (
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={() => console.log('Empty')}
          descriptionText="Sign here"
          clearText="Clear"
          confirmText="Save"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  jobContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  jobDetails: {
    fontSize: 16,
  },
  feedbackInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
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
    fontSize: 16,
  },
});

export default Oncoming;


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import instance from '../axios-instance'; // Make sure axios-instance is correctly configured
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NavigationProp, ParamListBase } from '@react-navigation/native';

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
// }

// type UpcomingProps = {
//   navigation: NavigationProp<ParamListBase>;
// };

// const Upcoming: React.FC<UpcomingProps> = ({ navigation }) => {
//   const [upcomingJobPosts, setUpcomingJobPosts] = useState<JobPost[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [feedback, setFeedback] = useState('');
//   const [signature, setSignature] = useState('');
//   const [showCheckoutForm, setShowCheckoutForm] = useState(false);

//   useEffect(() => {
//     const fetchUpcomingJobPosts = async () => {
//       try {
//         const response = await instance.get('/jobPosts');
//         const upcomingJobs = response.data.filter(
//           (job: JobPost) => job.status === 'upcoming'
//         );
//         setUpcomingJobPosts(upcomingJobs);
//       } catch (error: any) {
//         console.error('Error fetching upcoming job posts:', error.response ? error.response.data : error.message);
//         Alert.alert('Error', 'Failed to fetch upcoming job posts');
//       }
//     };
//     fetchUpcomingJobPosts();
//   }, []);

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       navigation.navigate('Login');
//     } catch (error: any) {
//       console.error('Error logging out:', error.message);
//       Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
//     }
//   };

//   const toggleModal = () => {
//     setModalVisible(!modalVisible);
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     // Filter upcomingJobPosts based on search query
//     const filtered = upcomingJobPosts.filter((post) =>
//       post.JobDescription.toLowerCase().includes(query.toLowerCase())
//     );
//     setUpcomingJobPosts(filtered);
//   };

//   const checkIn = async (jobId: string) => {
//     try {
//       await instance.post(`/jobPosts/${jobId}/checkIn`);
//       setUpcomingJobPosts(prevJobs =>
//         prevJobs.map(job =>
//           job._id === jobId ? { ...job, status: 'checkedIn' } : job
//         )
//       );
//     } catch (error: any) {
//       console.error('Error checking in:', error.message);
//       Alert.alert('Check In Failed', 'Failed to check in. Please try again.');
//     }
//   };

//   const checkOut = (job: JobPost) => {
//     setSelectedJob(job);
//     setShowCheckoutForm(true);
//   };

//   const handleCheckout = async () => {
//     if (!selectedJob) return;

//     try {
//       await instance.post(`/jobPosts/${selectedJob._id}/checkOut`, {
//         feedback,
//         signature
//       });

//       setUpcomingJobPosts(prevJobs =>
//         prevJobs.map(job =>
//           job._id === selectedJob._id ? { ...job, status: 'completed' } : job
//         )
//       );

//       setShowCheckoutForm(false);
//       setFeedback('');
//       setSignature('');
//       setSelectedJob(null);
//     } catch (error: any) {
//       console.error('Error checking out:', error.message);
//       Alert.alert('Check Out Failed', 'Failed to check out. Please try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//         <FontAwesome name="search" size={20} style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search..."
//           value={searchQuery}
//           onChangeText={handleSearch}
//         />
//         <TouchableOpacity style={styles.menuIcon} onPress={toggleModal}>
//           <FontAwesome name="bars" size={24} color="black" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.jobListContainer}>
//         {upcomingJobPosts.length > 0 ? (
//           upcomingJobPosts.map((post, index) => (
//             <View key={index} style={styles.infoContainer}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Date:</Text>
//                 <Text style={styles.infoText}>{new Date(post.Date).toDateString()}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Shift:</Text>
//                 <Text style={styles.infoText}>{post.Shift}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Location:</Text>
//                 <Text style={styles.infoText}>{post.Location}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Start time:</Text>
//                 <Text style={styles.infoText}>{post.Starttime}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>End time:</Text>
//                 <Text style={styles.infoText}>{post.Endtime}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Job Description:</Text>
//                 <Text style={styles.infoText}>{post.JobDescription}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Payment:</Text>
//                 <Text style={styles.infoText}>{post.Payment}</Text>
//               </View>
//               {post.status === 'upcoming' && (
//                 <View style={styles.buttonContainer}>
//                   <TouchableOpacity
//                     style={styles.checkInButton}
//                     onPress={() => checkIn(post._id)}
//                   >
//                     <Text style={styles.buttonText}>Check In</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.checkOutButton}
//                     onPress={() => checkOut(post)}
//                   >
//                     <Text style={styles.buttonText}>Check Out</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           ))
//         ) : (
//           <Text>No upcoming job posts found</Text>
//         )}
//       </View>

//       <Modal visible={modalVisible} animationType="slide" transparent={true}>
//         <TouchableOpacity style={styles.modalOverlay} onPress={toggleModal}>
//           <View style={styles.modalContainer}>
//             <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Profile')}>
//               <Text style={styles.modalItemText}>Profile</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Notifications')}>
//               <Text style={styles.modalItemText}>Notifications</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.modalItem} onPress={logout}>
//               <Text style={styles.modalItemText}>Logout</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {showCheckoutForm && (
//         <Modal visible={showCheckoutForm} animationType="slide" transparent={true}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter feedback"
//                 value={feedback}
//                 onChangeText={setFeedback}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter signature"
//                 value={signature}
//                 onChangeText={setSignature}
//               />
//               <TouchableOpacity style={styles.checkOutButton} onPress={handleCheckout}>
//                 <Text style={styles.buttonText}>Confirm Checkout</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCheckoutForm(false)}>
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Dashboard')}>
//           <FontAwesome name="home" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <FontAwesome name="search" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Search</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('JobPostForm')}>
//           <FontAwesome name="plus" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Post Job</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Notifications')}>
//           <FontAwesome name="bell" size={20} style={styles.footerIcon} />
//           <Text style={styles.footerText}>Notifications</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     padding: 5,
//   },
//   menuIcon: {
//     marginLeft: 10,
//   },
//   jobListContainer: {
//     flex: 1,
//   },
//   infoContainer: {
//     marginBottom: 15,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 5,
//   },
//   infoLabel: {
//     fontWeight: 'bold',
//     width: '30%',
//   },
//   infoText: {
//     width: '70%',
//   },
//   buttonContainer: {
//     marginTop: 10,
//   },
//   checkInButton: {
//     backgroundColor: '#4CAF50',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   checkOutButton: {
//     backgroundColor: '#F44336',
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: 'white',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   modalItemText: {
//     fontSize: 16,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 5,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   cancelButton: {
//     backgroundColor: '#FF5722',
//     padding: 10,
//     borderRadius: 5,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
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
// });

// export default Upcoming;
