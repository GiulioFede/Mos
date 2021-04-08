import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import HomeNavigator from "./assets/navigation/navigation.home"

export default function App() {

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <HomeNavigator />
        <StatusBar
          backgroundColor="#fff"
          barStyle="dark-content" // Here is where you change the font-color
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  safeArea:{
    flex:1
  }
});
