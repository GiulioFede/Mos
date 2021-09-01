import React, {useState, useContext, useCallback, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView,TouchableOpacity as TouchableOpacityNative, Image, Dimensions, Animated,FlatList,  SafeAreaView, StatusBar, Platform} from 'react-native';
import {Octicons,Ionicons, Entypo, AntDesign, MaterialIcons, SimpleLineIcons} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, altezzaSchermoInterno, fontSizeCampi, fontSizeTitoloBarra, iconSize, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosPurple, MosViola } from '../../../../resources/colors';
import SnackMessage from '../../profile/screen/component/snackMessage';
import { LinearGradient } from "expo-linear-gradient";
import {geohashQueryBounds} from "geofire-common";
import { Directions, FlingGestureHandler, State, TouchableOpacity} from 'react-native-gesture-handler';
//import { FlatList } from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import BottomSheetUserDetails from './bottomSheetUserDetails';
import DialogCreaNuovaConversazione from './dialogoCreaNuovaConversazione';
import { AutenticazioneUtente } from '../../../../context/firebase/autenticazione';
import { computeDistance, getAgeFromTimestamp, range } from '../../../../context/utilities/functions.utilities';
import localStorage from '../../../../context/local_storage/localStorage';
import { sendPushNotification } from '../../../../context/push_notifications/functions';
import LottieView from 'lottie-react-native';

const {width, height} = Dimensions.get("window");
const IMAGE_WIDTH = width*0.86;
const IMAGE_HEIGHT = (width<height/2)?width*0.86*1.5:width*0.85*1.3;

//mantiene della flatlist le informazioni sull'item attualmente mostrato
var currentItemDisplayed = null;

const info_profiles3 = [
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
]

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
        <View style={{marginBottom:10, paddingLeft:10, flexDirection:"row", flexWrap:"wrap"}}>
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
const MAX_CARD_INTO_LIST = 3;

//variabili di appoggio
var radius = 25;
var rangeEta = [];
const emptyArray = [{key:"empty"}];

export default function AroundYouComponent(props){

    var {navigation, route} = props;
    //contesto autenticazione
    const {findNextTenClosestUsers, listOfConversations, setListOfConversations, informazioniProfiloUtente, user, createNewConversation} = useContext(AutenticazioneUtente);
    
    const [startingPointHeightBottomMenu, setstartingPointHeightBottomMenu] = useState(0);

    const snackMessageRef = useRef();
    const bottomSheetUserDetailsRef = useRef();
    const isSwipeAnimationFinished = useRef(false);
    const dialogCreaNuovaConversazioneRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isChatCreating, setIsChatCreating] = useState(false);
    //se false nasconderà la scheda
    const [showMe, setShowMe] = useState(true);
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

    function creaNuovaConversazione(uidOfCard, nameOfCard, token){
        console.log("creazione conversazione in corso con "+uidOfCard);
        setIsLoading(true);
        setIsChatCreating(true);
        dialogCreaNuovaConversazioneRef.current.close_dialog();
        createNewConversation(uidOfCard, nameOfCard, informazioniProfiloUtente.name)
            .then(async(arrayOfResults)=>{ //contiene nel primo la nuova chatId e nel secondo la data di creazione
                console.log("chat creata");
                //aggiungo la coppia {chatId: newChatId, uid: uidOfCard} alle mie informazioni personali cosi da aggiornare lo screen chat
                let listOfConversationsTMP = {conversations: []};
                if(listOfConversations==null){
                    listOfConversationsTMP["conversations"]=[{chatId: arrayOfResults[0], uid: uidOfCard, contactName: nameOfCard, creation_data: arrayOfResults[1]}];
                } 
                else {
                    listOfConversationsTMP = JSON.parse(JSON.stringify(listOfConversations));
                    listOfConversationsTMP["conversations"].push({chatId: arrayOfResults[0], uid: uidOfCard, contactName: nameOfCard, creation_data: arrayOfResults[1]});
                }
                console.log("invio una push notification a "+nameOfCard+" al token "+token);
                try{
               //manda una push notification al contatto per avvertirlo che hai creato una conversazione
                    await sendPushNotification(token,"Qualcuno ti trova interessante!", (informazioniProfiloUtente.name+" vorrebbe parlare con te."),{});
                }catch(e){
                    console.log("errore nell'invio della push notification:"+e);
                }
                setListOfConversations(listOfConversationsTMP);
                //mandalo in chat
                navigation.navigate("Chat");
            }).catch((err)=>{
                console.log("errore durante creazione chat:"+err);
                if(err=="A conversation already exists")
                    snackMessageRef.current.setta_messaggio_da_mostrare("Sembra che stai già avendo una conversazione con "+nameOfCard);
                else if(err=="The user blocked you")
                    snackMessageRef.current.setta_messaggio_da_mostrare("Non è possibile iniziare una conversazione con "+nameOfCard+". L'utente ti ha bloccato.");
                else
                    snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore durante la creazione della chat. Riprova più tardi.");
                

            }).finally(()=>{
                setIsLoading(false);
                setIsChatCreating(false);
            })

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
                isSwipeAnimationFinished.current = false;
                //trova successivi 10 elementi (all'inizio si parte dall'elemento zero di bounds)
                findNext10ClosestUsers(false,null,true);
            }
    
       if(informazioniProfiloUtente.show_me==true)
            init();
       else
            setShowMe(false);

    },[refresh,informazioniProfiloUtente.action_range_preference, informazioniProfiloUtente.gender_preference,informazioniProfiloUtente.age_range, informazioniProfiloUtente.show_me]);


    //resetta dati di ricerca cosi da ricominciare da capo in caso non trova nessuno una volta giunto alla fine
    async function reset(){

        try{
            setNoOne(false);
            setShowMe(true);

            //posizione di partenza: la mia posizione    
            const center = [parseFloat(informazioniProfiloUtente.location.lat), parseFloat(informazioniProfiloUtente.location.lng)];
            //raggio in metri entro cui prelevare gli utenti vicini
            //lo prelevo dalle preferenze
            let action_range = await localStorage.readPreference(user,"action_range");
            if(action_range!=null){
                if(action_range<=0.25) radius = 25;
                else if (action_range<=0.50) radius = 250;
                else radius = 2500;
            }
            const radiusInM = radius*1000;

            console.log("neighbors in "+action_range);
            //ottengo l'array bounds fatto di N elementi (startAt e endAt ogni elemento)
            bounds.current = geohashQueryBounds(center, radiusInM);
            console.log(geohashQueryBounds(center, radiusInM));
            current_bounds_index.current = 0;
            lastDocumentDownloaded.current = null;

            //setto range di età sulla quale effettuare la ricerca: voglio età comprese tra [20,30] anni
            //data di inizio: oggi - X anni
            //leggo range di età di preferenza
            let age_range = await localStorage.readPreference(user,"age_range");//ritorna "x,y"
            if(age_range==null){
                let user_age = getAgeFromTimestamp(informazioniProfiloUtente.date_of_birth);
                if(user_age<=94)
                    rangeEta = range(user_age,user_age+5);
                else
                    rangeEta = [user_age];
            }else {
                age_range = age_range.split(","); //["x","y"]
                rangeEta = range(parseInt(age_range[0]),parseInt(age_range[1])); //creo range [x,x+1,...,y-1,y]
            }

            setInfoProfiles([]);
            setActiveSlide(0);
            
        }catch(e){
            snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore.");
        }
    }

    async function findNext10ClosestUsers(isRecursive, newIndex, isRefresh){
        try{

            setIsLoading(true);
                console.log("chiamata di findNext10ClosesUsers. E' ricorsiva?"+isRecursive+","+newIndex);
                //se è ricorsiva e il successivo indice è uguale alla dimensione dell'array bound mi fermo
                if(isRecursive && newIndex>=bounds.current.length){
                    console.log("non esiste più nulla da controllare. Fine");
                    //resetto. Ogni volta che resetto, però, riparto a loop. Se l'array è vuoto allora tale loop ritornerà qui e rifarà lo stesso. 
                    setActiveSlide(0);
                    setInfoProfiles([]);
                    setNoOne(true);
                    setIsLoading(false);
                    return;
                }

                //se l'indice attuale è maggiore o uguale alla lunghezza di bound allora resetta
                //questa situazione, a differenza di sopra, viene incontrata quando arriviamo alla fine senza azioni ricorsive
                if(current_bounds_index.current>=bounds.current.length){
                    console.log("non esiste più nulla da controllare. Fine");
                    //resetto. Ogni volta che resetto, però, riparto a loop. Se l'array è vuoto allora tale loop ritornerà qui e rifarà lo stesso. 
                    setActiveSlide(0);
                    setInfoProfiles([]);
                    setNoOne(true);
                    setIsLoading(false);
                    return;
                }

                console.log("Prelevo starting e ending point:");
                let startAt = null;
                let endAt = null;
                //se è ricorsiva significa che devo ripartire da zero ma dal newIndex
                if(isRecursive==true){
                    startAt = bounds.current[newIndex][0]
                    endAt = bounds.current[newIndex][1];
                }else {
                    startAt = (lastDocumentDownloaded.current==null) ? bounds.current[current_bounds_index.current][0] : lastDocumentDownloaded.current;
                    endAt = bounds.current[current_bounds_index.current][1];
                }
                //console.log("start: "+typeof(startAt)=="string"?startAt:startAt.data().name+"   end:"+endAt);
                console.log("start "+typeof(startAt));
                //ritorna in result[0] un array con i nuovi profili, mentre in result[1] l'ultimo documento trovato
                let result = await findNextTenClosestUsers(startAt, endAt, rangeEta);
        
                let nearest_users = result[0];
                console.log("Quanti nuovi utenti sono stati trovati?:"+nearest_users.length);

                //indico nuovo starting point per il futuro. Se non è stato trovato nulla allora result[1] sarà ancora null
                lastDocumentDownloaded.current = result[1];

                //se M è il numero degli attuali elementi ed N sono il numero di nuovi elementi trovati io devo
                // avere un array che contiene gli N elementi e se N<MAX_CARD_INTO_LIST aggiungo MX_CARD_INTO_LIST-N ultimi elementi del vecchio array
                //Quindi, se i nuovi elementi sono pari al massimo consentito
                if(nearest_users.length == MAX_CARD_INTO_LIST){
                    console.log("Massimo numero di novità")
                    setInfoProfiles([...nearest_users]);
                    //imposto la slide a 0
                    setActiveSlide(0);
                    setIsLoading(false);
                }
                //altrimenti, se comunque i nuovi sono >0
                else if (nearest_users.length > 0){
                    console.log("Qualcuno è stato trovato.")
                    let numero_nuovi = nearest_users.length; //es. 4
                    let numero_attuali = isRefresh==true?0:info_profiles.length; //es.7
                    //se il numero di prima con quello di ora è minore o uguale di MAX
                    if(numero_nuovi+numero_attuali<= MAX_CARD_INTO_LIST){
                        //es. vecchi=3, nuovi=1 --> metto tutto --> mi posizione come slide all'indice vecchi
                        if(isRefresh==true){
                            setInfoProfiles([...nearest_users]);
                            setActiveSlide(0); //non faccio overflow perchè esiste almeno un elemento nuovo
                        }else {
                            setInfoProfiles([...info_profiles,...nearest_users]);
                            setActiveSlide(info_profiles.length); //non faccio overflow perchè esiste almeno un elemento nuovo
                        }
                    }else{
                        let numero_attuali_da_lasciare = MAX_CARD_INTO_LIST-numero_nuovi; //10-4=6
                        let attualiCheDevonoRimanere = info_profiles.splice(-numero_attuali_da_lasciare);
                        //creo nuovo array
                        setInfoProfiles([...attualiCheDevonoRimanere,...nearest_users]);
                        //attualmente sono alla posizione es.7, ossia l'ultima dei vecchi
                        //secondo l'esempio adesso avrò un array di 6 (vecchi) + 4 nuovi, ossia 10 elementi.
                        //mi dovrò spostare alla posizione pari a numero_attuali_da_lasciare + 1, ma non metto +1 perchè l'array comincia da 0
                        setActiveSlide(numero_attuali_da_lasciare);
                    }
                    
                    setIsLoading(false);
                    //console.log("Risultato");
                    //console.log("Vecchio array:");
                    //console.log(info_profiles);
                    //console.log("Novità:");
                    //console.log(nearest_users);
                    console.log("indice attivo: "+activeIndex);
                }
                //altrimenti se non è stato trovato nulla, ripeto la query passando la successivo
                //NB: se non viene ritornato nulla allora è sicuro che possiamo passare al successivo bound
                else if(nearest_users.length == 0) {
                    console.log("Nessuno trovato.")
                    lastDocumentDownloaded.current = null;
                    let indiceCorrente = current_bounds_index.current;
                    current_bounds_index.current = current_bounds_index.current + 1;
                    //metto che isRecursive=true cosi da dirgli di prendere come valori di documento e indice corrente quelli passati come argomenti in quanto i "current" potrebbero non essere aggiornati
                    await findNext10ClosestUsers(true,indiceCorrente+1,false);
                    return;
                }
            
            }catch(e){
                console.log("errore:"+e);
                snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore. Riprova più tardi.");
                setIsLoading(false);
            }

    }

   // console.log("INFO PROFILES");
   // console.log(info_profiles);



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

    if(showMe==false)
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
            <View style={{width:width, height:height, position:"absolute", justifyContent:"center", alignItems:"center"}}>
                <Octicons name="eye-closed" size={height*0.2} color="rgba(68, 68, 68,0.3)" />
                <Text style={{fontSize:fontSizeCampi,fontFamily: "Raleway_200ExtraLight", textAlign:"center", marginTop:10}}>
                    La tua scheda è nascosta. Non potrai vedere le schede degli altri fino a quando non decidi di mostrarti.
                </Text>
            </View>
            </>
        )

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
                console.log("slide: "+activeIndex+1);
                if(activeIndex === info_profiles.length -1){
                    console.log("ricarico con nuovi elementi aggiuntivi");
                    //se non sta già caricando...
                    if(isLoading==false){
                        await findNext10ClosestUsers(false,null,false);
                    }
                    return;
                }
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
                        console.log( item.name+","+index);
                        const newStyle = [
                            style,
                            {
                                elevation: info_profiles.length - index,
                                zIndex: (activeIndex==index)?5:0,
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
                        //console.log(item);
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
                            <Animated.View style={{position:'absolute',top:IMAGE_HEIGHT*0.08, width:IMAGE_WIDTH, height:IMAGE_HEIGHT, opacity, transform: [{translateY}, {scale} ] }}>
                            {item.key!="empty" &&
                            <TouchableOpacity onPress={()=>{console.log("apri menu di "+item.name); apriChiudiBottomSheetMenu(item)}}>
                                    <Image source = {{ uri: item.profileImageUrl}} style={styles.image} />
                                <LinearGradient
                                    // Background Linear Gradient sopra chat
                                    colors={['transparent',"black"]}
                                    style={{position: 'absolute',bottom:0, width: IMAGE_WIDTH,height: IMAGE_HEIGHT*0.8, borderBottomLeftRadius: 16, borderBottomRightRadius:16}}
                                    />
                                <View style={{position:"absolute", alignItems:"flex-start", justifyContent:"flex-end", height:IMAGE_HEIGHT, bottom:10, overflow:"hidden", width:IMAGE_WIDTH*0.7}}>
                                    <View style={{flexDirection:"row", flexWrap:"wrap", marginBottom:5}}><Text style={styles.name}>{item.name}</Text><Text style={styles.name}> {item.age}</Text></View>
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
                            <Animated.View style={{position:'absolute', width:IMAGE_WIDTH, height:IMAGE_HEIGHT, opacity, transform: [{translateY}, {scale} ] }}>
                                <LottieView ref={animation => {lottieAnimationRef.current = animation}} autoPlay loop={false} onAnimationFinish={()=>{isSwipeAnimationFinished.current = true}} source={require('../../../../resources/lottie/swipe.json')} resizeMode="cover"/>
                            </Animated.View>
                        }
                            </TouchableOpacity>
                        }
                        </Animated.View>
                        <Animated.View style={{position:'absolute', opacity, transform: [{translateY}, {scale} ] }}>
                        {item.key!="empty" &&
                            <View style={{ backgroundColor:MosCeleste, top:IMAGE_HEIGHT*0.9, left:IMAGE_WIDTH*0.75, width:IMAGE_WIDTH*0.18, height:IMAGE_WIDTH*0.18, borderRadius:IMAGE_WIDTH*0.2/2, alignItems:"center", justifyContent:"center" }}>
                                <TouchableOpacity onPress={()=>{dialogCreaNuovaConversazioneRef.current.open_dialog(item.name, item.id, item.push_notification_token)}}>
                                    <Ionicons name="ios-chatbubble-sharp" size={IMAGE_WIDTH*0.18/2} color="white" />
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
    <View style={{position:"absolute",zIndex:5, top:altezzaBarraScreen+10, right:Dimensions.get("window").width*0.03}}>
        <TouchableOpacityNative onPress={()=>{setRefresh(!refresh)}} disabled={isLoading}>
            <SimpleLineIcons name="reload" size={fontSizeTitoloBarra} color="#444" />
        </TouchableOpacityNative>
    </View>

    {/* VIEW CHE APPARE SOLO QUANDO PROPRIO NESSUNO E' STATO TROVATO */}
    {noOne==true
        &&
    <View style={{width:width, height:height,zIndex:0, position:"absolute", justifyContent:"center", alignItems:"center"}}>
        <AntDesign name="frowno" size={height*0.2} color="rgba(68, 68, 68,0.3)" />
        <Text style={{fontSize:fontSizeCampi,fontFamily: "Raleway_200ExtraLight", textAlign:"center", marginTop:10}}>
            Sembra non ci sia nessun'altro che rispetti le tue preferenze. Prova a cambiare qualche parametro, come il raggio di azione o la fascia di età.
        </Text>
    </View>
    }

    <BottomSheetUserDetails ref={bottomSheetUserDetailsRef} IMAGE_HEIGHT={IMAGE_HEIGHT} />
    <DialogCreaNuovaConversazione ref={dialogCreaNuovaConversazioneRef} creaNuovaConversazione = {creaNuovaConversazione} />
    {isLoading==true && <View style={{position:"absolute", width:Dimensions.get("window").width, height:Dimensions.get("window").height, justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"rgba(255,255,255,0.85)"}}>
            <View style={{position:"absolute", width:larghezzaDevice, height:larghezzaDevice}}>
                <LottieView autoPlay loop={true} source={require('../../../../resources/lottie/radar_animation.json')} resizeMode="cover" />
            </View>
            <ActivityIndicator animating={isLoading} color={MosCeleste} />
            {isChatCreating==true && <Text style={styles.messaggioCreazioneChat}>Creazione chat in corso...</Text>}
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
        backgroundColor:"#fff",
        position:"absolute",
        zIndex:10
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
    },
    messaggioCreazioneChat: {
        marginTop:10,
        fontFamily: "Raleway_400Regular",
        color: 'black',
        fontSize: fontSizeCampi,
    }
    
  });