import React, {useState, useContext} from "react"
import {View, Text, StyleSheet, useWindowDimensions, Image, TextInput,TouchableOpacity, Platform, ScrollView} from "react-native";
import { altezzaSchermoInterno, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../context/variabili_globali/variabiliGlobali";
import {RadioButton, ActivityIndicator, Dialog, Portal} from "react-native-paper";
import { MosCeleste, MosPurple, MosViola } from "../../../resources/colors";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./feature/date_picker";
import * as Location from 'expo-location';
import { AntDesign, MaterialIcons, Ionicons, Foundation,Fontisto, MaterialCommunityIcons,FontAwesome  } from '@expo/vector-icons';  
import PhotoManager from "./photo";
//installa expo install @react-native-community/datetimepicker

export default function SlidePage({item,setNomeUtente, setDataUtente,setPosizioneUtente,setSessoUtente,setIdentitaDiGenere, setPreferenzaSessoUtente,setDescrizioneUtente, setUriImmagine, creaProfilo, setError}){


    const {width, height} = useWindowDimensions();
    //servono sia per l'identità di genere che per l'orientamento sessuale a far aprire una finestra per la selezione
    const [apriSceltaGenere, setApriGenere] = useState(false);

    //nome
    const [nome, setNome] = useState('');
    //descrizione
    const [descrizione, setDescrizione] = useState('');

    //posizione
    const [isLocationSet, setIsLocationSet] = useState(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    function ottieniPosizioneUtente(){

        setIsLocationLoading(true);
        //controllo se la locazione è attiva...
        try{
        Location.hasServicesEnabledAsync()
            .then((ris)=>{
                //se la locazione non è attiva
                if(ris==false){
                    setError("Per conoscere la tua posizione devi attivare la geolocalizzazione.");
                    setIsLocationLoading(false);
                }
                //altrimenti se è attiva...
                else {
                    //controlla se l'utente ha già accontentito a darci i permessi
                    Location.requestForegroundPermissionsAsync()
                        .then((ris)=>{
                            console.log("ok getFroreground:");
                            console.log(ris);
                            //se l'utente non ha permesso più di chiedere la posizione ancora una volta...
                            if(ris.canAskAgain==false){
                                setIsLocationLoading(false);
                                setError("Vai in impostazioni e consenti a Mosaic di chiedere di nuovo la posizione");
                                return;
                            }
                            var isAccepted= "none";                            
                            if(Platform.OS==="android")
                                isAccepted = ris.android.scope;
                            else if(Platform.OS==="ios")
                                isAccepted = ris.scope;
                            
                            if(isAccepted=="none"){
                                //non ha accettato
                                setIsLocationLoading(false);
                                setError("Non è possibile usare Mosaic se non consenti di conoscere la tua posizione.");
                                return;
                            }else {
                                //ha accettato
                                Location.getCurrentPositionAsync()
                                    .then((pos)=>{
                                        setIsLocationLoading(false);
                                        //ottieni la posizione
                                        const user_position = [pos.coords.latitude,pos.coords.longitude];
                                        console.log(pos);
                                        console.log(user_position);
                                        setPosizioneUtente(user_position);
                                        setIsLocationSet(true);
                                    }).catch((e)=>{
                                        setIsLocationLoading(false);
                                        setError("Si è verificato un errore. Riprovare più tardi.")
                                    });
                            } 
                        }).catch((e)=>{
                            setIsLocationLoading(false);
                            setError("Si è verificato un errore. Riprovare più tardi.")
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

    
    function creaNuovoUser(){
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
            {item.id=='8' && 
                <View> 
                    {/*altrimenti imposta l'immagine dell'utente */}
                    {uri &&  <View style={styles.contenitoreImgProfilo}><Image source={{ uri: uri }} style={[styles.image, {alignSelf:"center",width:altezzaSchermoInterno*0.3, height:altezzaSchermoInterno*0.3, resizeMode:"cover"}]} /></View> }
                </View>
            }
            {/*item.id=='9' && <Ionicons name="person-add" size={altezzaSchermoInterno*0.3} color="white" /> */}

            <View style={{flex:1, padding:10}}>
                <View style={{flex:0.5, width:"100%", justifyContent:"center"}} >
                    <Text style={styles.titolo}>{item.title}</Text>
                    <Text style={styles.sottoTesto}>{item.subTitle}</Text>
                </View>
                <View style={{flex:0.5,width:"100%", justifyContent:"center", alignItems:"center"}}>

                    {/*PAGINA 1 --> NOME */}
                    {item.id=='1' &&
                        <TextInput
                            style={[styles.sottoTesto,{backgroundColor:"white",color:MosCeleste,fontFamily:"Raleway_400Regular", width:width*0.7, margin:25, paddingVertical:3, borderRadius:height*0.03}]}
                            onChangeText={text => setNome(text.trim())}
                            onSubmitEditing={()=>setNomeUtente(nome)}
                            onBlur={()=> setNomeUtente(nome)} //focus perso
                            value={nome}
                            placeholder="Nome"
                            keyboardType="name-phone-pad"
                      />
                         }

                        {/*PAGINA 2 --> DATA DI NASCITA */}
                        {item.id=='2' && <DatePicker setData={setDataUtente} /> }

                        {/*PAGINA 3 --> POSIZIONE */}
                        {item.id=='3' && 
                                <View>
                                    {/*se stiamo acquisendo la locazione... */}
                                    { isLocationLoading && <ActivityIndicator animating={true} color={MosCeleste} />}

                                    {/*se la locazione non è settata... */}
                                    { !isLocationSet && 
                                        <View>
                                            {!isLocationLoading &&
                                                <TouchableOpacity onPress={ottieniPosizioneUtente}>
                                                    <Text style={[styles.campiDaCompilare,{color:"white", fontFamily:"Raleway_400Regular", backgroundColor:MosCeleste, padding:10, borderRadius:20}]}> OTTIENI POSIZIONE</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    }
                                    {/*se la locazione è settata... */}
                                    {isLocationSet && <AntDesign name="checkcircle" size={altezzaSchermoInterno*0.05} color="#15e302" /> }
                                </View>    
                        }

                        {/*PAGINA 4 --> SESSO BIOLOGICO */}
                        {item.id=='4' &&
                        <View>
                            <View style={{flexDirection:"column", justifyContent:"center", alignItems:"center", width:"100%"}}>
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center" }}>
                                    <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                    <RadioButton
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="maschio"
                                        style={{width:200, height:200}}
                                        status={ isSexChecked === 'maschio' ? 'checked' : 'unchecked' }
                                        onPress={() => setSesso('maschio')}
                                    />
                                    <Text style={[styles.campiDaCompilare,{paddingLeft:larghezzaDevice*0.1}]}>FEMMINA</Text>
                                    <RadioButton
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isSexChecked === 'femmina' ? 'checked' : 'unchecked' }
                                        onPress={() => setSesso('femmina')}
                                    />
                                </View>
                                <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                                    <Text style={[styles.campiDaCompilare]}>INTERSEX</Text>
                                    <RadioButton
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


                            <ScrollView contentContainerStyle={{justifyContent:"center", }} >
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="maschio"
                                        style={{width:200, height:200}}
                                        status={ isGenereChecked === 'maschio' ? 'checked' : 'unchecked' }
                                        onPress={() => setGenere('maschio')}
                                    />
                                     <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isGenereChecked === 'femmina' ? 'checked' : 'unchecked' }
                                        onPress={() => setGenere('femmina')}
                                    />
                                     <Text style={styles.campiDaCompilare}>FEMMINA</Text>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="agender"
                                            status={ isGenereChecked === 'agender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('agender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>AGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="androgino"
                                            status={ isGenereChecked === 'androgino' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('androgino')}
                                        />
                                        <Text style={styles.campiDaCompilare}>ANDROGINO</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="terzo genere"
                                            status={ isGenereChecked === 'terzo genere' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('terzo genere')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TERZO GENERE</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="intergender"
                                            status={ isGenereChecked === 'intergender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('intergender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>INTERGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="bigender"
                                            status={ isGenereChecked === 'bigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('bigender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>BIGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="trigender"
                                            status={ isGenereChecked === 'trigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('trigender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TRIGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="pangender"
                                            status={ isGenereChecked === 'pangender' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('pangender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>PANGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderfluid"
                                            status={ isGenereChecked === 'genderfluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('genderfluid')}
                                        />
                                        <Text style={styles.campiDaCompilare}>GENDERFLUID</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderflux"
                                            status={ isGenereChecked === 'genderflux' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('genderflux')}
                                        />
                                        <Text style={styles.campiDaCompilare}>GENDERFLUX</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="transessuale"
                                            status={ isGenereChecked === 'transessuale' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('transessuale')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TRANSESSUALE</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi boy"
                                            status={ isGenereChecked === 'demi boy' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi boy')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI-BOY</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi girl"
                                            status={ isGenereChecked === 'demi girl' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi girl')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI-GIRL</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi androgino"
                                            status={ isGenereChecked === 'demi androgino' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi androgino')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI-ANDROGINO</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi fluid"
                                            status={ isGenereChecked === 'demi fluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi fluid')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI-FLUID</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi flux"
                                            status={ isGenereChecked === 'demi flux' ? 'checked' : 'unchecked' }
                                            onPress={() => setGenere('demi flux')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI-FLUX</Text>
                                    </View>
                            </ScrollView>
                        }

                        {/*PAGINA 6 --> ORIENTAMENTO SESSUALE*/}
                        {item.id=='6' &&
                            <ScrollView contentContainerStyle={{justifyContent:"center", }}>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        value="maschio"
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        style={{width:200, height:200}}
                                        status={ isSexPreferenceChecked === 'maschio' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('maschio')}
                                    />
                                     <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                </View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color={MosCeleste}
                                        uncheckedColor={MosCeleste}
                                        value="femmina"
                                        status={ isSexPreferenceChecked === 'femmina' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('femmina')}
                                    />
                                     <Text style={styles.campiDaCompilare}>FEMMINA</Text>
                                     </View>
                                     <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="agender"
                                            status={ isSexPreferenceChecked === 'agender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('agender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>AGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="androgino"
                                            status={ isSexPreferenceChecked === 'androgino' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('androgino')}
                                        />
                                        <Text style={styles.campiDaCompilare}>ANDROGINO</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="terzo genere"
                                            status={ isSexPreferenceChecked === 'terzo genere' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('terzo genere')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TERZO GENERE</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="intergender"
                                            status={ isSexPreferenceChecked === 'intergender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('intergender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>INTERGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="bigender"
                                            status={ isSexPreferenceChecked === 'bigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('bigender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>BIGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="trigender"
                                            status={ isSexPreferenceChecked === 'trigender' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('trigender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TRIGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="pangender"
                                            status={ isSexPreferenceChecked === 'pangeder' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('pangender')}
                                        />
                                        <Text style={styles.campiDaCompilare}>PANGENDER</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderfluid"
                                            status={ isSexPreferenceChecked === 'genderfluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('genderfluid')}
                                        />
                                        <Text style={styles.campiDaCompilare}>GENDERFLUID</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="genderflux"
                                            status={ isSexPreferenceChecked === 'genderflux' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('genderflux')}
                                        />
                                        <Text style={styles.campiDaCompilare}>GENDERFLUX</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="transessuale"
                                            status={ isSexPreferenceChecked === 'transessuale' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('transessuale')}
                                        />
                                        <Text style={styles.campiDaCompilare}>TRANSESSUALE</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi boy"
                                            status={ isSexPreferenceChecked === 'demi boy' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi boy')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI BOY</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi girl"
                                            status={ isSexPreferenceChecked === 'demi girl' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi girl')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI GIRL</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi androgino"
                                            status={ isSexPreferenceChecked === 'demi androgino' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi androgino')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI ANDROGINO</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi fluid"
                                            status={ isSexPreferenceChecked === 'demi fluid' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi fluid')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI FLUID</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                        <RadioButton
                                            color={MosCeleste}
                                            uncheckedColor={MosCeleste}
                                            value="demi flux"
                                            status={ isSexPreferenceChecked === 'demi flux' ? 'checked' : 'unchecked' }
                                            onPress={() => setPreferenzaSesso('demi flux')}
                                        />
                                        <Text style={styles.campiDaCompilare}>DEMI FLUX</Text>
                                    </View>
                            </ScrollView>
                        }

                        {/*PAGINA 7 --> DESCRIZIONE */}
                        {item.id=='7' &&
                            <View style={{ flex:0.8, width:"100%"}}>
                                <Text style={{fontFamily:"Raleway_400Regular", fontSize:fontSizeCampi, color:MosPurple}}>Descrizione</Text>
                                <TextInput
                                    style={{backgroundColor:"white",textAlignVertical:"top", color:MosCeleste,fontFamily:"Raleway_400Regular", width:"100%", height:"100%", paddingVertical:3,fontSize:fontSizeSottoTitolo*0.8,fontFamily: "Raleway_200ExtraLight",color: MosCeleste}}
                                    onChangeText={text => setDescrizione(text)}
                                    onSubmitEditing={()=>setDescrizioneUtente(descrizione)}
                                    onBlur={()=> setDescrizioneUtente(descrizione)} //focus perso
                                    value={descrizione}
                                    keyboardType="name-phone-pad"
                                    multiline={true}
                                    placeholder='Parlaci di te, della tua sessualità in breve...'
                                    underlineColorAndroid='transparent'
                                    maxLength={150}
                                />
                            </View>
                            }

                        {/*PAGINA 6 --> FOTO */}
                        {item.id=='8' && <PhotoManager setErrore={displayError} setUriUtente={setUriImg}/>}

                        {/*PAGINA 7 --> CREAZIONE PROFILO */}
                        {item.id=='9' && 
                                    <TouchableOpacity onPress={creaNuovoUser}>
                                        <Text style={[styles.campiDaCompilare,{color:"white", backgroundColor:MosCeleste,fontFamily:"Raleway_400Regular", padding:10, marginTop:20, borderRadius:20}]}> CREA PROFILO</Text>
                                    </TouchableOpacity> 
                        }

                     {/*<Text style={[styles.info,{paddingTop:20, textAlign:"center"}]}>{item.info}</Text>*/}
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
        alignSelf:"center",
        textAlign:"center",
    },
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
    info: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "white"
    },
    errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red",
    },
    contenitoreImgProfilo:{
        
    },
})