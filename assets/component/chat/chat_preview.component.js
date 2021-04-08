import React from "react";
import {View, StyleSheet, Image,Text, Dimensions} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { MosCeleste } from "../../resources/colors";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import MessageBubble from "./message_bubble";


const ChatPreview =({nome, urlImmagineProfilo,dataUltimoMessaggio, ultimoMessaggio}) => {

        //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={styles.container}>
            {/* IMMAGINE PROFILO */}
            <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine SOSTITUIRE CON QUELLA DELL'UTENTE ma ovviamente non usare require ma (forse) fetch*/}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={require('../../resources/images/chat/fotoChat5.jpg')} resizeMode="cover"  style={styles.immagineProfilo}></Image>
                        </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* nome */}
                        <View style={styles.contenitoreNome}>
                            <Text style={styles.nome}>Katia</Text>
                        </View>

                        <View style={styles.ultimoMessaggio}>
                            <MessageBubble messaggio={ultimoMessaggio} />
                        </View>
            </View>
        </View>
    )
}

export default ChatPreview;

const styles = StyleSheet.create({
    container: {
        padding:10,
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.2
    },
    contenitoreMediaProfilo:{
        paddingLeft:Dimensions.get("window").width*0.10,
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    onlineCircle: {
        backgroundColor: "#00ff40",
        elevation: 10,
        position: "absolute",
        bottom: 20,
        left:46,
        padding:4, 
        height:15,
        width: 15,
        borderRadius:10
    },
    contenitoreImmagineProfilo: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: "hidden",
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 7
            }
        })
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        bottom: 0,
        left: 140,
        width: 40,
        height: 40,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        margin:8
    },
    contenitoreNome:{
        position:"absolute",
        left:180,
        zIndex:10,
    },
    nome:{
        fontSize:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
    },
    ultimoMessaggio: {
        position: "absolute",
        zIndex:10,
        elevation:10,
        top:102,
        left:120
    }
})

