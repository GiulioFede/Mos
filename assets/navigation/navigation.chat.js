import React from "react";
import {createStackNavigator, TransitionPresets} from "@react-navigation/stack";
//1) IMPORTO i modelli di sezioni che voglio compaiano nella sezione “Chat”
import ChatScreen from "../screen/chat/chat.screen";
import ChatDetail from "../screen/chat/chat_detail";

const chatStack = createStackNavigator();

const ChatNavigator = () => {
    return (
        <chatStack.Navigator 
        screenOptions={{headerTitleAlign: "center",//per centrare i titoli degli screen
                        ...TransitionPresets.ModalPresentationIOS
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
