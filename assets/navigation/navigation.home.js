import React, {useContext} from 'react';
import {Text, View, StyleSheet } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

import { Button } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import HomeScreen from './HomeScreen/homeScreen';
import { AutenticazioneUtente } from '../context/firebase/autenticazione';



const Drawer = createDrawerNavigator();

/*QUESTO E' IL CUORE DELL'APP: La Home Navigator definisce due sezioni:
    1) Home: sarebbe la parte centrale dell'app: chat, around you e profile.
    2) Varie sezioni: Account...

    Quella di default è la Home. In qualsiasi delle sue tre schermate è possibile aprire il menu laterale e accedere alla seconda
    parte dell'app (es. Account).
*/

export default function HomeNavigator({navigation}) {

  //contesto autenticazione
var {logOut} = useContext(AutenticazioneUtente);

function AltriPulsanti(props) {
  return (
    <DrawerContentScrollView {...props}>
       {/*inserisco prima gli Screen definiti nel Drawer.Navigator*/}
      <DrawerItemList {...props} /> 
      {/*aggiungo il bottone di logOut*/}
      <DrawerItem label="Logout" onPress={() => logOut().then((ok)=>navigation.navigate("LoginScreen")).catch((e)=>{console.log("errore al logout"); navigation.navigate("LoginScreen")})} /> 
    </DrawerContentScrollView>
  );
}

  return (
      <Drawer.Navigator initialRouteName="Home" drawerContent={props => <AltriPulsanti {...props} />} >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Informazioni Personali" component={InformazioniPersonali} />
       
      </Drawer.Navigator>
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
  