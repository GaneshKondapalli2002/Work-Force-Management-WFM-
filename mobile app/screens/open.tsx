import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import instance from '../axios-instance'; // Assuming axios instance is correctly configured
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ShapesIcon from '../components/ShapesIcon';

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

type OpenJobsProps = {
  navigation: NavigationProp<ParamListBase>;
};

const OpenJobs: React.FC<OpenJobsProps> = ({ navigation }) => {
  const [openJobPosts, setOpenJobPosts] = useState<JobPost[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editFormValues, setEditFormValues] = useState<JobPost>({
    _id: '',
    Date: '',
    Shift: '',
    Location: '',
    Starttime: '',
    Endtime: '',
    JobDescription: '',
    Payment: '',
  });

  useEffect(() => {
    const fetchOpenJobPosts = async () => {
      try {
        const response = await instance.get('/jobPosts');
        const openJobs = response.data.filter((job: JobPost) => job.status === 'open');
        setOpenJobPosts(openJobs);
      } catch (error: any) {
        console.error('Error fetching open job posts:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to fetch open job posts');
      }
    };
    fetchOpenJobPosts();
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
  };

  const editJobPost = async (postId: string) => {
    try {
      const jobPostToEdit = openJobPosts.find(post => post._id === postId);
      if (jobPostToEdit) {
        setEditFormValues(jobPostToEdit);
        setEditMode(true);
      }
    } catch (error: any) {
      console.error('Error setting edit mode:', error.message);
    }
  };

  const saveEditedJobPost = async () => {
    try {
      const response = await instance.put(`/jobPosts/${editFormValues._id}`, editFormValues);
      const updatedJobPost = response.data;

      // Update locally in state
      const updatedJobPosts = openJobPosts.map(post =>
        post._id === updatedJobPost._id ? updatedJobPost : post
      );
      setOpenJobPosts(updatedJobPosts);
      setEditMode(false);
      Alert.alert('Success', 'Job post updated successfully');
    } catch (error: any) {
      console.error('Error updating job post:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to update job post');
    }
  };

  const deleteJobPost = async (postId: string) => {
    try {
      await instance.delete(`/jobPosts/delete/${postId}`);
      setOpenJobPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      Alert.alert('Success', 'Job post deleted successfully');
    } catch (error: any) {
      console.error('Error deleting job post:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to delete job post');
    }
  };

  const handleInputChange = (fieldName: keyof JobPost, value: string) => {
    setEditFormValues({ ...editFormValues, [fieldName]: value });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditFormValues({
      _id: '',
      Date: '',
      Shift: '',
      Location: '',
      Starttime: '',
      Endtime: '',
      JobDescription: '',
      Payment: '',
    });
  };

  const filteredJobPosts = openJobPosts.filter(post =>
    post.JobDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to check if user is admin (replace with your actual logic)
  const isAdmin = true; // Replace with actual check based on user roles

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
        {filteredJobPosts.length > 0 ? (
          filteredJobPosts.map((post, index) => (
            <View key={index} style={styles.infoContainer}>
              {editMode && editFormValues._id === post._id ? (
                <View style={styles.editFormContainer}>
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Date}
                    onChangeText={value => handleInputChange('Date', value)}
                    placeholder="Date"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Shift}
                    onChangeText={value => handleInputChange('Shift', value)}
                    placeholder="Shift"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Location}
                    onChangeText={value => handleInputChange('Location', value)}
                    placeholder="Location"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Starttime}
                    onChangeText={value => handleInputChange('Starttime', value)}
                    placeholder="Start time"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Endtime}
                    onChangeText={value => handleInputChange('Endtime', value)}
                    placeholder="End time"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.JobDescription}
                    onChangeText={value => handleInputChange('JobDescription', value)}
                    placeholder="Job Description"
                  />
                  <TextInput
                    style={styles.inputField}
                    value={editFormValues.Payment}
                    onChangeText={value => handleInputChange('Payment', value)}
                    placeholder="Payment"
                  />
                  <View style={styles.editFormButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={saveEditedJobPost}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Icon name="calendar" size={18} style={styles.icon} />
                    <Text style={styles.infoText}>{new Date(post.Date).toDateString()}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="map-marker" size={18} style={styles.icon} />
                    <Text style={styles.infoText}>{post.Location}</Text>
                  </View>
                  <Text style={styles.cardText}>{getShiftIcon(post.Shift)} {post.Shift}</Text>
                  <View style={styles.infoRow}>
                    <Icon name="clock-o" size={18} style={styles.icon} />
                    <Text style={styles.infoText}>{post.Starttime} - {post.Endtime}</Text>
                  </View>
                 <View style={styles.infoRow}>
                    <FontAwesome name="file-text-o" size={20} style={styles.icon} />
                    <Text style={styles.infoText}>{post.JobDescription}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <FontAwesome name="dollar" size={20} style={styles.icon} />
                    <Text style={styles.infoText}>{post.Payment}</Text>
                  </View>
                  {isAdmin && (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.editButton} onPress={() => editJobPost(post._id)}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteJobPost(post._id)}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          ))
        ) : (
          <Text>No open job posts found</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  menuIcon: {
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
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
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#69DCCE',
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 50,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 18,
    textAlign: 'center',
  },
  editFormContainer: {
    marginBottom: 10,
  },
  inputField: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  editFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#28a745',
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
});

export default OpenJobs;
