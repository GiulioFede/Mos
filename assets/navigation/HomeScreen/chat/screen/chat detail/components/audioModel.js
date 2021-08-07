// Import react
import React, { useRef, useState } from 'react'

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
import {Entypo, Feather} from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { ActivityIndicator } from 'react-native-paper';

/*
    NB: La funzione MessageModel viene utilizzata da tutti gli elementi della flat list. Però (importantissimo) le variabili globali
        fuori la funzione MessageModel sono condivise da tutti. E' quindi possibile capire se c'è qualche audio già in riproduzione 
        e capire anche chi sia guardando l'indice che contiene il valore della row, ossia del row-esimo messaggio 
*/
var sound = new Audio.Sound();
var timeOutEvent = null;
var indiceFocusMessaggioAudio = -1; //indica l'i-esimo messaggio audio che è in riproduzione o in pausa
var resettaUltimoAudioMessaggio= null; //contiene il riferimento della funzione resetta delll'ultimo messaggio audio riprodotto o in pausa

let date = new Date();

function getDate(mostraNuovaData, myDate){
    if(mostraNuovaData==true){
        date = new Date(myDate);
        console.log("ritorno data");
        let data_str = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDay();
        return( 
            <Text style={styles.dataCentrale}>{data_str}</Text>
        )
    }
}

function getTimestamp(myDate, isAuthor){
    date = new Date(myDate);
    let time_str = date.getHours()+":"+date.getMinutes();
    if(isAuthor){
        console.log("ritorno timestamp");
        return( 
            <Text style={styles.timestampOrarioAudioUtenteCorrente}>{time_str}</Text>
        )
    }else {
        console.log("ritorno timestamp");
        return( 
            <Text style={[styles.timestampOrarioAudioUtenteCorrente,{alignSelf:"flex-start", textAlign:"left",alignSelf:"flex-start"}]}>{time_str}</Text>
        )
    }
}


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

export default function AudioModel({messaggio, utenteCorrente, mostraMessaggioErrore, mostraNuovaData}){

    const [amplitude,setAmplitude] = useState(1);
    const [tempoAudio, setTempoAudio] = useState(0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const isLoaded = useRef(false);

    console.log("mostra nuova data per "+messaggio.row+"?: "+mostraNuovaData);
        
    async function playAudio(){
        try{
            console.log("Playing audio...");
            //se l'audio in riproduzione o in pausa (non cambia) NON è quello che attualmente voglio riprodurre 
            //(caso tipico quando un audio X viene riprodotto e io voglio, mentre X è in pausa o in riproduzione, caricare un audio Y).
            if((messaggio.row != indiceFocusMessaggioAudio || isLoaded.current==false)  && indiceFocusMessaggioAudio!=-1){
                    console.log(messaggio.row);
                    console.log(indiceFocusMessaggioAudio);
                    //annullo l'intero messaggio audio
                    console.log("Riproduco attuale "+messaggio.row +"dal vecchio "+indiceFocusMessaggioAudio);
                    await resettaUltimoAudioMessaggio();
            }
            
            console.log("aggiorno indice");
            indiceFocusMessaggioAudio = messaggio.row;
            resettaUltimoAudioMessaggio = resetta;

            //se l'audio esiste già, ossia è stato caricato e...
            if(isLoaded.current == true){
                console.log("audio è caricato di già");
                //...se l'audio era già in riproduzione
                if(isAudioPlaying){
                    console.log("audio era in riproduzione. Lo metto in pausa.");
                    //lo metto in pausa
                    await sound.pauseAsync();
                    clearTimeout(timeOutEvent);
                
                //...altrimenti l'audio era in pausa e quindi necessito di rimetterlo in riproduzione    
                }else {
                    console.log("audio non è stato caricato");
                    const intermediate_status = await sound.getStatusAsync();
                    if(intermediate_status.isLoaded==true){
                        //ho però bisogno di capire quanto rimane del timeout 
                        console.log("Riprendo riproduzione audio: ");
                        //prelevo durata totale audio
                        let total_duration = intermediate_status.durationMillis;
                        //prelevo quanto è trascorso di tempo dall'inizio ma non uso la positionMillis ma tempoAudio in caso è stato spostato manualmente
                        let new_starting_point_ms = total_duration*tempoAudio
                        console.log("tempo audio ri-riproduzione:"+tempoAudio);
                        //imposto nuovo starting point
                        await sound.setPositionAsync(new_starting_point_ms);
                        //riprendo riproduzione+
                        await sound.playAsync();
                        //setto nuovo timeout come differenza
                        timeOutEvent = setTimeout(async ()=>{
                            await resetta();
                            console.log("elimino listener audio (dopo pausa");
                        }, (total_duration-new_starting_point_ms))
                    }
                }
                //setIsAudioPlaying(!isAudioPlaying);
            }else {
                    
                    //preparo audio
                        console.log("preparo nuovo audio");
                        //questa parte, per quanto insensata, risolve un bug su IOS. Per registrare l'audio ho bisogno di 'allowsRecordingIOS=false
                        //ma per riprodurlo ho bisogno di settarlo come false.
                        await Audio.setAudioModeAsync({
                            allowsRecordingIOS: false,
                          
                          });
                        //elimino precedente evento di timeout (altrimenti quando occorre mi elimina l'attuale audio che sto caricando)
                        let initial_status = await sound.loadAsync({uri:messaggio.content});
                        await sound.setVolumeAsync(1);
                        if(initial_status.isLoaded==true){
                            console.log(initial_status);
                            let durata_totale = initial_status.durationMillis;
                            console.log(durata_totale);
                            let new_starting_point_ms = tempoAudio*durata_totale;
                            console.log("tempo audio: "+tempoAudio);
                            console.log(new_starting_point_ms);
                            await sound.setPositionAsync(new_starting_point_ms);
                            //l'audio dovrebbe essere in riproduzione...
                            //indico cosa chiamare ogni 100ms
                            sound.setOnPlaybackStatusUpdate(aggiornaProgressBarRiproduzioneAudio);
                            await sound.setProgressUpdateIntervalAsync(100);
                            await sound.playAsync();
                            //mi assicuro che l'audio sia in riproduzione e caricato
                            isLoaded.current = initial_status.isLoaded;
                            //elimino listener (per sicurezza) dopo durata audio
                            timeOutEvent = setTimeout(async()=>{
                                await resetta();
                                console.log("elimino listener audio");
                            }, (durata_totale-new_starting_point_ms))
                    }
                }
        }catch(error){
            sound = new Audio.Sound();
            mostraMessaggioErrore("Si è verificato un errore durante la riproduzione dell'audio.")
            console.log("Errore durante la riproduzione audio: "+error);
            
        }
    }

    function aggiornaProgressBarRiproduzioneAudio(status){
        try{
            if(status.isLoaded==true){
                if(status.isPlaying==true){
                    if(isAudioPlaying==false) setIsAudioPlaying(true);
                    //prelevo durata totale audio
                    let total_duration = status.durationMillis;
                    //prelevo quanto è trascorso di tempo dall'inizio
                    let actual_duration = status.positionMillis;
                    //calcolo rapporto per aggiornare progress bar
                    let percentOfTotalTime = actual_duration/total_duration;
                    setTempoAudio(percentOfTotalTime);
                    console.log("aggiorno tempo di "+messaggio.row+" a "+percentOfTotalTime);
                }else
                    setIsAudioPlaying(false);
            }
        }catch(err){
            sound = new Audio.Sound();
            mostraMessaggioErrore("Si è verificato un errore durante la riproduzione dell'audio.")
            console.log("errore durante l'aggiornamento della progress bar");
        }
    }

   async function resetta(){
       try{
            //resetto
            console.log("chiamo resetta da "+messaggio.row);
            clearTimeout(timeOutEvent);
            let status = await sound.getStatusAsync();
            if(status.isLoaded==true){
                sound._clearSubscriptions();
                await sound.stopAsync();
                await sound.unloadAsync();
            }
            setIsAudioPlaying(false);
            isLoaded.current = false;
            setTempoAudio(0);
        }catch(error){
            sound = new Audio.Sound();
            mostraMessaggioErrore("Si è verificato un errore durante la riproduzione dell'audio.")
            console.log("Errore durante il reset: "+error);
        }

    }

    //quando l'utente usa lo slider manualmente APPENA RILASCIA il punto dello slider viene richiamata tale funzione
    async function spostaAudioAvantiIndietro(){
        try{
            console.log("spostamento");
            //se l'audio esiste già, ossia è stato caricato e...
            if(isLoaded.current == true){
                //...se l'audio era già in riproduzione
                if(isAudioPlaying){
                    //lo metto in pausa
                    console.log("riproduco audio da");
                    /*
                        Prendo valore slider (tempoAudio) che è una percentuale e calcolo l'equivalente in ms rispetto la durationMillis
                    */
                    let current_status = await sound.getStatusAsync();
                    let durata_totale = current_status.durationMillis;
                    let new_starting_point_ms = durata_totale*tempoAudio;
                    await sound.setPositionAsync(new_starting_point_ms);
                    await sound.playAsync();
                    //creo nuovo timeout
                    clearTimeout(timeOutEvent);
                    //elimino listener (per sicurezza) dopo durata audio
                    timeOutEvent = setTimeout(async()=>{
                        await resetta();
                        console.log("elimino listener audio");
                    }, (durata_totale-new_starting_point_ms))
                }
                //se l'audio non era in riproduzione non fare nulla
                else {
                    console.log("...2");
                }
            }
            //se l'audio non esiste non fare nulla
            else {
                console.log("...1");
            }
        }catch(error){
            sound = new Audio.Sound();
            mostraMessaggioErrore("Si è verificato un errore durante la riproduzione dell'audio.")
            console.log("Errore durante lo spostamento: "+error);
        }
        
    }

    /*
        Questa funzione viene chiamata all'inizio dello sliding manuale. Quando rilascio il pallino invece viene chiamata la funzione "spostaAudioAvantiIndietro()"
    */
   async function pauseAudio(){
       try{
            //se l'audio esiste già, ossia è stato caricato e...
            if(isLoaded.current == true){
                //...se l'audio era già in riproduzione
                if(isAudioPlaying){
                    //lo metto in pausa
                    console.log("pausa audio");
                    await sound.pauseAsync();
                    clearTimeout(timeOutEvent);
                }
                //se l'audio è in pausa
                else {
                    console.log("...3")
                }
            }else {
                console.log("...4")
            }
        }catch(error){
            sound = new Audio.Sound();
            mostraMessaggioErrore("Si è verificato un errore durante la riproduzione dell'audio.")
            console.log("Errore durante la pausa: "+error);
        }
    
    }

            //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    //se il messaggio audio è stato inviato dall'utente corrente
            return (
                <>
            <View style={styles.container}>
                {getDate(mostraNuovaData,messaggio.date)}
                {messaggio.author==utenteCorrente &&
                    <View style={styles.areaAudio}>
                        <View style={styles.areaRiproduzione}>
                            <TouchableOpacity onPress={playAudio}>
                                <Entypo name={isAudioPlaying==false ? "controller-play" : "controller-paus"} size={altezzaDevice*0.15*0.3} color="#52575D" />
                            </TouchableOpacity>
                            <View style={{backgroundColor:MosCeleste, flex:1, borderRadius:altezzaDevice*0.01, height:altezzaDevice*0.15*0.3}}>
                                <Slider
                                    value = {tempoAudio}
                                    onValueChange = {(t) =>{setTempoAudio(t)}}
                                    style={{flex:1, height:altezzaDevice*0.15*0.3}}
                                    thumbTintColor="white"
                                    //aggiorna l'audio quando l'utente va avanti con lo slider
                                    onSlidingComplete={spostaAudioAvantiIndietro} //NB: questo metodo non significa "quando lo slider arrivato alla fine", ma quando, muovendo lo slider manualmente, lo rilascio
                                    onSlidingStart = {pauseAudio}
                                    maximumTrackTintColor="white"
                                    minimumTrackTintColor="#52575D"
                                />
                            </View>
                        </View>
                            <View style={{flexDirection:"row", alignSelf:"flex-end"}}>     
                                {getTimestamp(messaggio.date,true)}
                                <View style={{justifyContent:"center"}}>
                                    {messaggio.state=="in-progress" && <ActivityIndicator size={fontSizeCampi*0.8} color={MosCeleste} />}
                                    {messaggio.state=="failed" && <Feather name="x" size={fontSizeCampi*0.8} color="red" />}
                                </View>
                            </View>
                            <View style={styles.bordoInferioreUtenteCorrente}/>
                    </View>
            }
            {messaggio.author!=utenteCorrente &&
                    <View style={styles.areaAudio}>
                    <View style={[styles.areaRiproduzione,{alignSelf:"flex-start"}]}>
                        <TouchableOpacity onPress={playAudio}>
                            <Entypo name={isAudioPlaying==false ? "controller-play" : "controller-paus"} size={altezzaDevice*0.15*0.3} color="#52575D" />
                         </TouchableOpacity>
                         <View style={{backgroundColor:MosPurple, flex:1, borderRadius:altezzaDevice*0.01, height:altezzaDevice*0.15*0.3}}>
                            <Slider
                                value = {tempoAudio}
                                onValueChange = {(t) =>{console.log("spostamento percentuale audio di "+ messaggio.row+" a "+t);setTempoAudio(t)}}
                                style={{flex:1, height:altezzaDevice*0.15*0.3}}
                                thumbTintColor="white"
                                //aggiorna l'audio quando l'utente va avanti con lo slider
                                onSlidingComplete={spostaAudioAvantiIndietro} //NB: questo metodo non significa "quando lo slider arrivato alla fine", ma quando, muovendo lo slider manualmente, lo rilascio
                                onSlidingStart = {pauseAudio}
                                maximumTrackTintColor="white"
                                minimumTrackTintColor="#52575D"
                            />
                         </View>
                    </View>
                        {getTimestamp(messaggio.date,false)}     
                        <View style={[styles.bordoInferiore,{alignSelf:"flex-start"}]}/>
                </View>
            }
            </View>
            </>
            )
}

const styles = StyleSheet.create({  
    container:{
        margin:10,
        maxWidth:larghezzaDevice
    },
    areaMessaggio: {
        padding:10
    },
    areaAudio: {
        height:altezzaDevice*0.15,
        padding:10
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
        alignSelf:"center",
        textAlignVertical:"center"
    },
    bordoInferioreUtenteCorrente: {
        borderBottomColor:MosCeleste,
        borderBottomWidth:4,
        width:larghezzaDevice*0.16,
        paddingTop:15,
        alignSelf:"flex-end"
    },
    dataCentrale:{
        paddingBottom:40,
        textAlign:"center",
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.5
    }
  });