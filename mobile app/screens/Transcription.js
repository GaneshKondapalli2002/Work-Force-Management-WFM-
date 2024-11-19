import React, { useState } from 'react';
import { View, Text, Button, TextInput, ActivityIndicator } from 'react-native';
import { startTranscriptionJob, checkTranscriptionJobStatus } from '../services/transcriptionService';

const Transcription = () => {
  const [mediaFileUri, setMediaFileUri] = useState('');
  const [transcriptionJobName, setTranscriptionJobName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartJob = async () => {
    setLoading(true);
    try {
      const result = await startTranscriptionJob(mediaFileUri, transcriptionJobName);
      setStatus(`Job started: ${result.msg}`);
    } catch (error) {
      setStatus('Error starting job');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const result = await checkTranscriptionJobStatus(transcriptionJobName);
      setStatus(`Job status: ${result.status}`);
    } catch (error) {
      setStatus('Error checking job status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="S3 Media File URI"
        value={mediaFileUri}
        onChangeText={setMediaFileUri}
        style={{ borderWidth: 1, borderColor: 'gray', marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Transcription Job Name"
        value={transcriptionJobName}
        onChangeText={setTranscriptionJobName}
        style={{ borderWidth: 1, borderColor: 'gray', marginBottom: 10, padding: 8 }}
      />
      <Button title="Start Transcription Job" onPress={handleStartJob} />
      <Button title="Check Job Status" onPress={handleCheckStatus} style={{ marginTop: 10 }} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {status && <Text style={{ marginTop: 10 }}>{status}</Text>}
    </View>
  );
};

export default Transcription;
