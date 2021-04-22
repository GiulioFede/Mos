import React, {useState,useEffect,useContext, useRef} from "react";
import {View, Text,StyleSheet, FlatList,Animated, KeyboardAvoidingView,ScrollView, useWindowDimensions, BackHandler} from "react-native";
import {Snackbar, ActivityIndicator} from "react-native-paper";
import { ColoreBarraDiStato } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../resources/colors";
import IndicatoreSlide from "./component/indicatore_slide";
import ProgressiveButton from "./component/progressive_button";
import SlidePage from "./component/slide_page";

import slider_data from './resources/slider_data';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";

export default function SliderNuovoUtente({route, navigation}){ //NB: route.params.uid contiene l'uid col quale salvare l'utente (e' uguale all'uid di autenticazione)

    //contesto autenticazione
    var {creaNuovoUtente, aggiornaImmagineProfilo, logOut} = useContext(AutenticazioneUtente);
    //estraggo argomenti dalla funzione
    var {uid} = route.params;

    var coloreBarra = useContext(ColoreBarraDiStato);
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
    let posizione = useRef("");
    let sesso = useRef("");
    let preferenzaSesso = useRef("");
    let uriImmagineProfilo = useRef("");

    //funzioni per modificare i dati sopra
    function setName(nome){
        const letters = /^[A-Za-z]+$/;
        if(nome.length<3){
            setShowForwardArrow(false);
            setSnackError("Inserisci un nome almeno di 3 lettere.");
        }
        else if(!nome.match(letters)){
            setShowForwardArrow(false);
            setSnackError("Inserisci solamente caratteri alfabetici A-Z oppure a-z.");
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
        if (Math.abs(today.getFullYear()- data.getFullYear()<14)){
            setShowForwardArrow(false);
            setSnackError("Devi avere almeno 14 anni per usare Mosaic.");
        }
        else {
            dataDiNascita.current=data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
            setShowForwardArrow(true);
        }
    }

    function setPosizione(position){
        posizione.current = position;
        setShowForwardArrow(true);
    }

    function setSesso(sex){
        sesso.current = sex;
        setShowForwardArrow(true);
    }

    function setPreferenzaSesso(sexPreference){
        preferenzaSesso.current = sexPreference;
        setShowForwardArrow(true);
    }

    function setUriImmagineProfilo(uri){
        uriImmagineProfilo.current = uri;
        setShowForwardArrow(true);
    }

    const [isCreazioneUtenteLoading, setIsCreazioneUtenteIsLoading] = useState(false);
    function creaNuovoProfilo(){
        console.log("creazione profilo:"+name.current+","+dataDiNascita.current+","+posizione.current+","+sesso.current+","+preferenzaSesso.current+","+uriImmagineProfilo.current);
        //ultimo check di sicurezza
        if(!uid || uid.length==0 || name.current.length==0 || dataDiNascita.current.length==0 || posizione.current.length == 0 || sesso.current.length==0 || preferenzaSesso.current.length==0 || uriImmagineProfilo.current.length==0){
            console.log("Errore generico:"+e);
            setSnackError("Si è verificato un problema. Riprova più tardi.");
            return;
        }

        setIsCreazioneUtenteIsLoading(true);
        coloreBarra.setColore("white");

        try{
           creaNuovoUtente(uid,
                           name.current,
                           dataDiNascita.current,
                           posizione.current,
                           sesso.current,
                           preferenzaSesso.current)
                .then((ris)=>{
                    console.log("Utente inserito:");
                    console.log(ris);

                    //salvo immagine profilo
                    //prendo il file
                    fetch(uriImmagineProfilo.current)
                        .then((response)=>{
                            //il file è stato preso, creo il blob dal file
                            response.blob()
                                .then((blob)=>{
                                    //blob creato
                                    //chiamo firebase
                                    aggiornaImmagineProfilo(uid, blob)
                                        .then((ris)=>{
                                            setIsCreazioneUtenteIsLoading(false);
                                            console.log("successo caricamento immagine profilo:"+ris);
                                            //navigo nella home
                                            navigation.navigate("Home");
                                        }).catch((e)=>{
                                            var code = e.code;
                                            var message = "Si è verificato un problema. Riprova più tardi.";
                                            if(code=="storage/retry-limit-exceeded")
                                                message = "La richiesta ha impiegato troppo tempo. Riprovare.";
                                            else if(code=="storage/canceled")
                                                message = "Operazione annullata.";
                                            else if(code=="storage/cannot-slice-blob")
                                                message = "Si è verificato un errore: il file locale è stato cambiato.";
                
                                            setIsCreazioneUtenteIsLoading(false);
                                            coloreBarra.setColore(MosCeleste);
                                            console.log("Errore caricamento immagine:"+code+","+e.code);
                                            setSnackError("Si è verificato un problema. Riprova più tardi.");
                                        })
                                }).catch((e)=>{
                                    setIsCreazioneUtenteIsLoading(false);
                                    coloreBarra.setColore(MosCeleste);
                                    console.log("Errore generico:"+e);
                                    setSnackError("Si è verificato un problema. Riprova più tardi.");
                                })
                        }).catch((e)=>{
                            setIsCreazioneUtenteIsLoading(false);
                            coloreBarra.setColore(MosCeleste);
                            console.log("Errore generico:"+e);
                            setSnackError("Si è verificato un problema. Riprova più tardi.");
                        });
                }).catch((e)=>{
                    setIsCreazioneUtenteIsLoading(false);
                    coloreBarra.setColore(MosCeleste);
                    var messaggio = "Si è verificato un problema. Riprova più tardi.";
                    var code = e.code;

                    console.log("Errore specifico:"+code+","+e);
                    setSnackError(messaggio);

                });
            }catch(e){
                setIsCreazioneUtenteIsLoading(false);
                coloreBarra.setColore(MosCeleste);
                console.log("Errore generico:"+e);
                setSnackError("Si è verificato un problema. Riprova più tardi.");
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

        console.log(currentIndex+":"+name+","+dataDiNascita);
        console.log(name);
        if(currentIndex==0 && dataDiNascita.current=="") //se sono in data ed è vuota non permettere di andare avanti
            setShowForwardArrow(false);
        if(currentIndex==1 && posizione.current=="")
            setShowForwardArrow(false);
        if(currentIndex==2 && sesso.current=="")
            setShowForwardArrow(false);
        if(currentIndex==3 && preferenzaSesso.current=="")
            setShowForwardArrow(false);
        if(currentIndex==4 && uriImmagineProfilo.current=="")
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
        coloreBarra.setColore(MosCeleste);

        const backAction = () => {
            coloreBarra.setColore("white");
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
                keyboardVerticalOffset={20}
                behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
            <View style={{flex:3, justifyContent:"center", alignItems:"center"}} >
                <ScrollView>
                        <FlatList
                            data = {slider_data}
                            renderItem = {({item}) => 
                                                <SlidePage 
                                                    item={item} 
                                                    setNomeUtente={setName}
                                                    setDataUtente={setDataDiNascita}
                                                    setPosizioneUtente={setPosizione}
                                                    setSessoUtente = {setSesso}
                                                    setPreferenzaSessoUtente = {setPreferenzaSesso}
                                                    setUriImmagine = {setUriImmagineProfilo}
                                                    creaProfilo = {creaNuovoProfilo}
                                                    setError = {setSnackError}
                                                    setCreazioneUtenteLoading = {setIsCreazioneUtenteIsLoading}
                                                />}
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
                    <IndicatoreSlide data={slider_data} scrollX={scrollX}/> 
                    <ProgressiveButton  percentage={(currentIndex+1)*(100/slider_data.length)} 
                                        scrollSlide={scrollSlider}
                                        scrollBack={scrollBack}
                                        showLeftArrow={showLeftArrow}
                                        showForwardArrow={showForwardArrow}/>

                    {/*MOSTRA L'ERRORE SE SI RIEMPIE UN CAMPO IN MODO ERRATO */}
                    <Snackbar
                        visible={snackError ? true : false}
                        onDismiss={hideSnackError}
                        duration= {5000}
                        action={{
                        label: 'Undo',
                        onPress: () => {
                            // Do something
                            hideSnackError();
                        },
                        }}>
                        {snackError}
                    </Snackbar>
                 
               </ScrollView>
            </View>
            </KeyboardAvoidingView>
            
            
            {/*MOSTRA IL CARICAMENTO QUANDO IL PROFILO STA PER ESSERE CREATO */}
            { isCreazioneUtenteLoading &&
                     <View style={{width:width, height:height,position:"absolute",zIndex: 100, backgroundColor:"rgba(255, 255, 255,0.9)", justifyContent:"center", alignItems:"center"}}>
                            <ActivityIndicator animating={true} color={MosCeleste} />
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
        backgroundColor:MosCeleste
    }
})
