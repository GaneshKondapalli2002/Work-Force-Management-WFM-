// import React, { useRef } from 'react';
// import { View, StyleSheet, Button } from 'react-native';
// import Signature, { SignatureViewRef } from 'react-native-signature-canvas';

// const SignatureScreen: React.FC = () => {
//   const ref = useRef<SignatureViewRef>(null);

//   const handleSignature = (signature: string) => {
//     console.log(signature);
//   };

//   const handleClear = () => {
//     ref.current?.clearSignature();
//   };

//   const handleConfirm = () => {
//     ref.current?.readSignature();
//   };

//   return (
//     <View style={styles.container}>
//       <Signature
//         ref={ref}
//         onOK={handleSignature}
//         descriptionText="Sign"
//         clearText="Clear"
//         confirmText="Save"
//         webStyle={signaturePadStyle}
//       />
//       <Button title="Clear" onPress={handleClear} />
//       <Button title="Save" onPress={handleConfirm} />
//     </View>
//   );
// };

// const signaturePadStyle = `
//   .m-signature-pad--footer {
//     display: none;
//     margin: 0px;
//   }
// `;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default SignatureScreen;
