import React,{useEffect, useState, useContext, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput, Touchable, FlatList} from "react-native"
import {Divider, FAB, ProgressBar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, altezzaSchermoInterno, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali"
import { MosCeleste, MosCelesteRGBA, MosPurple, MosViola } from "../../../../../resources/colors";
import MessageModel from "./components/messageModel";

import * as firebase from 'firebase';
import 'firebase/firestore';
import { LocalStorage } from "../../../../../context/local_storage/localStorage";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, INTERRUPTION_MODE_IOS_DO_NOT_MIX, Recording } from "expo-av/build/Audio";
import {Svg, Path, Circle, Line} from "react-native-svg";
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";





//Contiene info sulla registrazione. 
let recording = new Audio.Recording();

export default function ChatDetail({ navigation,route}){

    const [messaggio, setMessaggio] = useState("");
    //conterrà l'intera chat
    const [chat, setChat] = useState([]);
    //contesto autenticazione
    const {getUtenteCorrente} = useContext(AutenticazioneUtente);
    //uid utente
    const {contactUid} = route.params;
    //reference alla flat list
    const refFlatList = useRef();

    function tornaIndietro(){
        navigation.goBack();
    }

    function inviaMessaggio(){
        LocalStorage.storeNewMessage(contactUid,
                                    getUtenteCorrente(),
                                    "29/07/2021",
                                    "mex",
                                    messaggio,
                                    (tx,result)=>{
                                        console.log("Messaggio salvato in locale");
                                        //creo nuovo messaggio
                                        let newMex = {row: chat.length+1 ,author:getUtenteCorrente(), date:"29/07/2021", type:"mex",content:messaggio}
                                        let chatTmp = [...chat];
                                        chatTmp.push(newMex);
                                        setChat(chatTmp);
                                        },
                                    (tx,err)=>{console.log("Messaggio non salvato in locale: "+err)})

    }

    useEffect(()=>{
        console.log("Sto prelevando tutti i messaggi scambiati con l'utente corrente...");
        const ottieniListaMessaggi = async () =>{
            try{
                //da eliminare
                //LocalStorage.removeTableForConversation(contactUid,(x,y)=>{console.log("OKKKKKK")},(x,y)=>{console.log("NOOO")});
                console.log("Prelevo messaggi con "+contactUid);
                //creo tabella per memorizzare la conversazione (se non esiste)
                LocalStorage.createNewTableForConversation(contactUid, //nome tabella
                            (transazione, resultSet) => { //cosa fare in caso di successo
                            console.log("TABELLA CREATA (SE NON ESISTEVA GIA)");
                            //una volta creata (se non esisteva), prelevare i messaggi
                                LocalStorage.getListOfChatMessages(contactUid, //nome tabella
                                    (transazione, resultSet) => { //cosa fare in caso di successo
                                    console.log("MESSAGGI PRELEVATI CON SUCCESSO");
                                    console.log(resultSet);
                                    //inizializzo la chat
                                    setChat(resultSet.rows._array);
                                    },
                                    (transazione, errore) => { //cosa fare in caso di errore
                                    console.log("ERRORE: MESSAGGI NON PRELEVATI");
                                    }
                            )
                            },
                            (transazione, errore) => { //cosa fare in caso di errore
                            console.log("CREAZIONE TABELLA FALLITO");
                            }
                            
                )
            }catch(err){
                console.log("errore interno mentre si eseguiva use effect (chat_detail.js");
            }
    }
    ottieniListaMessaggi();
    },[])

    /*
     ::::::::::::::::::::::::::::::::::::::AUDIO VOCALE::::::::::::::::::::::::::::::::::::::
    */
   //se true indica che la registrazione è avviata
    const [isRecording, setIsRecording] = useState(false);
    //indica la durata attuale dell'audio mentre lo si registra
    const [durataAudio, setDurataAudio] = useState(0);
    //avvia registrazione vocale
    async function startRecording(){
        try{
        console.log("Avvio registrazione vocale...");
        //chiedo permessi
        await Audio.requestPermissionsAsync();
        //setto alcune configurazioni personalizzate su Android e IOS
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true, //permetto su IOS la registrazione, di default è false
            staysActiveInBackground: false, //interrompi la registrazione se si esce dall'app
            interruptionModeIOS: INTERRUPTION_MODE_IOS_DO_NOT_MIX, //interrompi il suono delle altre app mentre si registra
            interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, //idem come sopra ma per android
            shouldDuckAndroid: false, //se arrivo un audio da altre app queste aspetteranno
        })
        //creo un suono nuovo
        await recording.prepareToRecordAsync(
            Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        )
        recording.setOnRecordingStatusUpdate(aggiornaAnimazioneAudioVocale);
        recording.setProgressUpdateInterval(100);
        await recording.startAsync();
        //adesso sta registrando...
        console.log("Avvio registrazione...");
        setIsRecording(true);
        }catch(err){
            console.log("E' avvenuto un errore "+err);
        }
    }

    //stop il recording di sopra
    async function stopRecording(){
        console.log("Stopping recording...");
        //prelevo l'uri dove è stata memorizzata
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording terminata e salvata in '+uri);
        setIsRecording(false);
        //salvo audio criptato nel database
        saveAudio(uri);
    }

    function saveAudio(uri){
        LocalStorage.saveAudioIntoFolder(contactUid,getUtenteCorrente(),uri,
                            (tx,ris)=>{console.log("percorso salvato nel database");},
                            (tx,ris)=>{console.log("percorso non salvato nel database");});
    }

    function annullaRecording(){

    }

    /*
      Viene richiamata ogni mezzo secondo (grazie a progressUpdateIntervalMillis (500)) e contiene, tra le varie informazioni il metering, 
      ossia il valore in db della potenza del suono emesso
    */
    const [amplitude, setAmplitude] = useState(0.9);
    
    function aggiornaAnimazioneAudioVocale(status){
        console.log("AGGIORNAMENTO AUDIO VOCALE");
        console.log(status);

        //AGGIORNO PROGRESS BAR
        //prelevo tempo (siccome progress bar ha massimo a 1 allora dato che il massimo consentito è di 1 secondo (60k ms) lo divido per 60k)
        let secondi = parseInt(status.durationMillis)/60000;
        setDurataAudio(secondi);  
        let power = 0;
        //AGGIORNO LINE WAVES
        if(parseInt(status.metering)>-120)
            power = 160 + parseInt(status.metering);
        else
            power = (160 + parseInt(status.metering))*0.7
        let amplitude1 = (power/160)/3;
        let amplitude2 = (power/160);
        let amplitude3 = (power/160)/2;
        setAmplitude(power/160/2);

    }

    /*
            ANIMAZIONE AUDIO SINE WAVES
    */


    
    return (
      <View style={styles.container}>
     {/* BARRA SUPERIORE */}
     <View style={styles.barraSuperiore}>
          <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0,zIndex:10, paddingLeft:Dimensions.get("window").width*0.03}}>
              <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
          </TouchableOpacity>
          <Text style={styles.titolo}>Laura</Text>
          <TouchableOpacity style={{position:"absolute", right:Dimensions.get("window").width*0.04}}>
              <Octicons name="kebab-vertical" size={fontSizeTitoloBarra} color="#52575D" />
          </TouchableOpacity>
      </View>

      {
      <View style={styles.areaMessaggi}>
           <FlatList
            ref={refFlatList} 
            data={chat}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.row.toString()}
            renderItem={({ item }) => <MessageModel messaggio = {item} utenteCorrente={getUtenteCorrente()}/>}
            onContentSizeChange={() => refFlatList.current.scrollToEnd()}/>
      </View> }
      <LinearGradient
          // Background Linear Gradient
          colors={["rgba(119, 39, 236,0.1)",'transparent']}
          style={{position: 'absolute',top:altezzaBarraScreen,width: larghezzaDevice,height: 50}}
        />
      

        <LinearGradient
          // Background Linear Gradient
          colors={['transparent', "rgba(119, 39, 236,0.1)"]}
          style={{position: 'absolute',bottom:altezzaMenuNavigazione*1.5,width: larghezzaDevice,height: 50}}
        />
        {/*SE STA REGISTRANDO...faccio comparire lo schermo nero*/}
           {isRecording==true && <View style={styles.backgroundRecording}>
            <Svg width={larghezzaDevice} height={altezzaDevice} viewBox="0 0 1 1">
                <Path d={"M 0.1 "+amplitude/5*0.2+" L 0.1 -"+amplitude/5*0.2} stroke={MosViola} strokeWidth="0.02" opacity="0.1"  />
                <Path d={"M 0.9 "+amplitude/5*0.2+" L 0.9 -"+amplitude/5*0.2} stroke={MosViola} strokeWidth="0.02" opacity="0.1"  />
                <Path d={"M 0.2 "+amplitude/4*0.2+" L 0.2 -"+amplitude/4*0.2} stroke={MosViola} strokeWidth="0.02" opacity="0.3"  />
                <Path d={"M 0.8 "+amplitude/4*0.2+" L 0.8 -"+amplitude/4*0.2} stroke={MosViola} strokeWidth="0.02" opacity="0.3"  />
                <Path d={"M 0.3 "+amplitude/3*0.2+" L 0.3 -"+amplitude/3*0.2} stroke={MosPurple} strokeWidth="0.02" opacity="0.5"  />
                <Path d={"M 0.7 "+amplitude/3*0.2+" L 0.7 -"+amplitude/3*0.2} stroke={MosPurple} strokeWidth="0.02" opacity="0.5"  />
                <Path d={"M 0.4 "+amplitude/2*0.2+" L 0.4 -"+amplitude/2*0.2} stroke={MosPurple} strokeWidth="0.02" opacity="0.7"  />
                <Path d={"M 0.6 "+amplitude/2*0.2+" L 0.6 -"+amplitude/2*0.2} stroke={MosPurple} strokeWidth="0.02" opacity="0.7"  />
                <Path d={"M 0.5 "+amplitude*0.2+" L 0.5 -"+amplitude*0.2} stroke={MosCeleste} strokeWidth="0.02" opacity="0.9"  />



                <Path d="M 0 0 L 1 0" stroke={MosCeleste} strokeWidth="0.02" opacity="0.1"  />
                <Path d="M 0 0 L 1 0" stroke={MosCeleste} strokeWidth="0.01" opacity="0.3"  />
                <Path d="M 0 0 L 1 0" stroke={MosCeleste} strokeWidth="0.005" opacity="0.6"  />
                <Path d="M 0 0 L 1 0" stroke={MosPurple} strokeWidth="0.022" opacity="0.1"  />
                <Path d="M 0 0 L 1 0" stroke={MosPurple} strokeWidth="0.009" opacity="0.3"  />
                <Path d="M 0 0 L 1 0" stroke={MosPurple} strokeWidth="0.004" opacity="0.6"  /> 
                <Path d="M 0 0 L 1 0" stroke={MosViola} strokeWidth="0.02" opacity="0.05"  />
                <Path d="M 0 0 L 1 0" stroke={MosViola} strokeWidth="0.08" opacity="0.03"  />
                <Path d="M 0 0 L 1 0" stroke={MosViola} strokeWidth="0.03" opacity="0.06"  /> 
                <Path d="M 0 0 L 1 0" stroke="white" strokeWidth="0.001" opacity="1"  /> 

            </Svg>
            </View>
        }

      {/*TASTIERA*/}
      <View style={styles.tastiera}>

        {/*SE NON STA REGISTRANDO...mostro icona invia messaggio*/}
        {isRecording==false &&
        <TouchableOpacity onPress={inviaMessaggio} style={styles.inviaMessaggio}>
                <FontAwesome name = "location-arrow" size={fontSizeTitoloBarra} color={MosCeleste} />
        </TouchableOpacity>
        }

        {/*SE STA REGISTRANDO...mostro icona "annulla audio"*/}
        {isRecording==true &&
        <TouchableOpacity onPress={annullaRecording} style={styles.pulsanteAudioAnnullaRecording}>
            <FontAwesome name="remove" size={fontSizeTitoloBarra*0.8} color="red" />
        </TouchableOpacity>
        }

        {/*SE STA REGISTRANDO...mostro barra countdown audio max 60secondi*/}
        {isRecording==true &&
        <View style={styles.areaAnimazioneAudio}>
             <ProgressBar progress={durataAudio} color={MosCeleste} />
        </View>
        }

        {/*SE NON STA REGISTRANDO...mostro input area messaggio*/}
        {isRecording==false &&
            <TextInput
                style={styles.input}
                maxLength={25}
                onChangeText={(text)=>{setMessaggio(text)}}
                value={messaggio}
                placeholder="Scrivi un breve messaggio..."
                keyboardType="default"
            />
        }

            
            {/*SE NON STA REGISTRANDO...*/}
                {isRecording==false &&
                <TouchableOpacity onPress={startRecording} style={styles.pulsanteAudio}>
                    <MaterialIcons name="keyboard-voice" size={fontSizeTitoloBarra} color="white" />
                </TouchableOpacity>
                }
            {/*SE STA REGISTRANDO...*/}
                {isRecording==true &&
                <TouchableOpacity onPress={stopRecording} style={styles.pulsanteAudioInRecording}>
                    <Ionicons name="ios-stop" size={fontSizeTitoloBarra*0.8} color="white" />
                </TouchableOpacity>
            }

      </View>

  </View>
       
    )
}

const styles = StyleSheet.create({
    container: {
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra,
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
        height:altezzaSchermoInterno-altezzaBarraScreen-altezzaMenuNavigazione*1.5,
        backgroundColor:"#fff"
    },
    tastiera:{
        position:"absolute",
        bottom:0,
        flexDirection: 'row',
        justifyContent:"center",
        alignItems:"center",
        width: larghezzaDevice,
        height: altezzaMenuNavigazione*1.5,
        backgroundColor:"#fff"
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

})