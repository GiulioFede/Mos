import React,{ useImperativeHandle, forwardRef, useState,useEffect, useRef} from "react";
import { ActivityIndicator,TouchableOpacity, Dimensions,Animated, Text, View, StyleSheet, Platform, Image} from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { altezzaDevice, fontSizeTitolo, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import {useFonts, Lobster_400Regular} from '@expo-google-fonts/lobster';
import { MosCeleste, MosPurple } from "../../../../../../resources/colors";

const loadPhrase = "Attendi"; //cambiarla a seconda della lingua
const questionPhrase = "Vuoi renderti più visibile?";
const DecisionScreen = forwardRef((props, ref) => {


     const [showDecisionScreen, setShowDecisionScreen] = useState(false);
     const [uri1error, setUri1Error] = useState(false);
     const [uri2error, setUri2Error] = useState(false);
     const [question, setQuestion ] = useState("Vuoi renderti più visibile?");
     const [refresh, setRefresh] = useState(false);
     const current_statistics = useRef(null);

     const {makeDecision,upgradeConversation, chatID, uidCurrentUser, contactUid} = props;

     useImperativeHandle(ref, () => ({
        show(statistics){
            local_show(statistics);
        },
        hide(){
            local_hide();
        }
        
     }));

     function local_show(statistics){
        console.log("apro decision screen");
        let nomeCampoDiInteresse = uidCurrentUser+"_response";
        console.log(statistics[nomeCampoDiInteresse]);
        //se l'utente corrente ha già risposto allora lo metto in attesa
        current_statistics.current = statistics;
        if(statistics[nomeCampoDiInteresse]!=null)
            setQuestion(loadPhrase);
        else    
            setQuestion(questionPhrase);

         setShowDecisionScreen(true);
         setRefresh(!refresh);

     }

     function local_hide(){
        setShowDecisionScreen(false);
     }

     const topTransitionAnimation = useRef(new Animated.Value(-larghezzaDevice*0.9*0.4*0.3)).current;
     const fromTopToBottomTransition = () => {
         Animated.timing( topTransitionAnimation, {
            toValue: -larghezzaDevice*0.9*0.4*0.1,
            duration: 1500,
            useNativeDriver: false
         }).start();
     }

     const bottomTransitionAnimation = useRef(new Animated.Value(larghezzaDevice*0.9*0.4*0.3)).current;
     const fromBottomToTopTransition = () => {
        Animated.timing( bottomTransitionAnimation, {
           toValue: larghezzaDevice*0.9*0.4*0.1,
           duration: 1500,
           useNativeDriver: false
        }).start();
    }

    const bottomOpacityAnimation = useRef(new Animated.Value(0)).current;
    const fromBottomToTopOpacity = () => {
        Animated.timing( bottomOpacityAnimation, {
           toValue: 1,
           duration: 1400,
           useNativeDriver: false
        }).start();
    }

    const topOpacityAnimation = useRef(new Animated.Value(0)).current;
    const fromTopToBottomOpacity = () => {
        Animated.timing( topOpacityAnimation, {
           toValue: 1,
           duration: 1400,
           useNativeDriver: false
        }).start();
    }

    const opacityAnimation = useRef(new Animated.Value(0)).current;
    const opacityTransition = () => {
        Animated.timing( opacityAnimation, {
           toValue: 1,
           duration: 1000,
           useNativeDriver: false
        }).start();
    }

    const motionAnimation = useRef(new Animated.Value(altezzaDevice*0.1)).current;
    const motionTransition = () => {
        Animated.timing( motionAnimation, {
           toValue: 0,
           duration: 1000,
           useNativeDriver: false
        }).start();
    }

    console.log("STATISTICHE ATTUALI");
    console.log(current_statistics.current);
    useEffect(()=>{
        opacityTransition();
        motionTransition();

    },[refresh])

    //questa funzione viene chiamata quando si preme Si o No alla domanda "Vuoi renderti più visibile?"
    async function makeLocalDecision(response){

        try{
            //se non sono l'amministratore, una volta data la mia risposta dovrò attendere che l'amministratore riceva il documento con la mia response=true/false e la sua a true/false/null
            if(current_statistics.current!=null){
                //quindi se non sono l'amministratore mi limito a dare la mia risposta
                if(current_statistics.current.administrator != uidCurrentUser)
                    await makeDecision(response,chatID);
                //se invece sono l'amministratore...
                else {
                    //se la risposta del contatto è null
                    let nomeCampoDiInteresse = contactUid+"_response";
                    if(current_statistics.current[nomeCampoDiInteresse]==null){
                        //mi limito a dare la mia e mi metto in attesa
                        await makeDecision(response,chatID);
                        setQuestion(loadPhrase);
                    }
                    //se invece la risposta del contatto è true o false devo fare l'upgrade (o no) e resettare 
                    else {
                        //se la risposta dell'utente è true e la mia è true faccio l'upgrade
                        if(current_statistics.current[nomeCampoDiInteresse]==true && response==true){
                            //faccio upgrade
                            await upgradeConversation(chatID,true,contactUid);
                            console.log("upgrade riuscito con successo");
                        }
                        //altrimenti in qualsiasi altro caso resetto
                        else {
                            //resetto solo
                            await upgradeConversation(chatID,false,contactUid);
                            console.log("'continua con lo stesso livello di visibilità' riuscito con successo");
                        }
                    }

                }
                console.log("Decisione presa:"+response);
            //disabilita bottoni (dovrei chiudere la schermata ma tanto la riaprirà subito il listener del documento modificato. Per evitare di lasciare la chat libera aspetto che sia lui a farlo, disabilitando intato i bottoni)
            }
            setQuestion(loadPhrase);
        }catch(e){
            console.log("Errore nel prendere la decisione:"+e);
        }
    }

    let [LobsterFont] = useFonts({Lobster_400Regular});
    if(!LobsterFont)
        return <View></View>

    if(showDecisionScreen==true){
        return (
            <Animated.View style={{position:"absolute",opacity:opacityAnimation ,width:larghezzaDevice, height:altezzaDevice, justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <Animated.View style={{width:larghezzaDevice*0.9, height:altezzaDevice*0.7, backgroundColor:"white", top:motionAnimation, borderRadius:larghezzaDevice*0.02}}>
                        <View style={{flexGrow:1, borderTopRightRadius:larghezzaDevice*0.02, borderTopLeftRadius:larghezzaDevice*0.02, justifyContent:"center"}}>
                            <Text style={styles.title}>...parlate già da un pò</Text>
                        </View>
                        <View style={{height:"40%", justifyContent:"center", alignItems:"center", flexDirection:"row"}}>
                            <Animated.View style={[styles.contenitoreImmagineProfilo,{top: topTransitionAnimation,opacity:topOpacityAnimation, left:10, borderColor:"white", borderWidth:2}]}>
                                {uri1error== false && <Image source={{uri: "https://data.whicdn.com/images/339581930/original.jpg"}} resizeMode="cover"  style={styles.immagineProfilo} onError={()=>{setUri1Error(true)}} onLoadEnd={()=>{fromTopToBottomTransition(); fromTopToBottomOpacity()}} />}
                                {uri1error== true && <Image  source={require('../../../../../../resources/images/img-profile-not-found.png')} resizeMode="cover"  style={styles.immagineProfilo} onLoadEnd={()=>{fromTopToBottomTransition(); fromTopToBottomOpacity()}} />}
                            </Animated.View>
                            <Animated.View style={[styles.contenitoreImmagineProfilo,{top:bottomTransitionAnimation,opacity:bottomOpacityAnimation, right:10,borderColor:"white", borderWidth:2}]}>
                                {uri2error==false && <Image source={{uri: "https://www.stockvault.net/data/2019/09/02/269196/preview16.jpg"}} resizeMode="cover"  style={styles.immagineProfilo} onError={()=>{setUri2Error(true)}} onLoadEnd={()=>{fromBottomToTopTransition(); fromBottomToTopOpacity()}}/>}
                                {uri2error==true && <Image  source={require('../../../../../../resources/images/img-profile-not-found.png')} resizeMode="cover"  style={styles.immagineProfilo} onLoadEnd={()=>{fromBottomToTopTransition(); fromBottomToTopOpacity()}} />}
                            </Animated.View>
                        </View>
                        <View style={{flexGrow:1, justifyContent:"center", padding:1, margin:5}}>
                            <Text style={styles.question}>{question} {question==loadPhrase?"Lucy...":""}</Text>
                            {question!=loadPhrase && <Text style={styles.subquestion}>Sia tu che Lucy dovrete essere daccordo, altrimenti continuerete per un altro pò prima che vi venga richiesto ancora</Text>}
                        </View>

                        {question!=loadPhrase &&
                        <View style={{height:"20%", justifyContent:"center", borderBottomRightRadius:larghezzaDevice*0.02, borderBottomLeftRadius:larghezzaDevice*0.02, flexDirection:"row"}}>
                            <View style={{width:larghezzaDevice*0.9*0.5, justifyContent:"center"}}>
                                <TouchableOpacity onPress={async()=>{makeLocalDecision(true)}}>
                                    <Text style={[styles.question,{color:MosCeleste}]}>Si</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{width:larghezzaDevice*0.9*0.5, justifyContent:"center"}}>
                                <TouchableOpacity onPress={async()=>{makeLocalDecision(false)}}>
                                    <Text style={[styles.question,{color:MosPurple}]}>Non ancora</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        }
                    </Animated.View>
            </Animated.View>
        )
    }else {
        return (
            <></>
        )
    }
}
)

export default DecisionScreen;

const styles = StyleSheet.create({
    title:{
        fontFamily: 'Lobster_400Regular',
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        fontSize:larghezzaDevice*0.09
    },
    question:{
        fontFamily: 'Lobster_400Regular',
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        fontSize:larghezzaDevice*0.07
    },
    subquestion:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        fontSize:larghezzaDevice*0.03
    },
    nome:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreMediaProfilo:{
        paddingTop:10,
        alignItems:"center",
        justifyContent:"center",
        height: 200, //altezza sezione immagine profilo
        width: Dimensions.get("window").width,
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    contenitoreImmagineProfilo: {
        width: larghezzaDevice*0.9*0.4,
        height: larghezzaDevice*0.9*0.4,
        borderRadius: larghezzaDevice*0.9*0.4/2,
        overflow: "hidden",
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 4
            }
        })
    },
  });