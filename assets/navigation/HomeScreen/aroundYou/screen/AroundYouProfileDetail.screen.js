import React, {useState, useEffect, useContext, useRef} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import { altezzaDevice, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import AroundYouProfileDetailsComponent from '../component/aroundYouProfileDetails.component';


export default function AroundYouProfileDetails({navigation, route}){
    
      return (
          <View style={styles.container} >
                  <AroundYouProfileDetailsComponent navigation={navigation} route={route}/>
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