import React from "react";
import {View, StyleSheet, Image,Text,TouchableOpacity, Touchable} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import MessageBubble from "./message_bubble";
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo } from "../../../../../../context/variabili_globali/variabiliGlobali";


const ChatPreview =({navigation,nome, urlImmagineProfilo,dataUltimoMessaggio, ultimoMessaggio}) => {

    function apriDettagliChat(){
        navigation.navigate("Chat detail");
    }

        //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <TouchableOpacity activeOpacity={.7} style={styles.container} onPress={()=>{apriDettagliChat()}}>
            {/* IMMAGINE PROFILO */}
            <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine SOSTITUIRE CON QUELLA DELL'UTENTE ma ovviamente non usare require ma (forse) fetch*/}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={require('../../../../../../../assets/resources/images/chat/fotoChat3.jpg')} resizeMode="cover"  style={styles.immagineProfilo}></Image>
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
        </TouchableOpacity>
    )
}

export default ChatPreview;

const styles = StyleSheet.create({
    container: {
        borderBottomColor:"#e6e6e6",
        backgroundColor:"#fff",
        height:altezzaDevice*0.2,
        marginVertical:5
    },
    contenitoreMediaProfilo:{
        justifyContent:"center",
        height:altezzaDevice*0.2,
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
        bottom: altezzaDevice*0.2*0.065,
        left:altezzaDevice*0.22/4,
        height:altezzaDevice*0.2*0.07,
        width: altezzaDevice*0.2*0.07,
        borderRadius:altezzaDevice*0.2*0.07/2
    },
    contenitoreImmagineProfilo: {
        width: altezzaDevice*0.2,
        height: altezzaDevice*0.2,
        borderRadius: altezzaDevice*0.2/2,
        overflow: "hidden",
        position:"absolute",
        left:altezzaDevice*0.02,
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
        left:altezzaDevice*0.22,
        top:altezzaDevice*0.03,
        zIndex:10,
    },
    nome:{
        fontSize:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeSottoTitolo
    },
    ultimoMessaggio: {
        position: "absolute",
        left:altezzaDevice*0.22/2+altezzaDevice*0.02,
        bottom:0,
        zIndex:10,
        elevation:8

    }
})

