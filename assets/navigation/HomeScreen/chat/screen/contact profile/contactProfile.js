import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Ionicons} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import GalleriaImmagini from './galleriaImmagini';
import * as ImageManipulator from 'expo-image-manipulator';
import { AutenticazioneUtente } from '../../../../../context/firebase/autenticazione';
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import {navbarHeight, fontSizeTitolo, altezzaBarraScreen, larghezzaDevice, fontSizeTitoloBarra, altezzaMenuNavigazione } from '../../../../../context/variabili_globali/variabiliGlobali';

/*
    MISURE
    altezza barra profilo --> 10%
    altezza sezione immagine profilo --> 30%
    altezza area dettagli utenti --> 10%

    altezza area galleria
*/
const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSezioneImmagineProfilo = Dimensions.get("window").height*0.3;
const altezzaDettagliUtenti = Dimensions.get("window").height*0.1;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.5-altezzaMenuNavigazione-20;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

/*
    L'argomento props contiene props.user contenente a sua volta:
        - props.user.uuid
        - props.user.gallery
*/
export default function ContactProfile({navigation, route}){

    const {mediaProfilo, name} = route.params;
    console.log(mediaProfilo);
    console.log(name);

    const [uriProfileImage, setUriProfileImage] = useState(mediaProfilo.value.profileImageUrl=="" ? null : mediaProfilo.value.profileImageUrl);

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    

    function tornaIndietro(){
        navigation.navigate("Chat");
    }
   
    return (
        <>
            <View style={styles.container}>
                {/* BARRA SUPERIORE */}
                <View style={styles.barraSuperiore}>
                    <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0,zIndex:10, paddingLeft:Dimensions.get("window").width*0.03}}>
                            <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
                    </TouchableOpacity>
                    <Text style={styles.titolo}>{name}</Text>
                </View>
        
                <View style={{ flex: 1, justifyContent: 'flex-start'}}>
                            
                            {/* IMMAGINE PROFILO */}
                            <View style={styles.contenitoreMediaProfilo}>
                                {/* immagine */}
                                <View style={styles.contenitoreImmagineProfilo}>
                                    {uriProfileImage && <Image source={{uri: uriProfileImage}} resizeMode="cover"  style={styles.immagineProfilo}
                                                            onError={()=>{setUriProfileImage(null)}} />}
                                    {!uriProfileImage && <Text style={{position:"absolute", textAlign:"center", color:"white", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                                </View>
                            </View>
        
                            { 
                            <View style = {styles.areaDettagliUtente}>
                                <Text style={styles.nome}>{name}</Text>
                            </View>
                            }
        
                        {/*SEZIONE DELLA GALLERIA */}  
                            <View style={styles.sezioneGalleria}>
        
                                {/* GALLERIA 
                                    - galleria: array contenente i nomi delle immagini di galleria
                                */}
        
                                {<GalleriaImmagini galleryUrls={mediaProfilo.value.gallery} />}
                                
                            </View>
        
                </View>
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
        paddingTop:10,
        alignItems:"center",
        justifyContent:"center",
        height: altezzaSezioneImmagineProfilo, //altezza sezione immagine profilo
        width: Dimensions.get("window").width,
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
    //questa la lascio per poi utilizzarla quando si vuole mostrare il profilo dell'utente con cui si messaggia
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
    modificaImmagineProfiloIcon: {
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
        justifyContent:"center",
        alignItems:"center"
    },
    sezioneGalleria: {
        width:larghezzaSchermo,
        height:altezzaSezioneGalleria,  //sezione galleria
        justifyContent: 'center',
        alignItems:"center",
    },
    immagineGalleria: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreGalleria: {
        alignItems:"flex-end",
        justifyContent:"flex-end",
        flexGrow:1,
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
        bottom:altezzaSezioneGalleria*0.05,
        backgroundColor:"white",
        ...Platform.select({
            android: {
                elevation:10
            }
        })
      },
      bottoneEliminaFoto: {
        position: 'absolute',
        right: 0,
        width:altezzaSezioneGalleria*0.1,
        height:altezzaSezioneGalleria*0.1,
        backgroundColor:"white",
        borderBottomLeftRadius:altezzaSezioneGalleria*0.1/2,
        justifyContent:"flex-end",
        alignItems:"flex-end",
        zIndex:10,
        ...Platform.select({
            android: {
                elevation:12
            }
        })
      }
  });