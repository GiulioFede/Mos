// Import react
import React, { useRef, useEffect } from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { ActivityIndicator } from 'react-native-paper';
import { altezzaDevice, fontSizeCampi, larghezzaDevice } from '../../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple, MosViola } from '../../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { Feather } from '@expo/vector-icons'; 


const ref = function MessageModel({messaggio, utenteCorrente, mostraNuovaData}){

    let data = new Date(messaggio.date);

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    function getData(){
        if(mostraNuovaData==true){
            console.log("ritorno data");
            let data_str = data.getFullYear()+"/"+data.getMonth()+"/"+data.getDate();
            return( 
                <Text style={styles.dataCentrale}>{data_str}</Text>
            )
        }
    }

    function getTimestamp(){
        if(messaggio.author==utenteCorrente){
            console.log("ritorno timestamp");
            let time_str = data.getHours()+":"+data.getMinutes();
            return( 
                <Text style={styles.timestampOrarioUtenteCorrente}>{time_str}</Text>
            )
        }else {
            console.log("ritorno timestamp");
            let time_str = data.getHours()+":"+data.getMinutes();
            return( 
                <Text style={styles.timestampOra}>{time_str}</Text>
            )
        }
    }
    //se il messaggio è stato inviato dall'utente corrente
    if(messaggio.author==utenteCorrente){
            return (
                <View style={styles.container}>
                    {getData()}
                    <View style={styles.areaMessaggio}>
                        <Text style={styles.mexUtenteCorrente}>{messaggio.content}</Text>
                        <View style={{flexDirection:"row", alignSelf:"flex-end"}}>     
                                {getTimestamp()}
                                <View style={{justifyContent:"center"}}>
                                    {messaggio.state=="in-progress" && <ActivityIndicator size={fontSizeCampi*0.8} color={MosCeleste} />}
                                    {messaggio.state=="failed" && <Feather name="x" size={fontSizeCampi*0.8} color="red" />}
                                </View>
                        </View>
                        <View style={styles.bordoInferioreUtenteCorrente}/>
                    </View>
                </View>
            )
    }
    //se il messaggio è stato inviato dal contatto
    else {
    return (
            <View style={styles.container}>
                {getData()}
                <View style={styles.areaMessaggio}>
                    <Text style={styles.mex}>{messaggio.content}</Text>
                    {getTimestamp()}
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
        maxWidth:larghezzaDevice
    },
    areaMessaggio: {
        padding:10
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