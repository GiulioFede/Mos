import React, {useState, useRef} from "react"
import {View, Text, StyleSheet, useWindowDimensions, Image, TextInput,TouchableOpacity, Platform, ScrollView, Dimensions} from "react-native";
import { altezzaSchermoInterno, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../context/variabili_globali/variabiliGlobali";
import {RadioButton, ActivityIndicator, Dialog, Portal, Divider} from "react-native-paper";
import { MosCeleste, MosPurple, MosViola } from "../../../resources/colors";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./feature/date_picker";
import * as Location from 'expo-location';
import { AntDesign, Entypo,MaterialIcons  } from '@expo/vector-icons';  
import PhotoManager from "./photo";
import { LocationAccuracy } from "expo-location";
import { FlatList } from "react-native-gesture-handler";
//installa expo install @react-native-community/datetimepicker


//variabili di appoggio (li metto qua cosi da evitare di ricrearle ad ogni render)
let tmpKeywordArray = null;
let check = false;
let nomeTmp = "";
let descrizioneTmp = "";
let occupazioneTmp = "";

export default function SlidePage({item,setNomeUtente, setDataUtente,setPosizioneUtente,setSessoUtente,setIdentitaDiGenere, setPreferenzaSessoUtente,setDescrizioneUtente, setOccupazioneUtente,setKeywordUtente, setUriImmagine, creaProfilo, setError}){


    const {width, height} = useWindowDimensions();
    //servono sia per l'identità di genere che per l'orientamento sessuale a far aprire una finestra per la selezione
    const [apriSceltaGenere, setApriGenere] = useState(false);

    //nome
    const [nome, setNome] = useState('');
    //descrizione
    const [descrizione, setDescrizione] = useState('');
    //occupazione
    const [occupazione, setOccupazione] = useState('');
    //keyword hobby,interessi e passioni
    const [keyword, setUltimaKeyword] = useState('');

    //riferimento flatlist keyword
    const flatListKeywordRef = useRef();

    //nel caso il gps non funzioni
    const [provaAlternativaGeocode, setProvaAlternativaGeocode] = useState(false);
    const [geocodeResponse, setGeocodeResponse] = useState(null); //3 stati: nullo, false (almeno una tra città, regione o paese non è stata calcolata), <valore> (contiene la stringa città,regione e paese)
    const [indirizzo, setUltimoIndirizzo] = useState("");

    //posizione
    const [isLocationSet, setIsLocationSet] = useState(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    function ottieniPosizioneUtente(){
        if(isLocationLoading==true) return;

        setIsLocationLoading(true);
        //controllo se la locazione è attiva...
        try{
            console.log("controllo servizio attivo");
        Location.hasServicesEnabledAsync()
            .then((ris)=>{
                //se la locazione non è attiva
                if(ris==false){
                    console.log("servizio non attivo");
                    setError("Per conoscere la tua posizione devi attivare la geolocalizzazione.");
                    setIsLocationLoading(false);
                    return;
                }
                //altrimenti se è attiva...
                else {
                    console.log("servizio è attivo. Richiedo permessi.");
                    //controlla se l'utente ha già accontentito a darci i permessi
                    Location.requestForegroundPermissionsAsync()
                        .then(async(ris)=>{
                            console.log("ok getFroreground:");
                            console.log(ris);
                            //se l'utente non ha permesso più di chiedere la posizione ancora una volta...
                            if(ris.status != "granted"){
                                setIsLocationLoading(false);
                                setError("Vai in impostazioni e consenti a Mosaic di chiedere di nuovo la posizione");
                                return;
                            }
                            var isAccepted= "none";                            
                            if(Platform.OS==="android")
                                isAccepted = ris.android.accuracy;
                            else if(Platform.OS==="ios")
                                isAccepted = ris.scope;
                            
                            console.log("controllo isAccepted:");
                            if(isAccepted=="none"){
                                console.log("none");
                                //non ha accettato
                                setIsLocationLoading(false);
                                setError("Non è possibile usare Mosaic se non consenti di conoscere la tua posizione.");
                                return;
                            }else {
                                console.log("ha accettato. Richiedo posizione");
                                //ha accettato
                                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest })
                                    .then((pos)=>{
                                       console.log("posizione ottenuta");
                                        //ottieni la posizione
                                        const user_position = [pos.coords.latitude,pos.coords.longitude];
                                        console.log(pos);
                                        console.log(user_position);
                                        //ottengo la città, la regione e lo stato
                                        Location.reverseGeocodeAsync({latitude:pos.coords.latitude, longitude:pos.coords.longitude}, {useGoogleMaps:false})
                                           .then((ris)=>{
                                                //console.log("ADDRESS OBJECT USER");
                                                console.log(ris);
                                                user_position.push(ris[0].city==null?"null":(ris[0].city) );
                                                user_position.push(ris[0].region==null?"null":(ris[0].region));
                                                user_position.push(ris[0].country==null?"null":(ris[0].country));
                                                setPosizioneUtente(user_position);
                                                setIsLocationSet(true);
                                            }).catch((e)=>{
                                                console.log("errore posizione:"+e);
                                                setError("Si è verificato un problema. Riprova a riottenere la posizione.")
                                            }).finally(()=>{
                                                setIsLocationLoading(false);
                                            })
                                    }).catch((e)=>{
                                        console.log("errore posizione:"+e);
                                        setIsLocationLoading(false);
                                        setError("Sembra esserci un problema con il tuo provider di posizione. Prova questa alternativa.");
                                        if(provaAlternativaGeocode==false){
                                            setError("Si è verificato un errore col tuo provider di posizione. Prova questa alternativa.");
                                            setProvaAlternativaGeocode(true);
                                        }
                                        else 
                                            setError("Si è verificato un errore. Riprova più tardi.");
                                    });
                            } 
                        }).catch((e)=>{
                            console.log("errore posizione:"+e);
                            setIsLocationLoading(false);
                            setError("Sembra esserci un problema con il tuo provider di posizione. Prova questa alternativa.");
                            if(provaAlternativaGeocode==false){
                                setError("Si è verificato un errore col tuo provider di posizione. Prova questa alternativa.");
                                setProvaAlternativaGeocode(true);
                            }
                            else 
                                setError("Si è verificato un errore. Riprova più tardi.");
                        })

                }
            }).catch((e)=>{
                setIsLocationLoading(false);
                setError("Si è verificato un errore. Riprovare più tardi.")
                console.log("si è verificato un problema:"+e);
            })
        }catch(e){
            setIsLocationLoading(false);
            setError("Si è verificato un errore. Riprovare più tardi.")
        }
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
                    if(ris[0].city==null){ setError("Non siamo riusciti a trovare la città."); setIsLocationLoading(false); return;}
                    else if(ris[0].region==null) { setError("Non siamo riusciti a trovare la regione."); setIsLocationLoading(false); return;}
                    else if(ris[0].country==null) {setError("Non siamo riusciti a trovare il paese."); setIsLocationLoading(false); return;}
                    //altrimenti tutto ok
                    setGeocodeResponse(ris[0].city+","+ris[0].region+","+ris[0].country);
                    setIsLocationLoading(false);
                    setPosizioneUtente(user_position);
                    setIsLocationSet(true);
                    setError("Se non è quello il luogo dove vivi puoi riprovare con un nuovo indirizzo invece di procedere.");
                }catch(e){
                    console.log("errore geocode 2:"+e);
                    setError("Si è verificato un problema. Riprova più tardi.");
                    setIsLocationLoading(false);
                    setPosizioneUtente([]);
                    setIsLocationSet(false);
                }
            }else {
                setError("Inserisci un indirizzo valido.");
                setIsLocationLoading(false);
                setPosizioneUtente([]);
                setIsLocationSet(false);
            }
            console.log(ind);
        }else {
            setError("Inserisci un indirizzo valido.");
            setIsLocationLoading(false);
            setPosizioneUtente([]);
            setIsLocationSet(false);
        }
        }catch(e){
            console.log("errore geocode:"+e);
            setError("Si è verificato un errore durante il calcolo della tua posizione.");
            setIsLocationLoading(false);
            setPosizioneUtente([]);
            setIsLocationSet(false);
        }
    }

    //sesso
    const [isSexChecked, setIsSexChecked] = useState('');
    function setSesso(sex){
        setSessoUtente(sex);
        setIsSexChecked(sex);
    }

    //identita di genere
    const [isGenereChecked, setGenereChecked] = useState('');
    function setGenere(gen){
        setIdentitaDiGenere(gen);
        setGenereChecked(gen);
    }

    //orientamento sessuale
    const [isSexPreferenceChecked, setIsSexPreferenceChecked] = useState('');
    function setPreferenzaSesso(sex){
        setPreferenzaSessoUtente(sex);
        setIsSexPreferenceChecked(sex);
    }

    //foto
    const [uri, setUri] = useState(null);
    function setUriImg(path){
        setUri(path);
        setUriImmagine(path);
    }

    //array utilizzato dalla flatlist keyword
    const [keywordArray, setKeywordArray] = useState([]);
    //keyword hobby
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
                setError("La keyword "+keyword.toUpperCase()+" esiste già.");
                return;
            }
            //inserisco nella flatlist
            //se la flatlist è vuota...
            if(keywordArray.length==0)
                tmpKeywordArray = [{id:0, keyword:keyword.toUpperCase()}]
            else
                tmpKeywordArray = [...keywordArray,{id:((keywordArray[keywordArray.length-1].id)+1), keyword:keyword.toUpperCase()}];
            setKeywordArray(tmpKeywordArray);
            setKeywordUtente(tmpKeywordArray);
            setUltimaKeyword("");
        }
    }

    function eliminaKeyword(index){
        tmpKeywordArray = [...keywordArray];
        tmpKeywordArray.splice(index,1);
        setKeywordArray(tmpKeywordArray);
        setKeywordUtente(tmpKeywordArray);
    }

    console.log("keyword array");
    console.log(keywordArray);
    
    function creaNuovoUser(){
        console.log("crea profilo..");
        creaProfilo();
    }

    //setto l'errore
    function displayError(e){
        setError(e);
    }

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={[styles.container,{width}]}>
            {/*<Image source={item.image} style={[styles.image, {width, resizeMode:'contain'}]} />*/}
            {/*item.id=='1' && <AntDesign name="user" size={altezzaSchermoInterno*0.3} color={MosCeleste} /> */}
            {/*item.id=='2' && <MaterialIcons name="cake" size={altezzaSchermoInterno*0.3} color="white" /> */}
            {/*item.id=='3' && <Ionicons name="ios-location-sharp" size={altezzaSchermoInterno*0.3} color="white" /> */}
            {/*item.id=='4' && <Fontisto name="intersex" size={altezzaSchermoInterno*0.3} color="white" /> */}
            {/*item.id=='5' && <MaterialCommunityIcons name="heart-multiple" size={altezzaSchermoInterno*0.3} color="white" /> */}
            {item.id=='10' && 
                <View> 
                    {/*altrimenti imposta l'immagine dell'utente */}
                    {uri &&  <View style={styles.contenitoreImgProfilo}><Image source={{ uri: uri }} style={[styles.image, {alignSelf:"center",width:altezzaSchermoInterno*0.3, height:altezzaSchermoInterno*0.3, resizeMode:"cover"}]} /></View> }
                </View>
            }
            {/*item.id=='9' && <Ionicons name="person-add" size={altezzaSchermoInterno*0.3} color="white" /> */}

            <View style={{flex:1, padding:10}}>
                <View style={{flex:0.4, width:"100%",alignItems:"center", justifyContent:"center", alignSelf:"center"}} >
                    <Text style={styles.titolo}>{item.title}</Text>
                    <Text style={[styles.sottoTesto,{textAlign:"center"}]}>{item.subTitle}</Text>
                    {item.id=='3' && provaAlternativaGeocode==true && isLocationLoading && <ActivityIndicator animating={true} color={MosCeleste} />}
                    {item.id=='3' && provaAlternativaGeocode==true && 
                        <>
                        {geocodeResponse==false && isLocationLoading==false &&
                                     <Text style={[styles.sottoTesto,{paddingTop:20, textAlign:"center"}]}>Non siamo riusciti a localizzarti. Prova con un indirizzo più conosciuto, non per forza molto vicino a dove stai. Infatti Mosaic utilizzerà una macroarea per mostrare gli utenti vicini.</Text>}
                                    {geocodeResponse!=null && geocodeResponse!=false && isLocationLoading==false &&
                                        <>
                                        <View style={{flexDirection:"row",padding:Dimensions.get("window").height*0.01, justifyContent:"center", alignItems:"center"}}>
                                            <Entypo name="location-pin" size={fontSizeCampi*1.5} color={MosCeleste} />
                                            <Text style={[styles.sottoTesto,{textAlign:"center",textAlignVertical:"center"}]}>{geocodeResponse}</Text>
                                        </View>
                                        </>
                                    }
                        </>
                    }
                </View>
                <View style={{flex:1,width:"100%", justifyContent:"center", alignItems:"center"}}>

                    {/*PAGINA 1 --> NOME */}
                    {item.id=='1' &&
                        <View>
                        <TextInput
                            style={[styles.sottoTesto,{color:MosCeleste,fontFamily:"Raleway_400Regular",borderBottomColor:MosCeleste, borderBottomWidth:1, textAlign:"center", width:width*0.3, margin:25, paddingVertical:3}]}
                            onChangeText={text =>{ nomeTmp = text.trim(); nomeTmp = nomeTmp.charAt(0).toUpperCase() + nomeTmp.slice(1);  setNome(nomeTmp)}}
                            onSubmitEditing={()=>{nomeTmp = nome.trim(); nomeTmp = nome.charAt(0).toUpperCase() + nome.slice(1); setNomeUtente(nomeTmp)}}
                            onBlur={()=> {nomeTmp = nome.trim(); nomeTmp = nome.charAt(0).toUpperCase() + nome.slice(1); setNomeUtente(nomeTmp)}} //focus perso
                            value={nome}
                            autoCapitalize="words"
                            placeholder="Nome"
                            keyboardType="name-phone-pad"
                      />
                      </View>
                         }

                        {/*PAGINA 2 --> DATA DI NASCITA */}
                        {item.id=='2' && <DatePicker setData={setDataUtente} /> }

                        {/*PAGINA 3 --> POSIZIONE */}
                        {item.id=='3' && provaAlternativaGeocode==false &&
                                <View>
                                    {/*se stiamo acquisendo la locazione... */}
                                    { isLocationLoading && <ActivityIndicator animating={true} color={MosCeleste} />}

                                    {/*se la locazione non è settata... */}
                                    { !isLocationSet && 
                                        <View>
                                            {!isLocationLoading &&
                                                <TouchableOpacity onPress={ottieniPosizioneUtente}>
                                                    <View style={{backgroundColor:MosCeleste, padding:10, borderRadius:20}}>
                                                        <Text style={[styles.campiDaCompilare,{color:"white", fontFamily:"Raleway_400Regular"}]}> OTTIENI POSIZIONE</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    }
                                    {/*se la locazione è settata... */}
                                    {isLocationSet && <AntDesign name="checkcircle" size={altezzaSchermoInterno*0.05} color="#15e302" /> }
                                </View>    
                        }
                        {item.id=='3' && provaAlternativaGeocode==true &&
                                <View >
                                    {<Text style={[styles.info,{paddingTop:20, textAlign:"center"}]}>Inserisci il tuo indirizzo civico seguito dalla città, regione e paese dove vivi. Calcoleremo la tua posizione usando queste informazioni.</Text>}
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                                    <Text style={{color:MosPurple,fontFamily:"Raleway_400Regular",fontSize:fontSizeSottoTitolo*0.7,opacity:(keywordArray.length<10?1:0.3) }}>Indirizzo:</Text>
                                    
                                    <TextInput
                                        style={[styles.sottoTesto,{flex:1, color:MosCeleste, fontFamily:"Raleway_400Regular",fontSize:fontSizeSottoTitolo*0.5,borderBottomColor:MosCeleste, borderBottomWidth:1, textAlign:"center", margin:25, paddingVertical:3}]}
                                        onChangeText={ind => setUltimoIndirizzo(ind)}    
                                        value={indirizzo}
                                        maxLength={100}
                                        placeholder="<indirizzo civico> <città> <regione> <paese>"
                                        keyboardType="name-phone-pad"
                                />
                               
                                    <TouchableOpacity disabled={isLocationLoading} onPress={()=>{setUltimoIndirizzo(""); setGeocodeResponse(null); calcolaGeocode();}}>
                                        <MaterialIcons name="gps-fixed" size={fontSizeSottoTitolo*0.7} color={MosViola} />
                                    </TouchableOpacity>
                                </View>
                                
                               
                                </View> 
                        }

                        {/*PAGINA 4 --> SESSO BIOLOGICO */}
                        {item.id=='4' &&
                        <View>
                            <View style={{flexDirection:"column", justifyContent:"center", alignItems:"center", width:"100%"}}>
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center" }}>
                                    <TouchableOpacity onPress={() => setSesso('male')}>
                                        <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                    </TouchableOpacity>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="maschio"
                                        style={{width:200, height:200}}
                                        status={ isSexChecked === 'male' ? 'checked' : 'unchecked' }
                                        onPress={() => setSesso('male')}
                                    />
                                    <TouchableOpacity onPress={() => setSesso('female')}>
                                        <Text style={[styles.campiDaCompilare,{paddingLeft:larghezzaDevice*0.1}]}>FEMMINA</Text>
                                    </TouchableOpacity>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isSexChecked === 'female' ? 'checked' : 'unchecked' }
                                        onPress={() => setSesso('female')}
                                    />
                                </View>
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                                    <TouchableOpacity onPress={() => setSesso('intersex')}>
                                        <Text style={[styles.campiDaCompilare]}>INTERSEX</Text>
                                    </TouchableOpacity>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="intersex"
                                        status={ isSexChecked === 'intersex' ? 'checked' : 'unchecked' }
                                        onPress={() => setSesso('intersex')}
                                    />
                                </View>
                            </View>
                            </View>
                        }

                        {/*PAGINA 5 --> IDENTITA' DI GENERE*/}
                        {item.id=='5' &&


                            <ScrollView horizontal={true} contentContainerStyle={{justifyContent:"center", }} >
                               
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="maschio"
                                        style={{width:200, height:200}}
                                        status={ isGenereChecked === 'male' ? 'checked' : 'unchecked' }
                                        onPress={() => setGenere('male')}
                                    />
                                    <TouchableOpacity onPress={() => setGenere('male')}>
                                        <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isGenereChecked === 'female' ? 'checked' : 'unchecked' }
                                        onPress={() => setGenere('female')}
                                    />
                                     <TouchableOpacity onPress={() => setGenere('female')}>
                                        <Text style={styles.campiDaCompilare}>FEMMINA</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="agender"
                                            status={ isGenereChecked === 'agender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('agender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('agender')}>
                                            <Text style={styles.campiDaCompilare}>AGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="androgino"
                                            status={ isGenereChecked === 'androgynous' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('androgynous')}
                                        />
                                       <TouchableOpacity onPress={() => setGenere('androgynous')}>
                                            <Text style={styles.campiDaCompilare}>ANDROGINO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="terzo genere"
                                            status={ isGenereChecked === 'third gender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('third gender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('third gender')}>
                                            <Text style={styles.campiDaCompilare}>TERZO GENERE</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="intergender"
                                            status={ isGenereChecked === 'intergender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('intergender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('intergender')}>
                                            <Text style={styles.campiDaCompilare}>INTERGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="bigender"
                                            status={ isGenereChecked === 'bigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('bigender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('bigender')}>
                                            <Text style={styles.campiDaCompilare}>BIGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="trigender"
                                            status={ isGenereChecked === 'trigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('trigender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('trigender')}>
                                            <Text style={styles.campiDaCompilare}>TRIGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="pangender"
                                            status={ isGenereChecked === 'pangender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('pangender')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('pangender')}>
                                            <Text style={styles.campiDaCompilare}>PANGEDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderfluid"
                                            status={ isGenereChecked === 'genderfluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('genderfluid')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('genderfluid')}>
                                            <Text style={styles.campiDaCompilare}>GENDERFLUID</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderflux"
                                            status={ isGenereChecked === 'genderflux' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('genderflux')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('genderflux')}>
                                            <Text style={styles.campiDaCompilare}>GENDERFLUX</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="transessuale"
                                            status={ isGenereChecked === 'transexual' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('transexual')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('transexual')}>
                                            <Text style={styles.campiDaCompilare}>TRANSESSUALE</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi boy"
                                            status={ isGenereChecked === 'demi boy' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi boy')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('demi boy')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-BOY</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi girl"
                                            status={ isGenereChecked === 'demi girl' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi girl')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('demi girl')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-GIRL</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi androgino"
                                            status={ isGenereChecked === 'demi androgynous' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi androgynous')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('demi androgynous')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-ANDROGINO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi fluid"
                                            status={ isGenereChecked === 'demi fluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi fluid')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('demi fluid')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-FLUID</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi flux"
                                            status={ isGenereChecked === 'demi flux' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi flux')}
                                        />
                                        <TouchableOpacity onPress={() => setGenere('demi flux')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-FLUX</Text>
                                        </TouchableOpacity>
                                    </View>
                                   
                            </ScrollView>
                        }

                        {/*PAGINA 6 --> ORIENTAMENTO SESSUALE*/}
                        {item.id=='6' &&
                            <ScrollView horizontal={true} contentContainerStyle={{justifyContent:"center", }}>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton.Android
                                        value="maschio"
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        style={{width:200, height:200}}
                                        status={ isSexPreferenceChecked === 'male' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('male')}
                                    />
                                     <TouchableOpacity onPress={() => setPreferenzaSesso('male')}>
                                        <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton.Android
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isSexPreferenceChecked === 'female' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('female')}
                                    />
                                    <TouchableOpacity onPress={() => setPreferenzaSesso('female')}>
                                        <Text style={styles.campiDaCompilare}>FEMMINA</Text>
                                    </TouchableOpacity>
                                     </View>
                                     <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="agender"
                                            status={ isSexPreferenceChecked === 'agender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('agender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('agender')}>
                                            <Text style={styles.campiDaCompilare}>AGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="androgino"
                                            status={ isSexPreferenceChecked === 'androgynous' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('androgynous')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('androgynous')}>
                                            <Text style={styles.campiDaCompilare}>ANDROGINO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="terzo genere"
                                            status={ isSexPreferenceChecked === 'third gender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('third gender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('third gender')}>
                                            <Text style={styles.campiDaCompilare}>TERZO GENERE</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="intergender"
                                            status={ isSexPreferenceChecked === 'intergender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('intergender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('intergender')}>
                                            <Text style={styles.campiDaCompilare}>INTERGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="bigender"
                                            status={ isSexPreferenceChecked === 'bigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('bigender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('bigender')}>
                                            <Text style={styles.campiDaCompilare}>BIGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="trigender"
                                            status={ isSexPreferenceChecked === 'trigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('trigender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('trigender')}>
                                            <Text style={styles.campiDaCompilare}>TRIGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="pangender"
                                            status={ isSexPreferenceChecked === 'pangender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('pangender')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('pangender')}>
                                            <Text style={styles.campiDaCompilare}>PANGENDER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderfluid"
                                            status={ isSexPreferenceChecked === 'genderfluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('genderfluid')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('genderfluid')}>
                                            <Text style={styles.campiDaCompilare}>GENDER FLUID</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderflux"
                                            status={ isSexPreferenceChecked === 'genderflux' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('genderflux')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('genderflux')}>
                                            <Text style={styles.campiDaCompilare}>GENDERFLUX</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="transessuale"
                                            status={ isSexPreferenceChecked === 'transexual' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('transexual')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('transexual')}>
                                            <Text style={styles.campiDaCompilare}>TRANSESSUALE</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi boy"
                                            status={ isSexPreferenceChecked === 'demi boy' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi boy')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('demi boy')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-BOY</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi girl"
                                            status={ isSexPreferenceChecked === 'demi girl' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi girl')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('demi girl')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-GIRL</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi androgino"
                                            status={ isSexPreferenceChecked === 'demi androgynous' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi androgynous')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('demi androgynous')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-ANDROGINO</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi fluid"
                                            status={ isSexPreferenceChecked === 'demi fluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi fluid')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('demi fluid')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-FLUID</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton.Android
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi flux"
                                            status={ isSexPreferenceChecked === 'demi flux' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi flux')}
                                        />
                                        <TouchableOpacity onPress={() => setPreferenzaSesso('demi flux')}>
                                            <Text style={styles.campiDaCompilare}>DEMI-FLUX</Text>
                                        </TouchableOpacity>
                                    </View>
                            </ScrollView>
                        }

                        {/*PAGINA 7 --> DESCRIZIONE */}
                        {item.id=='7' &&
                            <View style={{ flex:0.8, width:"100%"}}>
                                <Text style={{fontFamily:"Raleway_400Regular", fontSize:fontSizeCampi, color:MosPurple}}>Descrizione</Text>
                                <TextInput
                                    style={{backgroundColor:"white",textAlignVertical:"top", color:MosCeleste,fontFamily:"Raleway_400Regular", width:"100%", height:"100%", paddingVertical:3,fontSize:fontSizeSottoTitolo*0.8,fontFamily: "Raleway_200ExtraLight",color: MosCeleste}}
                                    onChangeText={text =>{descrizioneTmp = text; descrizioneTmp = descrizioneTmp.charAt(0).toUpperCase() + descrizioneTmp.slice(1); setDescrizione(descrizioneTmp)}}
                                    onSubmitEditing={()=>setDescrizioneUtente(descrizione)}
                                    onBlur={()=> setDescrizioneUtente(descrizione)} //focus perso
                                    value={descrizione}
                                    keyboardType="default"
                                    multiline={true}
                                    placeholder='Parlaci di te...'
                                    underlineColorAndroid='transparent'
                                    maxLength={150}
                                />
                            </View>
                            }

                        {/*PAGINA 8 --> OCCUPAZIONE */}
                        {item.id=='8' &&
                            <View>
                            <TextInput
                                style={[styles.sottoTesto,{color:MosCeleste,fontFamily:"Raleway_400Regular",borderBottomColor:MosCeleste, borderBottomWidth:1, textAlign:"center", width:width*0.7, margin:25, paddingVertical:3}]}
                                onChangeText={text =>{occupazioneTmp = text; occupazioneTmp = occupazioneTmp.charAt(0).toUpperCase() + occupazioneTmp.slice(1); setOccupazione(occupazioneTmp)}}
                                onSubmitEditing={()=>setOccupazioneUtente(occupazione)}
                                onBlur={()=> setOccupazioneUtente(occupazione)} //focus perso
                                value={occupazione}
                                maxLength={50}
                                placeholder="es. studente, barista,..."
                                keyboardType="default"
                        />
                        </View> }
 
                        {/*PAGINA 9 --> HOBBY, INTERESSI E PASSIONI */}
                        {item.id=='9' 
                            &&
                            <View style={{flex:1}} >
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                                    <Text style={{color:MosPurple,fontFamily:"Raleway_400Regular",fontSize:fontSizeSottoTitolo*0.7,opacity:(keywordArray.length<10?1:0.3) }}>Inserisci parola chiave:</Text>
                                    <TextInput
                                        style={[styles.sottoTesto,{color:MosCeleste,opacity:(keywordArray.length<10?1:0.3), fontFamily:"Raleway_400Regular",fontSize:fontSizeSottoTitolo*0.7,borderBottomColor:MosCeleste, borderBottomWidth:1, textAlign:"center", width:width*0.3, margin:25, paddingVertical:3}]}
                                        onChangeText={key => setUltimaKeyword(key.trim())}
                                        onSubmitEditing={()=>{inserisciKeyword()}}
                                        value={keyword}
                                        editable = {keywordArray.length<10}
                                        maxLength={15}
                                        placeholder="es. dipingere"
                                        keyboardType="name-phone-pad"
                                />
                                </View>
                                <Divider />
                                <View >
                                <FlatList
                                    ref = {flatListKeywordRef}
                                    onContentSizeChange={()=> flatListKeywordRef.current.scrollToEnd()} 
                                    horizontal={true}
                                    data={keywordArray}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id.toString()}
                                    renderItem={({ item, index }) =>
                                        <View style={{marginTop:10, marginRight:10}}>
                                            <View style={{backgroundColor:MosPurple, borderRadius:10}}><Text style={{color:"white", marginTop: 20, height:50, textAlign:"center", textAlignVertical:"center", padding:10}}>{item.keyword}</Text></View>
                                            <TouchableOpacity style={{position:"absolute"}} onPress={()=>{eliminaKeyword(index)}}>
                                                <View style={{backgroundColor:"red", borderRadius:5}}><Entypo name="cross" size={20} color="white" /></View>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                />
                                </View>
                            </View>
                        }     

                        {/*PAGINA 10 --> FOTO */}
                        {item.id=='10' && <PhotoManager setErrore={displayError} setUriUtente={setUriImg}/>}

                        {/*PAGINA 11 --> CREAZIONE PROFILO */}
                        {item.id=='11' && 
                                    <TouchableOpacity onPress={()=>{creaNuovoUser()}}>
                                        <View style={{backgroundColor:MosCeleste, marginTop:20, borderRadius:20}}><Text style={[styles.campiDaCompilare,{color:"white", fontFamily:"Raleway_400Regular", padding:10}]}> CREA PROFILO</Text></View>
                                    </TouchableOpacity> 
                        }
                     
                </View>
                <View>
                        <Divider style={{marginVertical:20}} />
                        {<Text style={[styles.info,{ textAlign:"center"}]}>{item.info}</Text>}
                     </View>

            </View>
            
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    image: {
        justifyContent:"center",
        borderRadius: altezzaSchermoInterno*0.3/2,
        overflow: "hidden"
    },
    description:{
        fontWeight: '300',
        color: '#62656b',
        textAlign: 'center',
        paddingHorizontal: 64,
    },
    titolo:{
        fontSize:fontSizeTitolo*0.7,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
        textAlign:"center",
        alignSelf:"center",
        
    },
    testo:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        alignSelf:"center",
    },
    sottoTesto:{
        fontSize:fontSizeSottoTitolo*0.8,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        alignSelf:"center"
    },
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
    info: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "#444"
    },
    errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red",
    },
    contenitoreImgProfilo:{
        
    },
})