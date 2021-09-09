import React, {useEffect,useContext,useRef, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Dimensions, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { Divider} from 'react-native-paper';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloBarra, iconSize } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple } from "../../resources/colors";
import i18n from 'i18n-js';

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
                <Text style={styles.titolo}>{i18n.t('aboutMosaic')}</Text>
            </View>

            <ScrollView>
                {/*DESCRIZIONE*/}
                <Text style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('aboutMosaicSectionDescription')}</Text>

                <Divider />

                {/*COS E' MOSAIC*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('whatIsMosaic')}</Text>
                <Text style={styles.campo} >{i18n.t('whatIsMosaicDescription_pt1')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('whatIsMosaicDescription_pt2')}</Text>{i18n.t('whatIsMosaicDescription_pt3')}</Text>
                
                <Divider />

                {/*CHI SONO GLI UTENTI?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('whatUsers')}</Text>
                <Text style={styles.campo} >{i18n.t('whatUsersDescription_pt1')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('whatUsersDescription_pt2')}</Text>{i18n.t('whatUsersDescription_pt3')}</Text>
                <Text style={styles.campo} >{i18n.t('whatUsersDescription_pt4')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('whatUsersDescription_pt5')}</Text>.</Text>
                
                <Divider />

                {/*Come fa a garantire la privacy?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('privacy')}</Text>
                <Text style={styles.campo} >{i18n.t('privacy_pt1')}<Text style={{fontFamily:"Raleway_400Regular"}}>Cloud</Text>{i18n.t('privacy_pt2')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('privacy_pt3')}</Text>{i18n.t('privacy_pt4')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('privacy_pt5')}</Text>{i18n.t('privacy_pt6')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('privacy_pt7')}</Text>{i18n.t('privacy_pt8')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('privacy_pt9')}</Text>{i18n.t('privacy_pt10')}</Text>
                <Text style={styles.campo} >{i18n.t('privacy_pt11')}<Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('privacy_pt12')}</Text>{i18n.t('privacy_pt13')}</Text>

                <Divider />

                {/*Schermate principali*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('mainWindows')}</Text>
                <Text style={[styles.campo,{marginBottom:5}]} >{i18n.t('mainWindows_pt1')}</Text>
                <Text style={[styles.campo,{marginBottom:5}]}><Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('mainWindows_pt2')}</Text>{i18n.t('mainWindows_pt3')}</Text>
                <Text style={[styles.campo,{marginBottom:5}]}><Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('mainWindows_pt4')}:</Text>{i18n.t('mainWindows_pt5')}<Text style={{fontFamily:"Raleway_400Regular"}}> {i18n.t('personalInformation')}</Text>{i18n.t('mainWindows_pt6')}</Text>
                <Text style={styles.campo}><Text style={{fontFamily:"Raleway_400Regular"}}>{i18n.t('profile')}:</Text>{i18n.t('mainWindows_pt7')}</Text>
            
                <Divider />

                {/*Come avviene la sgranatura?*/}
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('howWorks')}</Text>
                <Text style={styles.campo} >{i18n.t('howWorksDescription')}</Text>
                
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