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
import { MosCeleste } from '../../../../../../resources/colors';

export default function TextMessageModel({messaggio}){

    return (
        <View style={styles.container}>
            <View style={styles.formaMessaggio}>
                <Text style={styles.mex}>mbbrebe dbvfvjbj ed</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({  
    container:{
        margin:10,
        maxWidth:larghezzaDevice*0.7,
    },
    formaMessaggio: {
        backgroundColor:MosCeleste,
        elevation:3,
        padding:10,
        borderTopLeftRadius:15,
        borderTopRightRadius:15,
        borderBottomLeftRadius:15
    },
    mex:{
        fontSize:fontSizeCampi,
        color:"white"
    }
  });
