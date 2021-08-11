import React, {useState, useEffect, useContext, useRef} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { AutenticazioneUtente } from '../../../../context/firebase/autenticazione';
import { altezzaDevice, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../../resources/colors';

import ProfileComponent from './component/profile.component';


export default function Profile({navigation, route}){
    
      return (
          <View style={styles.container} >
                  <ProfileComponent navigation={navigation} route={route}/>
          </View>
      )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#fff"
    },
    loadingArea: {
      width: larghezzaDevice,
      height: altezzaDevice,
      justifyContent:"center",
      alignItems:"center"
    }
  });