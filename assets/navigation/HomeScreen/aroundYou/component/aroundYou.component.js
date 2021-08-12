import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Entypo} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import { altezzaBarraScreen, fontSizeTitoloBarra, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../../resources/colors';
import SnackMessage from '../../profile/screen/component/snackMessage';

import {geohashQueryBounds} from "geofire-common";

export default function AroundYouComponent(props){
    
    const [isLoading, setIsLoading] = useState(true);

    const snackMessageRef = useRef();
    var {navigation, route} = props;

    //APRO MENU
    function apriUserSettings(){
        //navigation.openDrawer();
 
    }

    useEffect(()=>{

        //DA ELIMINARE
        // Find cities within 50km of London
        const center = [51.5074, 0.1278];
        const radiusInM = 50 * 1000;

        // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
        // a separate query for each pair. There can be up to 9 pairs of bounds
        // depending on overlap, but in most cases there are 4.
        console.log("NEIGHBORHOODS")
        const bounds = geohashQueryBounds(center, radiusInM);
        console.log(bounds);
        const promises = [];
        for (const b of bounds) {
            console.log(b);

        }
    },[])

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Around You</Text>
                <ActivityIndicator animating={isLoading} size={fontSizeTitoloBarra} color={MosCeleste} style={{position:"absolute", left:Dimensions.get("window").width*0.03}} />
            </View>
            <View style={[styles.container,{backgroundColor:"red", flex:1}]}>

            </View>
                
            {/*MOSTRA L'ERRORE */}
            <SnackMessage ref = {snackMessageRef} />


                        
</>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice,
    },
    barraSuperiore:{
        width:larghezzaDevice,
        height:altezzaBarraScreen,
        justifyContent:"center",
        paddingTop:24,
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
    
  });