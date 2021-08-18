import React, {useState, useEffect, useContext, useRef} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import { altezzaDevice, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import AroundYouComponent from '../component/aroundYou.component';


export default function AroundYou({navigation, route}){
    
      return (
          //<View style={styles.container} >
                  <AroundYouComponent navigation={navigation} route={route}/>
         // </View>
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