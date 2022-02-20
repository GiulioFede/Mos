import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, BackHandler} from 'react-native';
import {MaterialIcons, Entypo,Ionicons} from "@expo/vector-icons";;
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import GalleriaImmagini from './galleriaImmagini';
import * as ImageManipulator from 'expo-image-manipulator';
import { AutenticazioneUtente } from '../../../../../context/firebase/autenticazione';
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import {navbarHeight, fontSizeTitolo, altezzaBarraScreen, larghezzaDevice, fontSizeTitoloBarra, altezzaMenuNavigazione, fontSizeSottoTitolo } from '../../../../../context/variabili_globali/variabiliGlobali';
import SliderDetails from '../../../profile/screen/component/sliderDetails';
import i18n from 'i18n-js'

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

    const {mediaProfilo, informazioniProfiloUtente} = route.params;
    console.log(mediaProfilo);
    console.log(informazioniProfiloUtente);

    const [errore, setErrore] = useState(null);

    const [dettagli, setDettagli] = useState([]);

    function inizializzaDettagli(){
        console.log("inizializzo dettali usando");
        console.log(informazioniProfiloUtente);

        let dettagliTMP = [];
        //dettagli posizione
        dettagliTMP.push({
            section: "location",
            city: informazioniProfiloUtente.location.city,
            region: informazioniProfiloUtente.location.region,
            country: informazioniProfiloUtente.location.country
        });
        //dettagli genere
        dettagliTMP.push({
            section: "sex and gender",
            sex: informazioniProfiloUtente.biological_sex,
            gender_identity: informazioniProfiloUtente.gender_identity,
            gender_preference: informazioniProfiloUtente.gender_preference
        });
        //dettagli occupazione e descrizione
        dettagliTMP.push({
            section: "occupation and decription",
            occupation: informazioniProfiloUtente.current_occupation,
            description: informazioniProfiloUtente.self_description,
        });
        //dettagli hobby interessi e passionioni
        dettagliTMP.push({
            section: "hobbies interests and passions",
            hobbies_interests_and_passions: informazioniProfiloUtente.hobbies_interests_and_passions
        });
        
        setDettagli([...dettagliTMP]);
    }

    useEffect(()=>{
        const bh = BackHandler.addEventListener('hardwareBackPress',tornaIndietro);

        inizializzaDettagli();
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', tornaIndietro);
        }
    },[])

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    

    function tornaIndietro(){
        console.log("torno indietro");
        navigation.navigate("Chat");
    }
   
    return (
            <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0,zIndex:10, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
                <Text style={styles.titolo}>{i18n.t('profile')}</Text>
                
            </View>
            <ScrollView horizontal={false} style={{backgroundColor:"#fff"}}>

            <View style={{ flex: 1, justifyContent: 'flex-start', width:larghezzaDevice}}>
                    <View style={{backgroundColor:"#fff"}}>
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo} >
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <ActivityIndicator animating={errore==null} size={fontSizeTitoloBarra} color={MosCeleste} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}/>
                            {(errore==null || errore==false) && <Image source={{uri:mediaProfilo.profileImageUrl}} resizeMode="cover"  style={styles.immagineProfilo} onLoadEnd={()=>{setErrore(false)}} onError={()=>{setErrore(true)}}/>}
                            {errore==true && <Image source={require('../../../../../resources/images/img-profile-not-found.png')} resizeMode="cover"  style={styles.immagineProfilo} />}
                            </View>
                    </View>

                    {/* NOME */}
                    <View style = {styles.areaDettagliUtente}>
                        <Text style={styles.nome}>{informazioniProfiloUtente.name.charAt(0).toUpperCase()+informazioniProfiloUtente.name.slice(1)}</Text>
                        <Entypo name="dot-single" size={24} color="#52575D" />
                        <Text style={styles.age}>{informazioniProfiloUtente.age}</Text>
                    </View>
                    <SliderDetails dettagli={dettagli} />

                    </View>
                    <View style={{backgroundColor:"#fff"}}>
                    
                {/*SEZIONE DELLA GALLERIA */}  
                    <View style={styles.sezioneGalleria}>

                        {/* GALLERIA */}

                        <GalleriaImmagini galleryUrls={mediaProfilo.gallery} />

                    </View>
                    </View>
            </View>

                </ScrollView>
            </>
    )
}


const styles = StyleSheet.create({
    container: {
      //backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra*0.8,
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
        backgroundColor:"#fff"
        //borderBottomColor:"#e6e6e6",
        //borderBottomWidth:0.7,
    },
    nome:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo*0.7
    },
    nomeGrassetto:{
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeTitolo*0.7
    },
    age:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo*0.6
    },
    areaSessualita:{
        backgroundColor:"rgba(247, 247, 247,0.5)"
    },
    areaDescrizione:{
        textAlign:"center",
        marginBottom:20
    },
    descrizioneTesto: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeSottoTitolo*0.7,
        textAlign:"center"
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
        backgroundColor: '#fff',
        justifyContent:"center",
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
        alignItems:"center",
        textAlignVertical:"center",
        flexDirection:"row"
    },
    galleryTitle:{
        fontSize:fontSizeTitoloBarra,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        left:20,
        top:20

    },
    sezioneGalleria: {
        width:larghezzaSchermo,
        backgroundColor:"#fff",
        marginTop:30
        //height:altezzaSezioneGalleria,  //sezione galleria
        //justifyContent: 'center',
        //alignItems:"center"
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
        right: 15,
        bottom:15,
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