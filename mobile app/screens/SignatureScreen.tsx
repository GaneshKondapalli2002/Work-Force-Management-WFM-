import React, { useRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { NavigationProp } from '@react-navigation/native';

interface SignatureProps {
  navigation: NavigationProp<any, any>;
}

const Signature = React.forwardRef<SignatureViewRef, SignatureProps>(({ navigation }, ref) => {
  const localRef = useRef<SignatureViewRef>(null);

  useImperativeHandle(ref, () => localRef.current as SignatureViewRef);

  const handleSignature = (signature: string) => {
    console.log(signature);
    // Process the signature here (e.g., save it to state, upload to server, etc.)
    Alert.alert("Signature Captured", "Your signature has been saved successfully.");
    navigation.goBack(); // Navigate back after capturing the signature
  };

  const handleEmpty = () => {
    Alert.alert("No Signature", "Please provide a signature.");
  };

  const webStyle = `
    .m-signature-pad--footer {
      display: none;
      margin: 0px;
    }
    .m-signature-pad {
      box-shadow: none;
      border: none;
    }
  `;

  return (
    <View style={styles.container}>
      <SignatureScreen
        ref={localRef}
        onOK={handleSignature}
        onEmpty={handleEmpty}
        descriptionText="Sign"
        clearText="Clear"
        confirmText="Save"
        webStyle={webStyle}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Signature;
