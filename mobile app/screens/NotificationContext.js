// NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const STORAGE_KEY = 'notifications';
const USER_ID_KEY = 'userId'; // Key for storing user ID

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null); // Track logged-in user's ID

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Retrieve logged-in user's ID
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        setUserId(storedUserId);

        // Retrieve notifications and filter by user ID
        const storedNotifications = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          // Filter notifications to only include those for the logged-in user
          const userNotifications = parsedNotifications.filter(notification => notification.userId === storedUserId);
          setNotifications(userNotifications);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const addNotification = async (notification) => {
    try {
      const newNotification = { ...notification, userId }; // Add user ID to notification
      const newNotifications = [...notifications, newNotification];
      setNotifications(newNotifications);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
