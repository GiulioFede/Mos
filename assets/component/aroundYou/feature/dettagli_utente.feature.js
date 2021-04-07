import React from "react";
import {View,Text, StyleSheet} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';

export default function DettagliUtente({_nome, _distanza}){

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    if(!Raleway)
        return <View></View>

    return (
        <View style={styles.container}>
            <Text style={styles.testo}>{_nome}</Text>
            <Text style={styles.testo2}>a {_distanza}km da te</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        justifyContent:"center",
        alignItems:"center"
    },
    testo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:30
        },
    testo2:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:20
        }
})