import React, {useState, useEffect,useContext, useRef} from "react";
import {View, StyleSheet, Image,Text,TouchableOpacity, Animated} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import {useFonts as useFonts3, Lobster_400Regular} from '@expo-google-fonts/lobster';
import MessageBubble from "./message_bubble";
import { Divider } from "react-native-paper";
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple, MosViola } from "../../../../../../resources/colors";
import { AutenticazioneUtente } from "../../../../../../context/firebase/autenticazione";
import { fromDateToHHMM } from "../../../../../../context/utilities/functions.utilities";
import LottieView from 'lottie-react-native';

function getVisibilityString(num){
    if(num==0){
        return "Visibilità: 33%";
    }
    else if(num==1){
        return "Visibilità: 66%"
    }
    else if(num==2){
        return "Visibilità: 100%"
    }
}


/*
    content ha la seguente struttura:
        Object {
        "lastMessage": Object {
            "author": null,
            "timestamp": null,
            "type": null,
            "value": null,
            },
        "numberOfMessages": 0,
        }   

*/

let THRESHOLD = 3;

const ChatPreview =({navigation,informazioniPersonaliContatto, chatId, nome,contactUid, content,creationData, route,indicePosizioneChatInArray, ordinaListaChat, token}) => {

    //console.log("Chat ID di "+nome+" -->");
    //console.log(chatId);
    //console.log("Chat CONTENT-->");
    //console.log(creationData);

    const [lastContent, setLastContent] = useState(content);
    const ascoltatoreUltimoMessaggio = useRef(null);
    const [ultimoMessaggioDoc, setUltimoMessaggioDoc] = useState(null);
    const [media, setMedia] = useState(null)
    const [visibility, setVisibility] = useState(-1);
    const isMounted = useRef(true);
    const [radarVisibility, setRadarVisibility] = useState(false); //true solo quando manca la mia risposta
    const [fireworksVisibility, setFireworksVisibility] = useState(false);
    const {ottieniAscoltatoreUltimoMessaggio, user, getMediaProfiloContatto} = useContext(AutenticazioneUtente);

    function apriDettagliChat(){
        console.log("apro dettagli chat con utente "+contactUid+", chatId:"+chatId);
        navigation.navigate("Chat detail",{chatId: chatId, contactUid: contactUid, name: nome, token: token, urlProfileImageContactUser:media.profileImageUrl, creationData:creationData, visibilityBeforeOpenChatDetail: visibility});
    }

    function apriDettagliProfilo(){
        navigation.navigate("Contact profile",{informazioniProfiloUtente:informazioniPersonaliContatto, mediaProfilo: media});
    }

    const [uriProfileImage, setUriProfileImage] = useState(null) //useState(media.value.profileImageUrl=="" ? null : media.value.profileImageUrl);

    const transitionAnimation = useRef(new Animated.Value(20)).current;
    const transitionProfileImage = () => {
        Animated.timing( transitionAnimation, {
           toValue: 0,
           duration: 1000,
           useNativeDriver: false
        }).start();
    }

    const opacityAnimation = useRef(new Animated.Value(0)).current;
    const opacityTransition = () => {
        Animated.timing( opacityAnimation, {
           toValue: 1,
           duration: 900,
           useNativeDriver: true
        }).start();
    }
  
    useEffect(()=>{
        isMounted.current == true;

        return () =>{
            isMounted.current = false;
        }
    },[])
    

    useEffect(()=>{

        let ultimaVisibilità = -1;
        async function ascoltaUltimoMessaggio(){
            try{
                ascoltatoreUltimoMessaggio.current = ottieniAscoltatoreUltimoMessaggio(chatId)
                    .onSnapshot(
                        { includeMetadataChanges: true },
                        async(doc) => {
                            try{
                                if(doc.metadata.hasPendingWrites==false){
                                    console.log("ultimo messaggio ricevuto:");
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
                                    let lastMex = doc.data();
                                    //console.log(lastMex);
                                    if(lastMex!=undefined){
                                        if(isMounted.current==true){
                                        console.log("ultima visibilità con "+nome+": "+lastMex.level_of_visibility+", corrente visibilità:"+ultimaVisibilità);
                                        //se la visibilità è cambiata rispetto a prima --> fai apparire i fireworks
                                        if(lastMex.level_of_visibility>ultimaVisibilità && lastMex.level_of_visibility>0 && ultimaVisibilità>=0)
                                            setFireworksVisibility(true);
                                        else
                                            setFireworksVisibility(false);
                                        ultimaVisibilità = lastMex.level_of_visibility;
                                        setVisibility(lastMex.level_of_visibility);
                                        //se manca solo la mia risposta, setto il radar
                                        let contactResponse = contactUid+"_response";
                                        let myResponse = user+"_response";
                                        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA");
                                        console.log(lastMex.statistics[contactResponse]);
                                        console.log(lastMex.statistics[myResponse]);
                                        console.log(lastMex.statistics["number_of_messages"]);
                                        if(lastMex!=undefined && lastMex.statistics[contactResponse]!=null && lastMex.statistics[myResponse]==null && lastMex.statistics["number_of_messages"]>=THRESHOLD)
                                            setRadarVisibility(true);
                                        else
                                            setRadarVisibility(false);

                                        //setUltimoMessaggioDoc(JSON.parse(JSON.stringify(lastMex)));
                                        //avviso la classe superiore di renderizzare l'intera lista (peccato, potremmo farlo qui, ma è necessario per mettere sopra l'ultima chat)
                                        ordinaListaChat(indicePosizioneChatInArray,lastMex);
                                        }
                                    }
                                }
                            }catch(e){
                                console.log("Si è verificato un errore durante la ricezione/elaborazione delle statistiche:"+e);       
                            }
                });

            }catch(e){
                console.log("errore nell'ascoltare ultimo messaggio:"+e);
            }
        }

        ascoltaUltimoMessaggio();

        return () =>{
            console.log("rimuovo ascoltatore ultimo messaggio");
            if(ascoltatoreUltimoMessaggio.current!=null) ascoltatoreUltimoMessaggio.current();
        }
    },[])

    useEffect(()=>{

        async function caricaProfiloContatto(){
            let current_visibility = visibility==0?"100":(visibility==1)?"50":"0";
            console.log("carico profilo del contatto "+nome+" con visibilità "+current_visibility);
            getMediaProfiloContatto(contactUid,current_visibility)
                .then((media)=>{
                    if(isMounted.current==true){
                        setMedia(media.data());
                        //può capitare che l'utente si elimini l'account e lasci qualche riferimento a noi (al 99% mai)
                        setUriProfileImage((media.data()!=undefined && media.data()!=null)?media.data().profileImageUrl:null);
                    }
                })
        }

        if(visibility>=0){
            caricaProfiloContatto();
        }
    },[visibility])


    //carico font
    let [LobsterFont] = useFonts3({Lobster_400Regular});
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2 || lastContent==undefined || isMounted.current==false)
            return <View></View>

    return (
        <Animated.View style={{marginVertical:0.5,opacity:opacityAnimation}}>
            {uriProfileImage && media!=null && (lastContent.lastMessage.value==null) && <Animated.Image source={{uri:uriProfileImage}} resizeMode="cover"  style={{position:"absolute", width:"100%", height:"100%"}} blurRadius={5} onLoadEnd={()=>{opacityTransition();}} onError={(e)=>{setUriProfileImage(null); opacityTransition();}}></Animated.Image>}
            {fireworksVisibility==true &&
                <View style={{width:"100%", height:"100%",position:"absolute"}}>
                    <LottieView autoPlay loop={true} source={require('../../../../../../resources/lottie/upgradeAnimation.json')} resizeMode="cover" />
                </View>
                } 
        <TouchableOpacity activeOpacity={.7} style={[styles.container,{}]} onPress={()=>{apriDettagliChat()}}>
            {/* IMMAGINE PROFILO */}
            {media!=null &&
            <Animated.View style={[styles.contenitoreMediaProfilo,{top:transitionAnimation}]}>
                {radarVisibility &&
                <View style={styles.contenitoreRadar}>
                    <LottieView autoPlay loop={true} source={require('../../../../../../resources/lottie/radar_animation.json')} resizeMode="cover" />
                </View> 
                }
                <TouchableOpacity onPress={()=>{apriDettagliProfilo()}} style={[styles.contenitoreImmagineProfilo,{borderColor:"white", borderTopWidth:1, borderBottomWidth:1, borderLeftWidth:1, borderRightWidth:1 }]}  >
                        {uriProfileImage && <Animated.Image source={{uri:uriProfileImage}} resizeMode="cover"  style={[styles.immagineProfilo,{}]} onLoadEnd={()=>{if(isMounted.current==true){transitionProfileImage(); opacityTransition();}}} onError={(e)=>{if(isMounted.current==true){ setUriProfileImage(null); transitionProfileImage();opacityTransition();}}}></Animated.Image>}
                        {!uriProfileImage && <Text style={{position:"absolute", textAlign:"center", color:"white", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                </TouchableOpacity>
                <View style={[styles.ultimoMessaggio,{opacity:1}]}>
                    <MessageBubble messaggio={lastContent.lastMessage.value} type={lastContent.lastMessage.type} author = {lastContent.lastMessage.author} currentUser={user}/>
                </View>        
            </Animated.View>
            }
                    
            <View style={styles.contenitoreInfo}>
                {/* nome */}
                <View style={styles.contenitoreNome}>
                    <View style={{padding:5}}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nome,{color:(lastContent.lastMessage.value==null)?"white":"#52575D", textShadowColor:(lastContent.lastMessage.value==null)?'#444':'transparent',textShadowOffset:(lastContent.lastMessage.value==null)?{width: 1, height: 1}:{width:0, height:0},textShadowRadius:(lastContent.lastMessage.value==null)?1:0}]}>{nome}</Text>
                    </View>
                {/* livello di visibilità */}
                <Divider  />
                {lastContent.level_of_visibility!=undefined && lastContent.level_of_visibility!=null &&
                <View style={styles.contenitoreLivelloDiVisibilita}>
                    <Text style={styles.livelloDiVisibilita}>{getVisibilityString(visibility)}</Text>
                </View>
                } 
                </View>
               {/* data ultimo messaggio */}
               {lastContent.lastMessage.timestamp!=null  && lastContent.lastMessage.timestamp!=undefined &&
                <View style={styles.contenitoreDataUltimoMessaggio}>
                    <Text style={[styles.dataUltimoMessaggio,{color:lastContent.lastMessage.value==null?"white":"#52575D", textAlign:"right"}]}>{fromDateToHHMM(lastContent.lastMessage.timestamp)}</Text>
                </View>
                }
                {/* NEW se la chat è inviolata */}
               {(lastContent.lastMessage.timestamp==null || lastContent.lastMessage.timestamp==undefined) &&
                <View style={styles.contenitoreDataUltimoMessaggio}>
                    <Text style={[styles.dataUltimoMessaggio,{color:"orange", textAlign:"right", textShadowColor:(lastContent.lastMessage.value==null)?'#444':'transparent',textShadowOffset:(lastContent.lastMessage.value==null)?{width: 1, height: 1}:{width:0, height:0},textShadowRadius:(lastContent.lastMessage.value==null)?1:0}]}>NEW</Text>
                </View>
                }    
        </View>
        </TouchableOpacity>
        </Animated.View>
    )
}

export default ChatPreview;

const styles = StyleSheet.create({
    container: {
        borderBottomColor:"#e6e6e6",
        height:altezzaDevice*0.2,
        marginVertical:5,
        flexDirection:"row",
    },
    contenitoreMediaProfilo:{
        justifyContent:"center",
        width:larghezzaDevice*0.5,
        height:altezzaDevice*0.2,
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    onlineCircle: {
        backgroundColor: "#00ff40",
        elevation: 10,
        position: "absolute",
        bottom: altezzaDevice*0.2*0.065,
        left:altezzaDevice*0.22/4,
        height:altezzaDevice*0.2*0.07,
        width: altezzaDevice*0.2*0.07,
        borderRadius:altezzaDevice*0.2*0.07/2
    },
    contenitoreImmagineProfilo: {
        width: altezzaDevice*0.2,
        height: altezzaDevice*0.2,
        borderRadius: altezzaDevice*0.2/2,
        overflow: "hidden",
        position:"absolute",
        zIndex: 10,
        left:altezzaDevice*0.02,
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 7
            }
        })
    },
    contenitoreRadar: {
        width: altezzaDevice*0.23,
        height: altezzaDevice*0.23,
        borderRadius: altezzaDevice*0.2/23,
        left:altezzaDevice*0.005,
        overflow: "hidden",
        position:"absolute"
    },
    contenitoreInfo: {
        width:larghezzaDevice*0.46
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined,
    },
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        bottom: 0,
        left: 140,
        width: 40,
        height: 40,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        margin:8
    },
    contenitoreNome:{
        position:"absolute",
        left: larghezzaDevice*0.5*0.1,
        top:altezzaDevice*0.03,
        zIndex:10,
    },
    nome:{
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeSottoTitolo*1.1
    },
    contenitoreDataUltimoMessaggio:{
        position:"absolute",
        zIndex:10,
        width:"100%"
    },
    dataUltimoMessaggio:{
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeCampi*0.8,
    },
    contenitoreLivelloDiVisibilita:{
        backgroundColor:"orange",
        padding:5,
        margin:5,
        borderRadius:10,
        alignSelf: 'flex-start'
    },
    livelloDiVisibilita:{
        fontFamily: "Raleway_400Regular",
        color: "white",
        fontSize:fontSizeCampi*0.8,
        fontStyle:"italic",
    },
    ultimoMessaggio: {
        position: "absolute",
        left:altezzaDevice*0.22/2+altezzaDevice*0.02,
        bottom:0,
        zIndex:10,
        elevation:8
    },
    newTabContainer: {
        position:"absolute",
        backgroundColor:MosViola,
        zIndex:20,
        elevation:20,
        top:0,
        left: larghezzaDevice*0.5/2+larghezzaDevice*0.5/4.5,
        borderRadius:larghezzaDevice*0.02,
        borderColor:"white",
        borderWidth:1
    },
    newTab: {
        padding:5,
        color:"white"
    },
    waitMessage:{
        fontFamily: 'Lobster_400Regular',
        fontSize:fontSizeCampi,
        color:MosViola
    }
})

