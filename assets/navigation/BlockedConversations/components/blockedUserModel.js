// Import react
import React from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { altezzaBarraScreen, fontSizeCampi, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';
import { FontAwesome, Feather } from '@expo/vector-icons'; 
import { MosCeleste, MosPurple, MosViola } from '../../../resources/colors';
import { fromDateToGGMMYYYYHHMM } from '../../../context/utilities/functions.utilities';
import { Divider } from 'react-native-paper';
import i18n from 'i18n-js';

export default function BlockedUserModel({user, index, unlockContact}){

    console.log("Modello bloccato");
    console.log(user);

    return (
        <View style={styles.container}>
            <View style={{flexDirection:"row"}}>
                <FontAwesome name="lock" size={altezzaBarraScreen*0.6} color={MosPurple} style={{paddingRight:10}}/>
                <View>
                    <Text style={styles.name}>{user.contactName}</Text>
                    <Text style={styles.blocked}>{i18n.t('blockedModelTitle')} {fromDateToGGMMYYYYHHMM(parseInt(user.lock_timestamp/1000))}</Text>
                </View>
            </View>
            
            <Divider style={{width:larghezzaDevice*0.7,alignSelf:"center", marginVertical:5}} />

            <TouchableOpacity onPress={()=>{unlockContact(index)}} >
                <View style={{backgroundColor:MosCeleste, padding:5, borderRadius:altezzaBarraScreen*0.15, width:larghezzaDevice*0.7, alignSelf:"center", flexDirection:"row", justifyContent:"center"}}>
                    <Feather name="unlock" size={altezzaBarraScreen*0.3} color="white" style={{paddingRight:10}} />
                    <Text style={styles.unlock}>{i18n.t('blockedModelButton')}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({  
    container:{
        width:larghezzaDevice,
        padding:10,
        margin:10
    },
    name:{
        fontFamily: "Raleway_200ExtraLight",
        color: MosViola,
        fontSize:altezzaBarraScreen*0.25
    },
    blocked:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:altezzaBarraScreen*0.2,
        marginTop:altezzaBarraScreen*0.05
    },
    unlock:{
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
        fontSize:altezzaBarraScreen*0.2,
        textAlignVertical:"center",
        textAlign:"center"
    }
  });
