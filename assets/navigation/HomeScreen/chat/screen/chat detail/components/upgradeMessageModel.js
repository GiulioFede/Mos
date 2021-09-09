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
import LottieView from 'lottie-react-native';
import i18n from 'i18n-js'

export default function UpgradeMessageModel({type,contactName, mostraNuovaData}){

    let date = new Date();

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    function getData(){
        if(mostraNuovaData==true){
            let data_str = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
            return( 
                <Text style={styles.dataCentrale}>{data_str}</Text>
            )
        }
    }

    function getTimestamp(){
            let time_str = date.getHours()+":"+date.getMinutes();
            return( 
                <Text style={styles.timestampOrarioUtenteCorrente}>{time_str}</Text>
            )
    }

        return (
                <View style={styles.container}>
                    {getData()}
                    <View style={styles.areaMessaggio}>
                        <LottieView autoPlay loop={true} source={require('../../../../../../resources/lottie/upgradeAnimation.json')} resizeMode="cover" />
                        {type=="upgrade_1" &&
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.mexUpgrade}>{i18n.t('upgradeMessage_pt1')}{contactName}{i18n.t('upgradeMessage1_pt2')}</Text>
                        }
                        {type=="upgrade_2" &&
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.mexUpgrade}>{i18n.t('upgradeMessage_pt1')}{contactName}{i18n.t('upgradeMessage2_pt2')}</Text>
                        }
                        <View style={{flexDirection:"row", alignSelf:"flex-end"}}>     
                                {getTimestamp()}
                        </View>
                        </View>
                </View>
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
    mexUpgrade:{
        fontSize:fontSizeCampi*1.2,
        color:"#52575D",
        fontFamily: "Raleway_200ExtraLight",
        textAlign:"center"
    },
    timestampOrarioUtenteCorrente: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        alignSelf:"center",
        textAlignVertical:"center"
    },
    dataCentrale:{
        paddingBottom:40,
        textAlign:"center",
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.5
    }
  });