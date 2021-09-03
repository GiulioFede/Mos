// Import react
import React, { useContext, useEffect, useState, forwardRef, useImperativeHandle} from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native'
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper";
import { altezzaDevice, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from '../../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple, MosViola } from '../../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway'; 
import {Ionicons, AntDesign, FontAwesome} from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import local_storage from "../../../../../../context/local_storage/localStorage";
import { Audio } from 'expo-av';
import { INTERRUPTION_MODE_ANDROID_DO_NOT_MIX } from 'expo-av/build/Audio';
import { RowsOfMessagesToUpdate } from '../../context/chatContext';

let newRecording = new Audio.Recording();
let recordingIconAudioSound = new Audio.Sound()
let isRecordingKeyboardOpened = false;

const RecordingKeyboard = forwardRef((props, ref) => {

    const {addNewUpdate} = useContext(RowsOfMessagesToUpdate);

    //prelevo metodi
    const {setOpenRecordingKeyboard,isOpenRecordingKeyboardOpened, setSnackBarMessage, ultimaRow, getUtenteCorrente, chat,setChat, refFlatList,chatId, inviaNuovoMessaggio, lastMessage, contactUid, isMounted, lastStatistic, arrayOfRowsToUpdateState, setRefresh, refresh, getCurrentVisibility} = props;
    //indica la durata attuale dell'audio mentre lo si registra
    const [durataAudio, setDurataAudio] = useState(0);
    //contiene info sul recording
    const [recordingInfo, setRecordingInfo] = useState();
    //se true indica che la registrazione è avviata
    const [isRecording, setIsRecording] = useState(false);
    //se true indica che è possibile premere un pulsante per inviare l'audio (avviene quando la durata è verso il minuto)
    const [uriTmp,setUriTmp] = useState(null);
    const [_stopRecording, setStopRecording] = useState(0);

    console.log("ULTIMA STATISTICA RICEVUTA");
    console.log(lastStatistic);
    
   useImperativeHandle(ref, () => ({

        async startRecording(){
            
            await recordingIconAudioSound.loadAsync(require('../../../../../../resources/audio/recording_audio_android.aac'));
            await recordingIconAudioSound.playAsync();
            avviaRegistrazione();
            
        },
        async closeRecordingBoard(){
            await local_closeRecordingBoard();
        },
       
    }));

    async function local_closeRecordingBoard(){
        if(isRecordingKeyboardOpened==true && isRecording==true)
            await annullaRecording();
    }

    function avviaRegistrazione(){
        setTimeout(async()=>{
            recordingIconAudioSound._clearSubscriptions();
            await recordingIconAudioSound.stopAsync();
            await recordingIconAudioSound.unloadAsync();
            start_localRecording();},500);
    }

    function start_localRecording(){
        console.log("registro audio...");
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

                //if(!newRecording)
                    //Contiene info sulla registrazione.
                newRecording = new Audio.Recording();
                //creo un suono nuovo
                await newRecording.prepareToRecordAsync(
                    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
                    Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
                )
                
                newRecording.setOnRecordingStatusUpdate(aggiornaAnimazioneAudioVocale);
                newRecording.setProgressUpdateInterval(1000);
                await newRecording.startAsync();
                //adesso sta registrando...
                console.log("Avvio registrazione...");
                setRecordingInfo(newRecording);
                local_setIsRecording(true);
            }catch(err){
                console.log("E' avvenuto un errore "+err);
                setSnackBarMessage("E' avvenuto un errore. Prova a chiudere e riaprire l'app.");
                setOpenRecordingKeyboard(false);
                isOpenRecordingKeyboardOpened.current = false;

            }
        }else
            setSnackBarMessage("Memoria insufficiente. Prova a liberare lo spazio per poter continuare la conversazione");
    }).catch((e)=>{
        setSnackBarMessage("Si è verificato un errore interno. Non è stato possibile inviare il messaggio.");
    })
    }

    async function aggiornaAnimazioneAudioVocale(status){
        console.log("AGGIORNAMENTO AUDIO VOCALE");
        // console.log(status);
        if(status.durationMillis>=60000){
            newRecording.setOnRecordingStatusUpdate(null);
            setStopRecording(2);
        }
         //AGGIORNO PROGRESS BAR
         //prelevo tempo (siccome progress bar ha massimo a 1 allora dato che il massimo consentito è di 1 secondo (60k ms) lo divido per 60k)
         let secondi = parseInt(status.durationMillis)/60000;
         if(isRecordingKeyboardOpened==true) setDurataAudio(secondi);
         //se la durata è tra 50000 e 60000 prima di salvare invio un avviso
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

    useEffect(()=>{
        isRecordingKeyboardOpened = true;

        return () => {
            isRecordingKeyboardOpened = false;
        }
    },[])
    
    useEffect(()=>{
        if(_stopRecording==1)
            stopRecording();
        else if (_stopRecording==2)
            stopRecordingBeforeToSend();
    },[_stopRecording])

    async function stopRecordingBeforeToSend(){
        console.log("Stopping recording before sending...");
        try{
            //prelevo l'uri dove è stata memorizzata
            await recordingInfo.stopAndUnloadAsync();
            const uri = recordingInfo.getURI();
            setRecordingInfo(undefined);
            console.log('Recording terminata e salvata in '+uri);
            local_setUriTmp(uri);
        }catch(e){
            console.log("Si è verificato un problema:"+e);
            setRecordingInfo(undefined);
            local_setIsRecording(false);
            setSnackBarMessage("Si è verificato un problema.");
            setOpenRecordingKeyboard(false);
            isOpenRecordingKeyboardOpened.current = false;
        }
    }

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
        
    //stop il recording di sopra
    async function stopRecording(){
        console.log("Stopping recording...");
        try{
                var uri = null;
                if(uriTmp==null){
                    if(recordingInfo){
                    //prelevo l'uri dove è stata memorizzata
                    await recordingInfo.stopAndUnloadAsync();
                    uri = recordingInfo.getURI();
                    setRecordingInfo(undefined);
                    console.log('Recording terminata e salvata in '+uri);
                    }
                }else {
                    uri = uriTmp;
                    setUriTmp(null);
                }
                //salvo audio nel database
                saveAudio(uri);
        }catch(e){
            console.log("Si è verificato un problema:"+e);
            setRecordingInfo(undefined);
            local_setIsRecording(false);
            setSnackBarMessage("Si è verificato un problema.");
            setOpenRecordingKeyboard(false);
            isOpenRecordingKeyboardOpened.current = false;
            setUriTmp(null);
        }finally{
            setStopRecording(0);
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
                   let local_uri = await local_storage.saveAudioIntoFolder(getUtenteCorrente(),contactUid,nuovaChiave, getUtenteCorrente(),new Date(), uri, getCurrentVisibility());
                   //creo nuovo messaggio    
                   let newMex = {row: nuovaChiave ,author:getUtenteCorrente(), date:new Date().getTime(), type:"audio",content:local_uri, state:"in-progress"}
                   let chatTmp = [newMex,...chat];
                   setChat(chatTmp);
                   //scrollo in basso
                   refFlatList.current.scrollToOffset({animated:true, offset: chat.length-1});
                   local_setIsRecording(false);
                   console.log("(in-progress)--> invio audio "+nuovaChiave+" in remoto...");
                   setOpenRecordingKeyboard(false);
                   isOpenRecordingKeyboardOpened.current = false;
                   //salvo audio in remoto, ma uso approccio asincrono per liberare la UI. Se avviene qualche errore tolgo quello appena inserito
                   inviaNuovoMessaggio(chatId,contactUid,"audio", uri,(lastStatistic=="MAXIMUM_VISIBILITY_ACHIVED")?"MAXIMUM_VISIBILITY_ACHIVED":lastStatistic.lastMessage.author,
                       async(ris) =>{
                        try{
                           //l'audio è stato salvato con successo, lo lascio cosi com'è
                           console.log("salvato in remoto. Salvo in locale...");
                           //salvo in locale
                           //mi ritorna il percorso dove ha salvato l'audio. Di default salva l'audio con stato "in-progress" a indicare che non ha ancora ricevuto conferma di salvataggio nel database
                           //let local_uri = await local_storage.saveAudioIntoFolder(getUtenteCorrente(),contactUid,getUtenteCorrente(),uri);
                           await local_storage.updateMessageState(getUtenteCorrente()+contactUid+"",nuovaChiave,"succeed");
                           console.log("percorso salvato nel database e nel file system in uri: "+local_uri);
                           //aggiorno UI
                           console.log("Il componente è montato? "+isMounted.current);
                           //aggiorno database locale
                                console.log("Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato succeed"); 
                                addNewUpdate(contactUid,nuovaChiave,"succeed");
                                lastMessage.current = {code:"UPDATE_LAST_MEX", chatId: chatId, type:"audio", value: "", author:getUtenteCorrente(), timestamp:new Date().getTime()};
                           }catch(e){
                                console.log("Non Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato failed"); 
                                addNewUpdate(contactUid,nuovaChiave,"failed");
                               setSnackBarMessage("E' avvenuto un errore durante il salvataggio dell'audio in locale. Il messaggio è stato comunque inviato.");
                               console.log("errore durante l'aggiornamento dello stato dell'audio:"+e);
                           }
                       },
                       async(err) =>{
                           try{
                                await local_storage.updateMessageState(getUtenteCorrente()+contactUid+"",nuovaChiave,"failed");
                               //l'audio non è stato salvato. Lo elimino dalla lista
                               console.log("non salvato in remoto. Aggiorno stato come fallito in locale");
                           }catch(error1){
                               console.log("è avvenuto un errore durante l'aggiornamento a 'failed' dell'audio in locale:"+error1);
                           }finally{
                                console.log("Non Salvo nella chat "+contactUid+" di chiave "+nuovaChiave+" lo stato failed"); 
                                addNewUpdate(contactUid,nuovaChiave,"failed");
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

   async function annullaRecording(){
        console.log("Anulla recording...");
        try{
            newRecording.setOnRecordingStatusUpdate(null);
            if(recordingInfo){
                //prelevo l'uri dove è stata memorizzata
                await recordingInfo.stopAndUnloadAsync();
            }
            setRecordingInfo(undefined);
            console.log('Recording terminata');
            setOpenRecordingKeyboard(false);
            isOpenRecordingKeyboardOpened.current = false;
        }catch(e){
            console.log("Si è verificato un problema:"+e);
            setRecordingInfo(undefined);
            local_setIsRecording(false);
            setSnackBarMessage("Si è verificato un problema.");
            setOpenRecordingKeyboard(false);
            isOpenRecordingKeyboardOpened.current = false;
        }
    }

    function local_setUriTmp(uri){
        console.log("imposto uri temporanea");
        setUriTmp(uri);
    }

 
    function local_setIsRecording(value){
        setIsRecording(value);
    }
    console.log(isRecording);
    return (
        <View style={styles.tastiera}>

            {/* ICONA ANNULLA RECORDING */}
            <TouchableOpacity onPress={annullaRecording} disabled={!isRecording} style={styles.pulsanteAudioAnnullaRecording}>
                <FontAwesome name="remove" size={fontSizeTitoloBarra*0.8} color="white" />
            </TouchableOpacity>

            {/* PROGRESS BAR DURATA REGISTRAZIONE AUDIO */}
            <View style={styles.areaAnimazioneAudio}>
                <ProgressBar progress={durataAudio} color="white" />
            </View>

            {/* ICONA STOP RECORDING */}
            <TouchableOpacity onPress={stopRecording} disabled={!isRecording} style={styles.pulsanteAudioInRecording}>
                    {uriTmp==null && <Ionicons name="ios-stop" size={fontSizeTitoloBarra*0.8} color={MosCeleste} />}
                    {uriTmp!=null && <AntDesign name="up" size={fontSizeTitoloBarra*0.8} color={MosCeleste} />}
            </TouchableOpacity>

        </View>
    )

})

export default RecordingKeyboard;

const styles = StyleSheet.create({
    tastiera:{
        flex:0.15,
        flexDirection: 'row',
        justifyContent:"center",
        alignItems:"center",
        width: larghezzaDevice,
        backgroundColor:MosCeleste
    },  
    pulsanteAudioAnnullaRecording:{ //%15% spazio
        fontSize:fontSizeCampi,
        justifyContent:"center",
        alignItems:"center",
        width:larghezzaDevice*0.15,
        height:larghezzaDevice*0.15,
 
    },
    areaAnimazioneAudio: { //70% dello spazio
        width: larghezzaDevice*0.6,
        marginRight:larghezzaDevice*0.05
    },
    pulsanteAudioInRecording:{
        backgroundColor:"white",
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
  });