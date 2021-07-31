// Import react
import React, { useRef, useEffect } from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { altezzaDevice, fontSizeCampi, larghezzaDevice } from '../../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple, MosViola } from '../../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import Svg, { Path } from 'react-native-svg';
import { useState } from 'react/cjs/react.development';
import {Entypo} from '@expo/vector-icons'
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

/*
    NB: La funzione MessageModel viene utilizzata da tutti gli elementi della flat list. Però (importantissimo) le variabili globali
        fuori la funzione MessageModel sono condivise da tutti. E' quindi possibile capire se c'è qualche audio già in riproduzione 
        e capire anche chi sia guardando l'indice che contiene il valore della row, ossia del row-esimo messaggio 
*/
var sound = new Audio.Sound();
var timeOutEvent = null;
var indiceFocusMessaggioAudio = -1; //indica l'i-esimo messaggio audio che è in riproduzione o in pausa
var resettaUltimoAudioMessaggio= null; //contiene il riferimento della funzione resetta delll'ultimo messaggio audio riprodotto o in pausa


export async function resetMessageModel(){
    console.log("resetto flat list");
    try{
        let status = await sound.getStatusAsync();
        console.log(status);
        if(status.isLoaded==true){
            clearTimeout(timeOutEvent);
            sound._clearSubscriptions();
            await sound.stopAsync();
            await sound.unloadAsync();
        }
        sound = new Audio.Sound();
        timeOutEvent = null;
        indiceFocusMessaggioAudio = -1;
        resettaUltimoAudioMessaggio= null;
    }catch(e){
        console.log(e);
    }
}

const ref = function MessageModel({messaggio, utenteCorrente}){


    const [amplitude,setAmplitude] = useState(1);
    const [tempoAudio, setTempoAudio] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const isLoaded = useRef(false);

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

        
    async function playAudio(){
        
        console.log("Playing audio...");
        //se l'audio in riproduzione o in pausa (non cambia) NON è quello che attualmente voglio riprodurre 
        //(caso tipico quando un audio X viene riprodotto e io voglio, mentre X è in pausa o in riproduzione, caricare un audio Y).
        if(messaggio.row != indiceFocusMessaggioAudio && indiceFocusMessaggioAudio!=-1){
                console.log(messaggio.row);
                console.log(indiceFocusMessaggioAudio);
                //annullo l'intero messaggio audio
                console.log("Riproduco attuale "+messaggio.row +"dal vecchio "+indiceFocusMessaggioAudio);
                await resettaUltimoAudioMessaggio(messaggio.row);
        }

        indiceFocusMessaggioAudio = messaggio.row;
        resettaUltimoAudioMessaggio = resetta;
       
                //se l'audio esiste già, ossia è stato caricato e...
        if(isLoaded.current == true){
            //...se l'audio era già in riproduzione
            if(isAudioPlaying){
                //lo metto in pausa
                await sound.pauseAsync();
                clearTimeout(timeOutEvent);
            
            //...altrimenti l'audio era in pausa e quindi necessito di rimetterlo in riproduzione    
            }else {
                const intermediate_status = await sound.playAsync();
                //ho però bisogno di capire quanto rimane del timeout 
                console.log("Riprendo riproduzione audio: ");
                //prelevo durata totale audio
                let total_duration = intermediate_status.durationMillis;
                //prelevo quanto è trascorso di tempo dall'inizio
                let actual_duration = intermediate_status.positionMillis;
                //setto nuovo timeout come differenza
                timeOutEvent = setTimeout(async ()=>{
                    await sound.unloadAsync();
                    setIsAudioPlaying(false);
                    isLoaded.current = false;
                    setTempoAudio(1);
                    console.log("elimino listener audio (dopo pausa");
                }, (total_duration-actual_duration))
            }
            setIsAudioPlaying(!isAudioPlaying);
        }else {
            
                //preparo audio
                try {
                    
                    //elimino precedente evento di timeout (altrimenti quando occorre mi elimina l'attuale audio che sto caricando)
                    clearTimeout(timeOutEvent);
                    await sound.unloadAsync();
                    await sound.loadAsync({uri:messaggio.content});
                    const initial_status = await sound.playAsync();
                    //l'audio dovrebbe essere in riproduzione...
                    //indico cosa chiaare ogni 100ms
                    sound.setOnPlaybackStatusUpdate(aggiornaProgressBarRiproduzioneAudio);
                    sound.setProgressUpdateIntervalAsync(100);
                    //mi assicuro che l'audio sia in riproduzione e caricato
                    setIsAudioPlaying(initial_status.isPlaying);
                    isLoaded.current = initial_status.isLoaded;
                    //elimino listener (per sicurezza) dopo durata audio
                    timeOutEvent = setTimeout(async()=>{
                        await sound.unloadAsync();
                        setIsAudioPlaying(false);
                        isLoaded.current = false;
                        setTempoAudio(1);
                        console.log("elimino listener audio");
                    }, initial_status.durationMillis)
               
            }catch(error){
                console.log("Errore durante la riproduzione audio: "+error);
            }
        }

        
        setIsAudioPlaying(!isAudioPlaying);
    }

    function aggiornaProgressBarRiproduzioneAudio(status){
        try{
            if(status.isLoaded==true){
                //prelevo durata totale audio
                let total_duration = status.durationMillis;
                //prelevo quanto è trascorso di tempo dall'inizio
                let actual_duration = status.positionMillis;
                //calcolo rapporto per aggiornare progress bar
                let percentOfTotalTime = actual_duration/total_duration;
                setTempoAudio(percentOfTotalTime);
            }
        }catch(err){
            console.log("errore durante l'aggiornamento della progress bar");
        }
    }

   async function resetta(id){
        console.log("Io sono "+messaggio.row+" ma sono stato chiamato dal nuovo "+id);
        //resetto
        clearTimeout(timeOutEvent);
        sound._clearSubscriptions();
        await sound.stopAsync();
        await sound.unloadAsync();
        setIsAudioPlaying(false);
        isLoaded.current = false;
        setTempoAudio(0);

    }

        

    //se il messaggio è stato inviato dall'utente corrente
    if(messaggio.author==utenteCorrente){
        //se il messaggio è testuale
        if(messaggio.type=="mex"){
            return (

                <View style={styles.container}>
                    <View style={styles.areaMessaggio}>
                        <Text style={styles.mexUtenteCorrente}>{messaggio.content}</Text>
                        <Text style={styles.timestampOrarioUtenteCorrente}>15:32</Text>
                        <View style={styles.bordoInferioreUtenteCorrente}/>
                    </View>
                </View>
            )
        }
        //se il messaggio è audio
        else {
            return (
            <View style={styles.container}>
                <View style={styles.areaAudio}>
                    <View style={styles.areaRiproduzione}>
                        <TouchableOpacity onPress={playAudio}>
                            <Entypo name={isAudioPlaying==false ? "controller-play" : "controller-paus"} size={altezzaDevice*0.15*0.3} color="#52575D" />
                         </TouchableOpacity>
                         <View style={{backgroundColor:MosCeleste, flex:1, borderRadius:altezzaDevice*0.01, height:altezzaDevice*0.15*0.3}}>
                         <Slider
                            value = {tempoAudio}
                            onValueChange = {(t) =>{setTempoAudio(t)}}
                            style={{flex:1, height:altezzaDevice*0.15*0.3,}}
                            thumbTintColor="white"
                            onSlidingComplete={()=>console.log("finito")} //NB: questo metodo non significa "quando lo sliderè arrivato alla fine", ma quando, muovendo lo slider manualmente, lo rilascio
                            maximumTrackTintColor="white"
                            minimumTrackTintColor="#52575D"
                         />
                         </View>
                    </View>     
                        <Text style={styles.timestampOrarioAudioUtenteCorrente}>15:31</Text>
                        <View style={styles.bordoInferioreUtenteCorrente}/>
                </View>
            </View>
            )
        }
    }
    //se il messaggio è stato inviato dal contatto
    else {
    return (
            <View style={styles.container}>
                <View style={styles.areaMessaggio}>
                    <Text style={styles.mex}>{messaggio.content}</Text>
                    <Text style={styles.timestampOrario}>15:32</Text>
                    <View style={styles.bordoInferiore}/>
                </View>
            </View>
        )
    }
}

export default ref;

const styles = StyleSheet.create({  
    container:{
        margin:10,
        maxWidth:larghezzaDevice,
    },
    areaMessaggio: {
        padding:10
    },
    areaAudio: {
        height:altezzaDevice*0.15
    },
    areaRiproduzione:{
        height:altezzaDevice*0.1,
        width:"70%",
        height:altezzaDevice*0.15*0.35,
        flexDirection:"row",
        alignSelf:"flex-end",
        alignItems:"center",
    },
    mex:{
        fontSize:fontSizeCampi*1.5,
        color:"#52575D",
        fontFamily: "Raleway_400Regular"
    },
    timestampOra: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        paddingTop:15
    },
    bordoInferiore: {
        borderBottomColor:MosPurple,
        borderBottomWidth:4,
        width:larghezzaDevice*0.16,
        paddingTop:15
    },
    mexUtenteCorrente:{
        fontSize:fontSizeCampi*1.5,
        color:"#52575D",
        fontFamily: "Raleway_200ExtraLight",
        textAlign:"right"
    },
    timestampOrarioUtenteCorrente: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        paddingTop:15,
        textAlign:"right"
    },
    timestampOrarioAudioUtenteCorrente: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        textAlign:"right"
    },
    bordoInferioreUtenteCorrente: {
        borderBottomColor:MosCeleste,
        borderBottomWidth:4,
        width:larghezzaDevice*0.16,
        paddingTop:15,
        alignSelf:"flex-end"
    },
  });