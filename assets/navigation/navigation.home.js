import React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

import { Button } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen/homeScreen';



const Drawer = createDrawerNavigator();

/*QUESTO E' IL CUORE DELL'APP: La Home Navigator definisce due sezioni:
    1) Home: sarebbe la parte centrale dell'app: chat, around you e profile.
    2) Varie sezioni: Account...

    Quella di default è la Home. In qualsiasi delle sue tre schermate è possibile aprire il menu laterale e accedere alla seconda
    parte dell'app (es. Account).
*/


export default function HomeNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Informazioni Personali" component={InformazioniPersonali} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

function InformazioniPersonali({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button onPress={() => navigation.goBack()} title="Go back home" />
      </View>
    );
  }

//-------------------



const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });
  