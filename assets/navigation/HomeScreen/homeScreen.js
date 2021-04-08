import React from 'react';
import {View, StyleSheet } from 'react-native';
import {Ionicons,AntDesign} from '@expo/vector-icons'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { MosCeleste } from '../../resources/colors';
import ChatNavigator from './chat/navigation.chat';
import AroundYou from './around you/screen/aroundYou.screen';
import Profile from './profile/screen/profile.screen';

const Tab = createBottomTabNavigator();

function HomeScreen(){

    return (
        <View style={styles.container}>
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
        </View>
    )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });