import React, {useEffect, useContext, useState, useRef} from "react";
import {View, Text, StyleSheet, FlatList,Button, TouchableOpacity, Dimensions} from "react-native";
import ChatPreview from "./chat_preview.component";
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Divider } from 'react-native-paper';
import { AutenticazioneUtente } from "../../../../../../context/firebase/autenticazione";
import { MosCeleste } from "../../../../../../resources/colors";
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";


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

function orderChatByTimestamp(chat){
    var sorted = chat.sort(function(a, b) {
        //console.log("CONFRONTO");
        //console.log(a);
        //console.log(b);
        let tempo1 = (a.value.lastMessage.timestamp==null)?(a.creation_data):a.value.lastMessage.timestamp;
        let tempo2 = (b.value.lastMessage.timestamp==null)?(b.creation_data):b.value.lastMessage.timestamp;
        //console.log("confronto "+a.contactName+" con "+b.contactName+" con timestamp rispettivamente di: "+tempo1+" e "+tempo2+" , ossia in date "+new Date(tempo1).toString()+" e "+new Date(tempo2).toString());
        return tempo2 - tempo1
    });

    return sorted;
}


//simulo la Promise.allSettled che da problemi ma è vitale in questo caso
    //raccoglie tutti gli url delle immagini di galleria e di profilo dell'utente. I risultati errati verranno marchiati come
    //status di tipo "rejected" altrimenti come "fulfilled" e in value di trovo l'url.
    Promise.myAllSettled = promises =>
    Promise.all(
      promises.map((promise, i) =>
        promise
          .then(value => ({
            status: "fulfilled",
            value,
          }))
          .catch(reason => ({
            status: "rejected",
            reason,
          }))
      )
    );

function orderBlockedChatByLockTimestamp(chat){
    var sorted = chat.sort(function(a, b) {
        //console.log("CONFRONTO");
        //console.log(a);
        //console.log(b);
        let tempo1 = a.lock_timestamp;
        let tempo2 = b.lock_timestamp;
        return tempo2 - tempo1
    });

    return sorted;
}

//mantiene il riferimento al listener su nuove chat che sono state create (qualcuno ha creato una chat con me)
var newChatListener = null;

export default function ChatListComponent({navigation, route}){

    //contesto autenticazione
    var {listOfConversations,setListOfConversations,ottieniAscoltatoreNuoveConversazioni, getChatSummaryInformation, getMediaProfiloContatto, getUserInformation, setConversazioniBloccate} = useContext(AutenticazioneUtente);
    //se true indica che si stanno caricando le chat
    const [isChatLoading, setIsChatLoading] = useState(true);
    //lista delle conversazioni con relative informazioni
    const [chatsSummary, setChatsSummary] = useState([]);
    //lista delle informazioni sui media di ogni itente delle conversazioni sopra
    //const [mediaContatti, setMediaContatti] = useState([]);
    //lista delle informazioni base dei contatti
    const [infoProfiloContatti, setInfoProfiloContatti] = useState([]);

    const isMounted = useRef(true);


    //console.log("TUTTE LE CONVERSAZIONI E I PROFILI UTENTI SONO STATI CARICATI");
    //console.log(chatsSummary);
    //console.log(mediaContatti);


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
        if(isMounted.current==true)
            setIsChatLoading(true);

        //2) Scarico la lista dei documenti delle conversazioni riassuntive
        //NB: alla fine della funzione avremo ciò:
        /*
            1) chatSummary: 
            [
                Object {
                    "chatId": "BQCktyNpkjv9Lb8kBsoj",
                    "contactName": "Teresa",
                    "contactUid": "AglqTSW161f8cNRcOhiZQMqLtlk1",
                    "key": "2",
                    "creation_data": Object {
                        "nanoseconds": 0,
                        "seconds": 1629282023,
                    }
                    "value": Object {
                        "lastMessage": Object {
                            "author": "AglqTSW161f8cNRcOhiZQMqLtlk1",
                            "timestamp": Object {
                            "nanoseconds": 0,
                            "seconds": 1629669601,
                            },
                            "type": "text",
                            "value": "prova4",
                        },
                    "level_of_visibility": 0,
                    },
                },
                Object {
                    "chatId": "3eU5T6CaHcRc3kWiDlo9",
                    "contactName": "Erica",
                    "contactUid": "Ud3EZplnClVk9pyDlSBme8vTDUL2",
                    "key": "1",<------------------------------------------- NB: la chat viene ordinata quindi le chiavi possono essere disposte in modo divers. I relativi media si trovano sempre allo stesso posto, anche dopo il riordinamento in quanto tanto ci si accede con key
                    "creation_data": Object {
                        "nanoseconds": 0,
                        "seconds": 1629061261,
                    }
                    "value": Object {
                        "lastMessage": Object {
                            "author": null,
                            "timestamp": null,
                            "type": null,
                            "value": null,
                        },
                    "level_of_visibility": 0,
                    },
                }
                ]

            2) mediaContatti:
                    [
                        Object {
                            "key": "0",
                            "value": Object {
                            "gallery": Object {},
                            "profileImageUrl": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FAglqTSW161f8cNRcOhiZQMqLtlk1%2FprofileImage1?alt=media&token=88e33e69-0640-4262-a742-8fbf5c13ca14",
                            },
                        },
                        Object {
                            "key": "1",
                            "value": Object {
                            "gallery": Object {},
                            "profileImageUrl": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FUd3EZplnClVk9pyDlSBme8vTDUL2%2FprofileImage1?alt=media&token=b5c356cd-ddba-47ec-97de-849a3d791d66",
                            },
                        },
                        Object {
                            "key": "2",
                            "value": Object {
                            "gallery": Object {},
                            "profileImageUrl": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2Fu98FyRlSpsdn2FHftO3r094iuDb2%2FprofileImage1?alt=media&token=6e3ec093-2b2f-427b-8374-32492cc2ba4c",
                            },
                        },
                    ]
        */
        //console.log("Lista conversazioni");
        //console.log(listOfConversations);
        //se non possiede delle conversazioni devo comunque settare [] cosi da fare il refresh di chatsSummary e mediaContatti per aggiornare la grafica
        if(listOfConversations.conversations.length==0){
            if(isMounted.current==true)
                setChatsSummary([]);
                //setMediaContatti([]);
        }

        //se possiede delle conversazioni...
        if(listOfConversations!=null && listOfConversations["conversations"].length>0){
            const promises = []; //qui inserisco tutte le promise per i summary delle chat
            for(var i = 0; i < listOfConversations["conversations"].length; i++) {
                let conversation = listOfConversations["conversations"][i];
                promises.push(getChatSummaryInformation(conversation.chatId));
            }
            //attendo tutte le promise
            Promise.all(promises)
                .then(async(summaries)=>{
                    //console.log("Tutte le informazioni sommarie delle conversazioni sono state scaricate");
                    //qui tutte le informazioni sommarie sono state caricate. Li inserisco nell'array che userò ovunque (sfrutto ciclo for sotto)
                    //console.log(summaries[0].data());
                    //Prelevo media utente
                    //const promisesMediaContatti = []; //qui inserisco tutte le promise per le immagini
                    const chatsSummaryTmp = []; //qui avrò tutte le informazioni sulla conversazione
                    const promisesInfoProfileContatti = []; //qui avrò tutte le informazioni sul profilo dei contatti
                    const blocked = []; //qui metterò le conversazioni bloccate
                    let j= 0;
                    for(var i = 0; i < listOfConversations["conversations"].length; i++) {
                        //sfrutto questo ciclo per salvarmi i sommari delle conversazioni
                        let conversation = listOfConversations["conversations"][i];
                        console.log("conversazione scaricata");
                        //console.log(conversation);
                        //se la conversazione è di tipo blocked non la aggiungo al resto delle conversazioni, ma la metto insieme a quelle bloccate
                        if(conversation.hasOwnProperty("blocked")){
                            //console.log("la aggiungo a blocked");
                            blocked.push({uid: conversation.uid, name: conversation.contactName, lock_timestamp: conversation.lock_timestamp});
                            continue;
                        }else if(summaries[i].data()!=null && summaries[i].data()!=undefined) {
                            //console.log("la aggiungo alle conversazioni");
                            chatsSummaryTmp.push({key:j.toString(),chatId:conversation.chatId, creation_data: conversation.creation_data,  value: summaries[i].data(), contactName:conversation.contactName, contactUid:conversation.uid });
                            //prelevo informazioni base utente
                            promisesInfoProfileContatti.push(getUserInformation(conversation.uid));
                            j++;
                        }
  
                    }

                    //ordino per timestamp le conversazioni
                    let chatsSummaryTmpOrdered = orderChatByTimestamp(chatsSummaryTmp);
                    //console.log("conversazioni bloccate prima del sorting");
                    //console.log(blocked);
                    //ordino per timestamp quelle bloccate
                    let blocked_sorted = orderBlockedChatByLockTimestamp(blocked);
                    //console.log("conversazioni bloccate dopo sorting");
                    //console.log([...blocked_sorted]);
                    if(isMounted.current==true){
                        setChatsSummary(chatsSummaryTmpOrdered);
                        setConversazioniBloccate(blocked_sorted);
                    }
/*
                    //avvio promises per le info dei profili
                    Promise.all(promisesInfoProfileContatti)
                        .then((infoProfiles)=>{
                            for(let i=0; i<infoProfiles.length;i++)
                                infoProfiloContatti.push(infoProfiles[i].data());
                            setIsChatLoading(false);
                        }).catch((err)=>{
                            //probabilmente l'utente si è eliminato
                            console.log("Si è verificato un errore durante il recupero delle informazioni profilo: "+err);
                        })
*/  
                    let infoProfiloContattiTmp = [];
                    await Promise.myAllSettled(promisesInfoProfileContatti)
                        .then((infoProfiles)=>{
                            for(let i=0; i<infoProfiles.length;i++){
                                if(infoProfiles[i].status=="fulfilled")
                                    infoProfiloContattiTmp.push(infoProfiles[i].value.data());
                                else
                                    infoProfiloContattiTmp.push(null);
                            }
                            if(isMounted.current==true){
                                setInfoProfiloContatti([...infoProfiloContattiTmp]);
                                setIsChatLoading(false);
                            }
                        }).catch((err)=>{
                            //probabilmente l'utente si è eliminato
                            console.log("Si è verificato un errore durante il recupero delle informazioni profilo: "+err);
                        })

                }).catch((err)=>{
                    
                    console.log("Si è verificato un errore durante il recupero delle informazioni sommarie sulle conversazioni: "+err);
                })

               
        }else{
            if(isMounted.current==true)
                setIsChatLoading(false);
        }
        

    }

    //listener per nuove conversazioni create nel mio profilo (es. un utente X crea nel mio profilo una nuova chat)
    useEffect(()=>{

        async function ascoltaNuoveConversazioni(){
            try{
                newChatListener = ottieniAscoltatoreNuoveConversazioni()
                    .onSnapshot(
                        { includeMetadataChanges: true },
                        async(doc) => {
                            try{
                                if(doc.metadata.hasPendingWrites==false){
                                    console.log("ci sono nuove conversazioni:");
                                    /*
                                    Object {
                                        "lastMessage": Object {
                                            "author": "AglqTSW161f8cNRcOhiZQMqLtlk1",
                                            "timestamp": Object {
                                            "nanoseconds": 0,
                                            "seconds": 1629669601,
                                            },
                                            "type": "text",
                                            "value": "prova6",
                                        },
                                        "level_of_visibility": 0,
                                    }
                                    */
                                    let newConversations = doc.data();
                                    //console.log(newConversations);
                                    //console.log("precedenti conversazioni");
                                    //console.log(listOfConversations);
                                    if(isMounted.current==true)
                                        setListOfConversations(newConversations);
                                }
                            }catch(e){
                                console.log("Si è verificato un errore durante la ricezione delle nuove conversazioni:"+e);       
                            }
                });

            }catch(e){
                console.log("errore nell'ascoltare nuove conversazioni:"+e);
            }
        }

        ascoltaNuoveConversazioni();

        return () =>{
            console.log("rimuovo ascoltatore nuove conversazioni");
            if(newChatListener!=null) newChatListener();
        }
    },[])

    //INIZIO: 
    useEffect(()=>{
        console.log("chiamo use effect in chat.screen");
        caricaChat();
    },[listOfConversations])

    useEffect(()=>{
        isMounted.current = true;

        return () => isMounted.current = false;
    },[])

    function ordinaListaChat(indiceChat, newChatUpdated){
        //console.log("richiesta di aggiornare la chat all'indice:"+indiceChat);
        //console.log(newChatUpdated);
        //modifica nell'attuale array la chat all'indice 'indiceChat'
        let listUpdated = [...chatsSummary];
        listUpdated[indiceChat].value.lastMessage = newChatUpdated.lastMessage;
        listUpdated[indiceChat].level_of_visibility = newChatUpdated.level_of_visibility;
        //ordino chat
        let newChatList = orderChatByTimestamp(listUpdated);
        //console.log("chat ordinata:");
        //console.log(newChatList);
        setChatsSummary([...newChatList]);
    }

    //console.log("info profili scaricati");
    //console.log(infoProfiloContatti);
    
    if(isChatLoading==false){
        return (
            <>
                {/* LISTA CHAT */}
                <FlatList
                    data={chatsSummary}
                    keyExtractor={item=>item.key}
                    style={{zIndex:2}}
                    renderItem={({item, index})=>{
                        //console.log("ITEM DA RIVEDERE");
                        //console.log(infoProfiloContatti);
                        if(infoProfiloContatti[parseInt(item.key)]!=null){
                            //console.log("renderizzo preview di "+item.contactName);
                            return(
                            
                                <>
                                <ChatPreview
                                            informazioniPersonaliContatto={infoProfiloContatti[parseInt(item.key)]}
                                            navigation ={navigation}
                                            chatId = {item.chatId}
                                            nome = {item.contactName}
                                            contactUid = {item.contactUid}
                                            content = {item.value}
                                            creationData = {item.creation_data} 
                                            route = {route}
                                            indicePosizioneChatInArray={index}
                                            ordinaListaChat={ordinaListaChat}
                                            token = {infoProfiloContatti[parseInt(item.key)].hasOwnProperty("push_notification_token")?infoProfiloContatti[parseInt(item.key)].push_notification_token:""}
                                            />
                                <Divider />
                            </>
                    )}else {
                        //console.log("non renderizzo utente");
                        return (
                            <View></View>
                        )
                    }
                }}
                >

                </FlatList>
            </>
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
        fontSize:fontSizeTitoloBarra*0.8,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice
        ,
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