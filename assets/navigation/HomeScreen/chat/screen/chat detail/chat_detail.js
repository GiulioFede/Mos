import React,{useEffect, useState, useContext, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity,Image, Dimensions, Keyboard,KeyboardAvoidingView, TextInput, FlatList, BackHandler} from "react-native"
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, altezzaSchermoInterno, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali"
import { MosCeleste, coloreSchermataDiCaricamento, MosPurple, MosViola } from "../../../../../resources/colors";
import MessageModel from "./components/messageModel";
import * as FileSystem from 'expo-file-system';
import { sendPushNotification } from '../../../../../context/push_notifications/functions';

import * as firebase from 'firebase';
import 'firebase/firestore';
//import { LocalStorage } from "../../../../../context/local_storage/localStorage";
import local_storage from "../../../../../context/local_storage/localStorage";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, INTERRUPTION_MODE_IOS_DO_NOT_MIX, Recording } from "expo-av/build/Audio";
import {Svg, Path, Circle, Line} from "react-native-svg";
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import AudioModel, { resetMessageModel } from "./components/audioModel";
import ListaMessaggi from "./components/listaMessaggi";
import RecordingKeyboard from "./components/recordingKeyboard";
import { RowsOfMessagesToUpdate } from "../context/chatContext";
import DecisionScreen from "./components/decisionScreen";
import * as Notifications from 'expo-notifications'
//contiene le row da passare alla flat list per indicargli di aggiornare lo stato in "succeed"
//const [arrayOfRowsToUpdateState, setarrayOfRowsToUpdateState] = useState({});

var arrayOfRowsToUpdateState = {};
/*
    contiene l'id delle chat che sono state aperte almeno una volta. Questo serve a caricare nello useEffect due tipi di chat possibili:
        1) se l'id della chatDetail appena aperta rientra in questo array significa che da quando il telefono è stato aperto tale chat
           è già stata aperta e quindi se ci dovessero essere messaggi salvati in locale come in-progress allora sono davvero attualmente 
           in progress e vanno mostrati in quanto saranno a breve inviati.
        2) se l'ide della chatDetail appena aperta non rientra in questo array significa che la chat è stata aperta per la prima volta da quando
           il telefono è stato aperto e quindi se ci sono messaggi con state "in progress" significa che in realtà non lo sono perchè lo erano prima
           che il telefono avesse bruscamente killato l'app.
*/

var idChatAlreadyOpened = [];
let ascoltatoreNuoviMessaggi = null;
let ascoltatoreStatistics = null;
let THRESHOLD = 3;

export var idChatCorrente = null;

export default function ChatDetail({ navigation,route}){

    const [messaggio, setMessaggio] = useState("");
    //conterrà l'intera chat
    const [chat, setChat] = useState([]);
    //contesto autenticazione
    const {getUtenteCorrente,informazioniProfiloUtente, inviaNuovoMessaggio,ottieniAscoltatoreNuoviMessaggi, ottieniAscoltatoreStatistics, makeDecision, upgradeConversation,removeGroupOfAudiosBeforeTimestamp, removeMessages} = useContext(AutenticazioneUtente);
    
    const {addNewUpdate} = useContext(RowsOfMessagesToUpdate);

    //memorizzerà l'ultimo messaggio inviato/ricevuto costantemente rimpiazzando il precedente cosi che quando si torna allo schermo precedente possa aggiornare la chat_preview
    const lastMessage = useRef(null);

    //uid utente
    const {chatId, contactUid, name, token, urlProfileImageContactUser} = route.params;
    console.log(" MYID CHAT");
    console.log(route.params);
    //reference alla flat list
    const refFlatList = useRef();
    //se true significa che è possibile tornare indietro, ossia che la lista dei messaggi è stata caricata (altrimenti crea eccezioni)
    const [isChatLoaded,setIsChatLoaded] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const ultimaRow = useRef(0);

    //messaggio di errore
    const [snackBarMessage, setSnackBarMessage] = useState(null);
    const hideSnackMessage = () => setSnackBarMessage(null);

    const [openRecordingKeyboard, setOpenRecordingKeyboard] = useState(false);
    const recordingKeyboardRef = useRef();

    //mi serve solo come lista per tenermi gli aggiornamenti di chat
    var listTmp = useRef();
    listTmp.current = [...chat];

    async function tornaIndietro(){
        try{
            console.log("torno indietro");
            await resetMessageModel();
            navigation.navigate("Chat",lastMessage.current);
        }catch(e){
            console.log("chat_detail go back errore:"+e);
        }
    }

    async function inviaMessaggio(){ 
        //controllo che ci sia sufficiente spazio libero (nella memoria interna)
        FileSystem.getFreeDiskStorageAsync()
            .then(async(bytes)=>{
                console.log("Spazio libero: "+bytes);
                //se si hanno a disposizione almeno 100MB di spazio libero...
                if(bytes>104857600){
                    try{
                        Keyboard.dismiss();
                        setMessaggio("");
                        ultimaRow.current = ultimaRow.current + 1;
                        const nuovaChiave = ultimaRow.current;
                        await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",nuovaChiave, getUtenteCorrente(),new Date().getTime(),"mex",messaggio, "in-progress");
                        let newMex = {row: nuovaChiave ,author:getUtenteCorrente(), date:new Date()+"", type:"mex",content:messaggio,state:"in-progress"}
                        let chatTmp = [newMex,...chat];
                        setChat(chatTmp);
                        //invio messaggio a firebase
                        console.log("inizio procedura di salvataggio audio in remoto...");
                        inviaNuovoMessaggio(chatId,contactUid,"mex", messaggio,
                            async ()=>{
                                try{
                                    //await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",getUtenteCorrente(),"29/07/2021","mex",messaggio, "succeed");
                                    await local_storage.updateMessageState(getUtenteCorrente()+contactUid+"",nuovaChiave,"succeed");
                                    //invio push notification
                                    console.log("invio push notification a "+name+" con token "+token);
                                    await sendPushNotification(token,informazioniProfiloUtente.name+" ti ha inviato un messaggio", messaggio, chatId);
                                    console.log("Messaggio salvato in locale");
                                    console.log("Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato succeed"); 
                                    addNewUpdate(contactUid,nuovaChiave,"succeed");
                                    //salvo come ultimo messaggio da ritornare allo schermo di prima
                                    lastMessage.current = {code:"UPDATE_LAST_MEX", chatId: chatId, type:"text", value: messaggio, author:getUtenteCorrente(), timestamp:new Date().getTime()};
                                    if(isMounted.current==true)
                                        refFlatList.current.scrollToOffset({animated:true, offset: chat.length-1});
                                }catch(e){
                                    console.log(e);
                                    setSnackBarMessage("E' avvenuto un errore durante il salvataggio del messaggio in locale. Il messaggio è stato comunque inviato.");
                                }
                            },
                            async(e) =>{
                                try{
                                    console.log("errore durante l'invio del messaggio :"+e);
                                    await local_storage.updateMessageState(getUtenteCorrente()+contactUid+"",nuovaChiave,"failed");
                                    console.log("Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato failed"); 
                                    addNewUpdate(contactUid,nuovaChiave,"failed");
                                if(isMounted.current==true)
                                    refFlatList.current.scrollToOffset({animated:true, offset: chat.length-1});
                                }catch(e){
                                    console.log(e);
                                }finally{
                                    setSnackBarMessage("E' avvenuto un errore durante l'invio del messaggio.");
                                }
                            }
                        );
        
                    }catch(e){
                            console.log("errore durante l'invio del messaggio:"+e);
                            setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare il messaggio.");
                        }
                    }else {
                        setSnackBarMessage("Memoria insufficiente. Prova a liberare lo spazio per poter continuare la conversazione");
                    }
            
            }).catch(()=>{
                setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare il messaggio.");
            })
    }

    const isMounted = useRef(false);

    //DA ELIMINARE
    /*useEffect(()=>{
        async function test(){
            try{
            let db = firebase.firestore();
            const path = db.collection("chats").doc("BQCktyNpkjv9Lb8kBsoj");
            path.update({
                lastMessage: {
                    author: getUtenteCorrente(),
                    timestamp: new Date(),
                    type: "text",
                    value: "prova2"
                },
                numberOfMessages: firebase.firestore.FieldValue.increment(1)
            }).then((ris)=>{
                console.log("test chat: successo");
            }).catch((e)=>{
                console.log("test chat fallito: "+e);
            })
        }catch(e){
            console.log("test chat eccezione:"+e);
        }
        }

        test();
    },[])*/


    /*
        Mi metto in ascolto del documento statistics:
            - number_of_messages: 17
            - last_author: ABCD...
            - ABCD.._response: null/false/true
            - KYDZ.._response: null/false/true
            - administrator: ABCD...
    */
   const statistics = useRef();
   const decisionScreenRef = useRef();
   useEffect(()=>{

    async function ascoltaStatistics(){
        try{
            ascoltatoreStatistics = ottieniAscoltatoreStatistics(chatId)
                .onSnapshot(
                    /*
                        Includo nel listener anche l'avviso al cambiamento dei metadati. Infatti per risparmiare traffico, gli eventi generati dal dispositivo X
                        non vengono notificati dal Server al dispositivo X, ma è lo stesso che "simula" ciò. Però devo almeno avere la conferma che il documento
                        è stato scritto sul server prima di generarmi tale listener, e lo faccio controllando che hasPendingWrites=false.
                    */
                    { includeMetadataChanges: true },
                    async(doc) => {
                        try{
                                console.log("ascolto nuove statistiche dal "+doc.metadata.hasPendingWrites==true?"Local":"Server");
                                //se è stato salvato nel server
                                if(doc.metadata.hasPendingWrites==false){

                                    let stat = doc.data();
                                    console.log("nuove statistiche ricevute");
                                    console.log(stat);
                                    statistics.current = JSON.parse(JSON.stringify(stat));

                                    //se il numero di messaggi è un multiplo di THRESHOLD MA la visibilità è minore di 2 (dove 2 sta per massima visibilità)
                                    if( stat.statistics.number_of_messages!=0 && (stat.statistics.number_of_messages % THRESHOLD) == 0 ){ //TODO mettere stat.number_of_messages!=0, per adesso mi serve ==0 ma è errato
                                        /*
                                            mostro la finestra in cui chiedo di prendere una decisione se svelarsi o meno.
                                            La finestra mostrerà i seguenti messaggi (letti da statistics.current):
                                                - se l'utente corrente non ha ancora risposto (null) --> "Vuoi renderti più visibile?"
                                                - se l'utente corrente ha già risposto:
                                                    - indipendentemente se l'altro utente ha risposto o meno io mostrerò "In attesa della risposta dell'altro utente"
                                        */
                                        //se sono qua dentro significa che ancora manca almeno una risposta, la mia, la sua o entrambe
                                        //mostro la decision screen. Se manca la sua risposta vedrà "Attendi...", altrimenti "Vuoi renderti più visibile?"


                                        console.log("Dettagli");
                                        console.log(stat.statistics[contactUid+"_response"]);
                                        console.log(stat.statistics[getUtenteCorrente()+"_response"]);

                                        //se non sono amministartore dovrò attendere fino a che il % numero messaggi è != da THRESHOLD
                                        //se invece sono amministratore devo fare ogni volta i seguenti controlli
                                        //in particolare tali controlli dovrò farli solo se ho già dato la mia risposta in quanto le stesse azioni verranno fatte in DecisionScreen.js quando invece non ho preso decisioni
                                        if(stat.statistics[getUtenteCorrente()+"_response"]!=null && getUtenteCorrente()==stat.statistics.administrator) {
                                            //se l'utente corrente ha risposto
                                            if(stat.statistics[contactUid+"_response"]!=null){
                                                    //se la risposta dell'utente è true e la mia è true faccio l'upgrade
                                                    if(stat.statistics[contactUid+"_response"]==true && stat.statistics[getUtenteCorrente()+"_response"]==true){
                                                        //faccio upgrade
                                                        await upgradeConversation(chatId,true,contactUid);
                                                        console.log("upgrade riuscito con successo");
                                                    }
                                                    //altrimenti in qualsiasi altro caso resetto
                                                    else {
                                                        //resetto solo
                                                        await upgradeConversation(chatId,false,contactUid);
                                                        console.log("'continua con lo stesso livello di visibilità' riuscito con successo");
                                                    }
                                                }
                                            }
                    
                                        //altrimenti, se non ho risposto oppure ho risposto ma manca l'altro oppure semplicemente non sono l'amministratore mi metto in attesa
                                        decisionScreenRef.current.show(stat);



                                        
                                    }
                                    //altrimenti non blocco la chat
                                    else{
                                        decisionScreenRef.current.hide(); //se prima era aperto (in attesa di risposta) ora lo chiudo per sicurezza.
                                    }

                                }
                            }catch(e){
                                console.log("Si è verificato un errore durante la ricezione/elaborazione delle statistiche:"+e);       
                            }
                                
                              
                });
        }catch(e){
            console.log("Si è verificato un errore. Impossibile avviare la conversazione:"+e);
            setSnackBarMessage("Si è verificato un errore. Impossibile avviare la conversazione.");
        }
    }

    ascoltaStatistics();
    

    return () => {
            console.log("rimuovo ascoltatore statistiche");
            if(ascoltatoreStatistics) ascoltatoreStatistics();
    }
   },[])


    useEffect(()=>{
        isMounted.current = true;
        const bh = BackHandler.addEventListener('hardwareBackPress',tornaIndietro);
        //setto l'id della chat come corrente cosi da non mostrarmi notifiche su questa chat
        idChatCorrente = chatId;

        console.log("Sto prelevando tutti i messaggi scambiati con l'utente corrente...");
        
        async function ottieniPrimi10Messaggi() {
            //se la promise interna ha un errore lo catturo
            try{
                //da eliminare (la prima solo)
                //await local_storage.removeTable(getUtenteCorrente()+contactUid+"");
                await local_storage.createNewTableForConversation(getUtenteCorrente()+contactUid+"");
                await local_storage.createNewIndexForTableForConversation(getUtenteCorrente()+contactUid+"");
                
                //in ogni caso dopo ottieni la lista dei messaggi
                console.log("ottengo lista primi 10 messaggi..");
                if(!idChatAlreadyOpened.includes(contactUid)){
                    console.log("pulizia chat....");
                    //pulisco la chat da vecchi in-progress o failed messages
                    await local_storage.cleanChatFromFailedMessages(getUtenteCorrente()+contactUid+"");
                    idChatAlreadyOpened.push(contactUid);
                }

                local_storage.getListOfChatMessages(getUtenteCorrente()+contactUid+"", 0)
                    .then(async(lista_messaggi)=>{
                        try{
                            let lista_messaggi_array = JSON.parse(lista_messaggi);
                            const lista_iniziale = [...lista_messaggi_array];
                            //console.log(lista_messaggi);
                            //setChat(lista_iniziale);
                            /*
                                Prendere l'ultimaRow, invece della lenght dell'array, aiuta a non utilizzare la stessa chiave. 
                            */
                            if(lista_iniziale.length>0)
                                ultimaRow.current = lista_iniziale[0].row;
                            else
                                ultimaRow.current = 0;

                            listTmp.current = lista_iniziale;
                            console.log("Lista iniziale di messaggi caricata dallo storage:");
                            console.log(lista_iniziale);

                            await inizializzaAscoltatoreNuoviMessaggi();

                        }catch(e){
                            console.log("errore durante il caricamento:"+e);
                            setSnackBarMessage("error");
                        }
                    }).catch((e)=>{
                        console.log("errore interno mentre si eseguiva use effect (chat_detail.js):"+e);
                        setSnackBarMessage("Si è verificato un errore");
                        setIsChatLoaded(true);
                    })
                    
                
            }catch(err){
                console.log("errore interno mentre si eseguiva use effect (chat_detail.js):"+err);
                setSnackBarMessage("Si è verificato un errore");
                setIsChatLoaded(true);
            }
            
    }

    //dato che la funzione è async e non uso .then() allora verrà eseguita in maniera asincrona
    ottieniPrimi10Messaggi();


        return () => {
            BackHandler.removeEventListener('hardwareBackPress', tornaIndietro);
            isMounted.current = false;
            console.log("rimuovo ascoltatore nuovi messaggi");
            if(ascoltatoreNuoviMessaggi) ascoltatoreNuoviMessaggi(); //rimuovo listener
            //riattivo le notifiche
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                  shouldShowAlert: true,
                  shouldPlaySound: false,
                  shouldSetBadge: false
                })
              });
              //resetto id chat corrente
              idChatCorrente = null;
        }
        
    },[])

    async function inizializzaAscoltatoreNuoviMessaggi(){
        console.log("LISTA TMP ATTUALE. Ultima chiave attuale: "+ultimaRow.current);
            console.log(listTmp.current);
            //prelevo ultimo timestamp memorizzato
            let ultimoTimestampMemorizzato = -1;
            if(listTmp.current[0])
                ultimoTimestampMemorizzato = listTmp.current[0].date; //milliseconds (è un numero), per firstore ho bisogno di secondi, per questo divido per 1000
            console.log("ultimo timestamp memorizzato:"+ultimoTimestampMemorizzato);
            ascoltatoreNuoviMessaggi = ottieniAscoltatoreNuoviMessaggi(chatId, getUtenteCorrente(),ultimoTimestampMemorizzato )
                                    .onSnapshot(async(snapshot) => {
                                        const promises = [];
                                        //mantengo l'ultimo timestamp (o nome) dell'audio ricevuto cosi che procedo a eliminare tutti gli audio con nome minore dell'ultimo
                                        var lastAudioTimestamp = null;
                                        var lastMessageTimestamp = null; //questo è per tutti, ossia tiene in memoria l'ultimo timestamp ricevuto, che il type sia mex o audio
                                        snapshot.docChanges().forEach(async(change) => {
                                                    console.log("ascolto nuovo doc");
                                                    if (change.type != "added") {
                                                        return;
                                                    }
                                                    let doc = change.doc;
                                                    ultimaRow.current = ultimaRow.current+1;
                                                    console.log("E' un nuovo "+doc.data().type+". Lo memorizzo con chiave:"+ultimaRow.current);
                                                    console.log(doc.data());
                                                    //se il messaggio è un audio, indico qual'è l'ultimo timestamp o nome del file
                                                    if(doc.data().type=="audio")
                                                        lastAudioTimestamp = doc.data().timestamp;
                                                    lastMessageTimestamp = doc.data().timestamp;
                                                    promises.push(addNewReceivedMessage(doc, ultimaRow.current));
                                                    console.log("procedo al successivo di "+ultimaRow.current);
                                                    
                                    });
                                    console.log("fine ultima");
                                    try{
                                        let lastMessages = [];
                                        for(let i=0; i<promises.length; i++)
                                            lastMessages.push(await promises[i]);
                                        //solo quando tutti i messaggi sono stati salvati in locale verranno mostrati cosi da evitare di 
                                        //scaricarli solo quando si preme il bottone play
                                        
                                        //elimino messaggi testuali
                                        if(lastMessages.length>0){
                                            //prendo l'ultimo timestamp e lo do alla funzione che elimina tutti i messaggi precedenti sul mio canale
                                            await removeMessages(chatId,lastMessageTimestamp);
                                        }
                                        //se tra i messaggi ci sono stati audio, allora avrò che lastAudioTimestamp != null, quindi se avrò
                                        //5 audio scaricati, lastAudioTimestamp è il nome dell'ultimo audio. Posso procedere a eliminare tutti i precedenti
                                        if(lastAudioTimestamp!=null)
                                            await removeGroupOfAudiosBeforeTimestamp(chatId,lastAudioTimestamp);
                                        
                                        
                                        console.log("tutti i nuovi doc sono stati caricati");
                                        console.log(lastMessages);
                                        let newChat = [...lastMessages.reverse(),...listTmp.current];
                                        setChat(newChat);
                                        setIsChatLoaded(true);
                                    }catch(err){
                                        console.log("Si è verificato un problema sulla promise.all dell'ascoltatore:"+err);
                                    }
                                        
                                });
    }

    async function addNewReceivedMessage(doc, row){
        console.log("   doc di interesse:"+row);
        console.log("memorizzo doc");
        //console.log(listTmp);
        //memorizzo nello storage
        //se è un audio lo scarico e lo salvo

        //devo però convertire il timestamp globale (dal 1970..) in una data che è corretta nel mio timezone
        /*console.log("timestamp ricevuto: "+doc.data().timestamp+" che equivale alla data: "+ new Date(doc.data().timestamp));
        const localOffset = new Date().getTimezoneOffset()*60*1000;
        console.log("dato che l'offset qui è "+new Date().getTimezoneOffset()+" allora il local offset in millisecondi sarà: "+localOffset)
        const utcTime = doc.data().timestamp + localOffset;
        console.log("aggiungo ai ms del timestamp ricevuto ottenendo:"+utcTime+" per una equivalente data di: "+new Date(utcTime));*/
        
        if(doc.data().type == "audio"){
            await local_storage.saveAudioIntoFolder(getUtenteCorrente(),
                                                    contactUid,
                                                    row,
                                                    contactUid,
                                                    new Date(doc.data().timestamp),
                                                    doc.data().value
                                                    )
        }else
            await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",
                                                row, 
                                                contactUid,
                                                new Date(doc.data().timestamp).getTime(),
                                                doc.data().type,
                                                doc.data().value,
                                                "succeed");
        console.log("fine memorizzazione doc "+row);
        //posso procedere ad eliminare l'audio in remoto. Se fallisco, comunque non blocco l'utente in quanto tanto l'eliminazione è per timestamp<ultimoTimestamp (ogni volta), quindi al primo corretto si eliminano TUTTI i precedenti

        let newMex = {row: row ,author:contactUid, date:new Date(doc.data().timestamp).getTime(), type:doc.data().type+"",content:doc.data().value+"",state:"succeed"};
        return newMex;
        /* chatTmp = [newMex,...listTmp.current];
        //if(isMounted.current==true)
        setChat(chatTmp);
        refFlatList.current.scrollToOffset({animated:true, offset: chatTmp.length-1});*/
    }

    //console.log("CHAT ATTUALE-->");
    //console.log(chat);

    function caricaSuccessivi10Messaggi(){

        //controllo che l'ultimo messaggio non abbia row 1, altrimenti sono già alla fine ed è inutile richiedere valori
        if(chat[chat.length-1].row==1) return;
        setIsChatLoaded(false);
        local_storage.getListOfChatMessages(getUtenteCorrente()+contactUid+"",chat.length )
            .then((lista_messaggi)=>{
                console.log("SUCCESSIVI 10 MESSAGGI PRELEVATI CON SUCCESSO");
                //aggiorno chat la chat
                console.log(lista_messaggi);
                let lista_messaggi_array = JSON.parse(lista_messaggi);
                let chatTmp = [...chat,...lista_messaggi_array];
                setChat(chatTmp);
                //ultimaRow.current = ultimaRow.current + Object.keys(lista_messaggi_array).length;
                setIsChatLoaded(true);
            }).catch((e)=>{

            })

    }

    /*
     ::::::::::::::::::::::::::::::::::::::AUDIO VOCALE::::::::::::::::::::::::::::::::::::::
    */
   //contiene info sul recording
   const [recordingInfo, setRecordingInfo] = useState();
   //se true indica che la registrazione è avviata
    const [isRecording, setIsRecording] = useState(false);
    //indica la durata attuale dell'audio mentre lo si registra
    const [durataAudio, setDurataAudio] = useState(0);

    //avvia registrazione vocale
    function startRecording(){
         //controllo che ci sia sufficiente spazio libero (nella memoria interna)
         FileSystem.getFreeDiskStorageAsync()
         .then(async(bytes)=>{
             console.log("Spazio libero: "+bytes);
             //se si hanno a disposizione almeno 100MB di spazio libero...
             if(bytes>104857600){
                try{
                    console.log("Avvio registrazione vocale...");
                    //chiedo permessi
                    await Audio.requestPermissionsAsync();
                    //setto alcune configurazioni personalizzate su Android e IOS
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: true, //permetto su IOS la registrazione, di default è false
                        playsInSilentModeIOS: true,
                        staysActiveInBackground: false, //interrompi la registrazione se si esce dall'app
                         //interrompi il suono delle altre app mentre si registra
                        interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, //idem come sopra ma per android
                        shouldDuckAndroid: true, //se arrivo un audio da altre app queste aspetteranno
                    })

                    //Contiene info sulla registrazione. 
                    const newRecording = new Audio.Recording();
                    //creo un suono nuovo
                    await newRecording.prepareToRecordAsync(
                        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
                        Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
                    )
                    
                    newRecording.setOnRecordingStatusUpdate(aggiornaAnimazioneAudioVocale);
                    newRecording.setProgressUpdateInterval(100);
                    await newRecording.startAsync();
                    //adesso sta registrando...
                    console.log("Avvio registrazione...");
                    setRecordingInfo(newRecording);
                    setIsRecording(true);
                }catch(err){
                    console.log("E' avvenuto un errore "+err);
                }
            }else
                setSnackBarMessage("Memoria insufficiente. Prova a liberare lo spazio per poter continuare la conversazione");
        }).catch((e)=>{
            setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare il messaggio.");
        })
    }

    //stop il recording di sopra
    async function stopRecording(){
        console.log("Stopping recording...");
        try{
            //prelevo l'uri dove è stata memorizzata
            await recordingInfo.stopAndUnloadAsync();
            const uri = recordingInfo.getURI();
            setRecordingInfo(undefined);
            console.log('Recording terminata e salvata in '+uri);
            //salvo audio nel database
            saveAudio(uri);
        }catch(e){
            console.log("Si è verificato un problema:"+e);
            setRecordingInfo(undefined);
            setIsRecording(false);
            setSnackBarMessage("Si è verificato un problema.");
        }
    }
    
    function saveAudio(uri){
         //controllo che ci sia sufficiente spazio libero (nella memoria interna)
         FileSystem.getFreeDiskStorageAsync()
         .then(async(bytes)=>{
             console.log("Spazio libero: "+bytes);
             //se si hanno a disposizione almeno 100MB di spazio libero...
             if(bytes>104857600){
                try{
                    ultimaRow.current = ultimaRow.current + 1;
                    const nuovaChiave = ultimaRow.current;
                    //aggiugo alla chat
                    //creo nuovo messaggio    
                    let newMex = {row: nuovaChiave ,author:getUtenteCorrente(), date: new Date().getTime(), type:"audio",content:uri, state:"in-progress"}
                    let chatTmp = [newMex,...chat];
                    setChat(chatTmp);
                    //scrollo in basso
                    refFlatList.current.scrollToOffset({animated:true, offset: chat.length-1});
                    setIsRecording(false);
                    console.log("(in-progress)--> invio audio "+nuovaChiave+" in remoto...");
                    //salvo audio in remoto, ma uso approccio asincrono per liberare la UI. Se avviene qualche errore tolgo quello appena inserito
                    inviaNuovoMessaggio(chatId,contactUid,"audio", uri,
                        async(ris) =>{
                            //l'audio è stato salvato con successo, lo lascio cosi com'è
                            console.log("salvato in remoto. Salvo in locale...");
                            //salvo in locale
                            //mi ritorna il percorso dove ha salvato l'audio. Di default salva l'audio con stato "in-progress" a indicare che non ha ancora ricevuto conferma di salvataggio nel database
                            let local_uri = await local_storage.saveAudioIntoFolder(getUtenteCorrente(),contactUid,nuovaChiave, getUtenteCorrente(),new Date(),uri);
                            console.log("percorso salvato nel database e nel file system in uri: "+local_uri);
                            //aggiorno UI
                            console.log("Il componente è montato? "+isMounted.current);
                            //aggiorno database locale
                            try{
                                //aggiorno la UI con la spunta cosi da indicare che è stato caricato definitivamente
                                if(isMounted.current==true){
                                    //indico alla flat list la row da aggiornare come succeed
                                    let newarrayOfRowsToUpdateState = {};
                                    Object.assign(newarrayOfRowsToUpdateState,arrayOfRowsToUpdateState);
                                    newarrayOfRowsToUpdateState[nuovaChiave] = "succeed"; 
                                    setarrayOfRowsToUpdateState(newarrayOfRowsToUpdateState);
                                }
                            }catch(e){
                                setSnackBarMessage("E' avvenuto un errore durante il salvataggio dell'audio in locale:");
                                console.log("errore durante l'aggiornamento dello stato dell'audio:"+e);
                            }
                        },
                        (err) =>{
                            try{
                                //l'audio non è stato salvato. Lo elimino dalla lista
                                console.log("non salvato in remoto. Aggiorno stato come fallito in locale");
                                if(isMounted.current==true){
                                    setSnackBarMessage("E' avvenuto un errore durante l'invio dell'audio vocale.");
                                    //indico alla flat list la row da aggiornare come succeed
                                    let newarrayOfRowsToUpdateState = {};
                                    Object.assign(newarrayOfRowsToUpdateState,arrayOfRowsToUpdateState);
                                    newarrayOfRowsToUpdateState[nuovaChiave] = "failed"; 
                                    setarrayOfRowsToUpdateState(newarrayOfRowsToUpdateState);
                                }
                            }catch(error1){
                                console.log("è avvenuto un errore durante l'aggiornamento a 'failed' dell'audio in locale:"+error1);
                            }
                        })
                }catch(error2){
                    setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare l'audio vocale.");
                    console.log(error2);
                }
            }else
                setSnackBarMessage("Memoria insufficiente. Prova a liberare lo spazio per poter continuare la conversazione");
        }).catch((e)=>{
                setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare il messaggio.");
        })
    }

    function annullaRecording(){

    }

    /*
      Viene richiamata ogni mezzo secondo (grazie a progressUpdateIntervalMillis (500)) e contiene, tra le varie informazioni il metering, 
      ossia il valore in db della potenza del suono emesso
    */
    const [amplitude, setAmplitude] = useState(0.9);
    
    function aggiornaAnimazioneAudioVocale(status){
       // console.log("AGGIORNAMENTO AUDIO VOCALE");
       // console.log(status);

        //AGGIORNO PROGRESS BAR
        //prelevo tempo (siccome progress bar ha massimo a 1 allora dato che il massimo consentito è di 1 secondo (60k ms) lo divido per 60k)
        let secondi = parseInt(status.durationMillis)/60000;
        setDurataAudio(secondi); 
        /* 
        let power = 0;
        //AGGIORNO LINE WAVES
        if(parseInt(status.metering)>-120)
            power = 160 + parseInt(status.metering);
        else
            power = (160 + parseInt(status.metering))*0.7
        let amplitude1 = (power/160)/3;
        let amplitude2 = (power/160);
        let amplitude3 = (power/160)/2;
        setAmplitude(power/160/2);*/

    }

    function apriRecordingKeyboard(){
        setOpenRecordingKeyboard(true);
    }

    console.log("STATISTICHEEEE");
    console.log(statistics.current);

    useEffect(()=>{
        //se la voglio aprire...
        if(openRecordingKeyboard==true)
            recordingKeyboardRef.current.startRecording();

    },[openRecordingKeyboard]);

    return (
      <View style={styles.container}>
     {/* BARRA SUPERIORE */}
     <View style={styles.barraSuperiore}>
          <TouchableOpacity  onPress={tornaIndietro} style={{position:"absolute",left:0,zIndex:10, paddingLeft:Dimensions.get("window").width*0.03}}>
              <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
          </TouchableOpacity>
          <Text style={styles.titolo}>{name}</Text>
          <TouchableOpacity style={{position:"absolute", right:Dimensions.get("window").width*0.04}}>
              <Octicons name="kebab-vertical" size={fontSizeTitoloBarra} color="#52575D" />
          </TouchableOpacity>
      </View>

     {chat.length>0 &&
     <ListaMessaggi refFlatList={refFlatList} 
                    lista_messaggi={chat} 
                    caricaSuccessivi10Messaggi={caricaSuccessivi10Messaggi} 
                    getUtenteCorrente={getUtenteCorrente} 
                    setSnackBarMessage={setSnackBarMessage}
                    contactUid = {contactUid}
                    ultimaData = {null} /> }
      {chat.length==0 && 
        <View style={{flex:1}}>
            {isChatLoaded==true &&
                <View style={{width:larghezzaDevice, height:larghezzaDevice, justifyContent:"center"}}>
                     <Image source={require('../../../../../resources/images/cloud-background.png')} style={{position:"absolute", width:larghezzaDevice,height:larghezzaDevice , alignSelf:"center"}}/>
                    <Text style={[styles.helloTitle,{textAlign:"center", justifyContent:"center", textAlignVertical:"center"}]}>Saluta {name}! </Text>
                    <Text style={[styles.helloContent]}>Su Mosaic esistono 3 livelli di mosaicizzazione del profilo degli utenti, da quello massimo a quello nullo. Tu e {name} partirete con quello massimo. Col tempo, a seconda della conversazione, vi chiederemo di passare al livello successivo e ciò avverrà solo se entrambi sarete daccordo.</Text>
                    <Text style={[styles.helloContent]}>Dato l'anonimato, Mosaic invita a conversare con messaggi vocali limitando il numero di messaggi testuali a qualche carattere.</Text>
                </View>
            }
        </View>
      }
     
      <LinearGradient
          // Background Linear Gradient sopra chat
          colors={["rgba(119, 39, 236,0.1)",'transparent']}
          style={{position: 'absolute',top:altezzaBarraScreen,width: larghezzaDevice,height: 50}}
        />
      

        <LinearGradient
          // Background Linear Gradient sotto chat
          colors={['transparent', "rgba(119, 39, 236,0.1)"]}
          style={{position: 'absolute',bottom:altezzaMenuNavigazione*1.5,width: larghezzaDevice,height: 50}}
        />

      {//se non sta registrando mostro la classica tastiera 
        openRecordingKeyboard==false
        &&
        <View style={styles.tastiera}>
            <TouchableOpacity onPress={inviaMessaggio} style={styles.inviaMessaggio} disabled={messaggio==""?true:false}>
                    <FontAwesome name = "location-arrow" size={fontSizeTitoloBarra} color={messaggio==""?"rgba(27, 98, 253,0.3)":MosCeleste} />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                maxLength={25}
                disabled={!isChatLoaded}
                onChangeText={(text)=>{setMessaggio(text)}}
                value={messaggio}
                placeholder="Scrivi un breve messaggio..."
                keyboardType="default"
            />
            <TouchableOpacity onLongPress={apriRecordingKeyboard} disabled={!isChatLoaded} style={styles.pulsanteAudio}>
                <MaterialIcons name="keyboard-voice" size={fontSizeTitoloBarra} color="white" />
            </TouchableOpacity>
        </View>
      }

      {//se sta registrando mostro la schermata di registrazione
          openRecordingKeyboard == true
          &&
          //schermata nera + tastiera recording
          <>
          <View style={styles.backgroundRecording}/>
          <RecordingKeyboard ref = {recordingKeyboardRef} 
                             setOpenRecordingKeyboard = {setOpenRecordingKeyboard}
                             setSnackBarMessage = {setSnackBarMessage}
                             ultimaRow = {ultimaRow}
                             getUtenteCorrente = {getUtenteCorrente}
                             chat = {chat}
                             setChat = {setChat}
                             refFlatList = {refFlatList}
                             inviaNuovoMessaggio = {inviaNuovoMessaggio}
                             lastMessage = {lastMessage}
                             contactUid = {contactUid}
                             isMounted = {isMounted}
                             arrayOfRowsToUpdateState = {arrayOfRowsToUpdateState}
                             chatId = {chatId}
                             setRefresh = {setRefresh}
                             refresh = {refresh} />
          </>
          
      }
      
      {/*schermata caricamento chat */}
      {isChatLoaded==false && <View style={{position:"absolute", width:larghezzaDevice, height:altezzaDevice, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size={fontSizeTitoloBarra} color={MosPurple} /> 
      </View>}

      {/* schermata decision screen */}
      <DecisionScreen ref={decisionScreenRef} 
                      makeDecision={makeDecision}
                      upgradeConversation = {upgradeConversation} 
                      chatID={chatId}
                      uidCurrentUser={getUtenteCorrente()}
                      contactUid = {contactUid}
                      contactName = {name}
                      urlProfileImageContactUser={urlProfileImageContactUser}
                      current_level_of_visibility = {statistics.current!=undefined?statistics.current.level_of_visibility:0}
                      informazioniProfiloUtenteCorrente = {informazioniProfiloUtente}
                      />

      <Snackbar
            visible={snackBarMessage?true:false}
            onDismiss={hideSnackMessage}
            action={{
            label: 'Chiudi',
            onPress: () => {
                hideSnackMessage();
            },
            }}>
            {snackBarMessage}
        </Snackbar>

  </View>
       
    )
}

const styles = StyleSheet.create({
    container: {
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra*0.8,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice
    },
    barraSuperiore:{
        width:larghezzaDevice,
        height:altezzaBarraScreen,
        justifyContent:"center",
        paddingTop:24,
        backgroundColor:"#fff"
    },
    areaMessaggi: {
        flex:1,
        backgroundColor:"#fff",
    },
    tastiera:{
        //flex:0.15,
        flexDirection: 'row',
        justifyContent:"center",
        alignItems:"center",
        width: larghezzaDevice,
        backgroundColor:"#fff",
        paddingTop:fontSizeTitoloBarra*0.5,
        paddingBottom:fontSizeTitoloBarra*0.5
        
    },
    input:{
        textAlign:"right",
        fontSize:fontSizeCampi*1.1,
        height:altezzaMenuNavigazione,
        width:larghezzaDevice*0.65,
        textAlign:"left"
    },
    pulsanteAudio:{
        backgroundColor:MosCeleste,
        fontSize:fontSizeCampi,
        justifyContent:"center",
        alignItems:"center",
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
        borderRadius:larghezzaDevice*0.15/2,
        elevation:5,
        marginRight: larghezzaDevice*0.05
    },
    pulsanteAudioInRecording:{
        backgroundColor:"red",
        fontSize:fontSizeCampi,
        justifyContent:"center",
        alignItems:"center",
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
        borderRadius:larghezzaDevice*0.15/2,
        elevation:5,
        marginRight: larghezzaDevice*0.05,
        zIndex:10
    },
    inviaMessaggio:{
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
        justifyContent:"center",
        alignItems:"center"
    },
    testoConteggioDurataAudio: {
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
        justifyContent:"center",
        alignItems:"center"
    },
    fab: {
        position: 'absolute',
      },
    backgroundRecording:{
        position:"absolute",
        width:larghezzaDevice,
        height:altezzaDevice,
        backgroundColor:"#1d1616",
        opacity:0.96
    },
    areaAnimazioneAudio: { //70% dello spazio
        width: larghezzaDevice*0.6,
        marginRight:larghezzaDevice*0.05
    },
    pulsanteAudioAnnullaRecording:{ //%15% spazio
        fontSize:fontSizeCampi,
        justifyContent:"center",
        alignItems:"center",
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
 
    },
    helloTitle: {
        marginVertical:10,
        fontFamily: 'Lobster_400Regular',
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        fontSize:larghezzaDevice*0.09
    },
    helloContent: {
        marginVertical:10,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        fontSize:larghezzaDevice*0.04,
        textAlign:"center", 
        justifyContent:"center", 
        textAlignVertical:"center",
        padding:10
    }
    
})