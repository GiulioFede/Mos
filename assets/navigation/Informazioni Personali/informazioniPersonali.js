import React, {useState, useRef, useContext, useEffect} from "react";
import {View, Text,Dimensions,StyleSheet, TouchableOpacity, TextInput, ScrollView,KeyboardAvoidingView, Button, Platform,BackHandler, FlatList} from "react-native"
import { FAB, Snackbar, ActivityIndicator, Divider} from 'react-native-paper';
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloBarra, fontSizeTitoloCampo, iconSize, larghezzaDevice } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple, MosViola } from "../../resources/colors";
import {Ionicons, AntDesign,MaterialIcons, Entypo} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./components/datePicker";
import * as Location from 'expo-location';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import { geohashForLocation } from "geofire-common";
import AreaSceltaGenere from "./components/areaSceltaGenere";
import SliderKMPreference from "./components/sliderKmPreference";
import localStorage from "../../context/local_storage/localStorage";
import AgeRange from "./components/ageRange";
import { getAgeFromTimestamp } from "../../context/utilities/functions.utilities";
import { LocationAccuracy } from "expo-location";
import ShowMe from "./components/showMeCheckBox";
import Loading from "../HomeScreen/aroundYou/component/loading";
import GenericDialog from "./components/genericDialog";
import i18n from 'i18n-js';

let tmpKeywordArray = [];
let check = false;

export default function InformazioniPersonali({ navigation }) {

    var {user,informazioniProfiloUtente,setInformazioniProfiloUtente, informazioniAutenticazioneUtente, aggiornaEmail, inviaEmailDiVerifica, setMessaggioAuth,aggiornaDettagliProfiloUtente,logOut} = useContext(AutenticazioneUtente);

    const [isLoading, setIsLoading] = useState(false);

    const isMounted = useRef(true);

    const scrollView = useRef();

    //indica dove è stata fatta la modifica (dataDiNascita, descrizione, posizione, identità di genere, occupazione, keywords, slider km, range età, show me) NB: slider km e range età vengono trattati diversamente dagli altri dato che vengono salvati in locale
    var indiciModifiche = useRef([false,false,false,false,false, false, false, false, false, false, false]);

    const [auth, setAuth] = useState(informazioniAutenticazioneUtente!=null?((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]):null);
    const [erroreAuth, setErroreAuth] = useState(null);

    const [nome, setNome] = useState("");

    const [descrizione, setDescrizione] = useState(informazioniProfiloUtente.self_description);
    
    const [occupazione, setOccupazione] = useState(informazioniProfiloUtente.current_occupation);

    const [dataDiNascita, setDataDiNascita] = useState(informazioniProfiloUtente.date_of_birth);
    const [erroreData, setErroreData] = useState(null);

    const [keywordArray, setKeywordArray] = useState(Object.keys(informazioniProfiloUtente.hobbies_interests_and_passions).map(function(key,index){
            return {id: index, keyword: informazioniProfiloUtente.hobbies_interests_and_passions[index]}
    }))

    const sliderKMRef = useRef();

    const rangeEtaRef = useRef();

    const showMeRef = useRef();

    const loadingRef = useRef();

    const genericDialogRef = useRef();

    const [provaAlternativaGeocode, setProvaAlternativaGeocode] = useState(false);
    const [geocodeResponse, setGeocodeResponse] = useState(null); //3 stati: nullo, false (almeno una tra città, regione o paese non è stata calcolata), <valore> (contiene la stringa città,regione e paese)
    const [indirizzo, setUltimoIndirizzo] = useState("");

    const [isLocationLoading, setIsLocationLoading] = useState("");

    var posizioneUtente = useRef("");

    const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

    //messaggio snack
    const [snackMessage, setSnackMessage] = useState(null);
    //reference flat list keywords
    const flatListKeywordRef = useRef();


    function controllaEmail(){
        console.log("controllo email...");
        setErroreAuth(null);
        if(auth==informazioniAutenticazioneUtente[0]){
            setErroreAuth(i18n.t('emailAddressIsAlreadyInUse'));
            return false;
        }
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(auth))
        {
            //se è corretta
            setErroreAuth(null);
            //avverto che è avvenuta una modifica
            indiciModifiche.current[0]=true;
            return true;
        }
        
        setErroreAuth(i18n.t('err_invalidEmail'));
        return false;
    }

    function aggiornaEmailUtente(){
        if(!controllaEmail()) return;
        console.log("aggiorna email:"+auth);
        if(erroreAuth==null){
            try{
                setIsLoading(true);
                aggiornaEmail(auth)
                    .then((ris)=>{
                        console.log("email cambiata:"+ris);
                        //invia email di verifica
                        inviaEmailDiVerifica(user).then((ris)=>{
                            setMessaggioAuth(i18n.t('verificationNewEmail_pt1')+auth+i18n.t('verificationNewEmail_pt2'));
                        }).catch((e)=>{
                            
                        });
                        //in ogni caso esegui il log out. L'utente avrà comunque possibilità di farsi mandare l'email di verifica se non l'ha ricevuta.
                        setIsLoading(false);
                        logOut();
                        navigation.navigate("LoginScreen");
                    }).catch((e)=>{
                        setIsLoading(false);
                        var code = e.code;
                        var mex = i18n.t('err_generic');
                        if(code=="auth/email-already-in-use")
                            mex = i18n.t('emailAddressIsAlreadyInUse');
                        if(code=="auth/requires-recent-login")
                            mex= i18n.t('forSecurityReasonLoginAgain');
                        else if(code=="auth/too-many-requests")
                            mex =  i18n.t('err_youHaveMadeTooManyRequests');
                        else if(code=="auth/network-request-failed")
                            mex = i18n.t('err_networkProblem');
                        else if(code=="auth/invalid-email")
                            mex = i18n.t('err_invalidEmail');

                        setErroreAuth(mex);
                        console.log("errore interno nell'aggiornare l'email: "+e.code+","+e);
                    })
            }catch(e){
                setIsLoading(false);
                console.log("errore nell'aggiornare l'email: "+e.code+","+e);
                setErroreAuth(i18n.t('err_generic'));
            }
        }
}


function aggiornaPhoneNumber(){
    navigation.closeDrawer();
    console.log("aggiorno numero di telefono:"+auth);
    //apro phoneauth
    navigation.navigate("PhoneAuthScreen",{updatePhoneNumber:"yes", oldNumber:informazioniAutenticazioneUtente[1]}); //indico che tale schermo deve essere aperto per eseguire l'aggiornamento del numero di telefono
}

    function notificaModifiche(){
        for(var i=0; i<9; i++){
            if(indiciModifiche.current[i]==true){
                console.log("modifica "+i);
                scrollView.current.scrollToEnd({animated: true});
                return;
            }
        }
    }

    //DATA DI NASCITA::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function modificaDataDiNascita(data){
        console.log("data di nascita settata: "+data);
        //l'oggetto data è di tipo Date
        const today = new Date();
        if (Math.abs(today.getFullYear()- data.getFullYear()<14)){
            setErroreData(i18n.t('ageConstraint'));
        }
        else {
            setErroreData(null);
            let data_str = data;//.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
            console.log("setto data di nascita in modificaDataDiNascita uguale a "+data_str.toString());
            setDataDiNascita({nanoseconds:0, seconds:data_str.getTime()/1000});
            //console.log(informazioniProfiloUtente.date_of_birth+","+data_str);
            //avverto che è avvenuta una modifica se questa è diversa dalla precedente
            if(informazioniProfiloUtente.date_of_birth!=data_str){
                indiciModifiche.current[0]=true;
            }else {
                indiciModifiche.current[0]=false;
            }
        }
    }

    function apriDatePicker(){
        setIsDatePickerOpened(true);
    }

    const [apriArea, setApriArea] = useState(false);
    const [apriArea2, setApriArea2] = useState(false);

    //LOCATION::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function ottieniPosizioneUtente(){

        setIsLocationLoading("loading");
        //controllo se la locazione è attiva...
        try{
        console.log("controllo se il provider è acceso...")
        Location.hasServicesEnabledAsync()
            .then((ris)=>{
                //se la locazione non è attiva
                if(ris==false){
                    console.log("provider non acceso:"+ris);
                    setSnackMessage(i18n.t('activateGeolocation'));
                    setIsLocationLoading("");
                }
                //altrimenti se è attiva...
                else {
                    console.log("provider acceso:"+ris+". Controllo permessi:");
                    //controlla se l'utente ha già accontentito a darci i permessi
                    Location.requestForegroundPermissionsAsync()
                        .then(async(ris)=>{
                            //se l'utente non ha permesso più di chiedere la posizione ancora una volta...
                            if(ris.status != "granted"){
                                console.log("permessi negati:"+ris);
                                setIsLocationLoading("");
                                setSnackMessage(i18n.t('goToSettingsAndAllowMosaicToAskAgain'));
                                return;
                            }
                            console.log("permessi concessi:");
                            console.log(ris);
                            var isAccepted= "none";                            
                            if(Platform.OS==="android")
                                isAccepted = ris.android.accuracy;
                            else if(Platform.OS==="ios")
                                isAccepted = ris.scope;
                            console.log(isAccepted);
                            if(isAccepted=="none"){
                                //non ha accettato
                                console.log("isAccepted è none!")
                                setIsLocationLoading("");
                                setSnackMessage(i18n.t('impossibleToUpdatePosition'));
                                return;
                            }else {
                                console.log("ha accettato. Ottengo posizione...");
                                //ha accettato
                                Location.getCurrentPositionAsync({ enableHighAccuracy: true })
                                    .then((pos)=>{
                                        console.log("posizione ottenuta");
                                        if(pos==null) {
                                            console.log("errore in informazioni personali:"+e);
                                            setIsLocationLoading("");
                                            setSnackMessage(i18n.t('err_generic'));
                                            return;
                                        }
                                        console.log(pos);
                                        setIsLocationLoading("aggiornata");
                                        //ottieni la posizione
                                        const user_position = [pos.coords.latitude,pos.coords.longitude];
                                        console.log(pos);
                                        console.log(user_position);
                                        Location.reverseGeocodeAsync({latitude:pos.coords.latitude, longitude:pos.coords.longitude}, {useGoogleMaps:false})
                                           .then((ris)=>{
                                                //console.log("ADDRESS OBJECT USER");
                                                console.log(ris);
                                                user_position.push(ris[0].city==null?"null":(ris[0].city) );
                                                user_position.push(ris[0].region==null?"null":(ris[0].region));
                                                user_position.push(ris[0].country==null?"null":(ris[0].country));
                                                posizioneUtente.current=user_position;
                                                //avverto che è avvenuta una modifica
                                                indiciModifiche.current[2]=true;
                                                notificaModifiche();
                                                console.log("nuove modifiche alla posizione:");
                                                console.log(posizioneUtente.current);
                                            }).catch((e)=>{
                                                console.log("errore aggiornamento posizione:"+e);
                                                setSnackMessage(i18n.t('retryToGetPosition'))
                                            });
                                    }).catch((e)=>{
                                        console.log("errore in informazioni personali:"+e);
                                        setIsLocationLoading("");
                                        if(provaAlternativaGeocode==false){
                                            setSnackMessage(i18n.t('tryThisAlternative'));
                                            setProvaAlternativaGeocode(true);
                                        }
                                        else 
                                            setSnackMessage(i18n.t('err_generic'));
                                    });
                            } 
                        }).catch((e)=>{
                            console.log("errore in informazioni personali:"+e);
                            setIsLocationLoading("");
                            if(provaAlternativaGeocode==false){
                                setSnackMessage(i18n.t('tryThisAlternative'));
                                setProvaAlternativaGeocode(true);
                            }
                            else 
                                setSnackMessage(i18n.t('err_generic'));
                        })

                }
            }).catch((e)=>{
                setIsLocationLoading("");
                if(provaAlternativaGeocode==false){
                    setSnackMessage(i18n.t('tryThisAlternative'));
                    setProvaAlternativaGeocode(true);
                }
                else 
                    setSnackMessage(i18n.t('err_generic'));
            })
        }catch(e){
            setIsLocationLoading("");
            setSnackMessage(i18n.t('err_generic'))
        }
    }

    function modificaDescrizione(){
        setDescrizione(descrizione.replace(/\s*$/,""));
        //se era diversa da prima
        if(descrizione != informazioniProfiloUtente.self_description)
            indiciModifiche.current[1]=true;
        else
            indiciModifiche.current[1]=false;
        notificaModifiche();
    }

    function modificaOccupazione(){
        setOccupazione(occupazione.replace(/\s*$/,""));
        //se era diversa da prima
        if(occupazione != informazioniProfiloUtente.current_occupation)
            indiciModifiche.current[5] = true;
        else
            indiciModifiche.current[5] = false;
        notificaModifiche();
    }

    //keyword
    //keyword hobby,interessi e passioni
    const [keyword, setUltimaKeyword] = useState('');

    function inserisciKeyword(){
        //controllo che l'attuale keyword non sia vuota
        if(keyword.length>0){
            //controllo che l'attuale keyword non sia già presente
            check = false;
            for(let i=0; i<keywordArray.length;i++){
                if(keywordArray[i].keyword.toUpperCase()===keyword.toUpperCase()){
                    check = true;
                    break;
                }
            }
            //se è stato trovato un doppione esco e avviso
            if(check==true){
                setSnackMessage(i18n.t('keywordAlreadyExists_pt1')+keyword.toUpperCase()+i18n.t('keywordAlreadyExists_pt2'));
                return;
            }
            //inserisco nella flatlist
            //se la flatlist è vuota...
            if(keywordArray.length==0)
                tmpKeywordArray = [{id:0, keyword:keyword.toUpperCase()}]
            else
                tmpKeywordArray = [...keywordArray,{id:((keywordArray[keywordArray.length-1].id)+1), keyword:keyword.toUpperCase()}];
            setKeywordArray(tmpKeywordArray);
            setUltimaKeyword("");
        }
    }

    function eliminaKeyword(index){
        tmpKeywordArray = [...keywordArray];
        tmpKeywordArray.splice(index,1);
        setKeywordArray(tmpKeywordArray);
    }

    const [identitaDiGenere, setIdentitaDiGenere] = useState(informazioniProfiloUtente.gender_identity);
    function modificaIdentitaDiGenere(newGender){
        setIdentitaDiGenere(newGender);
        //se è diversa dalla precedente
        if(newGender != informazioniProfiloUtente.gender_identity)
            indiciModifiche.current[3] = true;
        else
            indiciModifiche.current[3] = false;
        
        notificaModifiche();
    }

    
    const [orientamentoSessuale, setOrientamentoSessuale] = useState("");
    function modificaOrientamentoSessuale(tipo){
        console.log("attrazione:"+tipo);
        setOrientamentoSessuale(tipo);

        if(tipo==informazioniProfiloUtente.gender_preference)
            indiciModifiche.current[4]=false;
        else
            indiciModifiche.current[4]=true;

        notificaModifiche();
    }

    const raggioDiAzione = useRef();
    function modificaPreferenzaRaggioDiAzione(vecchio, nuovo){
        console.log("modifica preferenza raggio di azione..");
        raggioDiAzione.current = nuovo;
        if(vecchio==nuovo)
            indiciModifiche.current[7] = false;
        else
            indiciModifiche.current[7] = true;
        
        notificaModifiche();
    }

    const rangeEta = useRef();
    function modificaPreferenzaRangeDiEta(min, max){
        console.log("nuovo range di età:"+min+","+max);
        rangeEta.current=[min,max];
        indiciModifiche.current[8] = true;
        notificaModifiche();

    }

    function modificaShowMe(val){
        console.log("show me:"+val);

        if(val==informazioniProfiloUtente.show_me)
            indiciModifiche.current[9]=false;
        else
            indiciModifiche.current[9]=true;

        notificaModifiche();
    }

    function getTranslatedGender(genId){
        if(genId=="male") return i18n.t('male2').toLowerCase();
        else if(genId=="female") return i18n.t('female2').toLowerCase();
        else if(genId=="androgynous") return i18n.t('androgynous2').toLowerCase();
        else if(genId=="third gender") return i18n.t('thirdGender2').toLowerCase();
        else if(genId=="transexual") return i18n.t('transexual2').toLowerCase();
        else if(genId=="demi androgynous") return i18n.t('demiAndrogynous2').toLowerCase();
        else return genId;
    }


    async function salvaDettagliUtente(){

        console.log("vecchie keyword:");
        console.log(informazioniProfiloUtente.hobbies_interests_and_passions);
        console.log("nuove keyword:");
        console.log(keywordArray);
        //controllo che le keyword siano diverse dall'ultima volta
        //1) se la dimensione dell'array è diversa allora sicuramente sono cambiate
        if(informazioniProfiloUtente.hobbies_interests_and_passions.length!=keywordArray.length){
            indiciModifiche.current[6] = true;
        }
        //2) altrimenti se è ancora uguale può comunque essere che una parola vecchia è stata eliminata e una nuova inserita
        else {
            for(let i=0; i<informazioniProfiloUtente.hobbies_interests_and_passions.length; i++){
                check = false;
                for(let j=0; j<keywordArray.length; j++){
                    //controllo che la i-esima keyword vecchia ci sia nell'array nuovo
                    if(informazioniProfiloUtente.hobbies_interests_and_passions[i]==keywordArray[j].keyword){
                        check = true; //è ancora presente
                        break;
                    }
                }
                //se non è presente allora l'array è cambiato, bisogna salvarlo
                if(check==false) {
                    indiciModifiche.current[6] = true;
                    break;
                }
            }
        }

        var doc = {};
        for(var i=0; i<10; i++){
            if(indiciModifiche.current[i]==true){
                if(i==0) doc["date_of_birth"] = new Date(dataDiNascita.seconds*1000);
                if(i==0) doc["age"] = getAgeFromTimestamp(dataDiNascita);
                else if(i==1) doc["self_description"] = descrizione;
                else if(i==2) {
                    doc["location.lat"]=posizioneUtente.current[0];
                    doc["location.lng"]=posizioneUtente.current[1];
                    doc["location.city"]=posizioneUtente.current[2];
                    doc["location.region"]=posizioneUtente.current[3];
                    doc["location.country"]=posizioneUtente.current[4];
                    let hash = geohashForLocation([posizioneUtente.current[0], posizioneUtente.current[1]]);
                    doc["location.geohash"] = hash.substring(0,5);
                }
                else if(i==3) doc["gender_identity"] = identitaDiGenere;
                else if(i==4) doc["gender_preference"] = orientamentoSessuale;
                else if(i==5) doc["current_occupation"] = occupazione;
                else if(i==6) doc["hobbies_interests_and_passions"] = Object.keys(keywordArray).map(function(k,i){
                                                                            return keywordArray[i].keyword;
                                                                        })
                else if(i==9) doc["show_me"] = showMeRef.current.get_checkValue();
                
            }
        }

        console.log(doc);

        if(Object.entries(doc).length !== 0){
            setIsLoading(true);
            try{
                aggiornaDettagliProfiloUtente(user,doc)
                    .then(async(ris)=>{
                        //aggiorno autenticazione
                        for(var i=0; i<10; i++){
                            if(indiciModifiche.current[i]==true){
                                if(i==0) informazioniProfiloUtente.date_of_birth = {nanoseconds: 0, seconds: dataDiNascita.seconds};
                                if(i==0) informazioniProfiloUtente.age = getAgeFromTimestamp(dataDiNascita);
                                else if(i==1) informazioniProfiloUtente.self_description = descrizione;
                                else if(i==2) {
                                    informazioniProfiloUtente.location.lat = posizioneUtente.current[0];
                                    informazioniProfiloUtente.location.lng = posizioneUtente.current[1];
                                    informazioniProfiloUtente.location.city = posizioneUtente.current[2];
                                    informazioniProfiloUtente.location.region = posizioneUtente.current[3];
                                    informazioniProfiloUtente.location.country = posizioneUtente.current[4];
                                    let hash = geohashForLocation([posizioneUtente.current[0], posizioneUtente.current[1]]);
                                    informazioniProfiloUtente.location.geohash = hash.substring(0,5);
                                }
                                else if(i==3) informazioniProfiloUtente.gender_identity = identitaDiGenere;
                                else if(i==4) informazioniProfiloUtente.gender_preference = orientamentoSessuale;
                                else if(i==5) informazioniProfiloUtente.current_occupation = occupazione;
                                else if(i==6) informazioniProfiloUtente.hobbies_interests_and_passions = Object.keys(keywordArray).map(function(k,i){
                                                                                                            return keywordArray[i].keyword;
                                                                                                        })
                                else if(i==9) informazioniProfiloUtente.show_me = showMeRef.current.get_checkValue();
                            }
                        }

                        let informazioniProfiloUtenteTMP = JSON.parse(JSON.stringify(informazioniProfiloUtente));

                        //controllo se ci sono preferenze locali da aggiornare
                        if(indiciModifiche.current[7]==true){
                            console.log("operazione di modifica preferenza raggio di azione in corso...");
                            await localStorage.savePreference(user,"action_range",raggioDiAzione.current);
                            informazioniProfiloUtenteTMP.action_range_preference = raggioDiAzione.current;
                        }

                        //controllo se ci sono preferenze locali da aggiornare
                        if(indiciModifiche.current[8]==true){
                            console.log("operazione di modifica preferenza età in corso...");
                            await localStorage.savePreference(user,"age_range",rangeEta.current[0]+","+rangeEta.current[1]);
                            informazioniProfiloUtenteTMP.action_range_preference = rangeEta.current;
                        }

                        setInformazioniProfiloUtente(informazioniProfiloUtenteTMP);

                        //resetto
                        resetta();
                        setSnackMessage(i18n.t('profileUpdateSuccesfully'));
                        setIsLoading(false);
                    }).catch((e)=>{
                        console.log("errore:"+e.code+","+e);
                        setIsLoading(false);
                        setSnackMessage(i18n.t('err_generic'));
                    })
            }catch(e){
                console.log("errore:"+e);
                setIsLoading(false);
                setSnackMessage(i18n.t('err_generic'));
            }
        }
        //altrimenti se nessuna modifica riguarda il remoto ma solo il locale
        //controllo se ci sono preferenze locali da aggiornare
        else if(indiciModifiche.current[7]==true || indiciModifiche.current[8]==true){
            try{
                setIsLoading(true);
                let informazioniProfiloUtenteTMP = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                if(indiciModifiche.current[7]==true){
                    console.log("operazione di modifica preferenza raggio di azione in corso...");
                    await localStorage.savePreference(user,"action_range",raggioDiAzione.current);
                    informazioniProfiloUtenteTMP.action_range_preference = raggioDiAzione.current;
                }
                else {
                    console.log("operazione di modifica preferenza età in corso...");
                    await localStorage.savePreference(user,"age_range",rangeEta.current[0]+","+rangeEta.current[1]);
                    informazioniProfiloUtenteTMP.action_range_preference = rangeEta.current;
                }

                setInformazioniProfiloUtente(informazioniProfiloUtenteTMP);
                await resetta();
                setSnackMessage(i18n.t('profileUpdateSuccesfully'));
                setIsLoading(false);
            }catch(e){
                setSnackMessage(i18n.t('savingPreferenceFailed'));
            }
        }

    }

    async function resetta(){
        //prima resetto tutti i campi con l'ultima modifica salvata
        if(informazioniAutenticazioneUtente!=null)
            setAuth((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]);
        //setDataDiNascita(informazioniProfiloUtente.dateOfBirth);
        setIsLocationLoading("");
        setDataDiNascita(informazioniProfiloUtente.date_of_birth);
        setIdentitaDiGenere(informazioniProfiloUtente.gender_identity);
        setOrientamentoSessuale(informazioniProfiloUtente.gender_preference);
        setDescrizione(informazioniProfiloUtente.self_description);
        setOccupazione(informazioniProfiloUtente.current_occupation);
        setKeywordArray(Object.keys(informazioniProfiloUtente.hobbies_interests_and_passions).map(function(key,index){
            return {id: index, keyword: informazioniProfiloUtente.hobbies_interests_and_passions[index]}
        }))

        await sliderKMRef.current.resetta();
        await rangeEtaRef.current.resetta();
        showMeRef.current.set_check(informazioniProfiloUtente.show_me);

        setGeocodeResponse(null);
        setUltimoIndirizzo("");
        setProvaAlternativaGeocode(false);

        //resetto tutti gli errori
        scrollView.current.scrollTo({y: 0});
        indiciModifiche.current = [false,false,false,false,false, false, false];
        setErroreAuth(null);
        setErroreData(null);
        setIsDatePickerOpened(false);
        setSnackMessage(null);
    }

    async function calcolaGeocode(){
        try{
        setIsLocationLoading(true);
            if(indirizzo.length>0){
            let ind = await Location.geocodeAsync(indirizzo);
            console.log("indirizzo:");
            if(ind.length>0 && ind[0].latitude!=null && ind[0].latitude!=0 && ind[0].longitude!=null && ind[0].longitude!=0){
                //calcolo citta, regione e paese
                console.log("valido");
                let user_position = [];
                user_position.push(ind[0].latitude);
                user_position.push(ind[0].longitude);
                try{
                    let ris = await Location.reverseGeocodeAsync({latitude:ind[0].latitude, longitude:ind[0].longitude}, {useGoogleMaps:false})
                    console.log("reverso calcolato");
                    console.log(ris);
                    user_position.push(ris[0].city==null?"null":(ris[0].city) );
                    user_position.push(ris[0].region==null?"null":(ris[0].region));
                    user_position.push(ris[0].country==null?"null":(ris[0].country));
                    posizioneUtente.current=user_position;
                    if(ris[0].city==null){ setSnackMessage(i18n.t('noCityWasFound')); setIsLocationLoading(false); return;}
                    else if(ris[0].region==null) { setSnackMessage(i18n.t('noRegionWasFound')); setIsLocationLoading(false); return;}
                    else if(ris[0].country==null) {setSnackMessage(i18n.t('noStateWasFound')); setIsLocationLoading(false); return;}
                    //altrimenti tutto ok
                    setGeocodeResponse(ris[0].city+","+ris[0].region+","+ris[0].country);
                    setIsLocationLoading(false);
                }catch(e){
                    console.log("errore geocode 2:"+e);
                    setSnackMessage(i18n.t('err_generic'));
                    setIsLocationLoading(false);
                }
            }else {
                setSnackMessage(i18n.t('enterValidAddress'));
                setIsLocationLoading(false);
            }
            console.log(ind);
        }else {
            setSnackMessage(i18n.t('enterValidAddress'));
            setIsLocationLoading(false);
        }
        }catch(e){
            console.log("errore geocode:"+e);
            setSnackMessage(i18n.t('errorDuringComputingPosition'));
            setIsLocationLoading(false);
        }
    }

    async function tornaIndietro(){
        //se sto caricando, non torno indietro
        if(loadingRef.current.get_state()==true) return;
        await resetta();
        navigation.goBack();
    }

    useEffect(()=>{
        
        isMounted.current = true;

        const backAction = () => {
            tornaIndietro();
            return true;
          };
        
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => {
            isMounted.current = false;
            backHandler.remove();
        }
    },[])

    //all'inizio 
    useEffect(()=>{

          if(isMounted.current == true){
            //inizializzo elementi
            if(informazioniAutenticazioneUtente!=null)
                setAuth((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]);
            setNome(informazioniProfiloUtente.name);
            setDescrizione(informazioniProfiloUtente.self_description);
            //let dataDiNascitaTMP = new Date(informazioniProfiloUtente.date_of_birth);
            console.log("setto data di nascita:"+informazioniProfiloUtente.date_of_birth);
            setDataDiNascita(informazioniProfiloUtente.date_of_birth);
            setIsLocationLoading("");
            setProvaAlternativaGeocode(false);
            setIdentitaDiGenere(informazioniProfiloUtente.gender_identity);
            setOrientamentoSessuale(informazioniProfiloUtente.gender_preference);
          }

    },[informazioniProfiloUtente, informazioniAutenticazioneUtente]) //metto come dipendenza l'informazione del profilo utente cosi da richiamare useEffect ogni volta che un nuovo utente (o anche il vecchio che riaccede di nuovo) ricarico gli elementi nuovi


    function getFormattedData(){
        let dataDiNascitaTMP = new Date(dataDiNascita.seconds*1000);
        console.log("ritorno di "+dataDiNascita+" il valore: "+dataDiNascitaTMP.getDate()+"/"+(dataDiNascitaTMP.getMonth()+1)+"/"+dataDiNascitaTMP.getFullYear());
        return dataDiNascitaTMP.getDate()+"/"+(dataDiNascitaTMP.getMonth()+1)+"/"+dataDiNascitaTMP.getFullYear()
    }

    async function eliminaAccount(){
        try{
            console.log("elimino account...");
            scrollView.current.scrollTo({y: 0});
            loadingRef.current.on();
            loadingRef.current.set_message(i18n.t('removingAccountInProgress'));
            //await deleteUserAccount(informazioniProfiloUtente.name);
            localStorage.deleteLocalStorage(user);
            loadingRef.current.off();
            navigation.goBack();
            //navigation.navigate("LoginScreen");
        }catch(e){
            console.log("errore durante eliminazione account...:"+e);
            setSnackMessage(i18n.t('removingAccountFailed'));
        }
    }

    console.log("info auth:")
    console.log(informazioniAutenticazioneUtente);

        //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
      <View style={styles.container} >

          {/* schermo di caricamento */}
          {isLoading &&
          <View style={{position:"absolute",backgroundColor:"rgba(230,230,230,0.8)", zIndex:100, width:larghezzaDevice, height:altezzaDevice, justifyContent:"center", alignItems:"center"}} >
            <ActivityIndicator animating={isLoading} color={MosCeleste} />
          </View> }

          {/* BARRA SUPERIORE */}
          <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={iconSize} color="#52575D" />
                </TouchableOpacity>
                <ActivityIndicator animating={isLoading} color={MosCeleste} style={{position:"absolute",right:0, paddingRight:Dimensions.get("window").width*0.03}} />
                <Text style={styles.titolo}>{i18n.t('personalInformation')}</Text>
            </View>

            <KeyboardAvoidingView
                keyboardVerticalOffset={30}
                style={{ flex: 1 }}
                 behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
                <View>
                    <ScrollView 
                        ref={scrollView}>

                        {/*DESCRIZIONE*/}
                        <Text style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>{i18n.t('personaInformationDescriptionSection')}</Text>
                        
                        <Divider />
                        <Text style={[styles.campo,{marginTop: 25, color:MosPurple, textAlign:"center"}]}>{i18n.t('auth')}</Text>
                        {/*EMAIL oppure TELEFONO*/}
                        {informazioniAutenticazioneUtente!=null && informazioniAutenticazioneUtente[0]!=null && <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('email')}</Text>}
                        {informazioniAutenticazioneUtente!=null && informazioniAutenticazioneUtente[0]==null && <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('phone')}</Text>}
                        <View>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                   style={styles.campo}
                                   editable={(informazioniAutenticazioneUtente!=null && informazioniAutenticazioneUtente[0]!=null)}
                                   onChangeText={text => setAuth(text.trim())}
                                   onSubmitEditing={()=>setAuth(auth)}
                                   onBlur={()=> setAuth(auth)} //focus perso
                                   value={auth}
                                   placeholder={(informazioniAutenticazioneUtente==null)?"":(informazioniAutenticazioneUtente[0]!=null)?i18n.t('email'):i18n.t('phone')}
                                   defaultValue = {auth}
                                   keyboardType="default"
                                    />
                            {erroreAuth && <Text style={[styles.errore,{marginVertical:10}]}>{erroreAuth}</Text>}
                            {informazioniAutenticazioneUtente!=null && informazioniAutenticazioneUtente[0]!=null && <Text style={[styles.errore,{marginVertical:10, color:MosCeleste}]}>{i18n.t('authEmailSubTitle')}</Text>}
                            {informazioniAutenticazioneUtente!=null && informazioniAutenticazioneUtente[0]==null && <Text style={[styles.errore,{marginVertical:10, color:MosCeleste}]}>{i18n.t('authPhoneSubTitle')}</Text>}
                        </View>
                        <TouchableOpacity color={MosPurple} style={[styles.saveButton,{backgroundColor:MosPurple, padding:10, textAlign:"center"}]} onPress={(informazioniAutenticazioneUtente==null)?{}:(informazioniAutenticazioneUtente[0]!=null)?aggiornaEmailUtente:aggiornaPhoneNumber}><Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.sottoCampo,{textAlign:"center", color:"white"}]}>{(informazioniAutenticazioneUtente==null)?"...":(informazioniAutenticazioneUtente[0]!=null)?i18n.t('updateEmailButton'):i18n.t('updatePhoneButton')}</Text></TouchableOpacity>
                        
                        </View>
                        <Divider />

                        <Text style={[styles.campo,{marginTop: 25, color:MosPurple, textAlign:"center"}]}>{i18n.t('personalDetails')}</Text>
                        {/*NOME*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('placeholder_name')}</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                    editable={false}
                                    style={styles.campo}
                                    defaultValue={nome} />
                            <Text style={styles.sottoCampo}>{i18n.t('notModificable')}</Text>
                        </View>
                        <Divider />
                        
                        {/*DATA DI NASCITA*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('dateOfBirth')}</Text>
                        <TouchableOpacity onPress={apriDatePicker}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                {Platform.OS === 'android' &&
                                <>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {getFormattedData()} </Text>
                                {erroreData && <Text style={[styles.errore,{marginTop:10}]}>{erroreData}</Text>}
                                </>
                            }
                            </View>
                        </TouchableOpacity>
                        <DatePicker setData={modificaDataDiNascita} isVisible={isDatePickerOpened} setIsVisible={setIsDatePickerOpened} />
                        <Divider style={{marginTop:10}} />

                        {/*DESCRIZIONE*/}
                        <View style={{ flex:0.8, width:"100%",marginBottom:10}}>
                                <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('personalDescription')}</Text>
                                <View style={{paddingLeft:Dimensions.get("window").width*0.03}}>
                                    <TextInput
                                        style={styles.campo}
                                        autoCapitalize="none"
                                        onChangeText={text => setDescrizione(text)}
                                        onBlur={()=> modificaDescrizione()} //focus perso
                                        value={descrizione}
                                        keyboardType="name-phone-pad"
                                        multiline={true}
                                        placeholder='...'
                                        underlineColorAndroid='transparent'
                                        maxLength={150}
                                    />
                                </View>
                            </View>
                            <Divider />
                        
                        {/*OCCUPAZIONE*/}
                        <View style={{ flex:0.8, width:"100%",marginBottom:10}}>
                                <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('currentOccupation')}</Text>
                                <View style={{paddingLeft:Dimensions.get("window").width*0.03}}>
                                    <TextInput
                                        style={styles.campo}
                                        autoCapitalize="none"
                                        onChangeText={text => setOccupazione(text)}
                                        onBlur={()=> modificaOccupazione()} //focus perso
                                        value={occupazione}
                                        keyboardType="name-phone-pad"
                                        multiline={true}
                                        placeholder='...'
                                        underlineColorAndroid='transparent'
                                        maxLength={50}
                                    />
                                </View>
                            </View>
                            <Divider />
                        
                        {/*KEYWORDS*/}
                        <View style={{ flex:0.8, width:"100%",marginBottom:10}}>
                                <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('hobbiesInterestsAndPassions')}</Text>
                                <View style={{paddingLeft:Dimensions.get("window").width*0.03, flexDirection:"row",alignItems:"center"}}>
                                    <TextInput
                                        style={[styles.campo,{width:Dimensions.get("window").width*0.4,margin:10, padding:10, borderBottomColor:MosViola,borderBottomWidth:1, color:MosCeleste,opacity:(keywordArray.length<10?1:0.3)}]}
                                        onChangeText={key => setUltimaKeyword(key.trim())}
                                        value={keyword}
                                        editable = {keywordArray.length<10}
                                        maxLength={15}
                                        placeholder={i18n.t('placeHolderHobby')}
                                        keyboardType="default"
                                    />
                                    <TouchableOpacity disabled={keywordArray.length>=10} onPress={()=>{inserisciKeyword()}}>
                                        <AntDesign name="plus" size={fontSizeCampi*1.5} color={MosViola} style={{opacity:(keywordArray.length<10?1:0.3)}} />
                                    </TouchableOpacity>
                                </View>
                                    <View style={{height:100,paddingLeft:Dimensions.get("window").width*0.03}}>
                                        <FlatList
                                            ref = {flatListKeywordRef}
                                            onContentSizeChange={()=> flatListKeywordRef.current.scrollToEnd()} 
                                            horizontal={true}
                                            data={keywordArray}
                                            showsHorizontalScrollIndicator={true}
                                            keyExtractor={item => item.id.toString()}
                                            renderItem={({ item, index }) =>
                                                <View style={{marginTop:10}}>
                                                    <View style={{backgroundColor:MosViola, borderRadius:10, margin:10}}>
                                                        <Text style={{color:"white",textAlign:"center", textAlignVertical:"center", padding:10}}>{item.keyword}</Text>
                                                    </View>
                                                    {keywordArray.length>5 &&
                                                    <TouchableOpacity style={{position:"absolute"}} onPress={()=>{eliminaKeyword(index)}}>
                                                        <Entypo name="cross" size={20} color="white" style={{backgroundColor:"red"}} /> 
                                                    </TouchableOpacity>
                                                    }
                                                </View>
                                                }
                                        />
                                    </View>
                            </View>
                            <Divider />

                        {/*AGGIORNA LA TUA POSIZIONE*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('updatePosition')}</Text>
                        {provaAlternativaGeocode==false &&
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10,flexDirection:"row", }}>
                                <TouchableOpacity 
                                        style={{ 
                                        borderRadius:Dimensions.get("window").width*0.4/2,
                                        justifyContent: 'center', 
                                        alignItems:'center',
                                        marginRight:10
                                        }}
                                        onPress = { () => ottieniPosizioneUtente()}
                                        > 
                                    { (isLocationLoading!="aggiornata")  && <Text style={[styles.campo,{color:MosViola}]}>{i18n.t('updateButton')}</Text>}
                                    { (isLocationLoading=="aggiornata")  && <Text style={[styles.campo,{color:"#15e302"}]}>{i18n.t('updateDone')}</Text>}
                                </TouchableOpacity>
                                { isLocationLoading=="loading" && <ActivityIndicator animating={true} color={MosCeleste}/>}
                            </View>
                        }

                        {provaAlternativaGeocode==true &&
                        <>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('alternativeTitle')}</Text>
                        <View style={{paddingLeft:Dimensions.get("window").width*0.03, flexDirection:"row",alignItems:"center"}}>
                                    <TextInput
                                        style={[styles.campo,{fontSize:fontSizeCampi*0.8, width:Dimensions.get("window").width*0.8,margin:10, padding:10, borderBottomColor:MosViola,borderBottomWidth:1, color:MosCeleste}]}
                                        onChangeText={ind => setUltimoIndirizzo(ind)}
                                        value={indirizzo}
                                        maxLength={100}
                                        placeholder={i18n.t('placeholder_address')}
                                        keyboardType="default"
                                    />
                                    <TouchableOpacity disabled={isLocationLoading} onPress={()=>{setUltimoIndirizzo(""); setGeocodeResponse(null); calcolaGeocode();}}>
                                        {isLocationLoading==false &&
                                            <MaterialIcons name="gps-fixed" size={fontSizeCampi*1.5} color={MosViola} />
                                        }
                                        {isLocationLoading==true &&
                                            <ActivityIndicator animating={true} color={MosCeleste} style={{width:fontSizeCampi*1.5, height:fontSizeCampi*1.5}}/>
                                        }
                                    </TouchableOpacity>
                                    </View>
                                    {geocodeResponse==false && isLocationLoading==false &&
                                     <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('tryMoreGenericAddress')}</Text>}
                                    {geocodeResponse!=null && geocodeResponse!=false && isLocationLoading==false &&
                                        <>
                                        <View style={{flexDirection:"row",padding:Dimensions.get("window").height*0.01}}>
                                            <Entypo name="location-pin" size={fontSizeCampi*1.5} color="#52575D" />
                                            <Text style={[styles.sottoCampo,{marginVertical:5}]}>{geocodeResponse}.{i18n.t('isCorrectQuestion')}</Text>
                                        </View>
                                        <View style={{flexDirection:"row",margin:Dimensions.get("window").height*0.02 }}>
                                            <TouchableOpacity onPress={()=>{
                                                //avverto che è avvenuta una modifica
                                                indiciModifiche.current[2]=true;
                                                notificaModifiche();
                                                //console.log("nuove modifiche alla posizione:");

                                            }} style={{flex:1}}>
                                                <Text style={[styles.sottoCampo,{marginVertical:5, color:"white",textAlignVertical:"center", textAlign:"center", backgroundColor:MosCeleste}]}>{i18n.t('yes')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={()=>{setGeocodeResponse(null); setSnackMessage(i18n.t('tryToBeMorePrecise'))}} style={{flex:1}}>
                                                <Text style={[styles.sottoCampo,{marginVertical:5, flex:1, color:"white", textAlignVertical:"center", textAlign:"center", backgroundColor:MosViola}]}>{i18n.t('no')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        </>
                                    }
                        </>
                        }




                        <Divider />

                        {/*SESSO*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('sex')}</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                    editable={false}
                                    style={styles.campo}
                                    defaultValue={informazioniProfiloUtente.biological_sex} />
                        </View>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('notModificable')}</Text>
                        <Divider />
                        
                        {/* IDENTITA' DI GENERE */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('genderIdentity')}</Text>
                        <TouchableOpacity onPress={()=>{setApriArea(true)}}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {getTranslatedGender(identitaDiGenere)} </Text>
                            </View>
                        </TouchableOpacity>
                        <AreaSceltaGenere apriArea={apriArea} setApriArea={setApriArea} setIdentitaDiGenere={modificaIdentitaDiGenere} />

                        <Divider/>

                        {/* ORIENTAMENTO SESSUALE */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('genderPreference')}</Text>
                        <TouchableOpacity onPress={()=>{setApriArea2(true)}}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {getTranslatedGender(orientamentoSessuale)} 
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('aroundYouFirstHint')}</Text>
                        <AreaSceltaGenere apriArea={apriArea2} setApriArea={setApriArea2} setIdentitaDiGenere={modificaOrientamentoSessuale} />

                        <Divider/>

                        {/* SLIDER KM PREFERENCE */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('actionRange')}</Text>
                        <View style={{ alignSelf:"center"}}>
                            <SliderKMPreference ref={sliderKMRef} currentUser = {user} modificaPreferenzaRaggioDiAzione = {modificaPreferenzaRaggioDiAzione} />
                        </View>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('aroundYouSecondHint')}</Text>
                        <Divider />

                        {/* RANGE ETA' */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('ageRange')}</Text>
                        <View style={{ alignSelf:"center"}}>
                            <AgeRange ref={rangeEtaRef} uid={user} dateOfBirth={informazioniProfiloUtente.date_of_birth} modificaPreferenzaRangeDiEta={modificaPreferenzaRangeDiEta} />
                        </View>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('aroundYouThirdHint')}</Text>

                        {/*MOSTRAMI SU MOSAIC*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('showMe')}</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01,flexDirection:"row", alignItems:"center"}}>
                            <Text style={[styles.campo,{color:MosViola}]}>{i18n.t('showMeContent')}</Text>
                            <ShowMe ref={showMeRef} modificaShowMe={modificaShowMe} initialValue={informazioniProfiloUtente.show_me} />
                        </View>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('showMeDescription')}</Text>

                        {/*ELIMINA ACCOUNT*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>{i18n.t('removeAccount')}</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01}}>
                            <TouchableOpacity onPress={()=>{genericDialogRef.current.open_dialog(i18n.t('removeAccountQuestion'), i18n.t('removeAccountQuestionHint'))}}>
                            <View style={{backgroundColor:"red", padding:5, borderRadius:5 }}><Text style={[styles.campo,{color:"white",paddingLeft:0}]}>{i18n.t('remove')}</Text></View>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.sottoCampo,{marginVertical:5}]}>{i18n.t('removeAccountQuestionHint')}</Text>
                        <Loading ref={loadingRef} />
                        <GenericDialog ref={genericDialogRef}  yesAction={eliminaAccount} />

                    {/*BOTTONE PER SALVARE*/}
                    <TouchableOpacity color={MosPurple} style={[styles.saveButton,{backgroundColor:MosPurple, padding:10,marginTop:20, textAlign:"center"}]} onPress={salvaDettagliUtente}><Text style={[styles.sottoCampo,{textAlign:"center", color:"white"}]}>{i18n.t('saveDetails')}</Text></TouchableOpacity>

                    </ScrollView>
                    
                </View>
            </KeyboardAvoidingView>

            {/*MESSAGGIO */}
            <Snackbar
                visible={snackMessage}
                onDismiss={()=>{setSnackMessage(null)}}
                action={{
                onPress: () => {
                    // Do something
                },
             }}>
                {snackMessage}
            </Snackbar>
    
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
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
        paddingLeft:Dimensions.get("window").width*0.03
    },
    sottoCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        paddingHorizontal:Dimensions.get("window").width*0.03
    },
    saveButton:{
        fontFamily: "Raleway_200ExtraLight",
        fontSize:fontSizeCampi*1.3,
    },
    errore: {
        fontFamily: "Raleway_200ExtraLight",
        color: "red",
        fontSize:fontSizeCampi,
        paddingLeft:Dimensions.get("window").width*0.03
    }
})