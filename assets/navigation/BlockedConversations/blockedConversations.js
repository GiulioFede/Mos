import React, {useEffect,useContext,useRef, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Dimensions} from 'react-native';
import Svg, {G, Circle} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons'; 
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import BlockedUserModel from "./components/blockedUserModel";
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloBarra, iconSize } from "../../context/variabili_globali/variabiliGlobali";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { MosCeleste, MosPurple } from "../../resources/colors";
import { Divider} from 'react-native-paper';
import Loading from "../HomeScreen/aroundYou/component/loading";
import SnackMessage from "../HomeScreen/profile/screen/component/snackMessage";
import i18n from 'i18n-js';

export default function BlockedConversationsScreen({navigation}){


   //contesto
   const {conversazioniBloccate,setConversazioniBloccate, unlockContact} = useContext(AutenticazioneUtente);

   //array contenente le conversazioni bloccatr
   const [utentiBloccati, setUtentiBloccati] = useState([]);

   const loadingRef = useRef();
   const snackMessageRef = useRef();

   function tornaIndietro(){
        navigation.goBack();
   }

   async function unlockCurrentContact(index){
       try{
        loadingRef.current.on();
        console.log("sto per sbloccare contatto "+index);
        console.log(utentiBloccati[index]);
        await unlockContact(utentiBloccati[index].name,utentiBloccati[index].lock_timestamp,utentiBloccati[index].uid)
        loadingRef.current.off();
        utentiBloccati.splice(index,1);
        console.log(utentiBloccati);
        setConversazioniBloccate([...utentiBloccati]);
       }catch(e){
           loadingRef.current.off();
           snackMessageRef.current.setta_messaggio_da_mostrare(i18n.t('err_generic'));
           console.log(e);
       }
   }

    //carico le conversazioni bloccate, e le ricarico se ci sono novità
    useEffect(()=>{
        console.log("conversazioni bloccate");
        console.log(conversazioniBloccate);
        if(conversazioniBloccate!=null && conversazioniBloccate!=undefined)
            setUtentiBloccati([...conversazioniBloccate]);
    },[conversazioniBloccate])


    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={styles.container}>

            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={iconSize} color="#52575D" />
                </TouchableOpacity>
                <Text style={styles.titolo}>{i18n.t('blockedUsers')}</Text>
            </View>

            {/*DESCRIZIONE*/}
            <Text style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('blockedUsersDescription')}</Text>
            
            <Divider />

            <FlatList
                data={utentiBloccati}
                keyExtractor={(item) => item.uid}
                renderItem = {({item, index}) => {
                    console.log(item);
                    return (
                    <>
                    <BlockedUserModel user={item} index={index} unlockContact={unlockCurrentContact} />
                    <Divider />
                    </>
                    )
                }}
            />

            <Loading ref={loadingRef} />
            <SnackMessage ref={snackMessageRef}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:"#fff"
    },
    titolo:{
        fontSize:fontSizeTitoloBarra*0.8,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        paddingBottom: 24,
    },
    barraSuperiore:{
        width:Dimensions.get("window").width,
        height: Dimensions.get("window").height*0.1,
        flexDirection:"row",
        justifyContent:"center",
        paddingTop:24,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
        textAlign:"center",
        backgroundColor:"#fff",

    },
    titoloCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        fontSize:fontSizeSottoTitolo,
        paddingHorizontal:Dimensions.get("window").width*0.03
    },
    campo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.3,
        paddingLeft:Dimensions.get("window").width*0.03
    },
})