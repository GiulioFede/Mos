import React, {useState} from "react";
import {View, StyleSheet, Image,Text,TouchableOpacity, Touchable} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import MessageBubble from "./message_bubble";
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosViola } from "../../../../../../resources/colors";


const ChatPreview =({navigation,chatId, nome,contactUid, content, media}) => {

    console.log("Chat ID-->");
    console.log(chatId);

    function apriDettagliChat(){
        console.log("apro dettagli chat con utente "+contactUid);
        navigation.navigate("Chat detail",{chatId: chatId, contactUid: contactUid});
    }

    function apriDettagliProfilo(){
        navigation.navigate("Contact profile",{name: nome, mediaProfilo: media});
    }

    const [uriProfileImage, setUriProfileImage] = useState(media.value.profileImageUrl=="" ? null : media.value.profileImageUrl);

        //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={{marginVertical:0.5, backgroundColor:"white"}}>
        <TouchableOpacity activeOpacity={.7} style={[styles.container,{backgroundColor:"white"}]} onPress={()=>{apriDettagliChat()}}>
            {/* IMMAGINE PROFILO */}
            <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine SOSTITUIRE CON QUELLA DELL'UTENTE ma ovviamente non usare require ma (forse) fetch*/}
                        <TouchableOpacity onPress={()=>{apriDettagliProfilo()}} style={styles.contenitoreImmagineProfilo}>
                                {uriProfileImage && <Image source={{uri:uriProfileImage}} resizeMode="cover"  style={styles.immagineProfilo} onError={(e)=>{setUriProfileImage(null)}}></Image>}
                                {!uriProfileImage && <Text style={{position:"absolute", textAlign:"center", color:"white", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                        </TouchableOpacity>
                        <View style={styles.ultimoMessaggio}>
                            <MessageBubble messaggio={content.lastMessage.value} />
                        </View>

                        
            </View>
                    
            <View style={styles.contenitoreInfo}>
                {/* nome */}
                <View style={styles.contenitoreNome}>
                    <Text style={[styles.nome,{color:"#52575D"}]}>{nome}</Text>
                </View>
               {/* data ultimo messaggio */}
                <View style={styles.contenitoreDataUltimoMessaggio}>
                    <Text style={[styles.dataUltimoMessaggio,{color:content.lastMessage.value==null?"white":"#52575D"}]}>{content.lastMessage.timestamp}</Text>
                </View>
        </View>
        </TouchableOpacity>
        </View>
    )
}

export default ChatPreview;

const styles = StyleSheet.create({
    container: {
        borderBottomColor:"#e6e6e6",
        height:altezzaDevice*0.2,
        marginVertical:5,
        flexDirection:"row",
    },
    contenitoreMediaProfilo:{
        justifyContent:"center",
        width:larghezzaDevice*0.5,
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
        borderColor:MosViola,
        borderWidth:2,
        overflow: "hidden",
        position:"absolute",
        zIndex: 10,
        left:altezzaDevice*0.02,
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 7
            }
        })
    },
    contenitoreInfo: {
        width:larghezzaDevice*0.5
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined,
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
        left: larghezzaDevice*0.5*0.1,
        top:altezzaDevice*0.03,
        zIndex:10,
    },
    nome:{
        fontSize:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeSottoTitolo*1.1
    },
    contenitoreDataUltimoMessaggio:{
        position:"absolute",
        left: larghezzaDevice*0.5*0.1,
        zIndex:10,
    },
    dataUltimoMessaggio:{
        fontSize:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeCampi
    },
    ultimoMessaggio: {
        position: "absolute",
        left:altezzaDevice*0.22/2+altezzaDevice*0.02,
        bottom:0,
        zIndex:10,
        elevation:8
    },
    newTabContainer: {
        position:"absolute",
        backgroundColor:MosViola,
        zIndex:20,
        elevation:20,
        top:0,
        left: larghezzaDevice*0.5/2+larghezzaDevice*0.5/4.5,
        borderRadius:larghezzaDevice*0.02,
        borderColor:"white",
        borderWidth:1
    },
    newTab: {
        padding:5,
        color:"white"
    }
})

