import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import moment from 'moment';
import axios from 'axios';

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

  useEffect(() => {
    const fetchJobDates = async () => {
      try {
        const response = await axios.get<JobPost[]>('http://192.168.106.5:5000/api/jobPosts');
        const jobs = response.data;

        // Define colors based on job status
        const statusColors: { [key: string]: string } = {
          'open': '#2775BD',
          'completed': '#0BB039',
          'upcoming': 'yellow',
          'checkedIn': 'orange',
          // 'default': 'grey'
        };

        // Map job dates to background colors
        const datesWithJobs = jobs.reduce((acc: { [key: string]: { customStyles: { container: { backgroundColor: string }; text: { color: string }; dotColor?: string } } }, job: JobPost) => {
          const jobDate = moment(job.Date).format('YYYY-MM-DD');
          const backgroundColor = statusColors[job.status] || statusColors['default'];

          acc[jobDate] = {
            customStyles: {
              container: {
                backgroundColor,
              },
              text: {
                color: 'black', // Text color set to black
              },
              dotColor: backgroundColor, // Dot color
            },
          };

          return acc;
        }, {});

        setMarkedDates(datesWithJobs);
      } catch (error) {
        console.error('Error fetching job dates:', error);
      }
    };

    fetchJobDates();
  }, []);

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    try {
      const response = await axios.get<JobPost[]>(`http://192.168.106.5:5000/api/jobPosts/date/${day.dateString}`);
      setJobDetails(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  return (
    <View style={styles.container}>
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
            {jobDetails.map((job) => (
              <View key={job._id} style={styles.jobDetail}>
                <Text>{job.JobDescription}</Text>
                <Text>{job.Shift}</Text>
                <Text>{job.Starttime} - {job.Endtime}</Text>
                <Text>{job.Location}</Text>
                <Text>Status: {job.status}</Text>
              </View>
            ))}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
