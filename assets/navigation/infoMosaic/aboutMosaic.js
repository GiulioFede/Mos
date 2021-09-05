import React, {useEffect,useContext,useRef, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Dimensions, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { Divider} from 'react-native-paper';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloBarra, iconSize } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple } from "../../resources/colors";

export default function AboutMosaicScreen({navigation}){


   function tornaIndietro(){
        navigation.goBack();
   }

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={styles.container}>

            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={iconSize} color="#52575D" />
                </TouchableOpacity>
                <Text style={styles.titolo}>About Mosaic</Text>
            </View>

            <ScrollView>
                {/*DESCRIZIONE*/}
                <Text style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Questa sezione ospita le informazioni generali su Mosaic.</Text>

                <Divider />

                {/*COS E' MOSAIC*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Cos'è Mosaic?</Text>
                <Text style={styles.campo} >Mosaic è un'app di incontri alternativa. L'idea è di permettere a chiunque di farsi conoscere senza che l'aspetto fisico giochi alcun ruolo <Text style={{fontFamily:"Raleway_400Regular"}}>inizialmente</Text>. Infatti i profili degli utenti saranno mosaicizzati. Col tempo, misurando la qualità della conversazione, verrà richiesto ai due utenti una sgranatura che possa rendere più visibile il proprio profilo alla persona con cui si sta conversando, e solo se entrambi saranno d'accordo ciò avverrà. </Text>
                
                <Divider />

                {/*CHI SONO GLI UTENTI?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>A quali utenti è rivolto?</Text>
                <Text style={styles.campo} >Mosaic non esclude nessuno! L'app è rivolta a <Text style={{fontFamily:"Raleway_400Regular"}}>tutti</Text>. A chi si sente escluso dalle altre app di incontri, a chi sente una identità di genere che sia diversa dal sesso biologico assegnatogli alla nascita, a chi è incerto della propria identità e vuole sentirsi libero di scoprirla senza che nessuno possa giudicarlo e di rivelarla solo a chi merita. </Text>
                <Text style={styles.campo} >Attenzione! Mosaic non esclude proprio nessuno. Infatti è possibile che la conversazione vada cosi bene che l'aspetto fisico, quando i profili diventeranno meno mosaicizzati, passerà i secondo piano. Ma è ovviamente possibile che ciò non accada. In tal caso è possibile troncare la conversazione <Text style={{fontFamily:"Raleway_400Regular"}}>senza preoccuparsi che il contatto possa conoscere la propria identità</Text>.</Text>
                
                <Divider />

                {/*Come fa a garantire la privacy?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Come garantisce la privacy?</Text>
                <Text style={styles.campo} >Mosaic rende i propri profili mosaicizzati tramite manipolazioni fatte in <Text style={{fontFamily:"Raleway_400Regular"}}>Cloud</Text> (e non lato client) garantendo la privacy della propria immagine e lasciando al proprietario la libertà di mostrarsi a chi vuole solo quando avrà occasione di farlo. Inoltre, dietro le quinte, esistono diverse <Text style={{fontFamily:"Raleway_400Regular"}}>regole di sicurezza</Text> che garantiranno l'accesso ai propri dati solo agli utenti che dispongono dei permessi necessari. <Text style={{fontFamily:"Raleway_400Regular"}}>Non è mai possibile inviare immagini</Text> cosi da evitare contenuti inappropriati. Inoltre le conversazioni su Mosaic sono interamente <Text style={{fontFamily:"Raleway_400Regular"}}>vocali</Text> permettendo giusto lo scambio di qualche piccolo messaggio testuale. E' possibile eliminare le conversazioni oppure, nei casi più tragici, se l'utente con il quale si sta conversando dovesse risultare inappropriato, sarà possibile <Text style={{fontFamily:"Raleway_400Regular"}}>bloccarlo</Text> (con la possibilità di sbloccarlo in ogni momento).</Text>
                <Text style={styles.campo} >Attenzione! Tutte le conversazioni vengono memorizzate in <Text style={{fontFamily:"Raleway_400Regular"}}>locale</Text>. I messaggi vocali e testuali rimarrando in remoto solo fino a quando il contatto non li avrà prelevati.</Text>

                <Divider />

                {/*Schermate principali*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Le sue schermate principali</Text>
                <Text style={[styles.campo,{marginBottom:5}]} >Mosaic possiede tre schermate principali: </Text>
                <Text style={[styles.campo,{marginBottom:5}]}><Text style={{fontFamily:"Raleway_400Regular"}}>Chat:</Text> questa schermata ospita tutte le tue conversazioni. Ognuna mostra il relativo livello attuale di visibilità raggiunta con l'utente. Cliccando su ciascuna si aprono i relativi dettagli e sarà possibile conversare.</Text>
                <Text style={[styles.campo,{marginBottom:5}]}><Text style={{fontFamily:"Raleway_400Regular"}}>Around you:</Text> questa schermata ospita tutte le schede degli utenti che rispettano le tue preferenze impostate nella sezione <Text style={{fontFamily:"Raleway_400Regular"}}>Informazioni personali</Text> del menu laterale. Le schede sono ordinate per vicinanza geografica, genere di preferenza ed età. </Text>
                <Text style={styles.campo}><Text style={{fontFamily:"Raleway_400Regular"}}>Profile:</Text> questa schermata ospita il tuo profilo con la tua immagine principale, la tua galleria e le tue informazioni base inserite durante la registrazione. Una icona ad occhio sulla destra ti permetterà di vedere il tuo profilo con gli occhi di chi sta all'esterno, e quindi di vederlo nei 3 possibili livelli di mosaicizzazione che i tuoi contatti vedranno a seconda del grado di visibilità raggiunto.</Text>
            
                <Divider />

                {/*Come avviene la sgranatura?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Come avviene la sgranatura?</Text>
                <Text style={styles.campo} >Una nuova conversazione può nascere in due soli modi: un utente scopre il tuo profilo nella sezione Around you e avvia una conversazione, oppure sei tu stesso a scoprire qualcuno. All'inizio entrambi i profili saranno completamente mosaicizzati. Dopo un tot di messaggi scambiati vi verrà chiesto un eventuale upgrade di visibilità. Potrete monitorare quanto manca a tale richiesta dalla percentuale della barra in alto nella conversazione. Solo se entrambi sarete d'accordo ciò avverrà. Dopo due sgranature i profili saranno completamente visibili.</Text>
                
                <Divider />
            
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:"#fff",
        padding:5
    },
    titolo:{
        fontSize:fontSizeTitoloBarra*0.8,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        paddingBottom: 24,
    },
    barraSuperiore:{
        width:Dimensions.get("window").width,
        height: Dimensions.get("window").height*0.1,
        flexDirection:"row",
        justifyContent:"center",
        paddingTop:24,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
        textAlign:"center",
        backgroundColor:"#fff",

    },
    titoloCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        fontSize:fontSizeSottoTitolo,
        paddingHorizontal:Dimensions.get("window").width*0.03
    },
    campo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.3,
        paddingLeft:Dimensions.get("window").width*0.03,
        marginBottom:20
    },
})