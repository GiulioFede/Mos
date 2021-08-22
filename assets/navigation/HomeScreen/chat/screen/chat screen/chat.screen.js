import React, {useEffect, useContext, useState, useRef} from "react";
import {View, Text, StyleSheet, FlatList,Button, TouchableOpacity, Dimensions} from "react-native";
import {MaterialIcons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import ChatPreview from "./component/chat_preview.component";
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../../../resources/colors";
import IconaNotifiche from "./component/notification/iconaNotifica";
import TabNotifiche from "./component/notification/tabNotifiche";
import ChatListComponent from "./component/chat.component";
import SnackMessage from "../../../profile/screen/component/snackMessage";


//qui è dove simulo l'array contenente le preview delle chat NB: ci deve essere anche l'urlImmagineProfilo che però
//non posso dare in quanto il componente ChatPreview vuole l'url statico se usa require.
//noi in ChatPreview invece useremo (forse) fetch e allora potremmo passaglierlo
const Chat = [
    {
        id:"1",
        userName: 'Tom',
        messageTime: '4 minuti fa',
        messageText: 'Hey ciao!'
    },
    {
        id:"2",
        userName: 'Giovanna',
        messageTime: '15 minuti fa',
        messageText: 'Buongiorno!'
    },
    {
        id:"3",
        userName: 'Carlotta',
        messageTime: '1 ora fa',
        messageText: 'Va benissimo, a presto!'
    },
    {
        id:"4",
        userName: 'Michele',
        messageTime: 'ieri',
        messageText: 'Top! domani alle 15?'
    },
    {
        id:"5",
        userName: 'Katia',
        messageTime: '06/04/2021',
        messageText: 'Ahahahah ok ciao!'
    }
]


export default function ChatScreen({navigation}){

    //riferimento tab notifiche
    const tabNotificheRef = useRef();
    const iconaNotificheRef = useRef();
    const [isNotificationTabOpened, setIsNotificationTabOpened] = useState(false);

    const snackMessageRef = useRef();

    //quando si clicca sull'icona 'menu': apri il menu laterale
    function apriUserSettings(){
        if(isNotificationTabOpened==true){
            setIsNotificationTabOpened(false);
            tabNotificheRef.current.openCloseNotificationTab();
        }

        navigation.setOptions({ tabBarVisible: false });
        console.log("apri menu laterale");
        navigation.openDrawer();
    }

    function incrementaNumeroNotifiche(){
        iconaNotificheRef.current.increment_notification_number();
    }

    function resettaNumeroNotifiche(){
        iconaNotificheRef.current.reset_notification_number();
    }

    function decrementaNumeroNotifiche(){
        iconaNotificheRef.current.decrement_notification_number();
    }

    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
    return (
            <View style={styles.container}>
                {/* BARRA SUPERIORE */}
                <View style={styles.barraSuperiore}>
                    <Text style={styles.titolo}>Chat</Text>
                    <TouchableOpacity onPress={apriUserSettings} style={{position:"absolute", right:Dimensions.get("window").width*0.03}}>
                            <MaterialIcons name="menu" size={fontSizeTitoloBarra} color="#52575D" />
                    </TouchableOpacity>
                    {/* ICONA NOTIFICHE */}
                    <TouchableOpacity onPress={()=>{tabNotificheRef.current.openCloseNotificationTab(); setIsNotificationTabOpened(!isNotificationTabOpened);}} style={{position:"absolute", left:Dimensions.get("window").width*0.03}}>
                        {isNotificationTabOpened==false && <MaterialCommunityIcons name="bell-ring-outline" size={fontSizeTitoloBarra*1.1} color="#52575D" /> }
                        {isNotificationTabOpened==true && <MaterialCommunityIcons name="bell-ring" size={fontSizeTitoloBarra*1.1} color={MosCeleste} /> }
                        <IconaNotifiche ref={iconaNotificheRef}/>
                    </TouchableOpacity>
                </View>

                {/* LISTA CHAT */}
                <ChatListComponent navigation={navigation} />

                {/* RIQUADRO A COMPARSA PER LE NOTIFICHE */}
                <View style={{position:"absolute", width:larghezzaDevice, height:altezzaDevice, top:altezzaBarraScreen}}>
                    <TabNotifiche ref={tabNotificheRef} snackMessageRef = {snackMessageRef} 
                                  incrementaNumeroNotifiche={incrementaNumeroNotifiche}
                                  resettaNumeroNotifiche={resettaNumeroNotifiche}
                                  decrementaNumeroNotifiche={decrementaNumeroNotifiche}/>
                </View>

                {/* ERRORE */}
                <SnackMessage ref={snackMessageRef} />
            </View>
        )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:"#fff",
        height:altezzaDevice
    },
    titolo:{
        fontSize:fontSizeTitoloBarra*0.8,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice,
    },
    barraSuperiore:{
        width:larghezzaDevice,
        height:altezzaBarraScreen,
        justifyContent:"center",
        paddingTop:24,
        marginBottom:20
    },
    newChat: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor:MosCeleste
      },
})