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


const ref = function RecordingKeyboard({messaggio, utenteCorrente}){


    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
    return (
        <View>
            <Text>Recording Keyboard</Text>
        </View>
    )

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
  });