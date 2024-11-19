import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { sendMessage, fetchMessages, Message } from '../axios-instance'; 
import { RouteProp } from '@react-navigation/native';


export interface MessagingScreenProps {
  receiverId: string;
}

const MessagingScreen: React.FC<MessagingScreenProps> = ({ receiverId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMessages(receiverId);
        setMessages(fetchedMessages);
      } catch (error: any) {
        console.error('Failed to fetch messages:', error.message);
      }
    };

    loadMessages();
  }, [receiverId]);

  const handleSendMessage = async () => {
    try {
      const sentMessage = await sendMessage(receiverId, newMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text>{item.sender === receiverId ? 'Them' : 'You'}: {item.message}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default MessagingScreen;
