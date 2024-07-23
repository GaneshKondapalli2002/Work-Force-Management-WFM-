import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, ImageSourcePropType } from "react-native";

export type ShapesIconType = {
  shapes?: ImageSourcePropType;
};

const ShapesIcon = ({ shapes }: ShapesIconType) => {
  return <Image style={styles.shapesIcon} contentFit="cover" source={shapes} />;
};

const styles = StyleSheet.create({
  shapesIcon: {
    position: "absolute",
    top: -129,
    left: -97,
    width: 300,
    height: 288,
  },
});

export default ShapesIcon;
