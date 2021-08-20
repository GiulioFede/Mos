import React, {useState, useContext, useCallback, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView,TouchableOpacity as TouchableOpacityNative, Image, Dimensions, Animated,FlatList,  SafeAreaView, StatusBar, Platform} from 'react-native';
import {Feather,Ionicons, Entypo, AntDesign, MaterialIcons, SimpleLineIcons} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import { altezzaBarraScreen, fontSizeCampi, fontSizeTitoloBarra, iconSize, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple, MosViola } from '../../../../resources/colors';
import SnackMessage from '../../profile/screen/component/snackMessage';
import PreviewProfile from './previewProfile';
import { LinearGradient } from "expo-linear-gradient";
import {geohashQueryBounds} from "geofire-common";
import KilometerView from './kilometerView';
import CircleBackground from './circleBackground';
import { Directions, FlingGestureHandler, State, TouchableOpacity} from 'react-native-gesture-handler';
//import { FlatList } from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import BottomSheetUserDetails from './bottomSheetUserDetails';
import LottieView from 'lottie-react-native';
import DialogCreaNuovaConversazione from './dialogoCreaNuovaConversazione';
import { AutenticazioneUtente } from '../../../../context/firebase/autenticazione';
import Loading from './loading';
import { computeDistance, getAgeFromTimestamp } from '../../../../context/utilities/functions.utilities';
import localStorage from '../../../../context/local_storage/localStorage';

const {width, height} = Dimensions.get("window");
const IMAGE_WIDTH = width*0.86;
const IMAGE_HEIGHT = width*0.86*1.5;

//mantiene della flatlist le informazioni sull'item attualmente mostrato
var currentItemDisplayed = null;

/*const info_profiles2 = [
    {
        id: "1",
        key: "1",
        name: "Marco",
        self_description: "Sono uno studente di Palermo.",
        date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
        biological_sex: "maschio",
        gender_identity: "demi boy",
        gender_preference: "demi girl",
        location: {
            geohash: "sqc0p129br",
            lat: 37.97,
            lng: 12.96
        },
        current_occupation: "student",
        hobbies_interests_and_passions: ["Ballare", "cantare", "pallavolo", "dipingere"],
        profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage2_50?alt=media&token=cf02f2a1-df3c-4fb3-aead-b3dd9e2a209f",
        gallery: {
            1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
            2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
            3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
        }
    },
    {
        id: "2",
        key: "2",
        name: "Lisa",
        self_description: "Sono una studentessa di Palermo.",
        date_of_birth: "Fri Mar 07 1983 09:08:10 GMT+0100 (CET)",
        biological_sex: "femmina",
        gender_identity: "demi girl",
        gender_preference: "pangender",
        location: {
            geohash: "sqc0p129br",
            lat: 38.97,
            lng: 7.96
        },
        current_occupation: "student",
        hobbies_interests_and_passions: ["Ballare", "cantare", "pallavolo", "dipingere"],
        profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F11_75?alt=media&token=1b443f70-2824-44f3-86f7-0970601c077d",
        gallery: {
            1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
            2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
            3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
        }
    },
    {
        id: "3",
        key: "3",
        name: "Giuseppe",
        self_description: "Sono un barista",
        date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
        biological_sex: "maschio",
        gender_identity: "demi boy",
        gender_preference: "demi girl",
        location: {
            geohash: "sqc0p129br",
            lat: 37.97,
            lng: 12.96
        },
        current_occupation: "worker",
        hobbies_interests_and_passions: ["Ballare", "cantare", "pallavolo", "dipingere"],
        profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F12_75?alt=media&token=e677c1a7-7be8-4e7d-a821-111923fe78a0",
        gallery: {
            1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
            2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
            3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
        }
    },
    {
        id: "4",
        key: "4",
        name: "Sonia",
        self_description: "Sono una infermiera.",
        date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
        biological_sex: "femmina",
        gender_identity: "femmina",
        gender_preference: "maschio",
        location: {
            geohash: "sqc0p129br",
            lat: 41.97,
            lng: 21.96
        },
        current_occupation: "worker",
        hobbies_interests_and_passions: ["Ballare", "cantare", "pallavolo", "dipingere"],
        profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F13_75?alt=media&token=67d0845b-bd33-41f3-806d-1e8777c74313",
        gallery: {
            1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
            2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
            3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
        }
    },
]*/

const info_profiles2 = [
    {
        id: "1",
        key: "empty",
        name: "Marco",
        self_description: "Sono uno studente di Palermo.",
        date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
        biological_sex: "maschio",
        gender_identity: "demi boy",
        gender_preference: "demi girl",
        location: {
            geohash: "sqc0p129br",
            lat: 37.97,
            lng: 12.96
        },
        current_occupation: "student",
        hobbies_interests_and_passions: ["Ballare", "cantare", "pallavolo", "dipingere"],
        profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2FprofileImage2_50?alt=media&token=cf02f2a1-df3c-4fb3-aead-b3dd9e2a209f",
        gallery: {
            1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
            2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
            3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
        }
    }
]


const VISIBLE_ITEMS = 4;

let cityTmp,regionTmp,countryTmp;
function getCityRegionCountryView(city, region, country){
    //console.log(city+","+region+","+country);
    cityTmp=null,regionTmp=null,countryTmp=null;
    if(city!="null" && region!="null" && country!="null"){
        cityTmp = city;
        regionTmp = ","+region;
        countryTmp = ","+country;
    }
    else if(city=="null" && region!="null" && country!="null"){
        regionTmp = region;
        countryTmp = ","+country;
    }
    else if(city=="null" && region=="null" && country!="null"){
        countryTmp = country;
    }
    else if(city!="null" && region=="null" && country!="null"){
        cityTmp = city;
        countryTmp = ","+country;
    }

    return (
        <View style={{marginBottom:10, paddingLeft:10, flexDirection:"row"}}>
            {(cityTmp!=null || countryTmp!=null || regionTmp!=null) && <Entypo name="location-pin" size={IMAGE_HEIGHT*0.2/5} color="white" />}
            {cityTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: IMAGE_HEIGHT*0.2/5, color:"#fff"}}>{cityTmp}</Text>}
            {regionTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: IMAGE_HEIGHT*0.2/5, color:"#fff"}}>{regionTmp}</Text>}
            {countryTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: IMAGE_HEIGHT*0.2/5, color:"#fff"}}>{countryTmp}</Text>}
        </View>
    )
}

//sono la data di inizio e fine entro cui cercare possibili utenti. Vengono inizializzate nello useEffect la prima volta ed ogni volta che tali preferenze cambiano.
let startDateToSearch = null;
let endDateToSearch = null;

/*
    Questo numero decide il numero di carte massimo da mostrare.  Es. con valore 4 saranno 'swipabili' solo 4 carte prima di un
    successivo aggiornamento.
    NB: se viene cambiato, cambiare anche l'omonimo in firestore.service.js
*/
const MAX_CARD_INTO_LIST = 4;

//variabili di appoggio
var radius = 25;
const emptyArray = [{key:"empty"}];

export default function AroundYouComponent(props){

    var {navigation, route} = props;
    //contesto autenticazione
    const {findNextTenClosestUsers, informazioniProfiloUtente, user} = useContext(AutenticazioneUtente);
    
    const [startingPointHeightBottomMenu, setstartingPointHeightBottomMenu] = useState(0);

    const snackMessageRef = useRef();
    const bottomSheetUserDetailsRef = useRef();
    const isSwipeAnimationFinished = useRef(false);
    const dialogCreaNuovaConversazioneRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const refFlatList = useRef();
    const startFrom = useRef(0);

    //per il bottone refresh
    const [refresh, setRefresh] = useState(false);

    //true solo quando nessuno è stato trovato. Fa apparire una particolare view.
    const [noOne, setNoOne] = useState(false);

    //APRO MENU
    function apriUserSettings(){
        navigation.openDrawer();
 
    }


    //const scrollX = React.useRef(new Animated.Value(0)).current;

    function apriChiudiBottomSheetMenu(item){
        bottomSheetUserDetailsRef.current.setNewUserInformationDetails(item);
        bottomSheetUserDetailsRef.current.expandOrClose();
    }

    function creaNuovaConversazione(){
        console.log("creazione conversazione in corso...");
    }
    

    const [activeIndex, setActiveIndex] = React.useState(0);
    const animatedValue = React.useRef(new Animated.Value(0)).current;
    const reactiveAnimated = React.useRef(new Animated.Value(0)).current;
    const lottieAnimationRef = useRef();

    React.useEffect(()=>{
        Animated.timing(animatedValue, {
            toValue: reactiveAnimated,
            duration:300,
            useNativeDriver: true
        }).start();
    },[])



    const setActiveSlide = React.useCallback((newIndex) => {
        setActiveIndex(newIndex);
        reactiveAnimated.setValue(newIndex);
    })


    const bounds = useRef([]);
    const lastDocumentDownloaded = useRef(null);
    const current_bounds_index = useRef(0);
    //conterrà gli utenti prelevati (dato alla flatlist)
    const [info_profiles, setInfoProfiles] = useState([]);

    const [callUpdate, setCallUpdate] = useState(true);

    useEffect(()=>{
        console.log("Use effect eseguito in aroundYou.component.js con:"+informazioniProfiloUtente.action_range_preference+","+informazioniProfiloUtente.gender_preference+",");

        /*
            Al caricamento della sezione trovo tutti i bounds centrati nella mia attuale
            posizione. Per esempio potrei ottenere un array fatto di 4 elementi. Ciascun elemento
            indicherà lo startAt e l'endAt su cui fare la query. Io utilizzerà anche un limit 10 
            e salverò l'ultimo documento scaricato in lastDocumentDownloaded cosi che se l'utente
            ne richiederà altri 10 userò come startAt ques'ultimo documento invece di ricominciare da
            capo o peggio filtrare per documenti. Infatti startAt con un ulteriore condizione che mi salti
            l'ultimo visionato farà comunque leggere i precedenti a firestore e me li metterà sul conto.
            Quando la query ritorna zero come risultato allora passo al successivo elemento in bounds usando come
            startAt ed endAt i nuovi e salvandomi in lastDocumentDownloaded l'ultimo nuovo. Si fa cosi fino a quando
            tutti gli elementi di bounds sono stati utilizzati. */
        
            async function init(){
                await reset();
                //setInfoProfiles([]);
                setActiveSlide(0);
                setActiveIndex(0);
                isSwipeAnimationFinished.current = false;
                //trova successivi 10 elementi (all'inizio si parte dall'elemento zero di bounds)
                findNext10ClosestUsers(false);
            }
    
       if(info_profiles.length == 0)
                init();
        else {
            setInfoProfiles([]);
        }

    },[refresh,informazioniProfiloUtente.action_range_preference, informazioniProfiloUtente.gender_preference]);


    useEffect(()=>{

        async function init(){
            await reset();
            //setInfoProfiles([]);
            setActiveSlide(0);
            setActiveIndex(0);
            isSwipeAnimationFinished.current = false;
            //trova successivi 10 elementi (all'inizio si parte dall'elemento zero di bounds)
            findNext10ClosestUsers(false);
        }

        if(info_profiles.length == 0)
            init();

    },[info_profiles])

    //resetta dati di ricerca cosi da ricominciare da capo in caso non trova nessuno una volta giunto alla fine
    async function reset(){

        try{
            setNoOne(false);

            //posizione di partenza: la mia posizione    
            const center = [parseFloat(informazioniProfiloUtente.location.lat), parseFloat(informazioniProfiloUtente.location.lng)];
            //raggio in metri entro cui prelevare gli utenti vicini
            //lo prelevo dalle preferenze
            let val = await localStorage.readPreference(user,"action_range");
            if(val!=null){
                if(val<=0.25) radius = 25;
                else if (val<=0.50) radius = 250;
                else if (val<=0.75) radius = 2500;
                else radius = 40000;
            }
            const radiusInM = radius*1000;

            console.log("neighbors");
            //ottengo l'array bounds fatto di N elementi (startAt e endAt ogni elemento)
            bounds.current = geohashQueryBounds(center, radiusInM);
            current_bounds_index.current = 0;
            lastDocumentDownloaded.current = null;

            //setto range di età sulla quale effettuare la ricerca: voglio età comprese tra [20,30] anni
            //data di inizio: oggi - X anni
            startDateToSearch = new Date(new Date().getFullYear()-30, 0, 1); //primo gennaio di quell'anno
            endDateToSearch = new Date(new Date().getFullYear()-20, 11, 31);

        // setActiveIndex(0);
        // animatedValue.current = new Animated.Value(0);
        // reactiveAnimated.current = new Animated.Value(0);

        startFrom.current = 0;
        }catch(e){
            snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore.");
        }
    }

    async function findNext10ClosestUsers(isReset){
   
        try{
            console.log("Cerco altri 10 utenti.Resetto:"+isReset);
            console.log(bounds.current.length+","+current_bounds_index.current);
            setIsLoading(true);
            /*
                la funzione viene richiamata ricorsivamente, quindi se l'indice corrente dell'elemento di bounds da
                esaminare è maggiore del suo massimo allora esco
            */
            if(current_bounds_index.current > bounds.current.length-1){
                /*
                    Invece di mostrare uno snack message, ritorniamo da capo e ricarichiamo i vecchi profili. (a ciclo)
                */
                //snackMessageRef.current.setta_messaggio_da_mostrare("Non è possible trovare nessun'altro che rispetti le tue preferenze.");
                console.log("Non è possibile trovare nessun'altro. Ritorno a capo:"+info_profiles.length);
                //se l'array fin'ora ottenuto ha una lunghezza maggiore di zero allora posso ritornare a loop a capo:
                //richiamo ricorsivamente
                if(info_profiles.length==0){
                    snackMessageRef.current.setta_messaggio_da_mostrare("Sembra non ci sia nessuno che rispetti le tue preferenze.");
                    setIsLoading(false);
                    setNoOne(true);
                }
                await reset();
                setIsLoading(false);
                if(info_profiles.length!=0)
                    findNext10ClosestUsers(true);
                return;
            }
            /*
                Passo gli startAt e gli endAt dell'elemento corrente.
                Se però lastDocumentDownloaded!= null allora passerò lui come startAt
            */
                //inizio e fine a livello di geohash o documento!
                let startAt = (lastDocumentDownloaded.current==null) ? bounds.current[current_bounds_index.current][0] : lastDocumentDownloaded.current;
                let endAt = bounds.current[current_bounds_index.current][1];

                //ritorna in result[0] un array con i nuovi profili, mentre in result[1] l'ultimo documento
                let result = await findNextTenClosestUsers(startAt, endAt, startDateToSearch.toString(), endDateToSearch.toString());

                let nearest_users = result[0];
                
                console.log("Utenti trovati?");
                //console.log(nearest_users);
                /*
                    se non è stato trovato nessuno, passo al successivo elemento dell'array automaticamente, ma
                    resetto lastDocumentDownloaded
                */
                if(nearest_users.length == 0){
                    console.log("nessuno");
                    //resetto per ricominciare, ma passo avanti
                    lastDocumentDownloaded.current = null;
                    //se non sono già alla fine (ho visitato tutte le zone)
                    current_bounds_index.current = current_bounds_index.current + 1;
                    //se l'array fin'ora ottenuto ha una lunghezza maggiore di zero allora posso ritornare a loop a capo:
                    //richiamo ricorsivamente
                    if(info_profiles.length>0)
                        await findNext10ClosestUsers(false);
                    //altrimenti smetto perchè ciclerei a loop senza mai trovare nessuno
                    else {
                        snackMessageRef.current.setta_messaggio_da_mostrare("Sembra non ci sia nessuno che rispetti le tue preferenze.");
                        setIsLoading(false);
                        setNoOne(true);
                    }
                    //esco
                    return;
                }
                //altrimenti, se è stato trovato qualcuno setto lastDocumentDownloaded come quello trovato in result
                else {
                    console.log("Si!");
                    lastDocumentDownloaded.current = result[1];
                }
                /*
                    Renderizzo. Siccome voglio almeno sempre 10 elementi, prima di eliminare totalmente i vecchi 10,
                    mi chiedo quanti siano quelli nuovi. Se sono almeno 10, cancello i vecchi, altrimenti prendo dei
                    vecchi quanto mi serve per arrivare a 10 con i nuovi.
                */
                console.log("renderizzo:"+isReset);
                let tmp = null;
                
                //se la lista è fatta da 10 elementi o se si ricomincia da capo, includere solo i nuovi
                if(nearest_users.length==MAX_CARD_INTO_LIST || isReset == true){
                    console.log(".lista piena. Resetto?:"+isReset);
                    tmp = [...nearest_users];
                    //scrollo all'inizio
                    startFrom.current = 0;
                    
                }
                else{
                    console.log(".lista non piena...lunghezza info profiles:"+info_profiles.length+" lunghezza novità:"+nearest_users.length);
                    //calcolo quanto manca ad arrivare a 10
                    let offset = MAX_CARD_INTO_LIST - nearest_users.length;
                    if(isReset==false)
                        startFrom.current = offset;
                    else
                       startFrom.current = 0;
                    //se il vecchio ha elementi minori di offset allora lo metto tutto
                    if(info_profiles.length<=offset)
                        tmp = [...info_profiles, ...nearest_users];
                    //altrimenti prendo solo i suoi ultimi offset
                    else
                        tmp = [...info_profiles.slice(-offset),...nearest_users];
                }
                console.log("setto nuovo info profiles:");
                //console.log(tmp);
                setInfoProfiles(tmp);
                
                //console.log(nearest_users);
            
            }catch(e){
                console.log("errore:"+e);
                snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore. Riprova più tardi.");
            }

        setIsLoading(false);
        
    }


    function getDistance(lat, lng){

        //ritorna distanza in kilometri
        let distance = computeDistance(informazioniProfiloUtente.location.lat, 
                                       informazioniProfiloUtente.location.lng,
                                       lat,
                                       lng);
        return distance.toString()+"Km";
    
    }

    var nextPos = 0;
//console.log("info_profiles:");
//console.log(info_profiles);
    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Attorno a te</Text>
                <View style={{position:"absolute", right:Dimensions.get("window").width*0.03}}>
                    <TouchableOpacity onPress={apriUserSettings}>
                            <MaterialIcons name="menu" size={fontSizeTitoloBarra} color="#52575D" />
                    </TouchableOpacity> 
                </View>
            </View>

        <FlingGestureHandler 
        key="UP" 
        direction={Directions.UP} 
        onHandlerStateChange={async(ev) =>{
            if(ev.nativeEvent.state === State.END){
               // console.log("swipe alto:"+activeIndex);//sarà chiamato quando faccio swipe dal basso verso l'alto (incrementando ogni volta activeIndex)
                //se arrivo alla fine ricarico con nuovi elementi
                if(activeIndex === info_profiles.length -1){
                    console.log("ricarico con nuovi elementi aggiuntivi");
                    //se non sta già caricando...
                    if(isLoading==false){
                        await findNext10ClosestUsers(false);
                        console.log("riprendi da "+startFrom.current);
                        setActiveSlide(startFrom.current); 
                        setActiveIndex(startFrom.current); 
                    }
                    return;
                }
                console.log("next");
                setActiveSlide(activeIndex + 1);
            }
    }}>
        <FlingGestureHandler
            key="DOWN" 
            direction={Directions.DOWN} 
            onHandlerStateChange={ev =>{
                if(ev.nativeEvent.state === State.END){
                   //console.log("swipe basso:"+activeIndex);//sarà chiamato quando faccio swipe dall'alto verso il basso (decrementando ogni volta activeIndex)
                    if(activeIndex === 0){
                        return;
                    }
                    setActiveSlide(activeIndex - 1);
                }
            }}>
                <FlatList 
                    data = {info_profiles.length==0?info_profiles2:info_profiles}
                    keyExtractor = {(item) => item.key}
                    ref = {refFlatList}
                    extraData = {refresh}
                    scrollEnabled={false}
                    onEndReached={()=>{console.log("carica nuovi elementi")}}
                    contentContainerStyle = {{
                        flex:1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    CellRendererComponent={({index,item,children,style,...props})=>{
                        
                        const newStyle = [
                            style,
                            {
                                elevation: info_profiles.length - index,
                                zIndex: info_profiles.length - index,
                                left: -IMAGE_WIDTH / 2,
                                top: -IMAGE_HEIGHT / 2
                            }
                        ];
                        return (
                            
                            <View index={index} {...props} style={newStyle}>
                               {children}
                            </View>

                        )
                    }}
                    renderItem = {({item, index}) => {
                        //console.log(index);
                        const inputRange = [index -1, index, index +1]
                        const translateY = animatedValue.interpolate({
                            inputRange,
                            outputRange: [15, 0, 15]
                        });
                        const opacity = animatedValue.interpolate({
                            inputRange,
                            outputRange: [-1 -1/VISIBLE_ITEMS, 1, 0]
                            //outputRange: [-1, 1, 1]
                        });
                        const scale = animatedValue.interpolate({
                            inputRange,
                            outputRange: [0.92, 1, 1.2]
                        });

                       // if(item.key!="empty"){
                        return (
                            <>
                            <Animated.View style={{position:'absolute',width:width, height:height, opacity, transform: [{translateY}, {scale} ] }}>
                            {item.key!="empty" &&
                            <TouchableOpacity onPress={()=>{apriChiudiBottomSheetMenu(item)}}>
                                    <Image source = {{ uri: item.profileImageUrl}} style={styles.image} />
                                <LinearGradient
                                    // Background Linear Gradient sopra chat
                                    colors={['transparent',"black"]}
                                    style={{position: 'absolute',bottom:0, width: IMAGE_WIDTH,height: IMAGE_HEIGHT*0.8, borderBottomLeftRadius: 16, borderBottomRightRadius:16}}
                                    />
                                <View style={{position:"absolute", alignItems:"flex-start", justifyContent:"flex-end", height:IMAGE_HEIGHT, bottom:10, overflow:"hidden", width:IMAGE_WIDTH*0.7}}>
                                    <Text style={styles.name}>{item.name},{item.age}</Text>
                                    {getCityRegionCountryView(item.location.city, item.location.region, item.location.country)}
                                    <Text style={[styles.name,{fontFamily:"Raleway_200ExtraLight", fontSize: IMAGE_HEIGHT*0.2/5, color:MosCeleste}]}>{item.gender_identity}</Text>
                                    <Text style={[styles.name,{fontFamily:"Raleway_200ExtraLight", fontSize: IMAGE_HEIGHT*0.2/5}]}>{item.current_occupation}</Text>
                                </View>
                                <View style={{position: 'absolute', top:0, left:0, backgroundColor:"white",borderBottomRightRadius: 16, elevation:1 }}>
                                    <Text style={{color:"black", fontSize:IMAGE_HEIGHT*0.2/4, padding:10, fontFamily: "Raleway_400Regular"}}>{getDistance(item.location.lat, item.location.lng)}</Text>
                                </View>

                                {index==0
                            &&
                            isSwipeAnimationFinished.current == false
                            &&
                            <Animated.View style={{position:'absolute', width:width, height:height, opacity, transform: [{translateY}, {scale} ] }}>
                                <LottieView ref={animation => {lottieAnimationRef.current = animation}} autoPlay loop={false} onAnimationFinish={()=>{isSwipeAnimationFinished.current = true}} source={require('../../../../resources/lottie/swipe.json')} style={{width:IMAGE_WIDTH, height:IMAGE_HEIGHT}} />
                            </Animated.View>
                        }
                            </TouchableOpacity>
                        }
                        </Animated.View>
                        <Animated.View style={{position:'absolute', width:width, height:height,  opacity, transform: [{translateY}, {scale} ] }}>
                        {item.key!="empty" &&
                            <View style={{ backgroundColor:MosCeleste, top:IMAGE_HEIGHT*0.8, left:IMAGE_WIDTH*0.75, width:IMAGE_WIDTH*0.18, height:IMAGE_WIDTH*0.18, borderRadius:IMAGE_WIDTH*0.2/2, alignItems:"center", justifyContent:"center" }}>
                                <TouchableOpacity onPress={()=>{dialogCreaNuovaConversazioneRef.current.open_dialog(item.name)}}>
                                    <Ionicons name="ios-chatbubble-sharp" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        }
                        </Animated.View>

                        
                        </>
                        )
                   // }
                    }}
                />
        </FlingGestureHandler>
    </FlingGestureHandler> 

    {/* TASTO REFRESH */}
    <View style={{position:"absolute", top:altezzaBarraScreen+10, right:Dimensions.get("window").width*0.03}}>
        <TouchableOpacityNative onPress={()=>{setRefresh(!refresh)}} disabled={isLoading}>
            <SimpleLineIcons name="reload" size={fontSizeTitoloBarra} color="#444" />
        </TouchableOpacityNative>
    </View>

    {/* VIEW CHE APPARE SOLO QUANDO PROPRIO NESSUNO E' STATO TROVATO */}
    {noOne==true
        &&
    <View style={{width:width, height:height, position:"absolute", justifyContent:"center", alignItems:"center"}}>
        <AntDesign name="frowno" size={height*0.2} color="rgba(68, 68, 68,0.3)" />
        <Text style={{fontSize:fontSizeCampi,fontFamily: "Raleway_200ExtraLight", textAlign:"center", marginTop:10}}>
            Sembra non ci sia nessuno che rispetti le tue preferenze. Prova a cambiare qualche parametro, come il raggio di azione o la fascia di età.
        </Text>
    </View>
    }

    <BottomSheetUserDetails ref={bottomSheetUserDetailsRef} IMAGE_HEIGHT={IMAGE_HEIGHT} />
    <DialogCreaNuovaConversazione ref={dialogCreaNuovaConversazioneRef} creaNuovaConversazione = {creaNuovaConversazione} />
    {isLoading==true && <View style={{position:"absolute", width:Dimensions.get("window").width, height:Dimensions.get("window").height, justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"rgba(255,255,255,0.5)"}}>
            <ActivityIndicator animating={isLoading} color={MosCeleste} />
    </View>}
    <SnackMessage ref={snackMessageRef}/>
    </> 
            
    )
}

const styles = StyleSheet.create({
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
    image: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    name : {
        textTransform: 'capitalize',
        fontFamily: "Raleway_400Regular",
        color: '#fff',
        fontSize: IMAGE_HEIGHT*0.2/3,
        fontWeight: '900',
        paddingLeft:10
    }
    
  });