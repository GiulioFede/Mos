import React, {useContext} from "react";
import {View,StatusBar} from "react-native";
import { ActivityIndicator} from 'react-native-paper';
import LoginScreen from './assets/navigation/LoginScreen/loginScreen';
import RegisterScreen from './assets/navigation/RegisterScreen/registerScreen';
import HomeNavigator from "./assets/navigation/navigation.home";
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { AutenticazioneUtente } from "./assets/context/firebase/autenticazione";
import { MosCeleste } from "./assets/resources/colors";
import PhoneAuthScreen from "./assets/navigation/PhoneAuthScreen/phoneAuth_screen";
import PhoneAuthVerificationCodeScreen from "./assets/navigation/PhoneAuthScreen/phoneAuthVerificationCode_screen";
import {ColoreBarraDiStato, ColoreBarraDiStato as ColoreStatusBar} from "./assets/context/variabili_globali/variabiliGlobali";
import SliderNuovoUtente from "./assets/navigation/SliderNuovoUtente/slider_nuovo_utente";


const Stack = createStackNavigator();

export default function Start(){

    
    const {isInizializzazione} = useContext(AutenticazioneUtente);

    var coloreBarra = useContext(ColoreBarraDiStato);

    console.log("Start.js"+isInizializzazione);

    //se l'accesso a firebase è ancora in fase di inizializzazione...
    if(isInizializzazione){
        return (
            <View style={{justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"white"}}>
                <ActivityIndicator animating={true} color={MosCeleste} />
                <StatusBar backgroundColor={coloreBarra.colore} barStyle="dark-content" />
            </View>
        )
    }else {
        return (
            <>
            <NavigationContainer>
            <Stack.Navigator screenOptions={{
                ...TransitionPresets.SlideFromRightIOS
            }} initialRouteName="SliderNuovoUtente" headerMode="none"
            >

                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="PhoneAuthScreen" component={PhoneAuthScreen} />
                    <Stack.Screen name="PhoneAuthVerificationCodeScreen" component={PhoneAuthVerificationCodeScreen} />
                    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                    <Stack.Screen name="SliderNuovoUtente" component={SliderNuovoUtente} />
                    <Stack.Screen name="Home" component={HomeNavigator} />

            </Stack.Navigator>
            </NavigationContainer>
            <StatusBar backgroundColor={coloreBarra.colore} barStyle="dark-content" />
            </>
        )
    }
}