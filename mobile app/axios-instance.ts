import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance
const instance: AxiosInstance = axios.create({
  baseURL: 'http://192.168.1.34:5000/api',
  timeout: 10000,
});

// Request interceptor to add authorization token
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error: any) {
      console.error('Error fetching token from AsyncStorage:', error.message);
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Handle response errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

// Define the JobPost type
export interface JobPost {
  _id: string;
  JobDescription: string;
  Date: string;
  Shift: string;
  Starttime: string;
  Endtime: string;
  Location: string;
  AssignedTo: string;
  status: string;
  isTemplate: boolean;
  Payment: string;
  user: string; // Add the missing property here
}

export interface Profile {
  address?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  qualifications?: string;
  skills?: string;
  idOptions?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profile: Profile;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

// Send a message
export const sendMessage = async (receiverId: string, message: string): Promise<Message> => {
  try {
    const response = await instance.post<Message>('/messages', { receiver: receiverId, message });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Fetch messages between the current user and another user
export const fetchMessages = async (receiverId: string): Promise<Message[]> => {
  try {
    const response = await instance.get<Message[]>(`/messages/${receiverId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};


// Fetch all job posts
export const fetchAllJobPosts = async (): Promise<JobPost[]> => {
  try {
    const response = await instance.get<JobPost[]>('/jobPosts');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Fetch a specific job post by ID
export const fetchJobPostById = async (postId: string): Promise<JobPost> => {
  try {
    const response = await instance.get<JobPost>(`/jobPosts/${postId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Create a new job post
export const createJobPost = async (newJobPost: JobPost): Promise<JobPost> => {
  try {
    const response = await instance.post<JobPost>('/jobPosts', newJobPost);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Update a job post
export const updateJobPost = async (postId: string, updatedJobPost: JobPost): Promise<JobPost> => {
  try {
    const response = await instance.put<JobPost>(`/jobPosts/${postId}`, updatedJobPost);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Delete a job post
export const deleteJobPost = async (postId: string): Promise<void> => {
  try {
    await instance.delete(`/jobPosts/${postId}`);
  } catch (error: any) {
    throw error;
  }
};

// Fetch all templates
export const fetchAllTemplates = async (): Promise<JobPost[]> => {
  try {
    const response = await instance.get<JobPost[]>('/templates');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Save a new template
export const saveTemplate = async (template: JobPost): Promise<JobPost> => {
  try {
    const response = await instance.post<JobPost>('/templates', template);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const fetchNotificationsFromAPI = async (): Promise<any[]> => {
  try {
    const response = await instance.get('/notifications');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error.message || error);
    return [];
  }
};



// export const startTranscription = async (jobName: string, audioUrl: string, outputBucket: string) => {
//   try {
//     const response = await instance.post('/transcription/start', {
//       jobName,
//       audioUrl,
//       outputBucket,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error('Error starting transcription:', error);
//     throw error;
//   }
// };

// export const checkStatus = async (jobName: string) => {
//   try {
//     const response = await instance.get(`/transcription/status/${jobName}`);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error checking transcription status:', error);
//     throw error;
//   }
// };

// export const recognizeSpeech = async (audioUri: string): Promise<string> => {
//   const jobName = `transcriptionJob_${Date.now()}`;
//   const audioUrl = `s3://myspeechbuckets /${audioUri}`; // Replace with actual S3 URL
//   const outputBucket = 'myspeechbuckets'; // Replace with actual S3 bucket name

//   await startTranscription(jobName, audioUrl, outputBucket);
//   await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute before checking status

//   const statusData = await checkStatus(jobName);
//   if (statusData.status === 'completed') {
//     const transcriptResponse = await axios.get(statusData.transcriptUri);
//     return transcriptResponse.data.results.transcripts[0].transcript;
//   } else {
//     throw new Error('Transcription job failed or is still in progress');
//   }
// };

export default instance;