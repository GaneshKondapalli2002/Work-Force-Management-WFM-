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
  const [note, setNote] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [contactNumber, setContactNumber] = useState('');

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
          <Text style={styles.title}>Additional Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter any additional notes here"
            value={note}
            onChangeText={setNote}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter any additional information"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
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
















// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
// import SignatureScreen from 'react-native-signature-canvas';
// import axios from 'axios';

// const Oncoming: React.FC = () => {
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [checkoutInputs, setCheckoutInputs] = useState<{ [key: string]: string }>({});
//   const [selectedJob, setSelectedJob] = useState<any>(null);
//   const [showSignature, setShowSignature] = useState(false);
//   const signatureRef = useRef<any>(null);

//   useEffect(() => {
//     // Fetch jobs data from API
//     const fetchJobs = async () => {
//       try {
//         const response = await axios.get('/jobPosts');
//         setJobs(response.data);
//       } catch (error) {
//         console.error('Error fetching jobs:', error);
//       }
//     };

//     fetchJobs();
//   }, []);

//   const handleCheckoutInput = (jobId: string, text: string) => {
//     setCheckoutInputs(prevInputs => ({
//       ...prevInputs,
//       [jobId]: text,
//     }));
//   };

//   const handleCheckIn = async (job: any) => {
//     try {   //jobPosts/${job._Id}/checkIn 
//       await axios.post(`/api/jobPosts/checkIn/${job._id}`);
//       Alert.alert('Success', 'Checked in successfully!');
//       // Optionally update state to reflect changes
//     } catch (error) {
//       console.error('Error checking in:', error);
//       Alert.alert('Error', 'Failed to check in');
//     }
//   };

//  const handleSignature = async (signature: string) => {
//     try {
//       if (selectedJob) {
//         await axios.put(`/api/jobPosts/checkout/${selectedJob._id}`, {
//           checkoutInput: checkoutInputs[selectedJob._id],
//           signature,
//         });
//         setShowSignature(false);
//         Alert.alert('Success', 'Feedback and signature saved successfully!');
//         // Optionally update state to reflect changes
//       }
//     } catch (error) {
//       console.error('Error saving feedback and signature:', error);
//       Alert.alert('Error', 'Failed to save feedback and signature');
//     }
//   };
//   const handleSubmitFeedback = (job: any) => {
//     setSelectedJob(job);
//     setShowSignature(true);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {jobs.map(job => (
//         <View key={job._id} style={styles.jobContainer}>
//           <Text style={styles.jobTitle}>{job.title}</Text>
//           <Text style={styles.jobDetails}>Location: {job.location}</Text>
//           <Text style={styles.jobDetails}>Start Time: {job.startTime}</Text>
//           <Text style={styles.jobDetails}>End Time: {job.endTime}</Text>
          
//           <TextInput
//             style={styles.feedbackInput}
//             placeholder="Enter feedback"
//             value={checkoutInputs[job._id] || ''}
//             onChangeText={text => handleCheckoutInput(job._id, text)}
//           />
          
//           <TouchableOpacity style={styles.button} onPress={() => handleCheckIn(job)}>
//             <Text style={styles.buttonText}>Check In</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.button} onPress={() => handleSubmitFeedback(job)}>
//             <Text style={styles.buttonText}>Check Out</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       {showSignature && (
//         <SignatureScreen
//           ref={signatureRef}
//           onOK={handleSignature}
//           onEmpty={() => console.log('Empty')}
//           descriptionText="Sign here"
//           clearText="Clear"
//           confirmText="Save"
//         />
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   jobContainer: {
//     marginBottom: 20,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 5,
//   },
//   jobTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   jobDetails: {
//     fontSize: 16,
//   },
//   feedbackInput: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     marginVertical: 10,
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
//     fontSize: 16,
//   },
// });

// export default Oncoming;