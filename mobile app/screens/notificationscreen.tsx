import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePushNotifications, PushNotificationState } from './Notification';

const NotificationScreen: React.FC = () => {
  const { notification } = usePushNotifications();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      {notification ? (
        <View style={styles.notification}>
          <Text>{notification.request.content.title}</Text>
          <Text>{notification.request.content.body}</Text>
        </View>
      ) : (
        <Text>No notifications</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notification: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});

export default NotificationScreen;
