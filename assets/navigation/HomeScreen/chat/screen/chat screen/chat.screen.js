import React, {useEffect, useContext} from "react";
import {View, Text, StyleSheet, FlatList,Button, TouchableOpacity, Dimensions} from "react-native";
import {MaterialIcons, AntDesign} from "@expo/vector-icons";
import {useFonts, Raleway_400Regular} from '@expo-google-fonts/raleway';
import ChatPreview from "./component/chat_preview.component";
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali";

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

    //contesto autenticazione
    var {informazioniProfiloUtente} = useContext(AutenticazioneUtente);


    //quando si clicca sull'icona 'menu': apri il menu laterale
    function apriUserSettings(){
        navigation.setOptions({ tabBarVisible: false });
        console.log("apri menu laterale");
        navigation.openDrawer();
    }


    let [Raleway] = useFonts({Raleway_400Regular});
    if(!Raleway)
        return <View></View>
    
    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Chat</Text>
                <TouchableOpacity onPress={apriUserSettings} style={{position:"absolute", right:Dimensions.get("window").width*0.03}}>
                        <MaterialIcons name="menu" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
                <AntDesign name="bells" size={fontSizeTitoloBarra} color="#52575D" style={{position:"absolute", left:Dimensions.get("window").width*0.03}} />
            </View>
            {/* LISTA CHAT */}
            <FlatList
                data={Chat}
                keyExtractor={item=>item.id}
                renderItem={({item})=>(
                    <ChatPreview
                                 navigation ={navigation}
                                 nome={item.userName}
                                 //urlImmagineProfilo={item.urlProfileImage}  quando lo avremo..
                                 dataUltimoMessaggio={item.messageTime}
                                 ultimoMessaggio={item.messageText}
                                 />
                )}
            >

            </FlatList>
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
        fontSize:fontSizeTitoloBarra,
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
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
})