import React,{useEffect,useLayoutEffect} from "react";
import {createStackNavigator, TransitionPresets} from "@react-navigation/stack";
//1) IMPORTO i modelli di sezioni che voglio compaiano nella sezione “Chat”
import { getFocusedRouteNameFromRoute } from "@react-navigation/core";
import AroundYou from "./screen/aroundYou.screen";
import AroundYouProfileDetails from "./screen/AroundYouProfileDetail.screen";

const aroundYouStack = createStackNavigator();

const AroundYouNavigator = ({navigation,route}) => {

    useEffect(()=>{
        navigation.setOptions({tabBarVisible: true});
    },[]);

    useLayoutEffect(()=>{
        const routeName = getFocusedRouteNameFromRoute(route);
        if(routeName == "AroundYou")
            navigation.setOptions({tabBarVisible: true});
        else
            navigation.setOptions({tabBarVisible: false});
    },[navigation,route])
    return (

        <aroundYouStack.Navigator 
        screenOptions={{headerTitleAlign: "center",//per centrare i titoli degli screen
                        ...TransitionPresets.SlideFromRightIOS
            }} 
        headerMode="none"
        
        
        >
            <aroundYouStack.Screen
                name="AroundYou"
                component = {AroundYou}
            />

            <aroundYouStack.Screen
                name="AroundYouProfileDetails"
                component = {AroundYouProfileDetails}
            />

        </aroundYouStack.Navigator>
    )
}

export default AroundYouNavigator;
