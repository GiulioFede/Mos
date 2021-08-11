import React, {useEffect, useContext, useState} from "react";
import {View, Text, StyleSheet, FlatList,Button, TouchableOpacity, Dimensions} from "react-native";
import {MaterialIcons, AntDesign} from "@expo/vector-icons";
import {useFonts, Raleway_400Regular} from '@expo-google-fonts/raleway';
import ChatPreview from "./component/chat_preview.component";
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../../../resources/colors";
import {ChatUpdates} from "../context/chatContext";

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
    var {listOfConversations, getChatSummaryInformation, getMediaProfiloContatto} = useContext(AutenticazioneUtente);
    //se true indica che si stanno caricando le chat
    const [isChatLoading, setIsChatLoading] = useState(true);
    //lista delle conversazioni con relative informazioni
    const [chatsSummary, setChatsSummary] = useState([]);
    //lista delle informazioni sui media di ogni itente delle conversazioni sopra
    const [mediaContatti, setMediaContatti] = useState([]);


    console.log("TUTTE LE CONVERSAZIONI E I PROFILI UTENTI SONO STATI CARICATI");
    console.log(chatsSummary);
    console.log(mediaContatti);

    //quando si clicca sull'icona 'menu': apri il menu laterale
    function apriUserSettings(){
        navigation.setOptions({ tabBarVisible: false });
        console.log("apri menu laterale");
        navigation.openDrawer();
    }

    //array contenente le preview della chat

    function caricaChat(){
        /*
            La funzione seguente fa quanto segue:
            1) Sul profilo dell'utente, in Firestore, nella collezione users/utente/chats abbiamo un solo documento contenente una mappa del genere:
                {
                    idUtente1: idChat1
                    idUtente2: idChat2
                    ...
                }
                Ossia, per ogni conversazione memorizziamo come chiave l'id dell'utente con cui sta conversando e l'id del documento contenente la chat
                Questo documento E' GIA' STATO SCARICATO in navigation.home.js e si trova dentro autenticazione.js nella variabile infoChat
            2) Si scarica il documento di id=idChatK contenente le informazioni riassuntive della conversazione
            3) A seconda del livello di visibilità della conversazione (es. 75) si scarica dell'utente di uuid=idUtenteK i suoi media

        */
        
        //Quindi qui verranno fatti solo i passi 2) e 3)
        //indico che sto caricando le chat
        setIsChatLoading(true);

        //2) Scarico la lista dei documenti delle conversazioni riassuntive
        console.log("Lista conversazioni");
        console.log(listOfConversations);
        //se possiede delle conversazioni...
        if(listOfConversations!=null && listOfConversations["conversations"].length>0){
            const promises = []; //qui inserisco tutte le promise per i summary delle chat
            for(var i = 0; i < listOfConversations["conversations"].length; i++) {
                let conversation = listOfConversations["conversations"][i];
                promises.push(getChatSummaryInformation(conversation.chatId));
            }
            //attendo tutte le promise
            Promise.all(promises)
                .then((summaries)=>{
                    console.log("Tutte le informazioni sommarie delle conversazioni sono state scaricate");
                    //qui tutte le informazioni sommarie sono state caricate. Li inserisco nell'array che userò ovunque (sfrutto ciclo for sotto)
                    console.log(summaries[0].data());
                    //Prelevo media utente
                    const promisesMediaContatti = []; //qui inserisco tutte le promise 
                    const chatsSummaryTmp = [];
                    for(var i = 0; i < listOfConversations["conversations"].length; i++) {
                        //sfrutto questo ciclo per salvarmi i sommari delle conversazioni
                        let conversation = listOfConversations["conversations"][i];
                        chatsSummaryTmp.push({key:i.toString(),chatId:conversation.chatId,  value: summaries[i].data(), contactName:conversation.contactName, contactUid:conversation.uid });
                        //TODO-->NB: QUI BISOGNERA' SCEGLIERE UNA LOGICA PER CAPIRE QUALE LIVELLO DI VISIBILITà ADOTTARE, PER ADESSO METTO SEMPRE A 0
                        const livelloDiVisibilità = "0";
                        promisesMediaContatti.push(getMediaProfiloContatto(conversation.uid, livelloDiVisibilità));
                    }

                    setChatsSummary(chatsSummaryTmp);

                    //avvio promises
                    Promise.all(promisesMediaContatti)
                        .then((mediaContattiResult)=>{
                            console.log("Tutti i media dei contatti sono stati scaricati");
                            const mediaContattiTmp = [];
                            for(var i = 0; i < listOfConversations["conversations"].length; i++) {
                                console.log("contatti "+mediaContattiResult[i].data());
                                //sfrutto questo ciclo per salvarmi i sommari delle conversazioni
                                mediaContattiTmp.push({key:i.toString(), value:mediaContattiResult[i].data()});
                            }
                            setMediaContatti(mediaContattiTmp);
                            //indico termine del caricamente delle chat
                            setIsChatLoading(false);
                        }).catch((err)=>{
                            console.log("Si è verificato un errore durrante il recupero dei media dei contatti: "+err);
                        })
                }).catch((err)=>{
                    console.log("Si è verificato un errore durante il recupero delle informazioni sommarie sulle conversazioni: "+err);
                })

                console.log(listOfConversations);
        }else
            setIsChatLoading(false);
        

    }

    //INIZIO: carica tutte le chat. TODO: aggiungere dipendenza (ricarica quando cambia...)
    useEffect(()=>{
        console.log("chiamo use effect in chat.screen");
        caricaChat();
    },[])


    let [Raleway] = useFonts({Raleway_400Regular});
    if(!Raleway)
        return <View></View>
    
    if(isChatLoading==false){
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
                    data={chatsSummary}
                    keyExtractor={item=>item.key}
                    renderItem={({item})=>(
                        <ChatPreview
                                    navigation ={navigation}
                                    chatId = {item.chatId}
                                    nome = {item.contactName}
                                    contactUid = {item.contactUid}
                                    content = {item.value}
                                    media = {mediaContatti[parseInt(item.key)]} 
                                    />
                    )}
                >

                </FlatList>
                <FAB
                    style={styles.newChat}
                    small
                    icon="plus"
                    onPress={() => console.log('Pressed')}
                />
            </View>
        )
    }else {
        return (
            <>
            <View style={[styles.container,{justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size={fontSizeTitoloBarra} color={MosCeleste} />
            </View>
            </>
        )
    }
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
    newChat: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor:MosCeleste
      },
})