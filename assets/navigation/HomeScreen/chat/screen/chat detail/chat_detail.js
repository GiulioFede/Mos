import React,{useEffect, useState} from "react"
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, Touchable} from "react-native"
import {Divider, FlatList} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali"
import { MosCeleste } from "../../../../../resources/colors";
import ListaMessaggi from "./listaMessaggi";

import * as firebase from 'firebase';
import 'firebase/firestore';
import { RSA } from "../../../../../context/local_storage/localStorage";

const Chat = [
    {
        id:"1",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"2",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"3",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"4",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"5",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"6",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    },
    {
        id:"7",
        author:"1920beebbe83bebfeub",
        timestamp: new Date(),
        tipo:"mex",
        content: 'Hey ciao!',
        details: "" //solo per l'audio
    }
]




export default function ChatDetail({ navigation,nome}){

    const [messaggio, setMessaggio] = useState("");

    function tornaIndietro(){
        navigation.goBack();
    }

    //tiene conto dell'ultima 

    function inviaMessaggio(){
/*
        var db = firebase.firestore();

        // Add a new document with a generated id.
        console.log("Aggiungo nuovo documento");
        db.collection("chats").doc('jWeGrG0ewsMicCGSeATI').collection("messages").add({
            author:"1920beebbe83bebfeub",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            tipo:"mex",
            content: 'Hey ciao!',
        })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            console.log(docRef.timestamp);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });*/

        //crittografaTesto(messaggio, "a");
        RSA();

    }

    useEffect(()=>{
        
        console.log("inizializzo ascoltatore collezione messaggi");
        var ultimaData = new Date("2021-05-02T09:33:00.105Z");
        var db = firebase.firestore();
        var unsubscribe = db.collection("chats").doc('jWeGrG0ewsMicCGSeATI').collection("messages").where("timestamp",">=",ultimaData)
                            .onSnapshot((docs)=>{
                                var i=0;
                                docs.forEach((doc)=>{
                                    console.log("documento "+i);
                                    console.log(doc.data().timestamp.toDate());
                                    i++;
                                })
                            });

        return () => {
            console.log("chat smontata...elimino il listening alla collezione messaggi");
            unsubscribe();
        }
    })
    
    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0,zIndex:10, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
                <Text style={styles.titolo}>Laura</Text>
                <TouchableOpacity style={{position:"absolute", right:Dimensions.get("window").width*0.04}}>
                    <Octicons name="kebab-vertical" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
            </View>

            <View style={{height:altezzaDevice-altezzaMenuNavigazione-altezzaBarraScreen}}>
                <ListaMessaggi lista={Chat}/>
            </View>
            
            {/*TASTIERA*/}
            <View style={styles.tastiera}>
                <TextInput
                    style={styles.input}
                    maxLength={15}
                    onChangeText={(text)=>{setMessaggio(text)}}
                    value={messaggio}
                    placeholder="scrivi un breve messaggio..."
                    keyboardType="default"
                />
                <TouchableOpacity onPress={inviaMessaggio} style={styles.inviaMessaggio}>
                    <Ionicons name="arrow-redo" size={fontSizeTitoloBarra} color={MosCeleste} />
                </TouchableOpacity>
                <Divider/>
            </View>
            <View style={styles.pulsanteAudio}>
                <MaterialIcons name="multitrack-audio" size={fontSizeTitoloBarra} color="white" />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      height: Dimensions.get("window").height,
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
        backgroundColor:"#fff"
    },
    tastiera:{
        backgroundColor:"#fff",
        position:"absolute",
        bottom:0,
        width: larghezzaDevice,
        height: altezzaMenuNavigazione*2.5,
    },
    input:{
        paddingLeft:10,
        fontSize:fontSizeCampi,
        width:larghezzaDevice*0.8,
        height:altezzaMenuNavigazione
    },
    pulsanteAudio:{
        position:"absolute",
        left:larghezzaDevice/2-altezzaMenuNavigazione*1.3/2,
        bottom:altezzaMenuNavigazione*0.1,
        backgroundColor:MosCeleste,
        fontSize:fontSizeCampi,
        justifyContent:"center",
        alignItems:"center",
        width:altezzaMenuNavigazione*1.3,
        height:altezzaMenuNavigazione*1.3,
        borderRadius:altezzaMenuNavigazione*1.3/2,
        elevation:5
    },
    inviaMessaggio:{
        position:"absolute",
        backgroundColor:"white",
        right: 10,
        bottom:altezzaMenuNavigazione*1.5,
        width:altezzaMenuNavigazione,
        height:altezzaMenuNavigazione,
        justifyContent:"center",
        alignItems:"center"
    }


})