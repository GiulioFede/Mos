import React,{useContext} from 'react';
import {View, StyleSheet } from 'react-native';
import {Snackbar} from "react-native-paper"
import {Ionicons,AntDesign} from '@expo/vector-icons'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { MosCeleste } from '../../resources/colors';
import ChatNavigator from './chat/navigation.chat';
import { AutenticazioneUtente } from '../../context/firebase/autenticazione';
import { altezzaMenuNavigazione } from '../../context/variabili_globali/variabiliGlobali';
import ProfileNavigator from './profile/navigation.profile';
import AroundYouNavigator from './aroundYou/navigation.aroundYou';

const Tab = createBottomTabNavigator();

function HomeScreen({navigation}){

    var {setMessaggioAuth,messaggioAuth} = useContext(AutenticazioneUtente);

    return (
        <View style={styles.container}>
                <Tab.Navigator
                    screenOptions={({route})=>({
                        tabBarIcon:({focused, color, size})=>{

                            if(route.name == 'Chat')
                                return <Ionicons name="ios-chatbubble-outline" size={24} color={color} />
                            else if(route.name == 'AroundYou'){
                                return <Ionicons name="md-location-outline" size={24} color={color} />
                            }
                            else if(route.name == 'Profile'){
                                return <AntDesign name="user" size={24} color={color} />
                            }
                            
                        },
                    })}
                        tabBarOptions={{
                            activeTintColor:MosCeleste,
                            inactiveTintColor: 'gray',
                            style:{height:altezzaMenuNavigazione}
                        }}
                    >
                    <Tab.Screen name="Chat" component={ChatNavigator} />
                    <Tab.Screen name="AroundYou" component={AroundYouNavigator} />
                    <Tab.Screen name="Profile" component={ProfileNavigator} />
                </Tab.Navigator>

                            {/*COMPARE SOLO PER MOSTRARE UN MESSAGGIO DAL CONTESTO DI AUTENTICAZIZONE */}
            <Snackbar
                visible={messaggioAuth}
                style={{position:"absolute",zIndex:10, elevation:10, bottom:0}}
                onDismiss={()=>{setMessaggioAuth(null)}}
                duration = {5000}
                
                action={{
                onPress: () => {
                        setMessaggioAuth(null);
                    },
                }}>
                    {messaggioAuth}
            </Snackbar>
        </View>
    )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });