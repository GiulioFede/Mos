import React,{useEffect,useLayoutEffect} from "react";
import {createStackNavigator, TransitionPresets} from "@react-navigation/stack";
//1) IMPORTO i modelli di sezioni che voglio compaiano nella sezione “Chat”
import ChatScreen from "./screen/chat screen/chat.screen";
import ChatDetail from "./screen/chat detail/chat_detail";
import { getFocusedRouteNameFromRoute } from "@react-navigation/core";

const chatStack = createStackNavigator();

const ChatNavigator = ({navigation,route}) => {

    useEffect(()=>{
        navigation.setOptions({tabBarVisible: true});
    },[]);

    useLayoutEffect(()=>{
        const routeName = getFocusedRouteNameFromRoute(route);
        if(routeName == "Chat")
            navigation.setOptions({tabBarVisible: true});
        else
            navigation.setOptions({tabBarVisible: false});
    },[navigation,route])
    return (
        <chatStack.Navigator 
        screenOptions={{headerTitleAlign: "center",//per centrare i titoli degli screen
                        ...TransitionPresets.SlideFromRightIOS
            }} 
        headerMode="none"
        
        
        >
            <chatStack.Screen
                name="Chat"
                component = {ChatScreen}
            />

            <chatStack.Screen 

                name="Chat detail"
                component ={ChatDetail}
            />

        </chatStack.Navigator>
    )
}

export default ChatNavigator;
