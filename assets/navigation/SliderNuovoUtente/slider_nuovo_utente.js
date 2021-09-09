import React, {useState,useEffect,useContext, useRef} from "react";
import {View, Text,StyleSheet, FlatList,Animated, KeyboardAvoidingView,ScrollView, useWindowDimensions, BackHandler, Dimensions, TouchableOpacity} from "react-native";
import {Snackbar, ActivityIndicator} from "react-native-paper";
import { altezzaBarraScreen, altezzaDevice, altezzaSchermoInterno, ColoreBarraDiStato, iconSize, larghezzaDevice } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../resources/colors";
import IndicatoreSlide from "./component/indicatore_slide";
import ProgressiveButton from "./component/progressive_button";
import SlidePage from "./component/slide_page";
import * as ImageManipulator from 'expo-image-manipulator';
import slider_data from './resources/slider_data';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import { Ionicons } from '@expo/vector-icons';
import { geohashForLocation } from "geofire-common";
import { getAgeFromDate } from "../../context/utilities/functions.utilities";
import i18n from 'i18n-js'

export default function SliderNuovoUtente({route, navigation}){ //NB: route.params.uid contiene l'uid col quale salvare l'utente (e' uguale all'uid di autenticazione)
    console.log("Slider nuovo utente");
    //contesto autenticazione
    var {userAuth, setInformazioniAutenticazioneUtente, creaNuovoProfiloUtente, logOut, setIsUserProfileCompleted} = useContext(AutenticazioneUtente);
    //estraggo argomenti dalla funzione
    var {uid} = route.params;

    //var coloreBarra = useContext(ColoreBarraDiStato);
    const {width, height} = useWindowDimensions();

    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const viewableItemsChanged = useRef(({viewableItems})=>{
        setCurrentIndex(viewableItems[0].index);
    }).current;
    const viewConfig = useRef({viewAreaCoveragePercentThreshold:50}).current;
    const slidesRef = useRef(null);

    //qui mantengo tutti i valori che mi servono per creare l'utente
    let name = useRef("");
    let dataDiNascita = useRef("");
    let posizione = useRef([]);
    let sesso = useRef("");
    let identitaDiGenere = useRef("");
    let preferenzaSesso = useRef("");
    let descrizione = useRef("");
    let occupazione = useRef("");
    let keyword = useRef([]); //array di keyword
    let uriImmagineProfilo = useRef("");

    //funzioni per modificare i dati sopra
    function setName(nome){
        const letters = /^[A-Za-z]+$/;
        if(nome.length<3){
            setShowForwardArrow(false);
            setSnackError(i18n.t('enterANameOfAtLeast3letters'));
        }
        else if(!nome.match(letters)){
            setShowForwardArrow(false);
            setSnackError(i18n.t('azConstraint'));
        }
        else {
            name.current = nome; 
            setShowForwardArrow(true);
        }
        console.log("Inserimento nome:"+name);
    }

    function setDataDiNascita(data){
        console.log("data di nascita settata: "+data);
        //l'oggetto data è di tipo Date
        const today = new Date();
        if (Math.abs(today.getFullYear()- data.getFullYear()<16)){ //TODO: stabilire se 16
            setShowForwardArrow(false);
            setSnackError(i18n.t('ageConstraint'));
        }
        else {
            dataDiNascita.current=data;//getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
            setShowForwardArrow(true);
        }
    }

    function setPosizione(position){
        //position conterrà un array di questo genere --> [lat, long, città, regione, stato]
        posizione.current = position;
        console.log(position);
        if(position.length==5)
            setShowForwardArrow(true);
        else
            setShowForwardArrow(false);
    }

    function setSesso(sex){
        sesso.current = sex;
        setShowForwardArrow(true);
    }

    function setIdentitaDiGenere(identita){
        identitaDiGenere.current = identita;
        setShowForwardArrow(true);
    }

    function setPreferenzaSesso(sexPreference){
        preferenzaSesso.current = sexPreference;
        setShowForwardArrow(true);
    }

    function setDescrizioneUtente(desc){
        descrizione.current = desc;
        if(descrizione.current != "")
            setShowForwardArrow(true);
        else
            setShowForwardArrow(false);
    }

    function setOccupazioneUtente(occ){
        occupazione.current = occ;
        if(occupazione.current != "")
            setShowForwardArrow(true);
        else
            setShowForwardArrow(false);
    }

    function setKeywordUtente(keywordArray){
        keyword.current = keywordArray;
        if(keyword.current.length>=5)
            setShowForwardArrow(true);
        else
            setShowForwardArrow(false);
    }

    function setUriImmagineProfilo(uri){
        uriImmagineProfilo.current = uri;
        setShowForwardArrow(true);
    }


    const [isCreazioneUtenteLoading, setIsCreazioneUtenteIsLoading] = useState(false);
  
    function creaNuovoProfilo(){
        console.log("creazione profilo:"+name.current+","+dataDiNascita.current+","+posizione.current+","+sesso.current+","+identitaDiGenere.current+","+preferenzaSesso.current+","+descrizione.current+","+occupazione.current+","+keyword.current+","+uriImmagineProfilo.current);
        //ultimo check di sicurezza
        if(!uid || uid.length==0 || name.current.length==0 || dataDiNascita.current.toString().length==0 || posizione.current.length == 0 || sesso.current.length==0 || identitaDiGenere.current=="" || preferenzaSesso.current.length==0 || descrizione.current.length==0 || occupazione.current.length==0 || uriImmagineProfilo.current.length==0){
            console.log("Errore generico:"+e);
            setSnackError(i18n.t('err_generic'));
            return;
        }
        setIsCreazioneUtenteIsLoading(true);
        try{
            console.log("genero hash:");
            //genero hash dalla posizione
            let hash = geohashForLocation([posizione.current[0], posizione.current[1]]);
            console.log(hash);
            console.log("manipolo immagine");
            //1) manipolo l'immagine per ridurne le dimensioni a meno di 1MB cosi da velocizzare lato server la trasformazione
            ImageManipulator.manipulateAsync(
                                uriImmagineProfilo.current,
                                [{ resize: { width: 800, height: 800 } }],
                                { format: 'jpeg',base64: true })
                            .then(async(immagineManipolata)=>{
                                try{
                                    console.log("immagine manipolata. Creo profilo...");
                                    //estraggo solo le keyword (perchè per la flat list sono nel formato id:...keyword:...)
                                    let keywordCleaned = [];
                                    for(let i=0; i<keyword.current.length; i++)
                                        keywordCleaned.push(keyword.current[i].keyword);
                                    await creaNuovoProfiloUtente(immagineManipolata.base64,
                                                                 name.current,  
                                                                 dataDiNascita.current,
                                                                 getAgeFromDate(dataDiNascita.current),
                                                                 sesso.current,
                                                                 identitaDiGenere.current,
                                                                 preferenzaSesso.current,
                                                                 descrizione.current,
                                                                 hash.substring(0,5), //per privacy prendo una regione fatta da solo 5 lettere di geohash (es. sqc0p )
                                                                 Number.parseFloat(posizione.current[0]).toPrecision(5), //per privacy prendo solo le prime 3 cifre dopo il punto
                                                                 Number.parseFloat(posizione.current[1]).toPrecision(5),
                                                                 posizione.current[2], //città
                                                                 posizione.current[3], //regione
                                                                 posizione.current[4], //stato
                                                                 occupazione.current,
                                                                 keywordCleaned
                                    );
                                    console.log("CREAZIONE PROFILO RIUSCITA!!!");
                                    const metodo = [userAuth.email,userAuth.phoneNumber];
                                    setInformazioniAutenticazioneUtente(metodo);
                                    setIsCreazioneUtenteIsLoading(false);
                                    setIsUserProfileCompleted(true);
                                    navigation.navigate("Home");    
                                }catch(e){
                                    console.log("errore durante la creazione del profilo:"+e);
                                    setSnackError(i18n.t('errorDuringProfileCreation'));
                                    setIsCreazioneUtenteIsLoading(false);
                                }                           

                            }).catch((e)=>{
                                setSnackError(i18n.t('errorDuringProfileCreation'));
                                console.log("slider_nuovo_utente.js : errore-->"+e);
                                setIsCreazioneUtenteIsLoading(false);
                            })
        }catch(e){
            console.log("errore durante la creazione del profilo:"+e);
            setSnackError(i18n.t('errorDuringProfileCreation'));
            setIsCreazioneUtenteIsLoading(false);
        }
        
            
    }

    //per l'errore
    const [snackError, setSnackError] = useState(null);
    const hideSnackError = () => setSnackError(null);

    //per andare avanti
    function scrollSlider(){

        if(currentIndex == slider_data.length-2)
            setShowForwardArrow(false);

        if(currentIndex < slider_data.length-1){
            slidesRef.current.scrollToIndex({index: currentIndex+1});
        }else 
            console.log("last item");
        console.log("Nuovo inserimento");
        console.log("indice corrente:"+currentIndex);
        console.log("valore:"+descrizione.current);
        if(currentIndex==0 && dataDiNascita.current.toString()=="") //se sono in data ed è vuota non permettere di andare avanti
            setShowForwardArrow(false);
        if(currentIndex==1 && posizione.current=="")
            setShowForwardArrow(false);
        if(currentIndex==2 && sesso.current=="")
            setShowForwardArrow(false);
        if(currentIndex==3 && identitaDiGenere.current=="")
            setShowForwardArrow(false);
        if(currentIndex==4 && preferenzaSesso.current=="")
            setShowForwardArrow(false);
        if(currentIndex==5 && descrizione.current=="")
            setShowForwardArrow(false);
        if(currentIndex==6 && occupazione.current=="")
            setShowForwardArrow(false);
        if(currentIndex==7 && keyword.current.length<5)
            setShowForwardArrow(false);
        if(currentIndex==8 && uriImmagineProfilo.current=="")
            setShowForwardArrow(false);

        //se l'indice corrente è diverso da 1 mostro la freccia indietro
        if(currentIndex>=0)
            setShowLeftArrow(true);
        else
            setShowLeftArrow(false);
    }

    //per andare indietro
    function scrollBack(){
        console.log(currentIndex);

        if(currentIndex > 0){
            slidesRef.current.scrollToIndex({index: currentIndex-1});
        }else
            console.log("first item");

        //se l'indice corrente è diverso da 1 mostro la freccia indietro
        if(currentIndex>1)
            setShowLeftArrow(true);
        else
            setShowLeftArrow(false);
        
        setShowForwardArrow(true);
    }

    //per decidere se mostrare o meno le frecce del menu per muoversi indetro o avanti
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showForwardArrow, setShowForwardArrow] = useState(false);

    //detect quando preme il bottone indietro
    useEffect(()=>{
        //coloreBarra.setColore(MosCeleste);

        const backAction = () => {
            //coloreBarra.setColore("white");
            //eseguo il logout
            logOut().then((ok)=>{}).catch((e)=>{});
            navigation.navigate("LoginScreen");
            console.log("torno a login");
            return true;
          };
      
          const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      
          return () => backHandler.remove(); //rimuovo quando il componente viene smontato per evitare memory leak
    },[])


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                keyboardVerticalOffset={40}
                behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
            <View style={{flex:1, justifyContent:"center", alignItems:"center"}} >
                {/* BARRA SUPERIORE */}
                <View style={styles.barraSuperiore}>
                        <TouchableOpacity onPress={() => {navigation.navigate("LoginScreen")}}>
                                <Ionicons name="chevron-back" size={iconSize} color={MosCeleste} style={{paddingLeft:24}} />
                        </TouchableOpacity>
                </View>
                <View style={{flex:1}}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>

                    <View style={{flex:1,width:larghezzaDevice}}>
                        
                        <FlatList
                                data = {slider_data}
                                renderItem = {({item}) => 
                                                    <SlidePage 
                                                        item={item} 
                                                        setNomeUtente={setName}
                                                        setDataUtente={setDataDiNascita}
                                                        setPosizioneUtente={setPosizione}
                                                        setSessoUtente = {setSesso}
                                                        setIdentitaDiGenere = {setIdentitaDiGenere}
                                                        setPreferenzaSessoUtente = {setPreferenzaSesso}
                                                        setDescrizioneUtente = {setDescrizioneUtente}
                                                        setOccupazioneUtente = {setOccupazioneUtente}
                                                        setKeywordUtente = {setKeywordUtente}
                                                        setUriImmagine = {setUriImmagineProfilo}
                                                        creaProfilo = {creaNuovoProfilo}
                                                        setError = {setSnackError}
                                                        setCreazioneUtenteLoading = {setIsCreazioneUtenteIsLoading}
                                                    />
                                                    }
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                pagingEnabled
                                scrollEnabled = {false}
                                keyExtractor={(item) => item.id}
                                
                                onScroll = {Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}],{
                                    useNativeDriver: false
                                })}
                                onViewableItemsChanged={viewableItemsChanged}
                                viewabilityConfig={viewConfig}
                                ref={slidesRef}
                            />
                    </View>

                    <View style={{justifyContent:"flex-end", width:larghezzaDevice}} >
                        
                            <IndicatoreSlide data={slider_data} scrollX={scrollX}/> 
                            <ProgressiveButton  percentage={(currentIndex+1)*(100/slider_data.length)} 
                                                scrollSlide={scrollSlider}
                                                scrollBack={scrollBack}
                                                showLeftArrow={showLeftArrow}
                                                showForwardArrow={showForwardArrow}/>

                    </View>
                    </ScrollView>
                </View>
                    {/*MOSTRA L'ERRORE SE SI RIEMPIE UN CAMPO IN MODO ERRATO */}
                    <Snackbar
                        visible={snackError ? true : false}
                        onDismiss={hideSnackError}
                        duration= {4000}
                        action={{
                        onPress: () => {
                            // Do something
                            hideSnackError();
                        },
                        }}>
                        {snackError}
                    </Snackbar>
            </View>
            </KeyboardAvoidingView>
            
            
            {/*MOSTRA IL CARICAMENTO QUANDO IL PROFILO STA PER ESSERE CREATO */}
            { isCreazioneUtenteLoading &&
                     <View style={{width:width, height:height,position:"absolute",zIndex: 100, backgroundColor:"rgba(255, 255, 255,0.9)", justifyContent:"center", alignItems:"center"}}>
                            <ActivityIndicator animating={true} color={MosCeleste} />
                            <Text style={{width:larghezzaDevice*0.6, textAlign:"center", paddingTop:10}}>{i18n.t('creationProfile')}</Text>
                            <Text style={{width:larghezzaDevice*0.6, textAlign:"center", paddingTop:20}}>{i18n.t('messageDuringCreation')}</Text>
                     </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    },
    barraSuperiore:{
        width:Dimensions.get("window").width,
        paddingTop:iconSize,
        paddingBottom:iconSize,
        flex:0.05
    },
})
