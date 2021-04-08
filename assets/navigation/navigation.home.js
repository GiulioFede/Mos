import React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AroundYou from '../screen/aroundYou.screen';
import Profile from '../screen/profile.screen';
import {Ionicons,AntDesign} from '@expo/vector-icons'
import { MosCeleste, MosViola } from '../resources/colors';
import ChatNavigator from './navigation.chat';

const Tab = createBottomTabNavigator();

export default function HomeNavigator(){

    return (
        <View style={styles.container}>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({route})=>({
                        tabBarIcon:({focused, color, size})=>{

                            if(route.name == 'Chat')
                                return <Ionicons name="ios-chatbubble-outline" size={24} color={color} />
                            else if(route.name == 'Around You'){
                                return <Ionicons name="md-location-outline" size={24} color={color} />
                            }
                            else if(route.name == 'Profile'){
                                return <AntDesign name="user" size={24} color={color} />
                            }
                            
                        },
                    })}
                        tabBarOptions={{
                            activeTintColor:MosCeleste,
                            inactiveTintColor: 'gray'
                        }}
                    >
                    <Tab.Screen name="Chat" component={ChatNavigator} />
                    <Tab.Screen name="Around You" component={AroundYou} />
                    <Tab.Screen name="Profile" component={Profile} />
                </Tab.Navigator>
            </NavigationContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });
  