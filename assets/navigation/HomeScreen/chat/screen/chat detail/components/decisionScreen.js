import React,{ useImperativeHandle, forwardRef, useState,useEffect, useRef} from "react";
import { ActivityIndicator,TouchableOpacity, Dimensions,Animated, Text, View, StyleSheet, Platform, Image} from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { altezzaDevice, fontSizeTitolo, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";

import { MosCeleste, MosPurple } from "../../../../../../resources/colors";
import local_storage from "../../../../../../context/local_storage/localStorage";
import { sendPushNotification } from "../../../../../../context/push_notifications/functions";

const loadPhrase = "Attendi "; //cambiarla a seconda della lingua
const questionPhrase1 = "Vuoi renderti più visibile?";
const questionPhrase2 = "Vuoi renderti completamente visibile?"
const DecisionScreen = forwardRef((props, ref) => {


     const [showDecisionScreen, setShowDecisionScreen] = useState(false);
     const [uri1error, setUri1Error] = useState(false);
     const [uri2error, setUri2Error] = useState(false);
     const [question, setQuestion ] = useState("Vuoi renderti più visibile?");
     const [refresh, setRefresh] = useState(false);
     const [urlProfileImage, setUrlProfileImage] = useState(null);
     const current_statistics = useRef(null);
     const isMounted = useRef(false);

     const {makeDecision,upgradeConversation, chatID, uidCurrentUser, contactUid, contactName,currentUserName, urlProfileImageContactUser,informazioniProfiloUtenteCorrente, myToken, contactToken} = props;

     useImperativeHandle(ref, () => ({
        show(sonoAmministratore, miaScelta, suaScelta, livelloCorrenteDiVisibilità){
            local_show(sonoAmministratore, miaScelta, suaScelta, livelloCorrenteDiVisibilità);
        },
        hide(){
            local_hide();
        }
        
     }));

     const [currentVisibility, setCurrentVisibility] = useState(0);
     const [myChoice, setMyChoice] = useState(null);
     const [contactChoice, setContactChoise] = useState(null);
     const [imAdministrator, setImAdministrator] = useState(false);

     async function local_show(sonoAmministratore, miaScelta, suaScelta, livelloCorrenteDiVisibilità){

        console.log("LOCAL SHOW CON");
        console.log(sonoAmministratore+","+ miaScelta+","+ suaScelta+","+livelloCorrenteDiVisibilità);
        //carico immagini di profilo
        await inizializzaImmagineProfiloUtenteCorrente(livelloCorrenteDiVisibilità);

        if(isMounted.current==true)
            setCurrentVisibility(livelloCorrenteDiVisibilità);

        if(isMounted.current==true){
            setMyChoice(miaScelta);
            setContactChoise(suaScelta);
            setImAdministrator(sonoAmministratore);
        }

        //se non sono amministratore
        if(sonoAmministratore==false){
            //se la mia scelta e la sua scelta sono a null mostro tutto
            if(miaScelta==null && suaScelta==null){
                //se siamo all'inizio
                if(livelloCorrenteDiVisibilità==0){
                    //mostro la scelta si e no e la frase 1
                    if(isMounted.current == true)
                        setQuestion(questionPhrase1);
                }
                else if (livelloCorrenteDiVisibilità==1){
                    if(isMounted.current == true)
                        setQuestion(questionPhrase2)
                }
            }
            //se la mia scelta è diversa da null (true o false) e la sua è ancora a null
            else if(miaScelta!=null && suaScelta==null){
                //mi metto in attesa
                if(isMounted.current == true)
                    setQuestion(loadPhrase);
            }
        }

        //se sono AMMINISTRATORE
        if(sonoAmministratore==true){
            //se sia la mia che quella del contatto sono a null 
            if(miaScelta==null && suaScelta==null){
                //se siamo all'inizio
                if(livelloCorrenteDiVisibilità==0){
                    //mostro la scelta si e no e la frase 1
                    if(isMounted.current == true)
                        setQuestion(questionPhrase1);
                }
                else if (livelloCorrenteDiVisibilità==1){
                    if(isMounted.current == true)
                        setQuestion(questionPhrase2)
                }
            }
            //se la mia è null ma quella del contatto no, mostro tutto sempre
            else if(miaScelta==null && suaScelta!=null){
                //se siamo all'inizio
                if(livelloCorrenteDiVisibilità==0){
                    //mostro la scelta si e no e la frase 1
                    if(isMounted.current == true)
                        setQuestion(questionPhrase1);
                }
                else if (livelloCorrenteDiVisibilità==1){
                    if(isMounted.current == true)
                        setQuestion(questionPhrase2);
                }
            }
            //se la mia scelta è !=null mentre quella del contatto è null mi metto in attesa
            else if(miaScelta!=null && suaScelta==null){
                if(isMounted.current == true)
                    setQuestion(loadPhrase);
            }
            
        }

        if(isMounted.current == true){
            setShowDecisionScreen(true);
            setRefresh(!refresh);
        }
     }

     console.log("mostra decision screen?:"+showDecisionScreen+" con visibilità "+currentVisibility);

     async function inizializzaImmagineProfiloUtenteCorrente(current_level_of_visibility){
        try{
            //carico l'immagine del profilo (tento di salvarla, ma se esiste già, mi viene ritornato l'uri locale)
            console.log("il livello corrente di visibilità è: "+current_level_of_visibility);
            console.log("token: "+contactToken+", "+myToken)
            //console.log(informazioniProfiloUtenteCorrente);
            let actual_remote_uri = "";
            if(current_level_of_visibility==null || current_level_of_visibility==undefined || current_level_of_visibility==0)
                actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_100"];
            else if(current_level_of_visibility==1) actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_50"];
                //else if(visibility=="75") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_75"];
            else if(current_level_of_visibility>=2) actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_0"];
            
            //console.log("actual_remote_uri:"+actual_remote_uri);
            if(actual_remote_uri==""){
                if(isMounted.current==true){
                    setUri1Error(true);
                    return;
                }
            }
            let local_uri = await local_storage.saveImageLocally(uidCurrentUser,actual_remote_uri);
            console.log("Local uri:"+local_uri);
            if(isMounted.current==true){
                setUrlProfileImage(local_uri);
            }
        }catch(e){
            if(isMounted.current==true)
                setUrlProfileImage(actual_remote_uri);
            console.log("eccezione galleria: "+e);
            //se sopra ci sono degli errori stai tranquillo, comunqe actual_remote_uri è un uri valido per scaricare l'immagine 
        }
    }

     function local_hide(){
        
        if(isMounted.current==true){
            setMyChoice(null);
            setContactChoise(null);
            setShowDecisionScreen(false);
        }
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
/*
    console.log("STATISTICHE ATTUALI IN DECISION SCREEN");
    console.log(current_statistics.current.statistics.number_of_messages);
*/
    
    useEffect(()=>{

        if(isMounted.current==true){
            opacityTransition();
            motionTransition();
        }

        async function inizializzaImmagineProfiloUtenteCorrente(){
            try{
                isMounted.current = true;
                //carico l'immagine del profilo (tento di salvarla, ma se esiste già, mi viene ritornato l'uri locale)
                console.log("il livello corrente di visibilità è: "+current_level_of_visibility);
                console.log("token: "+contactToken+", "+myToken)
                //console.log(informazioniProfiloUtenteCorrente);
                let actual_remote_uri = "";
                if(current_level_of_visibility==null || current_level_of_visibility==undefined || current_level_of_visibility==0)
                    actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_100"];
                else if(current_level_of_visibility==1) actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_50"];
                    //else if(visibility=="75") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_75"];
                else if(current_level_of_visibility>=2) actual_remote_uri = informazioniProfiloUtenteCorrente.urlProfileImage["url_0"];
                
                //console.log("actual_remote_uri:"+actual_remote_uri);
                if(actual_remote_uri==""){
                    if(isMounted.current==true){
                        setUri1Error(true);
                        return;
                    }
                }
                let local_uri = await local_storage.saveImageLocally(uidCurrentUser,actual_remote_uri);
                console.log("Local uri:"+local_uri);
                if(isMounted.current==true){
                    setUrlProfileImage(local_uri);
                }
            }catch(e){
                if(isMounted.current==true)
                    setUrlProfileImage(actual_remote_uri);
                console.log("eccezione galleria: "+e);
                //se sopra ci sono degli errori stai tranquillo, comunqe actual_remote_uri è un uri valido per scaricare l'immagine 
            }
        }

    
        
    },[refresh])

    useEffect(()=>{
        isMounted.current = true;

        return () => isMounted.current = false;
    },[])
   

    //questa funzione viene chiamata quando si preme Si o No alla domanda "Vuoi renderti più visibile?"
    async function makeLocalDecision(response){
        //per sicurezza controllo che la visibilità non è stata già raggiunta
        if(currentVisibility<2){
            try{
                //se non sono l'amministratore, una volta data la mia risposta dovrò attendere che l'amministratore riceva il documento con la mia response=true/false e la sua a true/false/null
                    console.log("Sono amministratore?");
                    //console.log(current_statistics.current["statistics"]["administrator"]);
                    //quindi se non sono l'amministratore mi limito a dare la mia risposta
                    if(!imAdministrator){
                        console.log("non sono amministratore");
                        await makeDecision(response,chatID);
                    }
                    //se invece sono l'amministratore...
                    else {
                        console.log("sono amministratore");
                        //se la risposta del contatto è null
                        let nomeCampoDiInteresse = contactUid+"_response";
                        if(contactChoice==null){
                            console.log("la risposta del contatto non è data");
                            //mi limito a dare la mia e mi metto in attesa
                            await makeDecision(response,chatID);
                            //setQuestion(loadPhrase);
                        }
                        //se invece la risposta del contatto è true o false devo fare l'upgrade (o no) e resettare 
                        else {
                            //console.log("la risposta del contatto è già stata data ed è: "+current_statistics.current["statistics"][nomeCampoDiInteresse]);
                            //se la risposta dell'utente è true e la mia è true faccio l'upgrade
                            if(contactChoice==true && response==true){
                                //faccio upgrade
                                console.log("essendo la riposta true, cosi come la mia, faccio l'upgrade");
                                upgradeConversation(chatID,true,contactUid, contactName, currentUserName, contactToken, myToken, currentVisibility)
                                    .then((ris)=>{
                                        console.log("upgrade riuscito con successo");
                                        //invio due push notification
                                        //console.log("invio push notification a "+contactName+" con token "+contactToken+" e a me,"+currentUserName+", con token "+myToken);
                                        //sendPushNotification(contactToken, "Tu e "+currentUserName+" siete passati al livello successivo!","Congratulazioni, siete al livello "+current_level_of_visibility,{});
                                        //sendPushNotification(myToken, "Tu e "+contactName+" siete passati al livello successivo!","Congratulazioni, siete al livello "+current_level_of_visibility,{});
                                        console.log("push notification inviate");
                                    }).catch((e)=>{
                                        console.log("si è verificato un problema durante l'upgrade:"+e);
                                    })
                                

                            }
                            //altrimenti in qualsiasi altro caso resetto
                            else {
                                console.log("eseguo reset");
                                //resetto solo
                                await upgradeConversation(chatID,false,contactUid,contactName, currentUserName, contactToken, myToken, currentVisibility);
                                console.log("'continua con lo stesso livello di visibilità' riuscito con successo");
                            }
                        }

                    
                    console.log("Decisione presa:"+response);
                //disabilita bottoni (dovrei chiudere la schermata ma tanto la riaprirà subito il listener del documento modificato. Per evitare di lasciare la chat libera aspetto che sia lui a farlo, disabilitando intato i bottoni)
                }
                //setQuestion(loadPhrase);
            }catch(e){
                console.log("Errore nel prendere la decisione:"+e);
            }
        }
    }
 

    if(showDecisionScreen==true){
        return (
            <Animated.View style={{position:"absolute",opacity:opacityAnimation ,width:larghezzaDevice, height:altezzaDevice, justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <Animated.View style={{width:larghezzaDevice*0.9, height:altezzaDevice*0.7, backgroundColor:"white", top:motionAnimation, borderRadius:larghezzaDevice*0.02}}>
                        <View style={{flexGrow:1, borderTopRightRadius:larghezzaDevice*0.02, borderTopLeftRadius:larghezzaDevice*0.02, justifyContent:"center"}}>
                            <Text style={styles.title}>...parlate già da un pò</Text>
                        </View>
                        <View style={{height:"40%", justifyContent:"center", alignItems:"center", flexDirection:"row"}}>
                            <Animated.View style={[styles.contenitoreImmagineProfilo,{top: topTransitionAnimation,opacity:topOpacityAnimation, left:10, borderColor:"white", borderWidth:2}]}>
                                {uri1error== false && urlProfileImage!=null && <Image source={{uri: urlProfileImage}} resizeMode="cover"  style={styles.immagineProfilo} onError={()=>{setUri1Error(true)}} onLoadEnd={()=>{fromTopToBottomTransition(); fromTopToBottomOpacity()}} />}
                                {uri1error== true && urlProfileImage!=null && <Image  source={require('../../../../../../resources/images/img-profile-not-found.png')} resizeMode="cover"  style={styles.immagineProfilo} onLoadEnd={()=>{fromTopToBottomTransition(); fromTopToBottomOpacity()}} />}
                            </Animated.View>
                            <Animated.View style={[styles.contenitoreImmagineProfilo,{top:bottomTransitionAnimation,opacity:bottomOpacityAnimation, right:10,borderColor:"white", borderWidth:2}]}>
                                {uri2error==false && <Image source={{uri: urlProfileImageContactUser}} resizeMode="cover"  style={styles.immagineProfilo} onError={()=>{setUri2Error(true)}} onLoadEnd={()=>{fromBottomToTopTransition(); fromBottomToTopOpacity()}}/>}
                                {uri2error==true && <Image  source={require('../../../../../../resources/images/img-profile-not-found.png')} resizeMode="cover"  style={styles.immagineProfilo} onLoadEnd={()=>{fromBottomToTopTransition(); fromBottomToTopOpacity()}} />}
                            </Animated.View>
                        </View>
                        <View style={{flexGrow:1, justifyContent:"center", padding:1, margin:5}}>
                            <Text style={styles.question}>{question} {question==loadPhrase?contactName+"...":""}</Text>
                            {question!=loadPhrase && <Text style={styles.subquestion}>Sia tu che {contactName} dovrete essere daccordo, altrimenti continuerete per un altro pò prima che vi venga richiesto ancora.</Text>}
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