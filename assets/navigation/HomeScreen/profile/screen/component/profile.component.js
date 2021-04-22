import React from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, StatusBar} from 'react-native';
import {MaterialIcons, Ionicons} from "@expo/vector-icons";
import { MosCeleste } from '../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB } from 'react-native-paper';
import {navbarHeight, fontSizeTitolo } from '../../../../../context/variabili_globali/variabiliGlobali';

/*
    MISURE
    altezza barra profilo --> 10%
    altezza sezione immagine profilo --> 30%
    altezza area dettagli utenti --> 10%

    altezza area galleria
*/
const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSchermo = Dimensions.get("window").height;
const altezzaBarraProfilo = Dimensions.get("window").height*0.1;
const altezzaSezioneImmagineProfilo = Dimensions.get("window").height*0.3;
const altezzaDettagliUtenti = Dimensions.get("window").height*0.1;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.5-navbarHeight;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

export default function ProfileComponent({navigation}){

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
    function apriUserSettings(){
        navigation.openDrawer();
    }

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <View style={{width:24, height:24}}/>
                <Text style={styles.titolo}>Profile</Text>
                <TouchableOpacity onPress={apriUserSettings} style={{right:Dimensions.get("window").width*0.03}}>
                        <MaterialIcons name="menu" size={24} color="#52575D" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                    
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={require("../../../../../../assets/resources/images/profilePicture.jpg")} resizeMode="cover"  style={styles.immagineProfilo}></Image>
                        </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* icona chat */}
                        <View style={styles.chatIcon}>
                            <Ionicons name="ios-chatbubble-outline" size={altezzaSezioneImmagineProfilo*0.1} color={MosCeleste} />
                        </View>
                    </View>

                    {/* NOME */}
                    <View style = {styles.areaDettagliUtente}>
                        <Text style={styles.nome}>Julie</Text>
                    </View>

                </View>
                <View style={styles.sezioneGalleria}>
                        {/* GALLERIA */}
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{justifyContent:"center", alignItems:"center"}}>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria1.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria2.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria3.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria4.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria5.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                            </ScrollView>


                            {/*Bottone aggiungi foto */}
                            <FAB
                            style={styles.bottoneAggiungiFoto}
                            small
                            icon="plus"
                            color={MosCeleste}
                            onPress={() => console.log('Pressed')}/>

                </View>
</>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:25,
        paddingRight:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
    },
    barraSuperiore:{
        width:Dimensions.get("window").width,
        height:altezzaBarraProfilo,
        flexDirection:"row",
        justifyContent:"space-between",
        paddingTop:24,
        paddingBottom: 24,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
    nome:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreMediaProfilo:{
        alignItems:"center",
        justifyContent:"center",
        height: altezzaSezioneImmagineProfilo, //altezza sezione immagine profilo
        width: Dimensions.get("window").width,
        backgroundColor:"red",
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    contenitoreImmagineProfilo: {
        width: altezzaSezioneImmagineProfilo,
        height: altezzaSezioneImmagineProfilo,
        borderRadius: altezzaSezioneImmagineProfilo/2,
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
        left:(larghezzaSchermo/2)-altezzaSezioneImmagineProfilo/2*0.8071,
        top:(altezzaSezioneImmagineProfilo/2)+altezzaSezioneImmagineProfilo/2*0.6071,
        height:altezzaSezioneImmagineProfilo*0.1,
        width: altezzaSezioneImmagineProfilo*0.1,
        borderRadius:altezzaSezioneImmagineProfilo*0.1/2
    },
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        left:(larghezzaSchermo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        top:(altezzaSezioneImmagineProfilo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        height:altezzaSezioneImmagineProfilo*0.2,
        width: altezzaSezioneImmagineProfilo*0.2,
        borderRadius:altezzaSezioneImmagineProfilo*0.2/2,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5
    },
    areaDettagliUtente: {
        alignSelf: "center",
        alignItems:"center",
        width:larghezzaSchermo,
        height: altezzaDettagliUtenti, //area dettagli utenti
        backgroundColor:"green",
        justifyContent:"center",
        alignItems:"center"
    },
    sezioneGalleria: {
        width:larghezzaSchermo,
        height:altezzaSezioneGalleria,  //sezione galleria
        justifyContent: 'center',
        alignItems:"center"
    },
    immagineGalleria: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreGalleria: {
        alignItems:"flex-end",
        justifyContent:"flex-end",
        flexGrow:1
    },
    contenitoreFotoGalleria: {
        width:dimensioneFotoGalleria-5, 
        height:dimensioneFotoGalleria-5,
        borderRadius:(larghezzaSchermo/2-2.5)*10/200,
        overflow: "hidden",
        marginHorizontal:2.5
    },
    bottoneAggiungiFoto: {
        position: 'absolute',
        right: larghezzaSchermo*0.05,
        bottom: altezzaSchermo*0.08,
        backgroundColor:"white",
        ...Platform.select({
            android: {
                elevation:10
            }
        })
      }
  });