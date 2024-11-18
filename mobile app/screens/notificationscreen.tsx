// NotificationScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotification } from './NotificationContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Notification: undefined;
  Home: undefined;
  // add other screens as needed
};

interface Notification {
  title: string;
  body: string;
  date: string; // Assuming this is an ISO string
  userId: string; // Ensure userId is included
}

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notification'>;

const NotificationScreen = () => {
  const { notifications } = useNotification();
  const navigation = useNavigation<NotificationScreenNavigationProp>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  const navigateToHome = async () => {
    try {
      navigation.navigate('Home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigateToHome}>
        <Text style={styles.title}>{' Notifications'}</Text>
      </TouchableOpacity>
      {notifications.length > 0 ? (
        notifications.map((notification: Notification, index: number) => (
          <View key={index} style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>
              {notification.title}
              <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
            </Text>
            <Text style={styles.notificationBody}>{notification.body}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noNotifications}>No notifications available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    padding: 20,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    marginTop: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  noNotifications: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
});

export default NotificationScreen;
