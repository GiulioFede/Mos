// Import react
import React from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions
} from 'react-native'
import { fontSizeCampi, larghezzaDevice } from '../../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple } from '../../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';

export default function MessageModel({messaggio, utenteCorrente}){

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    //se il messaggio è stato inviato dal contatto
    if(messaggio.author==utenteCorrente){
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
    else {
    return (
            <View style={styles.container}>
                <View style={styles.areaMessaggio}>
                    <Text style={styles.mex}>{messaggio.content}</Text>
                    <Text style={styles.timestampOra}rio>15:32</Text>
                    <View style={styles.bordoInferiore}/>
                </View>
            </View>
        )
    }
}

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
        paddingTop:15,
        textAlign:"right"
    },
    bordoInferioreUtenteCorrente: {
        borderBottomColor:MosCeleste,
        borderBottomWidth:4,
        width:larghezzaDevice*0.16,
        paddingTop:15,
        alignSelf:"flex-end"
    }
  });