import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform, TouchableOpacity, ScrollView, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import instance from '../axios-instance';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { usePushNotifications } from './Notification';
import * as Notifications from 'expo-notifications';
import { Picker } from '@react-native-picker/picker';


interface JobPost {
  _id: string;
  Date: string;
  Shift: string;
  Location: string;
  Starttime: string;
  Endtime: string;
  JobDescription: string;
  Payment: string;
  TemplateName: string; 
}

type DashboardProps = {
  navigation: NavigationProp<ParamListBase>;
};

const JobPostForm: React.FC<DashboardProps> = ({ navigation }) => {
  const { expoPushToken } = usePushNotifications();

  const [Shift, setShift] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [Location, setLocation] = useState('');
  const [Starttime, setStarttime] = useState('');
  const [Endtime, setEndtime] = useState('');
  const [JobDescription, setJobDescription] = useState('');
  const [Payment, setPayment] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [templates, setTemplates] = useState<JobPost[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [TemplateName, setTemplateName] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await instance.get('/jobPosts?isTemplate=true');
      setTemplates(response.data);
    } catch (error: any) {
      console.error('Error fetching templates:', error.message);
      Alert.alert('Error', 'Failed to fetch templates');
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      clearForm();
      return;
    }

    try {
      const response = await instance.get(`/jobPosts/templates/${templateId}`);
      const template = response.data;

      setShift(template.Shift);
      setDate(new Date(template.Date));
      setLocation(template.Location);
      setStarttime(template.Starttime);
      setEndtime(template.Endtime);
      setJobDescription(template.JobDescription);
      setPayment(template.Payment);
      setTemplateName(template.TemplateName);
      setSelectedTemplate(templateId);

      Alert.alert('Success', 'Template selected successfully');
    } catch (error: any) {
      console.error('Error selecting template:', error.message);
      Alert.alert('Error', 'Failed to select template');
    }
  };

  const clearForm = () => {
    setShift('');
    setDate(new Date());
    setLocation('');
    setStarttime('');
    setEndtime('');
    setJobDescription('');
    setPayment('');
    setIsTemplate(false);
    setTemplateName('');
    setSelectedTemplate('');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStarttime(selectedTime.toLocaleTimeString());
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEndtime(selectedTime.toLocaleTimeString());
    }
  };
//   const validateJobPostData = (data:any) => {
//   if (!data.Shift || !data.Date ) {
//     throw new Error('Missing required fields');
//   }
//   // Additional validation logic as needed
// };
  const handleSubmit = async () => {
    try {
      const response = await instance.post('/jobPosts', {
        Shift,
        Date: date.toISOString().split('T')[0],
        Location,
        Starttime,
        Endtime,
        JobDescription,
        Payment,
        status: 'open',
        expoPushToken: expoPushToken?.data,
        isTemplate,
        TemplateName,
      });
      
      Alert.alert('Success', 'Job post created successfully');
      console.log('Job post created:', response.data);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Job Posted!',
          body: 'A new job post has been created.',
        },
        trigger: null,
      });

      clearForm();
    } catch (error: any) {
      console.error('Error creating job post:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to create job post');
    }
  };
const SAVE = async () => {
  try {
    const response = await instance.post('/jobPosts', {
      Shift,
      Date: date.toISOString().split('T')[0],
      Location,
      Starttime,
      Endtime,
      JobDescription,
      Payment,
      status: 'draft',
      isTemplate,
      TemplateName,
    });
    
    Alert.alert('Success', 'Job post saved as draft successfully');
    console.log('Job draft saved:', response.data);

    clearForm();
  } catch (error: any) {
    console.error('Error saving job draft:', error.response ? error.response.data : error.message);
    Alert.alert('Error', 'Failed to save job draft');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.dashboard}>
          <Text style={styles.heading}>Job Post</Text>
      
        
           <Picker
            selectedValue={selectedTemplate}
            style={styles.input}
            onValueChange={(itemValue) => {
              setSelectedTemplate(itemValue as string);
              handleTemplateSelect(itemValue as string);
            }}
          >
            <Picker.Item label="Select a template" value="" />
            {templates.map((template) => (
              <Picker.Item key={template._id} label={template.TemplateName} value={template._id} />
            ))}
          </Picker> 
         
         
          <Text style={styles.label}>Shift</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={Shift}
              onValueChange={(itemValue: string) => setShift(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Shift" value="" />
              <Picker.Item label="Morning" value="Morning" />
              <Picker.Item label="Night" value="Night" />
            </Picker>
          </View>

          <Text style={styles.label}>Date</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputTouchable} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputText}>{date.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={Location}
            onChangeText={setLocation}
            placeholder="Enter Location"
          />

          <Text style={styles.label}>Start Time</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputTouchable} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.inputText}>{Starttime || 'Select Start Time'}</Text>
            </TouchableOpacity>
          </View>

          {showStartTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}

          <Text style={styles.label}>End Time</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputTouchable} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.inputText}>{Endtime || 'Select End Time'}</Text>
            </TouchableOpacity>
          </View>

          {showEndTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}

          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={styles.input}
            value={JobDescription}
            onChangeText={setJobDescription}
            placeholder="Enter Job Description"
          />

          <Text style={styles.label}>Payment</Text>
          <TextInput
            style={styles.input}
            value={Payment}
            onChangeText={setPayment}
            placeholder="Enter Payment"
          />

          

          {isTemplate && (
            <>
              <Text style={styles.label}>Template Name</Text>
              <TextInput
                style={styles.input}
                value={TemplateName}
                onChangeText={setTemplateName}
                placeholder="Enter Template Name"
                editable={isTemplate}
              />
            </>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsTemplate(!isTemplate)}
            >
              <Text style={styles.checkboxText}>{isTemplate ? '✓' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Save as Template</Text>
          </View>
              <Button  title="SAVE" onPress={SAVE} />
          <Button title="Submit" onPress={handleSubmit} />
        
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  dashboard: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button:{
    padding: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 40,
  },
  inputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
  },
  inputTouchable: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  inputText: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
  },
});

export default JobPostForm;
