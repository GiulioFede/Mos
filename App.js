import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import HomeNavigator from "./assets/navigation/navigation.home";
import { NavigationContainer, StackActions } from '@react-navigation/native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import LoginScreen from './assets/navigation/LoginScreen/loginScreen';
import RegisterScreen from './assets/navigation/RegisterScreen/registerScreen';

const Stack = createStackNavigator();

export default function App() {

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{...TransitionPresets.ModalPresentationIOS}} headerMode="none" initialRouteName="LoginScreen">
              <Stack.Screen name="LoginScreen"component={LoginScreen} />
              <Stack.Screen name="RegisterScreen"component={RegisterScreen} />
              <Stack.Screen name="Home"component={HomeNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" 
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
