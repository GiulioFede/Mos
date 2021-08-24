import React, {useState, useEffect} from "react";
import {View, StyleSheet, Image,Text,TouchableOpacity, Touchable} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import MessageBubble from "./message_bubble";
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosViola } from "../../../../../../resources/colors";


let date = new Date();
function getHHMMfromDate(milliseconds){
    date = new Date(milliseconds);
    return date.getHours()+":"+date.getMinutes();
}


/*
    content ha la seguente struttura:
        Object {
        "lastMessage": Object {
            "author": null,
            "timestamp": null,
            "type": null,
            "value": null,
            },
        "numberOfMessages": 0,
        }   

*/

const ChatPreview =({navigation,chatId, nome,contactUid, content, media, route}) => {

    console.log("Chat ID di "+nome+" -->");
    console.log(chatId);
    console.log("Chat CONTENT-->");
    console.log(content);

    const [lastContent, setLastContent] = useState(content);

    function apriDettagliChat(){
        console.log("apro dettagli chat con utente "+contactUid);
        navigation.navigate("Chat detail",{chatId: chatId, contactUid: contactUid, name: nome});
    }

    function apriDettagliProfilo(){
        navigation.navigate("Contact profile",{name: nome, mediaProfilo: media});
    }

    const [uriProfileImage, setUriProfileImage] = useState(media.value.profileImageUrl=="" ? null : media.value.profileImageUrl);

    /*
        Quando gli screen come ContactProfile ma quasi sempre Chat detail vogliono portare un dato al vecchio screen (ossia qui)
        modificano la route. In route.params troviamo il messaggio. I messaggi sono strutturati in modo diverso ma tutti hanno in comune
        sempre lo stesso campo: code. Questo indica che tipo di messaggio è. I possibili sono:

        1) MESSAGGIO DI AGGIORNAMENTO ULTIMO MESSAGGIO SCAMBIATO: indica di aggiornare la chatId con l'ultimo messaggio scambiato
            "params": Object {
                "code": "UPDATE_LAST_MEX",
                "author": "1anAHDbd82...",
                "chatId": "1agd6aaAAN..",
                "type": "text",
                "value": "ciao come va?",
                "timestamp": "26/04/1996...",
            },

    */
    useEffect(()=>{
        console.log("Nuovi dati passati dal vecchio screen nella chat con nome +"+nome);
        console.log(route.params);
        elaboraAzione(route.params);
    },[route])

    function elaboraAzione(messaggio){
        if(messaggio==null) return;

        if(messaggio.code == "UPDATE_LAST_MEX"){
            //se la chat_preview dove siamo è quella di interesse
            if(messaggio.chatId == chatId){
                //modifico contenuto
                let newLastContent = {lastMessage:{}};
                newLastContent.lastMessage.author = messaggio.author;
                newLastContent.lastMessage.timestamp = messaggio.timestamp;
                newLastContent.lastMessage.type = messaggio.type;
                newLastContent.lastMessage.value = messaggio.value;

                setLastContent(newLastContent);

                //TODO: cosa fare con numberOfMessages?
            }
        }
    }

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
                <TouchableOpacity onPress={()=>{apriDettagliProfilo()}} style={[styles.contenitoreImmagineProfilo,{ borderColor:(lastContent.lastMessage.value==null)?MosViola:'transparent', borderWidth: (lastContent.lastMessage.value==null)?2:0 }]}>
                        {uriProfileImage && <Image source={{uri:uriProfileImage}} resizeMode="cover"  style={styles.immagineProfilo} onError={(e)=>{setUriProfileImage(null)}}></Image>}
                        {!uriProfileImage && <Text style={{position:"absolute", textAlign:"center", color:"white", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                </TouchableOpacity>
                <View style={styles.ultimoMessaggio}>
                    <MessageBubble messaggio={lastContent.lastMessage.value} type={lastContent.lastMessage.type}/>
                </View>          
            </View>
                    
            <View style={styles.contenitoreInfo}>
                {/* nome */}
                <View style={styles.contenitoreNome}>
                    <Text style={[styles.nome,{color:"#52575D"}]}>{nome}</Text>
                </View>
               {/* data ultimo messaggio */}
                <View style={styles.contenitoreDataUltimoMessaggio}>
                    <Text style={[styles.dataUltimoMessaggio,{color:lastContent.lastMessage.value==null?"white":"#52575D", textAlign:"right"}]}>{getHHMMfromDate(lastContent.lastMessage.timestamp)}</Text>
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
        width:larghezzaDevice*0.46
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
        zIndex:10,
        width:"100%"
    },
    dataUltimoMessaggio:{
        fontSize:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeCampi,
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

