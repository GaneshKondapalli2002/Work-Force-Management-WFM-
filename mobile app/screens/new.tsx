import React, { useRef } from 'react';
import { Button, View } from 'react-native';
import SignatureScreen from './SignatureScreen';
import { NavigationProp } from '@react-navigation/native';
import { SignatureViewRef } from 'react-native-signature-canvas'; // Ensure this import is correct

const ParentComponent: React.FC<{ navigation: NavigationProp<any, any> }> = ({ navigation }) => {
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleSave = () => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SignatureScreen ref={signatureRef} navigation={navigation} />
      <Button title="Save Signature" onPress={handleSave} />
    </View>
  );
};

export default ParentComponent;
