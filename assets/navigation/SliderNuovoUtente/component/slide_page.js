import React, {useState, useContext} from "react"
import {View, Text, StyleSheet, useWindowDimensions, Image, TextInput,TouchableOpacity, Platform} from "react-native";
import { altezzaSchermoInterno, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../context/variabili_globali/variabiliGlobali";
import {RadioButton, ActivityIndicator} from "react-native-paper";
import { MosCeleste, MosPurple, MosViola } from "../../../resources/colors";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./feature/date_picker";
import * as Location from 'expo-location';
import { AntDesign, MaterialIcons, Ionicons, Foundation,Fontisto, MaterialCommunityIcons,FontAwesome  } from '@expo/vector-icons';  
import PhotoManager from "./photo";
//installa expo install @react-native-community/datetimepicker

export default function SlidePage({item,setNomeUtente, setDataUtente,setPosizioneUtente,setSessoUtente, setPreferenzaSessoUtente,setUriImmagine, creaProfilo, setError}){


    const {width, height} = useWindowDimensions();

    //nome
    const [nome, setNome] = useState('');

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
                    Location.requestPermissionsAsync()
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
                                        const user_position = pos.coords.latitude+","+pos.coords.longitude;
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

    //preferenze sessuali
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
            {item.id=='1' && <AntDesign name="user" size={altezzaSchermoInterno*0.3} color="white" /> }
            {item.id=='2' && <MaterialIcons name="cake" size={altezzaSchermoInterno*0.3} color="white" /> }
            {item.id=='3' && <Ionicons name="ios-location-sharp" size={altezzaSchermoInterno*0.3} color="white" /> }
            {item.id=='4' && <Fontisto name="intersex" size={altezzaSchermoInterno*0.3} color="white" /> }
            {item.id=='5' && <MaterialCommunityIcons name="heart-multiple" size={altezzaSchermoInterno*0.3} color="white" /> }
            {item.id=='6' && 
                <View>
                    {/*se l'uri non è stata ancora settata*/}
                    {!uri && <FontAwesome name="user-circle" size={altezzaSchermoInterno*0.3} color="white"/>} 
                    {/*altrimenti imposta l'immagine dell'utente */}
                    {uri &&  <View style={styles.contenitoreImgProfilo}><Image source={{ uri: uri }} style={[styles.image, {width:altezzaSchermoInterno*0.3, height:altezzaSchermoInterno*0.3, resizeMode:"cover"}]} /></View> }
                </View>
            }
            {item.id=='7' && <Ionicons name="person-add" size={altezzaSchermoInterno*0.3} color="white" /> }

            <View style={{alignItems:"center",justifyContent:"center"}}>
                <View >
                    <Text style={styles.titolo}>{item.title}</Text>
                    <Text style={styles.sottoTesto}>{item.subTitle}</Text>
                </View>
                <View style={{ justifyContent:"center", alignItems:"center"}}>

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
                                    { isLocationLoading && <ActivityIndicator animating={true} color="white" />}

                                    {/*se la locazione non è settata... */}
                                    { !isLocationSet && 
                                        <View>
                                            {!isLocationLoading &&
                                                <TouchableOpacity onPress={ottieniPosizioneUtente}>
                                                    <Text style={[styles.campiDaCompilare,{color:MosCeleste, fontFamily:"Raleway_400Regular", backgroundColor:"white", padding:10, borderRadius:20}]}> OTTIENI POSIZIONE</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    }
                                    {/*se la locazione è settata... */}
                                    {isLocationSet && <AntDesign name="checkcircle" size={altezzaSchermoInterno*0.05} color="#15e302" /> }
                                </View>    
                        }

                        {/*PAGINA 4 --> SESSO */}
                        {item.id=='4' && 
                            <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                                <Text style={styles.campiDaCompilare}>MASCHIO</Text>
                                 <RadioButton
                                    color="white"
                                    uncheckedColor="white"
                                    value="maschio"
                                    style={{width:200, height:200}}
                                    status={ isSexChecked === 'maschio' ? 'checked' : 'unchecked' }
                                    onPress={() => setSesso('maschio')}
                                />
                                <Text style={[styles.campiDaCompilare,{paddingLeft:larghezzaDevice*0.1}]}>FEMMINA</Text>
                                <RadioButton
                                    color="white"
                                    uncheckedColor="white"
                                    value="femmina"
                                    status={ isSexChecked === 'femmina' ? 'checked' : 'unchecked' }
                                    onPress={() => setSesso('femmina')}
                                />
                            </View>
                        }

                        {/*PAGINA 5 --> ORIENTAMENTO SESSUALE */}
                        {item.id=='5' &&
                            <View>
                                <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color="white"
                                        value="eterosessuaale"
                                        uncheckedColor="white"
                                        style={{width:200, height:200}}
                                        status={ isSexPreferenceChecked === 'eterosessuale' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('eterosessuale')}
                                    />
                                     <Text style={styles.campiDaCompilare}>ETEROSESSUALE</Text>
                                    </View>
                                    <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color="white"
                                        uncheckedColor="white"
                                        value="omosessuale"
                                        status={ isSexPreferenceChecked === 'omosessuale' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('omosessuale')}
                                    />
                                     <Text style={styles.campiDaCompilare}>OMOSESSUALE</Text>
                                     </View>
                                     <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <RadioButton
                                        color="white"
                                        uncheckedColor="white"
                                        value="bisessuale"
                                        status={ isSexPreferenceChecked === 'bisessuale' ? 'checked' : 'unchecked' }
                                        onPress={() => setPreferenzaSesso('bisessuale')}
                                    />
                                    <Text style={styles.campiDaCompilare}>BISESSUALE</Text>
                                    </View>
                            </View>
                        }

                        {/*PAGINA 6 --> FOTO */}
                        {item.id=='6' && <PhotoManager setErrore={displayError} setUriUtente={setUriImg}/>}

                        {/*PAGINA 7 --> CREAZIONE PROFILO */}
                        {item.id=='7' && 
                                    <TouchableOpacity onPress={creaNuovoUser}>
                                        <Text style={[styles.campiDaCompilare,{color:MosCeleste, backgroundColor:"white",fontFamily:"Raleway_400Regular", padding:10, marginTop:20, borderRadius:20}]}> CREA PROFILO</Text>
                                    </TouchableOpacity> 
                        }

                     <Text style={[styles.info,{paddingTop:20, textAlign:"center"}]}>{item.info}</Text>
                </View>
               

            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        height: altezzaSchermoInterno*0.8,
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal:10,
        backgroundColor:MosCeleste
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
        paddingHorizontal: 64
    },
    titolo:{
        fontSize:fontSizeTitolo*0.6,
        fontFamily: "Raleway_400Regular",
        color: "white",
        textAlign:"center",
        alignSelf:"center",
        paddingVertical:10
    },
    testo:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
        alignSelf:"center"
    },
    sottoTesto:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
        alignSelf:"center",
        textAlign:"center"
    },
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
    },
    info: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
    },
    errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red"
    },
    contenitoreImgProfilo:{
        
    },
})