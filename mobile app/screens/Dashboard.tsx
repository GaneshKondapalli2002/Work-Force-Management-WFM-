  import React, { useEffect, useState } from 'react';
  import { StyleSheet, View, Text, Image, TouchableOpacity} from "react-native";
  import ShapesIcon from "../components/ShapesIcon";
  import { NavigationProp, ParamListBase } from '@react-navigation/native';
  import Notifications from "../components/Notifications";
  import Clock from "../components/Clock";
  import { FontSize, Color, FontFamily } from "../GlobalStyles";

  type DashboardProps = {
    navigation: NavigationProp<ParamListBase>; // Explicitly type navigation prop
  };

  const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
    const navigateToProfile = () => {
      navigation.navigate('Profile'); // Navigate to the 'Profile' screen
    };

    return (
      
      <View style={styles.dashboard}>
        <View style={styles.dashboardChild} />
        <ShapesIcon shapes={require("../assets/shapes1.png")} />
        <Image
          style={[styles.wifiIcon, styles.iconLayout]}
          resizeMode="cover"
          source={require("../assets/wifi.png") as any} // Explicitly cast require statement
        />
        <Notifications />
        <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
          <Text style={styles.profileButtonText}>Login</Text>
        </TouchableOpacity>
        <Image
          style={styles.dashboardItem}
          resizeMode="cover"
          source={require("../assets/ellipse-3.png") as any} // Explicitly cast require statement
        />
        <Text style={styles.welcomeIsabellaAva}>Welcome Isabella Ava</Text>
        <Clock />

        <Text style={styles.goodAfternoon}>Good Afternoon</Text>
        <Text style={[styles.taskList, styles.taskListTypo]}>Task List</Text>
        <View style={styles.dashboardInner} />
        <Text style={[styles.dailyTasks, styles.taskListTypo]}>Daily Tasks</Text>
        <Image
          style={[styles.vectorIcon, styles.iconLayout]}
          resizeMode="cover"
          source={require("../assets/vector.png") as any} // Explicitly cast require statement
        />
        <View style={[styles.rectangleView, styles.dashboardChildLayout]} />
        <Text style={[styles.meetingAt12am, styles.meetJoshAtTypo]}>
          meeting at 12am
        </Text>
        <View style={[styles.dashboardChild1, styles.dashboardChildLayout]} />
        <Text style={[styles.workCompleted3pm, styles.meetJoshAtTypo]}>
          Work completed 3pm
        </Text>
        <View style={[styles.dashboardChild2, styles.dashboardChildLayout]} />
        <Text style={[styles.meetJoshAt, styles.meetJoshAtTypo]}>
          meet josh at mall 7pm
        </Text>
        <View style={[styles.dashboardChild3, styles.dashboardChildLayout]} />
        <Text style={[styles.drivingSchoolAt, styles.meetJoshAtTypo]}>
          Driving school at 5pm
        </Text>
        <View style={styles.dashboardChild4} />
      
      </View>
      
    );
  };

  const styles = StyleSheet.create({
    iconLayout: {
      maxHeight: "100%",
      maxWidth: "100%",
      position: "absolute",
      overflow: "hidden",
    },
    taskListTypo: {
      fontSize: FontSize.size_sm,
      textAlign: "center",
      color: Color.colorBlack,
      fontFamily: FontFamily.poppinsBold,
      fontWeight: "700",
      position: "absolute",
    },
    dashboardChildLayout: {
      height: 17,
      width: 17,
      borderWidth: 2,
      borderColor: Color.colorBlack,
      borderStyle: "solid",
      left: 73,
      position: "absolute",
    },
    profileButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: Color.colorBlack,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    profileButtonText: {
      color: Color.colorWhite,
      fontFamily: FontFamily.poppinsBold,
    },
    meetJoshAtTypo: {
      fontFamily: FontFamily.poppinsRegular,
      left: 100,
      textAlign: "center",
      color: Color.colorBlack,
      fontSize: FontSize.size_xs,
      position: "absolute",
    },
    dashboardChild: {
      top: 0,
      left: 0,
      width: 430,
      height: 333,
      backgroundColor: Color.colorMediumturquoise_200,
      position: "absolute",
    },
    wifiIcon: {
      height: "2.68%",
      width: "5.81%",
      top: "1.82%",
      right: "17.21%",
      bottom: "95.49%",
      left: "76.98%",
    },
    dashboardItem: {
      top: 122,
      left: 137,
      width: 150,
      height: 150,
      position: "absolute",
    },
    welcomeIsabellaAva: {
      top: 295,
      left: 97,
      fontSize: FontSize.size_xl,
      color: Color.colorWhite,
      textAlign: "left",
      fontFamily: FontFamily.poppinsBold,
      fontWeight: "700",
      position: "absolute",
    },
    goodAfternoon: {
      top: 376,
      left: 295,
      textAlign: "center",
      color: Color.colorBlack,
      fontSize: FontSize.size_xs,
      fontFamily: FontFamily.poppinsBold,
      fontWeight: "700",
      position: "absolute",
    },
    taskList: {
      top: 578,
      left: 25,
    },
    dashboardInner: {
      top: 612,
      left: 50,
      shadowColor: "rgba(0, 0, 0, 0.25)",
      shadowOffset: {
        width: 10,
        height: 4,
      },
      shadowRadius: 4,
      elevation: 4,
      shadowOpacity: 1,
      borderRadius: 13,
      width: 331,
      height: 285,
      backgroundColor: Color.colorWhite,
      position: "absolute",
    },
    dailyTasks: {
      top: 636,
      left: 67,
    },
      editButton: {
      backgroundColor: '#69DCCE',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    vectorIcon: {
      height: "2.6%",
      width: "5.63%",
      top: "68.03%",
      right: "14.14%",
      bottom: "29.38%",
      left: "80.23%",
    },
    rectangleView: {
      top: 686,
      backgroundColor: Color.colorMediumturquoise_200,
    },
    meetingAt12am: {
      top: 685,
    },
    dashboardChild1: {
      top: 742,
      backgroundColor: Color.colorWhite,
    },
    workCompleted3pm: {
      top: 738,
    },
    dashboardChild2: {
      top: 789,
      backgroundColor: Color.colorWhite,
    },
    meetJoshAt: {
      top: 836,
    },
    dashboardChild3: {
      top: 837,
      backgroundColor: Color.colorWhite,
    },
    drivingSchoolAt: {
      top: 785,
    },
    dashboardChild4: {
      top: 729,
      left: 355,
      backgroundColor: "#c9c8c8",
      width: 3,
      height: 83,
      position: "absolute",
    },
    dashboard: {
      backgroundColor: Color.colorWhitesmoke,
      flex: 1,
      width: "100%",
      height: 932,
      overflow: "hidden",
    },
  });

  export default Dashboard;
