import React from "react";
import {View,Text, StyleSheet, Image, Dimensions} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import DettagliUtente from "./dettagli_utente.feature";
import { MosCeleste } from "../../../../../resources/colors";

const {width,height}= Dimensions.get("window");
const ITEM_SIZE= width*0.72;
const BACKDROP_HEIGHT = height*0.6;

export const MiniaturaImmagineProfilo =({nome, distanza,urlImmagineProfilo}) => {

    return (
        <View style={{padding:10}}>
            {/* IMMAGINE PROFILO */}
            <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine SOSTITUIRE CON QUELLA DELL'UTENTE*/}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={require("../../../../../../assets/resources/images/profilePicture2.jpg")} resizeMode="cover"  style={styles.immagineProfilo}></Image>
                        </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* icona chat */}
                        <View style={styles.chatIcon}>
                            <Ionicons name="ios-chatbubble-outline" size={17} color={MosCeleste} />
                        </View>
            </View>
            {/* Dettagli utente*/}
            {console.log(nome)}
            <DettagliUtente _nome={nome} _distanza={distanza}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      flex:1
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreMediaProfilo:{
        alignSelf:"center",
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    contenitoreImmagineProfilo: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: "hidden",
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 4
            }
        })
    },
    onlineCircle: {
        backgroundColor: "#00ff40",
        elevation: 10,
        position: "absolute",
        bottom: 18,
        left:11,
        padding:4, 
        height:15,
        width: 15,
        borderRadius:10
    },
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        bottom: 0,
        right: -10,
        width: 40,
        height: 40,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        margin:8
    }
  });