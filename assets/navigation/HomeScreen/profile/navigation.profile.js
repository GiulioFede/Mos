import React,{useEffect,useLayoutEffect} from "react";
import {createStackNavigator, TransitionPresets} from "@react-navigation/stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/core";
import Profile from "./screen/profile.screen.js"
import ImageBlurLoader from "./screen/imageBlurLoader.screen.js"

const profileStack = createStackNavigator();

const ProfileNavigator = ({navigation,route}) => {

    useEffect(()=>{
        navigation.setOptions({tabBarVisible: true});
    },[]);

    useLayoutEffect(()=>{
        const routeName = getFocusedRouteNameFromRoute(route);
        if(routeName == "ProfileScreen")
            navigation.setOptions({tabBarVisible: true});
        else
            navigation.setOptions({tabBarVisible: false});
    },[navigation,route])
    return (
        <profileStack.Navigator 
        screenOptions={{
                        ...TransitionPresets.SlideFromRightIOS
            }} 
        headerMode="none"
        
        
        >
            <profileStack.Screen
                name="ProfileScreen"
                component = {Profile}
            />

            <profileStack.Screen 
                name="ImageBlurLoaderScreen"
                component ={ImageBlurLoader}
            />


        </profileStack.Navigator>
    )
}

export default ProfileNavigator;