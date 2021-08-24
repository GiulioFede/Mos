import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Entypo} from "@expo/vector-icons";
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import {navbarHeight, fontSizeTitolo, altezzaBarraScreen, larghezzaDevice, fontSizeTitoloBarra, altezzaMenuNavigazione, fontSizeCampi, fontSizeSottoTitolo } from '../../../../../context/variabili_globali/variabiliGlobali'
import * as ImagePicker from 'expo-image-picker';
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import GalleriaImmagini from './galleriaImmagini';
import * as ImageManipulator from 'expo-image-manipulator';
import local_storage from "../../../../../context/local_storage/localStorage";
import InformazioniPersonali from '../../../../Informazioni Personali/informazioniPersonali';
import VisibilityFAB from './visibilityFab';
import DialogEliminaImmagineDiGalleria from './dialogEliminaImmagineDiGalleria';
import SnackMessage from './snackMessage';
import { LinearGradient } from "expo-linear-gradient";

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
    Esempio di struttura di informazioniProfiloUtente:

    Object {
  "biological_sex": "maschio",
  "date_of_birth": "10/8/1988",
  "gender_identity": "intergender",
  "gender_preference": "agender",
  "location": Object {
    "geohash": "sqc0p129bw",
    "lat": 37.9759508,
    "lng": 12.9645777,
  },
  "name": "Giulio",
  "self_description": "Uejsjsjsjs

",

  "urlGalleryImages": Array [
    Object {
      "name": "0",
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0?alt=media&token=2d34475c-1f41-4e49-bbba-3159a5b487f7",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_100?alt=media&token=73c5d130-0ff9-4b98-851f-4b6beb256842",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_25?alt=media&token=4e35c4a0-bf98-4937-95b8-cf0b86cc37f1",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_50?alt=media&token=23f08d55-4ff1-45a7-b696-cfb5b2100094",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_75?alt=media&token=80a85840-bd69-46e6-a9e2-010022f88f85",
    },
    Object {
      "name": "1",
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1?alt=media&token=648f8150-dd6f-457f-a9b2-0e5f96a41c7f",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=db6a1e5e-c81d-43c0-9085-ee4a36d7378d",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_25?alt=media&token=bc5b0ce0-790c-4c14-a7b3-ed95412763b7",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_50?alt=media&token=a5d0d9de-0718-43e0-8acd-16c1dc9c5caa",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_75?alt=media&token=568eea5d-671a-4481-9e78-b846d2e36d33",
    },
    Object {
      "name": "2",
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2?alt=media&token=702f10dc-fe13-4083-99b2-63e60c65d6ec",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=e71bacdd-76d2-48b7-9d92-d5818701f78a",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_25?alt=media&token=938c4d34-3586-4756-84aa-fa6b3863e4e1",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_50?alt=media&token=14bcae7c-0a70-4a59-aaa9-0da26de1b625",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_75?alt=media&token=c76939e7-63d3-4c24-9e8c-a4c64b90f81d",
    }],

  "urlProfileImage": Object {
    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage1?alt=media&token=791d7a41-048d-41a5-84c0-44d620cbd32b",
    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage1_100?alt=media&token=3615a6f3-ff01-44c1-affe-778b47e6c3a4",
    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage1_25?alt=media&token=881d10a1-261d-478d-b608-ef2e30db20b7",
    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage1_50?alt=media&token=fb0ba255-7d52-4ddb-8715-5d75388ba412",
    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage1_75?alt=media&token=d830acbe-4d6d-46bc-963f-769109a683aa",
  },
}
*/

export default function ProfileComponent(props){
    //DA ELIMINARE
    const [base64DaEliminare, setBase64DaEliminare] = useState("");

    //contesto autenticazione
    const {caricaNuovaImmagineDiGalleria,messaggioAuth, user,eliminaImmagineDiGalleria,cambiaImmagineDiProfilo,scaricaUrlImmagine, informazioniProfiloUtente, setInformazioniProfiloUtente, getNomeImmagineDaUrl, getUtenteCorrente} = useContext(AutenticazioneUtente);

    //dati utente
    var {navigation, route} = props;

    //inizializzo la galleria
    const [galleria, setGalleria] = useState([]);

     //riferimento dialog elimina foto
    const dialogEliminaImmagineDiGalleriaRef = useRef();

    //riferimento snackmessage (barra errori)
    const snackMessageRef = useRef();


    console.log("INFORMAZIONI PROFILO UTENTE__________________________________________");
    console.log(galleria);
    /*
        Esempio di struttura di galleria:

        Array [
            Object {
                "name": "3",
                "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3?alt=media&token=b38a0cba-03d5-4275-af0f-86784806ca67",
                "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4",
                "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_25?alt=media&token=5fe1487b-83a8-4c14-baa3-51b10f5344a9",
                "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_50?alt=media&token=817c7f8b-3805-46c5-a116-5435d3e78e0f",
                "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_75?alt=media&token=c3fd1031-7c88-42a2-b1e6-1580837d6573",
            },
            Object {
                "name": "2",
                "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2?alt=media&token=e6242cb3-f76a-4392-96cc-b1f69a037ed1",
                "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
                "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_25?alt=media&token=9d9a53a0-f917-428f-878c-7c3412b51c9b",
                "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_50?alt=media&token=b63bdf55-20b4-4370-adfa-b209d42d5c31",
                "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_75?alt=media&token=ef60eca9-3f81-43db-b288-cc1b4caf6a41",
            },
            Object {
                "name": "1",
                "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1?alt=media&token=24a359e2-005e-4bd8-b684-21af442c0513",
                "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
                "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_25?alt=media&token=22c3bbce-51b2-4315-9094-7da6427bc393",
                "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_50?alt=media&token=f774a4b8-6253-41f5-8087-c6389bd75f9f",
                "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_75?alt=media&token=5b044416-2b3d-4296-897f-378875128be8",
            },
            ] 

    */
        console.log("INFORMAZIONI PROFILO UTENTE::::::::::::::::::");
        
    const inizializzaGalleria = () =>{
        console.log("reinizializzo galleria");
        //console.log(galleria);
        /*
//*        console.log(informazioniProfiloUtente.gallery);
        console.log(informazioniProfiloUtente.urlGalleryImages);
        var tmp = [];
        if(informazioniProfiloUtente.urlGalleryImages){
            let i = 0;
            for(var key of Object.keys(informazioniProfiloUtente.urlGalleryImages).sort()){
                    tmp.push({key: i, name: key, urls: informazioniProfiloUtente.urlGalleryImages[key]});
                    i++;
            }
        } */  
        console.log("Nuove immagini di galleria:");
        console.log(informazioniProfiloUtente.urlGalleryImages);
        let tmp = [...informazioniProfiloUtente.urlGalleryImages];   
        tmp.reverse();
        console.log("tmp reverse:");
        //console.log(tmp);
        setGalleria(tmp);
    }

    function getAge(timestamp) {
        var today = new Date();
        var birthDate = new Date(timestamp.seconds*1000);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    const [daEliminare, setDaEliminare] = useState("");
    const [visibility, setVisibility] = useState("0");
    console.log("Visibilità attuale:"+ visibility);
    //contiene l'uri se non è "null"
    const [urlProfileImage, setUrlProfileImage] = useState("null");
    const [error, setError] = useState(false);
    const isMounted = useRef(false);

    function setSnackMessage(message){
        snackMessageRef.current.setta_messaggio_da_mostrare(message);
    }
    
    useEffect(()=>{
        console.log("chiamo use effect profileComponent");
        isMounted.current = true;

        //ogni volta che cambia informazioniProfiloUtente controllo se è cambiata l'immagine di profilo e in tal caso la salvo in locale
        const getLocalUri = async() =>{
            let actual_remote_uri = "";
            if(visibility=="0") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_0"];
            else if(visibility=="25") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_25"];
            else if(visibility=="50") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_50"];
            else if(visibility=="75") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_75"];
            else if(visibility=="100") actual_remote_uri = informazioniProfiloUtente.urlProfileImage["url_100"];

            try{
                let local_uri = await local_storage.saveImageLocally(getUtenteCorrente(),actual_remote_uri);
                console.log("Local uri:"+local_uri);
                if(isMounted.current==true){
                    setUrlProfileImage(local_uri);
                }
            }catch(e){
                if(isMounted.current==true)
                    setError(true);
                console.log("eccezione galleria: "+e);
            }

        }

        setUrlProfileImage("null");
        getLocalUri();

        inizializzaGalleria();

        return () => isMounted.current = false;
    },[informazioniProfiloUtente.urlGalleryImages, informazioniProfiloUtente.age, informazioniProfiloUtente.self_description, user, visibility])

    //viene usato da uploadImageLoaderScreen per lasciare un messaggio a questo attuale schermo su come è andato l'upload
    useEffect(()=>{
        if(route.params?.uploadImageMex){
            console.log("immagine aggiornata:"+route.params?.uploadImageMex);
            setSnackMessage(route.params?.uploadImageMex);
        }
    },[route.params?.uploadImageMex])

    //per il caricamento
    const [isLoading, setIsLoading] = useState(false);

    //contiene l'indice della foto da eliminare
    const indiceFotoDaEliminare = useRef(-1);

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
    //APRO MENU
    function apriUserSettings(){
        navigation.openDrawer();
    }
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //apri finestra per eliminare foto (gli passo l'indice dell'array gallery dove si trova l'elemento da eliminare)
    function openDialog(indexGallery){
        dialogEliminaImmagineDiGalleriaRef.current.open_dialog();
        indiceFotoDaEliminare.current = indexGallery;
    }
    //chiudo la finestra (resettando l'indice della foto da eliminare)  
    function closeDialog(){
        dialogEliminaImmagineDiGalleriaRef.current.close_dialog();
        indiceFotoDaEliminare.current = -1;
    }

    //ELIMINA FOTO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //si basa sull'indiceFotoDaEliminare (ossia indice dell'array gallery) della foto che è stato settato quando abbiamo chiamato openDialog
    function eliminaImmagineDallaGalleria(){
        console.log("indice in galleria da eliminare"+indiceFotoDaEliminare.current);
        
        if(isLoading==false){
            try{
            setIsLoading(true);
            //const index = indiceFotoDaEliminare.current; //non è l'indice su firebase, ma sull'array locale
            //const url = galleria[index].url;
            //const nome = informazioniProfiloUtente.gallery[informazioniProfiloUtente.gallery.length-1-index];
            //const nome = getNomeImmagineDaUrl(url);
            let nome = galleria[indiceFotoDaEliminare.current].name;
            //console.log("Nome immagine: "+nome);
            const index = galleria.length -1 - indiceFotoDaEliminare.current;
            closeDialog();
            //elimino
            eliminaImmagineDiGalleria(nome) //firebase elimina cercando il valore (ecco perchè diamo url)
                .then(async(ris)=>{
                    setIsLoading(false);
                    console.log("Eliminazione remota completata "+ris);
                    //aggiorno informazioniProfiloUtente
                    var infoUrlGalleryImages = [...informazioniProfiloUtente.urlGalleryImages];
                    console.log("INFOURLGALLERYIMAGES ALL'INDICE "+index);
                    console.log(infoUrlGalleryImages);
                    console.log(infoUrlGalleryImages[index]);
                    Promise.all([local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[index]["url_0"]),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[index].url_25),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[index].url_50),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[index].url_75),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[index].url_100)]).finally(()=>{
                                                //rimuovo elemento
                                                console.log("sto per rimuove elemento da:");
                                                console.log(infoUrlGalleryImages);
                                                //faccio questo if else perchè "delete" si comporta male quando l'array ha un solo elemento
                                                if(infoUrlGalleryImages.length>1)
                                                    delete infoUrlGalleryImages[index];
                                                else
                                                    infoUrlGalleryImages = [];
                                                console.log("elemento eliminato. Nuovo stato:");
                                                console.log(infoUrlGalleryImages);
                                                var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                                                nuoveInformazioniProfilo.urlGalleryImages = infoUrlGalleryImages;
                                                setInformazioniProfiloUtente(nuoveInformazioniProfilo);
                                                indiceFotoDaEliminare.current = -1;
                                                //var tmp = [...galleria];
                                                //tmp.splice(index,1);
                                                //setGalleria(tmp);
                                                setSnackMessage("Foto eliminata con successo.");
                                       })
                }).catch((e)=>{
                    setIsLoading(false);
                    console.log("Errore nell'eliminazione dell'immagine: "+e);
                    console.log(e);
                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                })
        
            }catch(e){
                console.log(e);
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                setIsLoading(false);
            }

        }else {
            setSnackMessage("Attendi la fine del caricamento prima di procedere.");
            setIsLoading(false);
            closeDialog();
        }     
    }

   

    //CAMBIA IMMAGINE PROFILO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //isForProfile contiene true se la richiesta è stata fatta per cambiare l'immagine del profilo, altrimenti per aggiungere una nuova di galleria.
   function aggiungiNuovaImmagine(isForProfile){ 
        if(isLoading==false){
        try{
            setIsLoading(true);
            console.log("apro galleria immagini");
            //chiedo permessi
            ImagePicker.requestMediaLibraryPermissionsAsync(false)
                .then((ris)=>{
                    console.log(ris);
                    //se ha bloccato la possibilità di chiedere i permessi
                    if(ris.canAskAgain==false){
                        setSnackMessage("Vai in impostazioni e consenti a Mosaic di chiedere i permessi per accedere alla galleria.");
                        setIsLoading(false);
                        return;
                    }
                    //se non ha bloccato, ma ha rifiutato di concedere i permessi
                    if(ris.status!="granted"){
                        setSnackMessage("Mosaic ha bisogno del tuo permesso per aprire la galleria.");
                        setIsLoading(false);
                        return;
                    }
                    //se sono qui i permessi sono stati dati
                    //apro galleria
                    ImagePicker.launchImageLibraryAsync({
                                                            mediaTypes: ImagePicker.MediaTypeOptions.Images, //permetto la selezione di sole immagini
                                                            allowsEditing: true, //apro un editor col quale edito la foto
                                                            aspect: [4, 4], //l'editor permette solo un crop quadrato
                                                            quality: 1,
                                                        })
                        .then((ris)=>{
                            console.log("galleria aperta");
                            //se l'operazione non è stata annullata
                            if(!ris.cancelled){
                                //prendo l'uri e lo uso per settare l'immagine di profilo / galleria ma anche per caricarlo sullo storage
                                console.log(ris.uri);
                                const localUri = ris.uri;
                                
                                //modifico l'immagine per ridurne le dimensioni a meno di 1MB cosi da velocizzare lato server la trasformazione e indico il formato come jpg
                                ImageManipulator.manipulateAsync(
                                    localUri,
                                    [{ resize: { width: 800, height: 800 } }],
                                    { format: 'jpeg',base64: true }
                                  ).then((immagineManipolata)=>{
                                      //apro screen per il caricamento dell'immagine
                                      //scelgo il nome
                                      let nomeNuovaImmagine = (informazioniProfiloUtente.urlProfileImage.url_0).includes("profileImage1") ? "profileImage2" : "profileImage1";
                                      if(isForProfile==false){
                                          //prendo l'ultimo nome (in numero) dell'immagine di galleria
                                          if(galleria.length==0)
                                                nomeNuovaImmagine = 0;
                                          else
                                            nomeNuovaImmagine = (parseInt(galleria[0].name) + 1).toString();
                                      }
                                      navigation.navigate("UploadImageLoaderScreen",{isProfileImage: isForProfile ,uri: localUri, base64:immagineManipolata.base64, nomeNuovaImmagine: nomeNuovaImmagine});
                                  }).catch((e)=>{
                                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                    console.log("photo.js errore2:"+e);
                                  })

                                setIsLoading(false);
                                }
                            else 
                                //se l'operazione è stata annullata
                                setIsLoading(false);
    
                            })}).catch((e)=>{
                    setIsLoading(false);
                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                    console.log("photo.js errore1:"+e);
                })
            }catch(e){
                setIsLoading(false);
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                console.log("errore galleria:"+e);
            }

        }else {
            setSnackMessage("Attendi la fine del caricamento prima di procedere.");
            setIsLoading(false);
            closeDialog();
        }  
    }

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Profile</Text>
                <TouchableOpacity onPress={apriUserSettings} style={{position:"absolute", right:Dimensions.get("window").width*0.03}}>
                        <MaterialIcons name="menu" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
                <ActivityIndicator animating={isLoading} size={fontSizeTitoloBarra} color={MosCeleste} style={{position:"absolute", left:Dimensions.get("window").width*0.03}} />
            </View>
            <ScrollView horizontal={false}>

            <View style={{ flex: 1, justifyContent: 'flex-start', width:larghezzaDevice}}>
                    <View style={{ paddingBottom:30}}>
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo} >
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <ActivityIndicator animating={urlProfileImage!="null"} size={fontSizeTitoloBarra} color={MosCeleste} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}/>
                            {urlProfileImage!="null" && error==false && <Image source={{uri:urlProfileImage}} resizeMode="cover"  style={styles.immagineProfilo}/>}
                            {error==true && <Text style={{position:"absolute", textAlign:"center", color:"white", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                            </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* icona chat */}
                        <TouchableOpacity style={styles.modificaImmagineProfiloIcon} onPress={()=>aggiungiNuovaImmagine(true)}>
                            <Entypo name="pencil" size={altezzaSezioneImmagineProfilo*0.1} color={MosCeleste} />
                        </TouchableOpacity>
                    </View>

                    {/* NOME */}
                    <View style = {styles.areaDettagliUtente}>
                        <Text style={styles.nome}>{informazioniProfiloUtente.name.charAt(0).toUpperCase()+informazioniProfiloUtente.name.slice(1)}</Text>
                        <Entypo name="dot-single" size={24} color="#52575D" />
                        <Text style={styles.age}>{informazioniProfiloUtente.age}</Text>
                    </View>

                    {/* DESCRIZIONE */}
                    <View style ={styles.areaDescrizione}>
                        <Text style={styles.descrizioneTesto}>{informazioniProfiloUtente.self_description}</Text>
                    </View>
                    </View>
                    <View style={{backgroundColor:"#fff"}}>
                    <LinearGradient
                        // Background Linear Gradient sopra chat
                        colors={["rgb(219, 219, 219)",'transparent']}
                        style={{width: larghezzaDevice,height: 50, position:"absolute"}}
                        />
                {/*SEZIONE DELLA GALLERIA */}  
                    <View style={styles.sezioneGalleria}>

                        {/* GALLERIA */}

                        <GalleriaImmagini galleria={galleria} openDialog={openDialog} getUtenteCorrente={getUtenteCorrente} visibility={visibility} />

                    </View>
                    </View>
                </View>

                </ScrollView>

                <View style={{width:larghezzaDevice, position:"absolute", height:"100%" }}>
                    {/*Bottone aggiungi foto */}
                    <FAB
                                    style={styles.bottoneAggiungiFoto}
                                    //small
                                    icon="image-plus"
                                    color={MosCeleste}
                                    onPress={()=>aggiungiNuovaImmagine(false)}/>
                    
                    <VisibilityFAB larghezzaSchermo = {larghezzaSchermo} altezzaSezioneGalleria={altezzaSezioneGalleria} setVisibility={setVisibility} visibility={visibility}/>
                </View>
                
                {/*MOSTRA L'ERRORE */}
                <SnackMessage ref = {snackMessageRef} />

                <DialogEliminaImmagineDiGalleria ref = {dialogEliminaImmagineDiGalleriaRef} eliminaImmagineDallaGalleria={eliminaImmagineDallaGalleria}  />


                        
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
        //borderBottomColor:"#e6e6e6",
        //borderBottomWidth:0.7,
    },
    nome:{
        fontFamily: "Raleway_200ExtraLight",
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
        backgroundColor:"#fff"
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