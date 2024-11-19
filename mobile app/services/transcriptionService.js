import axios from 'axios';

// Base URL of your backend API
const API_BASE_URL = 'http://192.168.230.5:5000/api/transcription'; // Replace with your backend URL

// Function to start a transcription job
export const startTranscriptionJob = async (mediaFileUri, transcriptionJobName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/start`, {
      mediaFileUri,
      transcriptionJobName,
    });
    return response.data;
  } catch (error) {
    console.error('Error starting transcription job:', error);
    throw error;
  }
};

// Function to check the status of a transcription job
export const checkTranscriptionJobStatus = async (jobName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status/${jobName}`);
    return response.data;
  } catch (error) {
    console.error('Error checking transcription job status:', error);
    throw error;
  }
};
