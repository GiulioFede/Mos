import React,{useEffect, useState, useContext, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity,Image, Dimensions, Keyboard,KeyboardAvoidingView, TextInput, ScrollView, BackHandler, Platform} from "react-native"
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, altezzaSchermoInterno, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali"
import { MosCeleste, coloreSchermataDiCaricamento, MosPurple, MosViola } from "../../../../../resources/colors";
import MessageModel from "./components/messageModel";
import * as FileSystem from 'expo-file-system';
import { sendPushNotification } from '../../../../../context/push_notifications/functions';
import {useFonts, Lobster_400Regular} from '@expo-google-fonts/lobster';
import {useFonts as useFonts1, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
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
import ThreeDotTab from "./components/threeDotTab";
import OptionsDialog from "./components/dialogoOpzioni";
import ProgressRequest from "./components/progressRequest";
import i18n from 'i18n-js'
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
let THRESHOLD = 3; //NB: cambiare anche l'omonima in chat_preview NB: CAMBIARE ANCHE NELLE REGOLE DI SICUREZZA!!!
let isIOS = Platform.OS=="ios";

export var idChatCorrente = null;

export default function ChatDetail({ navigation,route}){

    const [messaggio, setMessaggio] = useState("");
    //conterrà l'intera chat
    const [chat, setChat] = useState([]);
    //contesto autenticazione
    const {getUtenteCorrente,informazioniProfiloUtente, inviaNuovoMessaggio,ottieniAscoltatoreNuoviMessaggi, ottieniAscoltatoreStatistics, makeDecision, upgradeConversation,removeGroupOfAudiosBeforeTimestamp, removeMessages,removeConversation, blockContact, setConversazioniBloccate, conversazioniBloccate} = useContext(AutenticazioneUtente);
    
    const {addNewUpdate} = useContext(RowsOfMessagesToUpdate);

    //memorizzerà l'ultimo messaggio inviato/ricevuto costantemente rimpiazzando il precedente cosi che quando si torna allo schermo precedente possa aggiornare la chat_preview
    const lastMessage = useRef(null);

    const threeDotTabRef = useRef();

    const [initialState, setInitialState] = useState(true);

    const progressRequestRef = useRef();

    const currentVisibility = useRef(0);

    //uid utente
    const {chatId, contactUid, name, token, urlProfileImageContactUser, creationData, visibilityBeforeOpenChatDetail} = route.params;
    //console.log(" MYID CHAT");
    //console.log(route.params);
    //reference alla flat list
    const refFlatList = useRef();
    //reference dialog
    const optionsDialogRef = useRef();

    const blockListeners = useRef(false);

    //se true significa che è possibile tornare indietro, ossia che la lista dei messaggi è stata caricata (altrimenti crea eccezioni)
    const [isChatLoaded,setIsChatLoaded] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const ultimaRow = useRef(0);

    //messaggio di errore
    const [snackBarMessage, setSnackBarMessage] = useState(null);
    const hideSnackMessage = () => setSnackBarMessage(null);

    const [openRecordingKeyboard, setOpenRecordingKeyboard] = useState(false);
    const isOpenRecordingKeyboardOpened = useRef(false);
    const recordingKeyboardRef = useRef();

    const isVisibilityMaximum = useRef(false);

    //mi serve solo come lista per tenermi gli aggiornamenti di chat
    var listTmp = useRef();
    listTmp.current = [...chat];

    async function removeCurrentConversation(){
        try{
            if(recordingKeyboardRef.current!=null || recordingKeyboardRef.current!=undefined)
                await recordingKeyboardRef.current.closeRecordingBoard();
            blockListeners.current = true;
            optionsDialogRef.current.show_loading(true);
            await removeConversation(chatId,contactUid,name,informazioniProfiloUtente.name,creationData);
            await local_storage.removeTable(getUtenteCorrente()+contactUid+"");
            setTimeout(()=>{
                navigation.goBack();
            },2000);
        }catch(e){
            console.log("errore eliminazione conversazione: "+e);
            if(e.code=="not-found")
                setSnackBarMessage(i18n.t('userNotExists'));
            else
                setSnackBarMessage(i18n.t('chatRemovingFailed'));
            optionsDialogRef.current.show_loading(false);
        }finally{
            blockListeners.current = false;
        }
    }

    async function blockCurrentContact(){
        try{
            if(recordingKeyboardRef.current!=null || recordingKeyboardRef.current!=undefined)
                await recordingKeyboardRef.current.closeRecordingBoard();
            blockListeners.current = true;
            optionsDialogRef.current.show_loading(true);
            let blockedChatObj = await blockContact(chatId,contactUid,name,informazioniProfiloUtente.name,creationData);
            //aggiorno la lista delle chat bloccate
            let current_blocked_chat_list = conversazioniBloccate;
            current_blocked_chat_list.push(blockedChatObj);
            setConversazioniBloccate(current_blocked_chat_list);
            await local_storage.removeTable(getUtenteCorrente()+contactUid+"");
            setTimeout(()=>{
                navigation.goBack();
            },2000);
        }catch(e){
            console.log("errore bloccaggio ed eliminazione conversazione: "+e);
            if(e.code=="not-found")
                setSnackBarMessage(i18n.t('userNotExists'));
            else
                setSnackBarMessage(i18n.t('failedOperation'));
            optionsDialogRef.current.show_loading(false);
        }finally{
            blockListeners.current = false;
        }
    }

    //console.log("INITIAL STATE:"+initialState);

    async function tornaIndietro(){
        try{
            console.log("E' la recording board aperta?"+isOpenRecordingKeyboardOpened.current);
            if(isOpenRecordingKeyboardOpened.current == false){
                console.log("torno indietro");
                await resetMessageModel();
                navigation.navigate("Chat",lastMessage.current);
            }
        }catch(e){
            console.log("chat_detail go back errore:"+e);
        }
    }

    async function inviaMessaggio(){
        if(statistics.current==undefined) return;
        if(statistics.current.statistics.number_of_messages>=THRESHOLD){
            setSnackBarMessage(i18n.t('waitChoice'));
            return;
        }  
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
                        await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",nuovaChiave, getUtenteCorrente(),new Date().getTime(),"mex",messaggio,currentVisibility.current, "in-progress");
                        let newMex = {row: nuovaChiave ,author:getUtenteCorrente(), date:new Date()+"", type:"mex",content:messaggio,current_visibility:currentVisibility.current, state:"in-progress"}
                        let chatTmp = [newMex,...chat];
                        setChat(chatTmp);
                        //invio messaggio a firebase
                        console.log("inizio procedura di salvataggio audio in remoto...");
                        //se sono al livello 2 avrò che statistics.current sarà undefined.
                        inviaNuovoMessaggio(chatId,contactUid,"mex", messaggio,(isVisibilityMaximum.current == true)?("MAXIMUM_VISIBILITY_ACHIVED"):(statistics.current.lastMessage.author),
                            async ()=>{
                                try{
                                    //await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",getUtenteCorrente(),"29/07/2021","mex",messaggio, "succeed");
                                    await local_storage.updateMessageState(getUtenteCorrente()+contactUid+"",nuovaChiave,"succeed");
                                    //invio push notification
                                    console.log("invio push notification a "+name+" con token "+token);
                                    await sendPushNotification(token,informazioniProfiloUtente.name+i18n.t('pushNewMessage'), messaggio, {chatId: chatId});
                                    console.log("Messaggio salvato in locale");
                                    console.log("Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato succeed"); 
                                    addNewUpdate(contactUid,nuovaChiave,"succeed");
                                    //salvo come ultimo messaggio da ritornare allo schermo di prima (?) --> forse non serve xkè prelevato direttamente da remoto
                                    lastMessage.current = {code:"UPDATE_LAST_MEX", chatId: chatId, type:"text", value: messaggio, author:getUtenteCorrente(), timestamp:new Date().getTime()};
                                    if(isMounted.current==true)
                                        refFlatList.current.scrollToOffset({animated:true, offset: chat.length-1});
                                }catch(e){
                                    console.log(e);
                                    setSnackBarMessage(i18n.t('mexError1'));
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
                                    setSnackBarMessage(i18n.t('mexError2'));
                                }
                            }
                        );
        
                    }catch(e){
                            console.log("errore durante l'invio del messaggio:"+e);
                            setSnackBarMessage(i18n.t('mexError3'));
                        }
                    }else {
                        setSnackBarMessage(i18n.t('memoryError'));
                    }
            
            }).catch(()=>{
                setSnackBarMessage(i18n.t('mexError3'));
            })
    }

    const isMounted = useRef(false);


   const statistics = useRef();
   const decisionScreenRef = useRef();

    async function ascoltaStatistics(ultimaVisibilitàSalvata){
        try{
      
            var lastStatisticReceived = null;

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
                                if(blockListeners.current==true){
                                    console.log("Non posso ascoltare,sono in fase di lavoro...");
                                    return;
                                }
                                //se è stato salvato nel server
                                if(doc.metadata.hasPendingWrites==false){

                                    let stat = doc.data();
                                    console.log("nuove statistiche ricevute in "+getUtenteCorrente());
                                    console.log(stat);
                                    if(stat==undefined) {               
                                        return;
                                    }


                                    console.log((JSON.stringify(stat)==JSON.stringify(lastStatisticReceived)));
                                    if(lastStatisticReceived!=null){
                                        if(JSON.stringify(stat)==JSON.stringify(lastStatisticReceived))
                                            return;
                                    }

                                    lastStatisticReceived = JSON.parse(JSON.stringify(stat));
                                    console.log(lastStatisticReceived);

                                    statistics.current = JSON.parse(JSON.stringify(stat));

                                    //aggiorno progress bar
                                    console.log("visibilityBeforeOpenChatDetail:"+visibilityBeforeOpenChatDetail);
                                    if(visibilityBeforeOpenChatDetail<2)
                                        progressRequestRef.current.set_percentage(stat.statistics.number_of_messages);
                                    
                                    console.log("Devo fare la notify locale?");
                                    let lastVis = 0;
                                    lastVis = ultimaVisibilitàSalvata;
                                    ultimaVisibilitàSalvata = stat.level_of_visibility;
                                    console.log("ultima visibilità salvata:"+lastVis);
                                    console.log("corrente visibilità giunta:"+stat.level_of_visibility);
                                    console.log("lunghezza chat:"+chat.length);
                                    //aggiorno corrente visibilità
                                    currentVisibility.current = stat.level_of_visibility;
                                    //controllo se quella nuova è maggiore rispetto la precedente. Se è cosi invio (localmente) un upgrade
                                    //console.log("NOTIFY UPGRADE?"+lastVis+","+stat.level_of_visibility);
                                   /* if(lastVis<stat.level_of_visibility)
                                        await notifyUpgrade((stat.level_of_visibility==1)?"upgrade_1":"upgrade_2");
                                    */

                                    if( stat.statistics.number_of_messages>=THRESHOLD && stat.level_of_visibility<2){ //TODO mettere stat.number_of_messages!=0, per adesso mi serve ==0 ma è errato
                                        /*
                                            mostro la finestra in cui chiedo di prendere una decisione se svelarsi o meno.
                                            La finestra mostrerà i seguenti messaggi (letti da statistics.current):
                                                - se l'utente corrente non ha ancora risposto (null) --> "Vuoi renderti più visibile?"
                                                - se l'utente corrente ha già risposto:
                                                    - indipendentemente se l'altro utente ha risposto o meno io mostrerò "In attesa della risposta dell'altro utente"
                                        */
                                        //se sono qua dentro significa che ancora manca almeno una risposta, la mia, la sua o entrambe
                                        //mostro la decision screen. Se manca la sua risposta vedrà "Attendi...", altrimenti "Vuoi renderti più visibile?"

                                        //chiudo eventuale keyboard di registrazione
                                        if(recordingKeyboardRef.current!=null || recordingKeyboardRef.current!=undefined)
                                            await recordingKeyboardRef.current.closeRecordingBoard();

                                        console.log("Dettagli");
                                        let miaScelta = stat.statistics[getUtenteCorrente()+"_response"];
                                        let suaScelta = stat.statistics[contactUid+"_response"];
                                        let livelloCorrenteDiVisibilità = stat["level_of_visibility"];
                                        console.log(miaScelta);
                                        console.log(suaScelta);

                                        //se non sono l'amministratore
                                        if(getUtenteCorrente()!=stat.statistics.administrator){
                                            //se nel documento arrivato non ho dato la mia risposta, allora mostro il decision screen con le scelte
                                            if(miaScelta==null){
                                                if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                    //non sono amministratore
                                                    //la mia scelta è null
                                                    //la sua è null
                                                    decisionScreenRef.current.show(false,null, null,livelloCorrenteDiVisibilità);
                                                    
                                            }
                                            //altrimenti se ho dato la mia scelta
                                            else {
                                                //se l'amministratore non ha ancora dato la sua risposta, mi metto in attesa
                                                if(suaScelta==null){
                                                    if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.show(false,miaScelta, null,livelloCorrenteDiVisibilità);
                                                }
                                                //altrimenti se entrambe le risposte non sono null MA ancora il numero di messaggi non è stato resettato (fase temporanea), mostro lo screen
                                                else if(suaScelta!=null && miaScelta!=null && stat.statistics.number_of_messages>=THRESHOLD)
                                                    if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.show(false,miaScelta, null,livelloCorrenteDiVisibilità);
                                                //altrimenti se la sua scelta è stata data chiudo il decision screen
                                                else if(suaScelta!=null){
                                                    if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.hide();
                                                }
                                            }
                                            return;
                                        }

                                        //se sono l'amministratore
                                        if(getUtenteCorrente()==stat.statistics.administrator){

                                            //se la mia risposta è nulla cosi come quella del contatto, mostro tutto
                                            if(miaScelta==null && suaScelta==null){
                                                if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.show(true,null, null,livelloCorrenteDiVisibilità);
                                            }
                                            //se invece la mia scelta è null ma il contatto ha già risposto, al solito mostro tutto
                                            else if(miaScelta==null && suaScelta!=null){
                                                if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.show(true,null, suaScelta, livelloCorrenteDiVisibilità);
                                            }
                                            //se invece la mia scelta non è null ma lo è quella del contatto mi metto in attesa
                                            else if(miaScelta!=null && suaScelta==null){
                                                if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                        decisionScreenRef.current.show(true,miaScelta, null, livelloCorrenteDiVisibilità);
                                            }
                                            
                                            //se invece sia la mia scelta che quella sua è !=null allora chiudo tutto
                                            else if(miaScelta!=null && suaScelta!=null){
                                                //devo però fare l'upgrade o meno
                                                //se sia la mia che la sua sono false, resetto solo
                                                if(miaScelta==false && suaScelta==false)
                                                    await upgradeConversation(chatId,false,contactUid, name, informazioniProfiloUtente.name,token, informazioniProfiloUtente.push_notification_token, livelloCorrenteDiVisibilità);
                                                else if(miaScelta==false && suaScelta==true)
                                                    await upgradeConversation(chatId,false,contactUid, name, informazioniProfiloUtente.name,token, informazioniProfiloUtente.push_notification_token, livelloCorrenteDiVisibilità);
                                                else if(miaScelta==true && suaScelta==false)
                                                    await upgradeConversation(chatId,false,contactUid, name, informazioniProfiloUtente.name,token, informazioniProfiloUtente.push_notification_token, livelloCorrenteDiVisibilità);
                                                else if(miaScelta==true && suaScelta==true){
                                                    try{
                                                        await upgradeConversation(chatId,true,contactUid, name, informazioniProfiloUtente.name,token, informazioniProfiloUtente.push_notification_token, livelloCorrenteDiVisibilità);
                                                    }catch(e){
                                                        setSnackBarMessage(i18n.t('conversationError'));
                                                        decisionScreenRef.current.show(true,miaScelta, null, livelloCorrenteDiVisibilità);
                                                        return;
                                                    }
                                                    //await notifyUpgrade((livelloCorrenteDiVisibilità==0)?"upgrade_1":"upgrade_2");
                                                }

                                                if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                                    decisionScreenRef.current.hide();
                                                }
                                            return;
                                        }
                    
                                        //altrimenti, se non ho risposto oppure ho risposto ma non sono amministratore mi metto in attesa
                                        if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                            decisionScreenRef.current.show(stat);
                                        console.log("non ho risposto oppure ho risposto ma non sono amministratore mi metto in attesa");
                                        
                                    }
                                    //altrimenti non blocco la chat
                                    else{
                                        if(decisionScreenRef.current!=null && decisionScreenRef.current!=undefined)
                                            decisionScreenRef.current.hide(); //se prima era aperto (in attesa di risposta) ora lo chiudo per sicurezza.
                                        
                                        //se la visibilità è 2 stacco listener e levo la barra di progress prossima richiesta
                                        if(stat.level_of_visibility>=2){
                                            ascoltatoreStatistics();
                                            isVisibilityMaximum.current = true;
                                            if(progressRequestRef.current!=null && progressRequestRef.current!=undefined)
                                                progressRequestRef.current.make_invisible();
                                            return;
                                        }
                                    }

                                    if(initialState==true)
                                        setInitialState(false);
                                    
                                }

                            }catch(e){
                                console.log("Si è verificato un errore durante la ricezione/elaborazione delle statistiche:"+e);       
                            }
                                
                              
                });
        }catch(e){
            console.log("Si è verificato un errore. Impossibile avviare la conversazione:"+e);
            setSnackBarMessage(i18n.t('conversationError'));
        }
    }



    useEffect(()=>{
        isMounted.current = true;
        const bh = BackHandler.addEventListener('hardwareBackPress',tornaIndietro);
        //setto l'id della chat come corrente cosi da non mostrarmi notifiche su questa chat
        idChatCorrente = chatId;
        currentVisibility.current = visibilityBeforeOpenChatDetail;
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
                            setChat(lista_iniziale);
                            setIsChatLoaded(true);

                            //inizializzo ascoltatore statistiche e ultimi messaggi
                            await ascoltaStatistics((lista_iniziale.length==0)?0:lista_iniziale[0].current_visibility);
                            await inizializzaAscoltatoreNuoviMessaggi();

                        }catch(e){
                            console.log("errore durante il caricamento:"+e);
                            setSnackBarMessage(i18n.t('loadingChatError1'));
                        }
                    }).catch((e)=>{
                        console.log("errore interno mentre si eseguiva use effect (chat_detail.js):"+e);
                        setSnackBarMessage(i18n.t('loadingChatError1'));
                        setIsChatLoaded(true);
                    })
                    
                
            }catch(err){
                console.log("errore interno mentre si eseguiva use effect (chat_detail.js):"+err);
                setSnackBarMessage(i18n.t('loadingChatError1'));
                setIsChatLoaded(true);
            }
            
    }

    //dato che la funzione è async e non uso .then() allora verrà eseguita in maniera asincrona
    ottieniPrimi10Messaggi();


        return () => {
            BackHandler.removeEventListener('hardwareBackPress', tornaIndietro);
            isMounted.current = false;
            console.log("rimuovo ascoltatore nuovi messaggi");
            console.log("rimuovo ascoltatore statistics...")
            if(ascoltatoreNuoviMessaggi) ascoltatoreNuoviMessaggi(); //rimuovo listener
            if(ascoltatoreStatistics) ascoltatoreStatistics(); //rimuovo listener
            //resetto id chat corrente
            idChatCorrente = null;
        }
        
    },[])

    async function inizializzaAscoltatoreNuoviMessaggi(){
        //prelevo ultimo timestamp memorizzato
        let ultimoTimestampMemorizzato = -1;
        if(listTmp.current[0])
            ultimoTimestampMemorizzato = listTmp.current[0].date; //milliseconds (è un numero), per firstore ho bisogno di secondi, per questo divido per 1000
        console.log("ultimo timestamp memorizzato:"+ultimoTimestampMemorizzato);
        let ultimoTimestampDiSnapshot = ultimoTimestampMemorizzato;
        ascoltatoreNuoviMessaggi = ottieniAscoltatoreNuoviMessaggi(chatId, getUtenteCorrente(),ultimoTimestampMemorizzato, contactUid )
                                .onSnapshot({ includeMetadataChanges: true },async(snapshot) => {
                                    const promises = [];
                                    //mantengo l'ultimo timestamp (o nome) dell'audio ricevuto cosi che procedo a eliminare tutti gli audio con nome minore dell'ultimo
                                    var lastAudioTimestamp = null;
                                    var lastMessageTimestamp = null; //questo è per tutti, ossia tiene in memoria l'ultimo timestamp ricevuto, che il type sia mex o audio
                                    await Promise.all(snapshot.docs.map(async(docReceived) => {

                                                if (docReceived.metadata.hasPendingWrites == false && docReceived.data().timestamp > ultimoTimestampDiSnapshot ) {
                                                if(blockListeners.current==true){
                                                    console.log("Non posso ascoltare,sono in fase di lavoro...");
                                                    return;
                                                }
                                                ultimoTimestampDiSnapshot = docReceived.data().timestamp;
                                                let doc = docReceived;
                                                ultimaRow.current = ultimaRow.current+1;
                                                console.log("E' un nuovo "+doc.data().type+". Lo memorizzo con chiave:"+ultimaRow.current);
                                                console.log(doc.data());
                                                //se il messaggio è un audio, indico qual'è l'ultimo timestamp o nome del file
                                                if(doc.data().type=="audio")
                                                    lastAudioTimestamp = doc.data().timestamp;
                                                lastMessageTimestamp = doc.data().timestamp;
                                                promises.push(addNewReceivedMessage(doc, ultimaRow.current));
                                                console.log("procedo al successivo di "+ultimaRow.current);
                                            }
                                                
                                }));
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
                                        await removeMessages(chatId,lastMessageTimestamp, contactUid);
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

                                    if(initialState==true)
                                        setInitialState(false);

                                }catch(err){
                                    console.log("Si è verificato un problema sulla promise.all dell'ascoltatore:"+err);
                                }
                                    
                            });
    }


    function getCurrentVisibility(){
        return currentVisibility.current;
    }

    async function addNewReceivedMessage(doc, row){
        console.log("   doc di interesse:"+row);
        console.log("memorizzo doc");
        try{
            let local_uri = "";
            if(doc.data().type == "audio"){
                local_uri = await local_storage.saveAudioIntoFolder(getUtenteCorrente(),
                                                        contactUid,
                                                        row,
                                                        contactUid,
                                                        new Date(doc.data().timestamp),
                                                        doc.data().value,
                                                        currentVisibility.current
                                                        )
            }
            else
                await local_storage.storeNewMessage(getUtenteCorrente()+contactUid+"",
                                                    row, 
                                                    contactUid,
                                                    new Date(doc.data().timestamp).getTime(),
                                                    doc.data().type,
                                                    doc.data().value,
                                                    currentVisibility.current,
                                                    "succeed");
            console.log("fine memorizzazione doc "+row);
            //posso procedere ad eliminare l'audio in remoto. Se fallisco, comunque non blocco l'utente in quanto tanto l'eliminazione è per timestamp<ultimoTimestamp (ogni volta), quindi al primo corretto si eliminano TUTTI i precedenti

            let newMex = {row: row ,author:contactUid, date:new Date(doc.data().timestamp).getTime(), type:doc.data().type+"",content: doc.data().type=="audio"?local_uri:(doc.data().value+""),current_visibility:currentVisibility.current,state:"succeed"};
            return newMex;
        }catch(e){
            setSnackBarMessage(i18n.t('err_generic'));
        }
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
                console.log("err:"+e);
            })

    }


    function apriRecordingKeyboard(){
        if(statistics.current==undefined) return;
        if(statistics.current.statistics.number_of_messages>=THRESHOLD){
            setSnackBarMessage(i18n.t('waitChoice'));
            return;
        } 
        setOpenRecordingKeyboard(true);
        isOpenRecordingKeyboardOpened.current = true;
    }

    //console.log("STATISTICHEEEE");
    //console.log(statistics.current);
    //console.log("STATISTICHE ATTUALI IN CHAT DETAIL");
    //console.log((statistics.current!=null && statistics.current.statistics!=undefined)?statistics.current.statistics.number_of_messages:"....");

    useEffect(()=>{
        //se la voglio aprire...
        if(openRecordingKeyboard==true)
            recordingKeyboardRef.current.startRecording();

    },[openRecordingKeyboard]);


    let [LobsterFont] = useFonts({Lobster_400Regular});
    let [Raleway] = useFonts1({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2 || !LobsterFont)
        return <View></View>


    return (
      <View style={styles.container}>

     {/* BARRA SUPERIORE */}
     <View style={styles.barraSuperiore}>
         <View style={{width:larghezzaDevice, height:altezzaBarraScreen*0.6, justifyContent:"flex-end"}}>
            <TouchableOpacity disabled={initialState}  onPress={tornaIndietro} style={{position:"absolute",zIndex:10,left:0, paddingLeft:Dimensions.get("window").width*0.03}}>
                <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
            </TouchableOpacity>
            <Text style={styles.titolo}>{name}</Text>
            <TouchableOpacity disabled={initialState}  onPress={()=>{threeDotTabRef.current.open_close_options_tab()}} style={{position:"absolute", right:Dimensions.get("window").width*0.04}}>
                <View style={{width:30, alignItems:"flex-end"}}>
                    <Octicons name="kebab-vertical" size={fontSizeTitoloBarra} color="#52575D" />  
                </View>
            </TouchableOpacity>
          </View>
          {visibilityBeforeOpenChatDetail<=1 && <ProgressRequest ref={progressRequestRef} initialVisibility={visibilityBeforeOpenChatDetail} threshold={THRESHOLD} />}
      </View>
     
    {!isIOS && 
    <>
     {chat.length>0 &&
     <ListaMessaggi refFlatList={refFlatList} 
                    lista_messaggi={chat} 
                    caricaSuccessivi10Messaggi={caricaSuccessivi10Messaggi} 
                    getUtenteCorrente={getUtenteCorrente} 
                    setSnackBarMessage={setSnackBarMessage}
                    contactUid = {contactUid}
                    ultimaData = {null}
                    contactName = {name} /> }
      {chat.length==0 && 
        <View style={{flex:1}}>
            {isChatLoaded==true &&
                <ScrollView>
                <View style={{width:larghezzaDevice, justifyContent:"center"}}>
                    <Image source={require('../../../../../resources/images/cloud-background.png')} style={{position:"absolute", width:larghezzaDevice,height:larghezzaDevice , alignSelf:"center"}}/>
                    <Text style={[styles.helloTitle,{textAlign:"center", justifyContent:"center", textAlignVertical:"center", marginTop:altezzaBarraScreen}]}>{i18n.t('helloConversation')}{name}! </Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation2_pt1')}{name}{i18n.t('helloConversation2_pt2')}</Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation3')}</Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation4')}</Text>
                </View>
            </ScrollView>
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
            <TouchableOpacity onPress={inviaMessaggio} style={styles.inviaMessaggio} disabled={initialState==true?true:(messaggio==""?true:false)}>
                    <FontAwesome name = "location-arrow" size={fontSizeTitoloBarra} color={messaggio==""?"rgba(27, 98, 253,0.3)":MosCeleste} />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                maxLength={25}
                disabled={initialState==true?true:!isChatLoaded}
                onChangeText={(text)=>{setMessaggio(text)}}
                value={messaggio}
                placeholder={i18n.t('keyboardTextLabel')}
                keyboardType="default"
            />
            <TouchableOpacity onLongPress={apriRecordingKeyboard} disabled={initialState==true?true:!isChatLoaded} style={styles.pulsanteAudio}>
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
                             isOpenRecordingKeyboardOpened = {isOpenRecordingKeyboardOpened}
                             setSnackBarMessage = {setSnackBarMessage}
                             ultimaRow = {ultimaRow}
                             getUtenteCorrente = {getUtenteCorrente}
                             chat = {chat}
                             setChat = {setChat}
                             refFlatList = {refFlatList}
                             inviaNuovoMessaggio = {inviaNuovoMessaggio}
                             lastMessage = {lastMessage}
                             lastStatistic = {(isVisibilityMaximum.current == true)?("MAXIMUM_VISIBILITY_ACHIVED"):(statistics.current)}
                             contactUid = {contactUid}
                             isMounted = {isMounted}
                             arrayOfRowsToUpdateState = {arrayOfRowsToUpdateState}
                             chatId = {chatId}
                             setRefresh = {setRefresh}
                             refresh = {refresh}
                             getCurrentVisibility = {getCurrentVisibility} 
                             contactToken = {token}
                             myName = {informazioniProfiloUtente.name}/>
          </>
          
      }
      </>
    }



    {isIOS &&
    <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center'}} behavior="padding"  enabled   keyboardVerticalOffset={fontSizeTitoloBarra}>
     {chat.length>0 &&
     <ListaMessaggi refFlatList={refFlatList} 
                    lista_messaggi={chat} 
                    caricaSuccessivi10Messaggi={caricaSuccessivi10Messaggi} 
                    getUtenteCorrente={getUtenteCorrente} 
                    setSnackBarMessage={setSnackBarMessage}
                    contactUid = {contactUid}
                    ultimaData = {null}
                    contactName = {name} /> }
      {chat.length==0 && 
        <View style={{flex:1}}>
            {isChatLoaded==true &&
                <ScrollView>
                <View style={{width:larghezzaDevice, justifyContent:"center"}}>
                    <Image source={require('../../../../../resources/images/cloud-background.png')} style={{position:"absolute", width:larghezzaDevice,height:larghezzaDevice , alignSelf:"center"}}/>
                    <Text style={[styles.helloTitle,{textAlign:"center", justifyContent:"center", textAlignVertical:"center", marginTop:altezzaBarraScreen}]}>{i18n.t('helloConversation')}{name}! </Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation2_pt1')}{name}{i18n.t('helloConversation2_pt2')}</Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation3')}</Text>
                    <Text style={[styles.helloContent]}>{i18n.t('helloConversation4')}</Text>
                </View>
            </ScrollView>
            }
        </View>
      }
     
      <LinearGradient
          // Background Linear Gradient sopra chat
          colors={["rgba(119, 39, 236,0.1)",'transparent']}
          style={{position: 'absolute',top:0,width: larghezzaDevice,height: 50}}
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
            <TouchableOpacity onPress={inviaMessaggio} style={styles.inviaMessaggio} disabled={initialState==true?true:(messaggio==""?true:false)}>
                    <FontAwesome name = "location-arrow" size={fontSizeTitoloBarra} color={messaggio==""?"rgba(27, 98, 253,0.3)":MosCeleste} />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                maxLength={25}
                disabled={initialState==true?true:!isChatLoaded}
                onChangeText={(text)=>{setMessaggio(text)}}
                value={messaggio}
                placeholder={i18n.t('keyboardTextLabel')}
                keyboardType="default"
            />
            <TouchableOpacity onLongPress={apriRecordingKeyboard} disabled={initialState==true?true:!isChatLoaded} style={styles.pulsanteAudio}>
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
                             isOpenRecordingKeyboardOpened = {isOpenRecordingKeyboardOpened}
                             setSnackBarMessage = {setSnackBarMessage}
                             ultimaRow = {ultimaRow}
                             getUtenteCorrente = {getUtenteCorrente}
                             chat = {chat}
                             setChat = {setChat}
                             refFlatList = {refFlatList}
                             inviaNuovoMessaggio = {inviaNuovoMessaggio}
                             lastMessage = {lastMessage}
                             lastStatistic = {(isVisibilityMaximum.current == true)?("MAXIMUM_VISIBILITY_ACHIVED"):(statistics.current)}
                             contactUid = {contactUid}
                             isMounted = {isMounted}
                             arrayOfRowsToUpdateState = {arrayOfRowsToUpdateState}
                             chatId = {chatId}
                             setRefresh = {setRefresh}
                             refresh = {refresh}
                             getCurrentVisibility = {getCurrentVisibility} 
                             contactToken = {token}
                             myName = {informazioniProfiloUtente.name}/>
          </>
          
      }
      </KeyboardAvoidingView> }
      
      {/*schermata caricamento chat */}
      {isChatLoaded==false && <View style={{position:"absolute", width:larghezzaDevice, height:altezzaDevice, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size={fontSizeTitoloBarra} color={MosPurple} /> 
      </View>}

      {/* schermata decision screen */}
      <DecisionScreen ref={decisionScreenRef} 
                      navigation = {navigation}
                      makeDecision={makeDecision}
                      upgradeConversation = {upgradeConversation} 
                      chatID={chatId}
                      uidCurrentUser={getUtenteCorrente()}
                      contactUid = {contactUid}
                      contactName = {name}
                      currentUserName = {informazioniProfiloUtente.name}
                      urlProfileImageContactUser={urlProfileImageContactUser}
                      current_level_of_visibility = {statistics.current!=undefined?statistics.current.level_of_visibility:0}
                      informazioniProfiloUtenteCorrente = {informazioniProfiloUtente}
                      myToken = {informazioniProfiloUtente.push_notification_token}
                      contactToken = {token}
                      />
      <ThreeDotTab ref={threeDotTabRef} optionsDialogRef={optionsDialogRef} contactName={name} />
      <OptionsDialog ref={optionsDialogRef} eliminaConversazione={removeCurrentConversation} bloccaContatto={blockCurrentContact} />
      <Snackbar
            visible={snackBarMessage?true:false}
            onDismiss={hideSnackMessage}
            action={{
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
    },
    itemMenu:{
        fontSize:fontSizeTitoloBarra*0.6,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        paddingVertical:10
    },
    
})