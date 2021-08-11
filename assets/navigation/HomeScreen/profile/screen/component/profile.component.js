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
  "urlGalleryImages": Object {
    "2021-08-10T07:42:23:333Z": Object {
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z?alt=media&token=fcb7581b-0feb-4edb-bee4-1e6fbc91cf2f",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_100?alt=media&token=2cc1e97a-6747-4ee9-ab4d-225598950933",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_25?alt=media&token=acbedbc0-d8bf-4104-a63b-0281d6d7f525",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_50?alt=media&token=18e69acc-f5f8-4b1a-8e71-1212ecc6e3fa",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_75?alt=media&token=dd079c57-d70f-4dbc-86b9-8cf616e5c344",
    },
    "2021-08-10T07:46:34:436Z": Object {
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z?alt=media&token=282e57aa-c66c-49ab-93d9-a04700e74484",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_100?alt=media&token=3eb36e5e-07eb-4c78-bece-8fed9eeef9cb",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_25?alt=media&token=8aa22505-2c83-4945-9309-19e2de196678",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_50?alt=media&token=d928de3d-8ab5-4ad7-b240-ecd246eeec52",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_75?alt=media&token=17e78f0f-a25d-49c3-8dfb-985400ebe0e7",
    },
    "2021-08-10T07:49:26:620Z": Object {
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z?alt=media&token=3219b7a1-91df-4d05-a8cb-e35d7397d601",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_100?alt=media&token=32f66c21-007c-45a9-a183-9321441291af",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_25?alt=media&token=ca87ed23-5f59-4fa0-bc5c-52ecd2143861",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_50?alt=media&token=7cf9205b-75a5-4b49-a9f4-9dac68706f90",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_75?alt=media&token=b742c8d6-dd31-458e-adb5-dd8814e8648d",
    },
    "2021-08-10T07:53:33:412Z": Object {
      "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z?alt=media&token=e55fb9a1-ab29-4a28-9a6f-1356270f6647",
      "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_100?alt=media&token=93e32422-3202-4393-a3b6-1808e2ac7655",
      "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_25?alt=media&token=4e2eea43-fa8c-4064-97bf-8689397960d0",
      "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_50?alt=media&token=e9cfb3ea-4853-4e76-884b-6df6843c6363",
      "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_75?alt=media&token=2e726f9a-4d52-4405-891c-17e91f6acba8",
    },
  },
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


    //console.log("INFORMAZIONI PROFILO UTENTE__________________________________________");
   // console.log(informazioniProfiloUtente);
    /*
        Esempio di struttura di galleria:

        Array [
            Object {
                "key": 3,
                "name": "2021-08-10T07:53:33:412Z",
                "urls": Object {
                    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z?alt=media&token=e55fb9a1-ab29-4a28-9a6f-1356270f6647",
                    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_100?alt=media&token=93e32422-3202-4393-a3b6-1808e2ac7655",
                    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_25?alt=media&token=4e2eea43-fa8c-4064-97bf-8689397960d0",
                    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_50?alt=media&token=e9cfb3ea-4853-4e76-884b-6df6843c6363",
                    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A53%3A33%3A412Z_75?alt=media&token=2e726f9a-4d52-4405-891c-17e91f6acba8",
                },
            },
            Object {
                "key": 2,
                "name": "2021-08-10T07:49:26:620Z",
                "urls": Object {
                    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z?alt=media&token=3219b7a1-91df-4d05-a8cb-e35d7397d601",
                    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_100?alt=media&token=32f66c21-007c-45a9-a183-9321441291af",
                    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_25?alt=media&token=ca87ed23-5f59-4fa0-bc5c-52ecd2143861",
                    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_50?alt=media&token=7cf9205b-75a5-4b49-a9f4-9dac68706f90",
                    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A49%3A26%3A620Z_75?alt=media&token=b742c8d6-dd31-458e-adb5-dd8814e8648d",
                },
            },
            Object {
                "key": 1,
                "name": "2021-08-10T07:46:34:436Z",
                "urls": Object {
                    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z?alt=media&token=282e57aa-c66c-49ab-93d9-a04700e74484",
                    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_100?alt=media&token=3eb36e5e-07eb-4c78-bece-8fed9eeef9cb",
                    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_25?alt=media&token=8aa22505-2c83-4945-9309-19e2de196678",
                    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_50?alt=media&token=d928de3d-8ab5-4ad7-b240-ecd246eeec52",
                    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A46%3A34%3A436Z_75?alt=media&token=17e78f0f-a25d-49c3-8dfb-985400ebe0e7",
                },
            },
            Object {
                "key": 0,
                "name": "2021-08-10T07:42:23:333Z",
                "urls": Object {
                    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z?alt=media&token=fcb7581b-0feb-4edb-bee4-1e6fbc91cf2f",
                    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_100?alt=media&token=2cc1e97a-6747-4ee9-ab4d-225598950933",
                    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_25?alt=media&token=acbedbc0-d8bf-4104-a63b-0281d6d7f525",
                    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_50?alt=media&token=18e69acc-f5f8-4b1a-8e71-1212ecc6e3fa",
                    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_75?alt=media&token=dd079c57-d70f-4dbc-86b9-8cf616e5c344",
                },
            },
        ]

    */

    const inizializzaGalleria = () =>{
        console.log("reinizializzo galleria");
        console.log(galleria);
//*        console.log(informazioniProfiloUtente.gallery);
        console.log(informazioniProfiloUtente.urlGalleryImages);
        var tmp = [];
        if(informazioniProfiloUtente.urlGalleryImages){
            let i = 0;
            for(var key of Object.keys(informazioniProfiloUtente.urlGalleryImages).sort()){
                    tmp.push({key: i, name: key, urls: informazioniProfiloUtente.urlGalleryImages[key]});
                    i++;
            }
        }       
        tmp.reverse();
        console.log("tmp reverse:");
        console.log(tmp);
        setGalleria(tmp);
    }

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
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
    },[informazioniProfiloUtente, visibility])

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

    //apri finestra per eliminare foto (gli passo la key (NB: non l'indice) della foto della galleria che potenzialmente vorrei eliminare)
    function openDialog(key){
        dialogEliminaImmagineDiGalleriaRef.current.open_dialog();
        indiceFotoDaEliminare.current = key.toString();
    }
    //chiudo la finestra (resettando l'indice della foto da eliminare)  
    function closeDialog(){
        dialogEliminaImmagineDiGalleriaRef.current.close_dialog();
        indiceFotoDaEliminare.current = -1;
    }

    //ELIMINA FOTO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //si basa sull'indice della foto che è stato settato quando abbiamo chiamato openDialog
    function eliminaImmagineDallaGalleria(){
        console.log("nome da eliminare"+indiceFotoDaEliminare.current);
        
        if(isLoading==false){
            try{
            setIsLoading(true);
            //const index = indiceFotoDaEliminare.current; //non è l'indice su firebase, ma sull'array locale
            //const url = galleria[index].url;
            //const nome = informazioniProfiloUtente.gallery[informazioniProfiloUtente.gallery.length-1-index];
            //const nome = getNomeImmagineDaUrl(url);
            let nome = indiceFotoDaEliminare.current;
            //console.log("Nome immagine: "+nome);
            closeDialog();
            
            //elimino
            eliminaImmagineDiGalleria(nome) //firebase elimina cercando il valore (ecco perchè diamo url)
                .then(async(ris)=>{
                    setIsLoading(false);
                    console.log("Eliminazione remota completata "+ris);
                    //aggiorno informazioniProfiloUtente
                    var infoUrlGalleryImages = JSON.parse(JSON.stringify(informazioniProfiloUtente.urlGalleryImages));
                    Promise.all([local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[nome].url_0),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[nome].url_25),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[nome].url_50),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[nome].url_75),
                                       local_storage.removeImageLocally(getUtenteCorrente(),infoUrlGalleryImages[nome].url_100)]).finally(()=>{
                                                //rimuovo elemento
                                                delete infoUrlGalleryImages[nome];
                                                var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                                                nuoveInformazioniProfilo.urlGalleryImages = infoUrlGalleryImages;
                                                setInformazioniProfiloUtente(nuoveInformazioniProfilo);

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
                <ScrollView horizontal={false} horizontal={true} showsHorizontalScrollIndicator={false} style={{width:larghezzaDevice}}>
            <View style={{ flex: 1, justifyContent: 'flex-start', width:larghezzaDevice}}>
                    
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <ActivityIndicator animating={urlProfileImage!="null"} size={fontSizeTitoloBarra} color={MosCeleste} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}/>
                            {urlProfileImage!="null" && error==false && <Image source={{uri:urlProfileImage}} resizeMode="cover"  style={styles.immagineProfilo} />}
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
                        <Text style={styles.age}>{getAge(informazioniProfiloUtente.date_of_birth)}</Text>
                    </View>

                    {/* DESCRIZIONE */}
                    <View style ={styles.areaDescrizione}>
                        <Text style={styles.descrizioneTesto}>"Ciao mi chiamo Giulio e sono uno studente. Sono nato ad Alcamo ma studio a Pisa."</Text>
                    </View>
                    <Divider />
                    
                {/*SEZIONE DELLA GALLERIA */}  
                    <View style={styles.sezioneGalleria}>

                        {/* GALLERIA */}

                        <GalleriaImmagini galleria={galleria} openDialog={openDialog} getUtenteCorrente={getUtenteCorrente} visibility={visibility} />

                    </View>
                </View>
                </ScrollView>
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
    sezioneGalleria: {
        width:larghezzaSchermo,
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