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

type DashboardProps = {
  navigation: NavigationProp<ParamListBase>;
};

const AdminDashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [openJobs, setOpenJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const fetchJobPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const response = await instance.get('/jobPosts');
      const jobPosts = response.data;
      const openJobsData = jobPosts.filter((job: any) => job.status === 'open');
      const completedJobsData = jobPosts.filter((job: any) => job.status === 'completed');
      const upcomingJobsData = jobPosts.filter((job: any) => job.status === 'upcoming');

      setOpenJobs(openJobsData);
      setCompletedJobs(completedJobsData);
      setUpcomingJobs(upcomingJobsData);
    } catch (error:any) {
      console.error('Error fetching job posts:', error.message);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Implement search functionality based on searchQuery
  };

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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error:any) {
      console.error('Error logging out:', error.message);
      Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const handleSectionPress = (section: string) => {
    setActiveSection(section); // Update active section state
    switch (section) {
      case 'open':
        navigation.navigate('Home', { jobs: openJobs });
        break;
      case 'completed':
        navigation.navigate('Completed', { jobs: completedJobs });
        break;
      case 'upcoming':
        navigation.navigate('UpcomingScreen', { jobs: upcomingJobs });
        break;
      default:
        break;
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
              onPress={() =>  navigation.navigate('open')}
            >
              <Text style={styles.sectionTitle}>Open Jobs</Text>
              <Text>{openJobs.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.section, activeSection === 'completed' && styles.activeSection]}
              onPress={() => navigation.navigate('Completed')}
            >
              <Text style={styles.sectionTitle}>Completed Jobs</Text>
              <Text>{completedJobs.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.section, activeSection === 'upcoming' && styles.activeSection]}
              onPress={() => handleSectionPress('upcoming')}
            >
              <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
              <Text>{upcomingJobs.length}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('sign')}>
          <FontAwesome name="home" size={20} style={styles.footerIcon} />
          <Text style={styles.footerText}>sign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <FontAwesome name="calendar" size={20} style={styles.footerIcon} onPress={() => navigation.navigate('Calendar')}/>
          <Text style={styles.footerText}>Calendar</Text>
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

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} onPress={toggleModal}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.modalItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.modalItemText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={logout}>
              <Text style={styles.modalItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  scrollContainer: {
    flex: 1,
  },
  sectionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    width: '30%',
    alignItems: 'center',
  },
  activeSection: {
    backgroundColor: '#b0b0b0',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
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

export default AdminDashboard;









// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import Voice from '@react-native-voice/voice';

// const AdminDashboard = () => {

//   const [started, setStarted] =useState('')
//   const [ended, setEnded] = useState('')
//   const [results, setResults] = useState([])

//   useEffect(() => {
//         Voice.onSpeechStart =onSpeechStart ;
//         Voice.onSpeechEnd = onSpeechEnd;
//         Voice.onSpeechResults = onSpeechResults;

//         return ()=>{
//           Voice.destroy().then(Voice.removeAllListeners)
//         }
//   },[])


//   const onSpeechStart =(e:any) =>{
//     console.log(e)
//     setStarted('@')
//   }

//   const onSpeechEnd =(e:any) =>{
//     console.log(e)
//     setEnded('*')
//   }

//   const onSpeechResults = (e:any) =>{
//     console.log(e)
//     setResults(e.value)
//   }

//   const startSpeech=async ()=>{
//     try{
//       await Voice.start('en-US');
//       setStarted('')
//       setEnded('')
//       setResults([])
//     }catch(e:any){
//       console.log(e);
//     }
//   }
// const stopSpeech=async ()=>{
//   try{
//       await Voice.stop();
//       await Voice.destroy();
//        setStarted('')
//       setEnded('')
//       setResults([])
//     }catch(e:any){
//       console.log(e);
//     }
// }
//   return (
//     <View >
//       <Text style={{color:'black', alignSelf:'center',marginTop:20}}>Voice to text</Text>
//     <TouchableOpacity style={{alignSelf:'center', marginTop:50}} onPress={()=>{startSpeech()}}>
//       <Text>speak</Text>
//     </TouchableOpacity>
//     <View style={{flexDirection: 'row', marginTop:50}}>
//       <Text>Started{started}</Text>
//       <Text>Ended{ended}</Text>
//     </View>
//     <TouchableOpacity style={{width:'100%',height:60, justifyContent:'center', backgroundColor:'black'}} onPress={()=>{stopSpeech()}}>
//     <Text style={{color:'White'}}>Stop listening</Text>
//     </TouchableOpacity>
//     </View>
//   );
// };

// export default AdminDashboard;
