import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import moment from 'moment';
import axiosInstance from '../axios-instance';
import ShapesIcon from '../components/ShapesIcon';
import { FontAwesome } from '@expo/vector-icons';

export interface JobPost {
  _id: string;
  Date: string;
  Shift: string;
  Location: string;
  Starttime: string;
  Endtime: string;
  JobDescription: string;
  Payment: string;
  TemplateName?: string;
  isTemplate: boolean;
  user: string;
  status: string;
  assignedTo?: string;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { customStyles: { container: { backgroundColor: string }; text: { color: string }; dotColor?: string } } }>({});
  const [jobDetails, setJobDetails] = useState<JobPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const slideAnim = useState(new Animated.Value(-300))[0];

  useEffect(() => {
    const fetchJobDates = async () => {
      try {
        const response = await axiosInstance.get<JobPost[]>('/jobPosts');
        const jobs = response.data;

        const statusColors: { [key: string]: string } = {
          'open': '#2775BD',
          'completed': '#0BB039',
          'upcoming': 'yellow',
          'checkedIn': 'orange',
          'default': 'grey',
        };

        const datesWithJobs = jobs.reduce((acc: { [key: string]: { customStyles: { container: { backgroundColor: string }; text: { color: string }; dotColor?: string } } }, job: JobPost) => {
          const jobDate = moment(job.Date).format('YYYY-MM-DD');
          const backgroundColor = statusColors[job.status] || statusColors['default'];

          acc[jobDate] = {
            customStyles: {
              container: {
                backgroundColor,
              },
              text: {
                color: 'black',
              },
              dotColor: backgroundColor,
            },
          };

          return acc;
        }, {});

        setMarkedDates(datesWithJobs);
        setJobPosts(jobs);  // Set job posts to be used in search
        setFilteredJobPosts(jobs);  // Set filtered job posts initially
      } catch (error) {
        console.error('Error fetching job dates:', error);
      }
    };

    fetchJobDates();
  }, []);

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

  const toggleModal = () => {
    Animated.timing(slideAnim, {
      toValue: modalVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(!modalVisible));
  };

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    try {
      const response = await axiosInstance.get<JobPost[]>(`/jobPosts/date/${day.dateString}`);
      setJobDetails(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ShapesIcon shapes={require('../assets/shapes.png')} />
      <View style={styles.content}>
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
        <Calendar
          markedDates={markedDates}
          markingType={'custom'}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: 'white',
            textSectionTitleColor: 'black',
            dayTextColor: 'black',
            todayTextColor: 'red',
            todayBackgroundColor: 'lightgrey',
          }}
        />
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Job Details for {selectedDate}</Text>
              {jobDetails.length > 0 ? (
                jobDetails.map((job) => (
                  <View key={job._id} style={styles.jobDetail}>
                    <Text>JobDescription: {job.JobDescription}</Text>
                    <Text>Shift: {job.Shift}</Text>
                    <Text>Starttime & Endtime: {job.Starttime} - {job.Endtime}</Text>
                    <Text>Location: {job.Location}</Text>
                    <Text>Status: {job.status}</Text>
                  </View>
                ))
              ) : (
                <Text>No job details available for this date.</Text>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginRight: 15,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  jobDetail: {
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    flex: 1,
  },
  menuButton: {
    marginRight: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
