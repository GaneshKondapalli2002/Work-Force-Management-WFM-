  import * as React from "react";
  import { Image } from "expo-image";
  import { StyleSheet, Text, View } from "react-native";
  import { FontSize, FontFamily, Color } from "../GlobalStyles";

  const Notifications = () => {
    return (
      <View style={styles.notifications}>
        <Image
          style={[styles.signalIcon, styles.iconLayout]}
          contentFit="cover"
          source={require("../assets/signal.png")}
        />
        <Image
          style={[styles.batteryHalfIcon, styles.iconLayout]}
          contentFit="cover"
          source={require("../assets/batteryhalf.png")}
        />
        <Text style={styles.text}>{`9:40 `}</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    iconLayout: {
      maxHeight: "100%",
      overflow: "hidden",
      maxWidth: "100%",
      width: "6.96%",
      height: "86.21%",
      position: "absolute",
    },
    signalIcon: {
      top: "6.9%",
      right: "21.17%",
      bottom: "6.9%",
      left: "71.87%",
    },
    batteryHalfIcon: {
      top: "0%",
      right: "0%",
      bottom: "13.79%",
      left: "93.04%",
    },
    text: {
      top: "17.24%",
      left: "0%",
      fontSize: FontSize.size_base,
      fontWeight: "700",
      fontFamily: FontFamily.poppinsBold,
      color: Color.colorBlack,
      textAlign: "left",
      position: "absolute",
    },
    notifications: {
      top: 15,
      left: 35,
      width: 359,
      height: 29,
      position: "absolute",
    },
  });

  export default Notifications;
