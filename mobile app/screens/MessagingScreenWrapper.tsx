import React from 'react';
import { RouteProp } from '@react-navigation/native';
import MessagingScreen, { MessagingScreenProps } from '../screens/message';

type MessagingScreenWrapperProps = {
  route: RouteProp<{ params: { receiverId: string } }, 'params'>;
};

const MessagingScreenWrapper: React.FC<MessagingScreenWrapperProps> = ({ route }) => {
  const { receiverId } = route.params;
  return <MessagingScreen receiverId={receiverId} />;
};

export default MessagingScreenWrapper;
