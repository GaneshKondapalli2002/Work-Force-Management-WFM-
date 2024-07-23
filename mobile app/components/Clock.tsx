import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, View, Text } from "react-native";
import { Border, Color, FontFamily, FontSize } from "../GlobalStyles";

const Clock = () => {
  return (
    <View style={styles.clock}>
      <Image
        style={[styles.clockChild, styles.clockChildLayout]}
        contentFit="cover"
        source={require("../assets/ellipse-4.png")}
      />
      <View style={styles.clockItem} />
      <Image
        style={[styles.clockInner, styles.clockInnerLayout]}
        contentFit="cover"
        source={require("../assets/rectangle-8.png")}
      />
      <Image
        style={[styles.rectangleIcon, styles.clockInnerLayout]}
        contentFit="cover"
        source={require("../assets/rectangle-9.png")}
      />
      <Image
        style={[styles.ellipseIcon, styles.clockChildLayout]}
        contentFit="cover"
        source={require("../assets/ellipse-6.png")}
      />
      <Text style={[styles.text, styles.textTypo1]}>12</Text>
      <Text style={[styles.text1, styles.textTypo1]}>6</Text>
      <Text style={[styles.text2, styles.textTypo]}>3</Text>
      <Text style={[styles.text3, styles.textTypo]}>9</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  clockChildLayout: {
    maxHeight: "100%",
    overflow: "hidden",
    maxWidth: "100%",
    position: "absolute",
  },
  clockInnerLayout: {
    right: "49.75%",
    borderRadius: Border.br_81xl,
    maxHeight: "100%",
    overflow: "hidden",
    maxWidth: "100%",
    position: "absolute",
  },
  textTypo1: {
    textAlign: "center",
    color: Color.colorBlack,
    fontFamily: FontFamily.poppinsRegular,
    fontSize: FontSize.size_3xs,
    position: "absolute",
  },
  textTypo: {
    top: "44.17%",
    textAlign: "center",
    color: Color.colorBlack,
    fontFamily: FontFamily.poppinsRegular,
    fontSize: FontSize.size_3xs,
    position: "absolute",
  },
  clockChild: {
    height: "100%",
    width: "100%",
    top: "0%",
    right: "0%",
    bottom: "0%",
    left: "0%",
  },
  clockItem: {
    height: "1.25%",
    width: "36.67%",
    top: "50%",
    right: "15%",
    bottom: "48.75%",
    left: "48.33%",
    backgroundColor: Color.colorLightseagreen,
    borderRadius: Border.br_81xl,
    position: "absolute",
  },
  clockInner: {
    height: "29.5%",
    width: "17.75%",
    top: "49.17%",
    bottom: "21.33%",
    left: "32.5%",
  },
  rectangleIcon: {
    height: "22.75%",
    width: "25.5%",
    top: "28%",
    bottom: "49.25%",
    left: "24.75%",
  },
  ellipseIcon: {
    height: "8.33%",
    width: "8.33%",
    top: "46.67%",
    right: "46.67%",
    bottom: "45%",
    left: "45%",
  },
  text: {
    top: "2.5%",
    left: "45.83%",
  },
  text1: {
    top: "87.5%",
    left: "46.67%",
  },
  text2: {
    left: "94.17%",
  },
  text3: {
    left: "2.5%",
  },
  clock: {
    top: 431,
    left: 155,
    width: 120,
    height: 120,
    position: "absolute",
  },
});

export default Clock;
