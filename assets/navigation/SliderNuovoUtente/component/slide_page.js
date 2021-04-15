import React, {useState} from "react"
import {View, Text, StyleSheet, useWindowDimensions, Image, Dimensions,TouchableOpacity, Platform, ActivityIndicator} from "react-native";
import { altezzaSchermoInterno, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../context/variabili_globali/variabiliGlobali";
import {TextInput} from "react-native-paper";
import { MosCeleste } from "../../../resources/colors";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./feature/date_picker";
import * as Location from 'expo-location';
//installa expo install @react-native-community/datetimepicker

export default function SlidePage({item,setNomeUtente, setDataUtente, setError}){

    const {width} = useWindowDimensions();
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
                                        console.log(pos)
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

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
        <View style={[styles.container,{width}]}>
            <Image source={item.image} style={[styles.image, {width, resizeMode:'contain'}]} />
            <View style={{flex:0.5,alignItems:"center",justifyContent:"center"}}>
                <View style={{flex:0.4 }}>
                    <Text style={styles.titolo}>{item.title}</Text>
                    <Text style={styles.sottoTesto}>{item.subTitle}</Text>
                </View>
                <View style={{ flex:0.6, justifyContent:"center", alignItems:"center", backgroundColor:"red"}}>

                    {/*PAGINA 1 --> NOME */}
                    {item.id=='1' &&
                        <TextInput
                                label="Nome"
                                value={nome}
                                onSubmitEditing ={()=>setNomeUtente(nome)}
                                onChangeText={text => setNome(text.trim())} //elimino gli eventuali spazi inseriti all'inizio, durante e alla fine
                                style={{width:width*0.6, backgroundColor:"transparent",color:"white"}} //backgroundColor indica lo sfondo dell'area di input
                                theme={{ colors: { text: "white", primary:"white" } }} //text indica il colore del valore dentro   primary il colore del titolo (solo quando è a focus)
                                underlineColor={"white"} //colore della linea di sotto 
                                selectionColor={"white"} //colore della barra che indica il prossimo carattere da inserire 
                                maxLength={30}
                                mode="flat"       
                        /> }

                        {/*PAGINA 2 --> DATA DI NASCITA */}
                        {item.id=='2' && <DatePicker setData={setDataUtente} /> }

                        {/*PAGINA 3 --> POSIZIONE */}
                        {item.id=='3' && 
                                <View>
                                    {/*se stiamo acquisendo la locazione... */}
                                    { isLocationLoading && <ActivityIndicator animating={true} color={"white"} />}

                                    {/*se la locazione non è settata... */}
                                    { !isLocationSet && 
                                        <View>
                                            {!isLocationLoading &&
                                                <TouchableOpacity onPress={ottieniPosizioneUtente}>
                                                    <Text style={{fontSize:fontSizeCampi, color:"white"}}> OTTIENI POSIZIONE</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    }
                                    {/*se la locazione è settata... */}

                                </View>    
                        }



                     <Text style={[styles.campiDaCompilare,{paddingTop:20, textAlign:"center"}]}>{item.info}</Text>
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
        paddingHorizontal:10
    },
    image: {
        flex:0.4,
        justifyContent:"center",
        borderRadius: Dimensions.get("window").width,
        overflow: "hidden"    
    },
    description:{
        fontWeight: '300',
        color: '#62656b',
        textAlign: 'center',
        paddingHorizontal: 64
    },
    titolo:{
        fontSize:fontSizeTitolo*0.7,
        fontFamily: "Raleway_400Regular",
        color: "white",
        textAlign:"center",
        alignSelf:"center",
        paddingVertical:10
    },
    testo:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        alignSelf:"center"
    },
    sottoTesto:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
        alignSelf:"center"
    },
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "white",
    },
    errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red"
    },
})