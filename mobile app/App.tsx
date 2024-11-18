import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IPhone1415ProMax from './screens/IPhone1415ProMax';
import Registration from './screens/Registration';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Profile from './screens/profile';
import Home from './screens/home';
import OTPVerification from './screens/otpverification';
import JobPostForm from './screens/jobpost';
import UpcomingScreen from './screens/oncoming';
import { usePushNotifications } from './screens/Notification'; 
import Completed from './screens/completed';
import Admin from './screens/admin';
import open from './screens/open';
import Notificationscreen from './screens/notificationscreen';
import Calendar  from './screens/calendar';
import { NotificationProvider } from './screens/NotificationContext';

const Stack = createNativeStackNavigator();

const App = () => {
  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);

  // Load fonts with useFonts hook
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  // Check if fonts are loaded
  if (!fontsLoaded) {
    return null; // Return null or a loading indicator until fonts are loaded
  }

  return (
    <NotificationProvider>
    <NavigationContainer>
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="IPhone1415ProMax" component={IPhone1415ProMax} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="JobPostForm" component={JobPostForm} />
        <Stack.Screen name="UpcomingScreen" component={UpcomingScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="Completed" component={Completed} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="open" component={open} />
        <Stack.Screen name="Notificationscreen" component={Notificationscreen} />
        <Stack.Screen name="Calendar" component={Calendar} />
      </Stack.Navigator>
    </NavigationContainer>
    </NotificationProvider>
  );
};

export default App;
