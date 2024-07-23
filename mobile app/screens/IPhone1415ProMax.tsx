import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, View, Text, Pressable } from "react-native";
import ShapesIcon from "../components/ShapesIcon";
import Notifications from "../components/Notifications";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, ParamListBase } from "@react-navigation/native";
import { Color, FontSize, FontFamily } from "../GlobalStyles";

const IPhone1415ProMax = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  return (
    <View style={styles.iphone1415ProMax1}>
      <ShapesIcon shapes={require("../assets/shapes.png")} />
      <Image
        style={styles.wifiIcon}
        contentFit="cover"
        source={require("../assets/wifi.png")}
      />
      <Notifications />
      <Image
        style={styles.undrawMobileContentXvgr1Icon}
        contentFit="cover"
        source={require("../assets/undraw-mobile-content-xvgr-1.png")}
      />
      <View style={styles.iphone1415ProMax1Child} />
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("Registration")}
      >
        <Text style={styles.getStarted}>Get Started</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wifiIcon: {
    height: "2.68%",
    width: "5.81%",
    top: "1.82%",
    right: "17.21%",
    bottom: "95.49%",
    left: "76.98%",
    maxWidth: "100%",
    maxHeight: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  undrawMobileContentXvgr1Icon: {
    top: 233,
    left: 86,
    width: 245,
    height: 233,
    position: "absolute",
    overflow: "hidden",
  },
  iphone1415ProMax1Child: {
    top: 794,
    left: 40,
    backgroundColor: Color.colorMediumturquoise_100,
    width: 354,
    height: 69,
    position: "absolute",
  },
  getStarted: {
    fontSize: FontSize.size_5xl,
    fontFamily: FontFamily.poppinsRegular,
    color: Color.colorWhite,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 352,
    height: 66,
  },
  button: {
    left: 42,
    top: 797,
    position: "absolute",
  },
  iphone1415ProMax1: {
    backgroundColor: Color.colorWhitesmoke,
    flex: 1,
    width: "100%",
    height: 932,
    overflow: "hidden",
  },
});

export default IPhone1415ProMax;
