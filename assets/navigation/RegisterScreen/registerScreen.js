import React, {useState, useEffect,useContext} from "react";
import {View, Text, ActivityIndicator,StyleSheet,ScrollView,TouchableOpacity, KeyboardAvoidingView, Dimensions, Image, BackHandler} from "react-native";
import {Snackbar, FAB, TextInput} from "react-native-paper";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { MosCeleste, MosViola } from "../../resources/colors";
import { Ionicons } from '@expo/vector-icons';
import { ColoreBarraDiStato, fontSizeTitoloPiccolo,fontSizeSottoTitolo, iconSize, fontSizeCampi, larghezzaDevice, altezzaSchermoInterno } from "../../context/variabili_globali/variabiliGlobali";
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import {LinearGradient} from "expo-linear-gradient";
import LottieView from 'lottie-react-native';

export default function RegisterScreen({navigation}){

    //per cambiare il colore della barra di stato (setColore)
    var coloreBarra = useContext(ColoreBarraDiStato);

    //contesto autenticazione
    var {registraNuovoUtente, inviaEmailDiVerifica,setIsUserProfileCompleted} = useContext(AutenticazioneUtente);


    //email
    const [email, setEmail] = useState('');
    //password
    const [password, setPassword] = useState('');
    //errore
    const [errore, setErrore] = useState("");
    //se è true significa che si sta aspettando una risposta dal server
    const [isLoading, setIsLoading] = useState(false);
    //gestiscono i messaggi snackbar
    const [snackmessage, setSnackBarMessage] = useState(null);
    const onDismissSnackBar = () => setSnackBarMessage(null);


    //REGISTRA NUOVO UTENTE
    function registraUtente(){
        console.log("registra nuovo utente");
        if(email.length==0 && password.length==0){
            setErrore("*Inserisci email e password.")
            return;
        }
        else if(email.length==0){
            setErrore("*Inserisci una email.");
            return;
        }
        else if(password.length==0){
            setErrore("*Inserisci una password.");
            return;
        }

        setIsLoading(true);
        setErrore("");
        try{

        registraNuovoUtente(email,password)
            .then((userCredential) => {
                // Signed in 
                console.log("utente registrato");
                var user = userCredential.user;
                // invia email di verifica
                try{
                inviaEmailDiVerifica(user)
                    .then(function() {
                        setIsLoading(false);
                        // Verification email sent.
                        console.log("email di verifica inviata");
                        setSnackBarMessage("Abbiamo inviato un email di verifica. Autorizza il tuo account prima di procedere al login.");

                    })
                    .catch(function(error) {
                        setIsLoading(false);
                        // Error occurred. Inspect error.code.
                        console.log("errore: email di verifica non inviata");
                    });
                }catch(e){
                    setIsLoading(false);
                    console.log("errore: email di verifica non inviata");
                }
            })
            .catch((error) => {
                console.log("registrazione fallita");
                setIsLoading(false);
                var errorCode = error.code;
                var messaggioDiErrore = "Si è verificato un problema. Riprova più tardi.";

                //errori specifici
                if(errorCode=="auth/email-already-in-use")
                    messaggioDiErrore = "*L'indirizzo email è già in uso.";
                else if(errorCode=="auth/invalid-email")
                    messaggioDiErrore = "*L'indirizzo email non è valido."; 
                else if(errorCode=="auth/weak-password")
                    messaggioDiErrore = "*Inserire una password meno vulnerabile.";

                //errori generali
                else if(codiceErrore=="auth/argument-error")
                    messaggioDiErrore ="*L'indirizzo email non è valido.";
                else if(codiceErrore=="auth/network-request-failed")
                    messaggioDiErrore ="*Problemi di rete. Riprovare più tardi.";
                else if(codiceErrore=="auth/too-many-requests")
                    messaggioDiErrore ="*Hai effettuato troppe richieste. Riprova più tardi.";
                else
                    messaggioDiErrore ="*Si è verificato un problema. Riprova più tardi.";

                setErrore(messaggioDiErrore);
            });
        }catch(e){
            setIsLoading(false);
            messaggioDiErrore ="*Si è verificato un problema. Riprova più tardi.";
            setErrore(messaggioDiErrore); 
        }
    }

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return (
                <View style={{justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"white"}}>
                    <ActivityIndicator animating={true} color={MosCeleste} />
                </View>
            )
    

    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                    <TouchableOpacity onPress={() => {coloreBarra.setColore("#fff"); navigation.navigate("LoginScreen")}}>
                            <Ionicons name="chevron-back" size={iconSize} color={MosCeleste} style={{paddingLeft:24}} />
                    </TouchableOpacity>
            </View>

            {/*QUANDO SI STA ASPETTANDO LA RISPOSTA DEL SERVER isLoading=true (permette anche di non premere altri bottoni)*/}
            {isLoading &&  <View  style={{position:"absolute", zIndex:15, justifyContent:"center",alignItems:"center",width:Dimensions.get("window").width, height:Dimensions.get("window").height}}><ActivityIndicator animating={true} color={MosCeleste}/></View> }
            {isLoading  && <View style={{backgroundColor:"rgba(255, 255, 255,0.8)", position:"absolute", width:Dimensions.get("window").width, height:Dimensions.get("window").height, zIndex:10}}/>} 
  
             <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',}} behavior="padding" enabled   keyboardVerticalOffset={50}>
                 <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={{alignItems:"center", justifyContent:"center"}}> 

                            {/* IMMAGINE */}
                            <View style={styles.contenitoreImmagineSfondo}>
                                {/* immagine */}
                                <View style={styles.contenitoreImmagine}>
                                    <Image source={require("../../resources/images/logoMosaic.png")} style={{width:larghezzaDevice*0.4, height:larghezzaDevice*0.4}} ></Image>
                                </View>
                                <LottieView autoPlay loop={true} source={require('../../resources/lottie/upgradeAnimation.json')} resizeMode="cover" />
                            </View>

                            <View style={{width:Dimensions.get("window").width,flexGrow:1, backgroundColor:"#fff"}}>
                                <View style={{alignItems:"center", justifyContent:"center", paddingBottom:10}}>
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.titolo}>Benvenuto su Mosaic</Text>
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.testo}>Prima la mente, poi il corpo</Text>
                                </View>

                                {/*EMAIL*/}
                                <View style={{alignItems:"center", justifyContent:"center"}}>
                                    <TextInput
                                    label="Email"
                                    value={email}
                                    placeholder="email"
                                    onChangeText={text => setEmail(text.trim())}
                                    maxLength={30}
                                    style={{width:Dimensions.get("window").width*0.8, backgroundColor:"transparent",fontSize:fontSizeCampi}}
                                    theme={{ colors: { text: MosCeleste, primary:MosCeleste } }}
                                    selectionColor={MosCeleste} 
                                    underlineColor={MosCeleste}                  
                                    mode="flat"
                                    /> 
                                {/*PASSWORD*/}
                                <TextInput
                                    label="Password"
                                    value={password}
                                    placeholder="password"
                                    secureTextEntry={true} //per la password-->non fa vedere cosa scriviamo
                                    onChangeText={text => setPassword(text.trim())} //elimino gli eventuali spazi inseriti all'inizio, durante e alla fine
                                    style={{width:Dimensions.get("window").width*0.8, backgroundColor:"transparent",fontSize:fontSizeCampi,color:"white"}} //backgroundColor indica lo sfondo dell'area di input
                                    theme={{ colors: { text: MosCeleste, primary:MosCeleste } }} //text indica il colore del valore dentro   primary il colore del titolo (solo quando è a focus)
                                    underlineColor={MosCeleste} //colore della linea di sotto 
                                    selectionColor={MosCeleste} //colore della barra che indica il prossimo carattere da inserire 
                                    maxLength={30}
                                    mode="flat"
                                    />
                            
                                {/*ERRORE*/}
                                <View style={{alignItems:"flex-start", paddingVertical:10, justifyContent:"flex-start", width:"80%"}}>
                                    <Text style={[styles.errore,{color:"red"}]}>{errore}</Text>
                                </View>

                            {/*BOTTONE REGISTRATI CON EMAIL/PASSWORD*/}
                                <FAB
                                    style={{backgroundColor:"white", width:Dimensions.get("window").width*0.7, marginBottom:30}}
                                    small
                                    color={MosCeleste}
                                    icon="email-lock"
                                    onPress={() => {
                                        registraUtente();
                                    }}
                                    label="REGISTRATI"
                                /> 
                                </View>                             
                            </View>

                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                    {/*COMPARE SOLO PER DARE UNA RISPOSTA SE L'EMAIL E' STATA INVIATA O MENO */}
            <Snackbar
                                    visible={snackmessage ? true : false}
                                    onDismiss={onDismissSnackBar}
                                    duration = {5000}
                                    theme={{ colors: { surface: "white",accent: "white"},}}
                                    action={{
                                        onPress: () => {
                                            onDismissSnackBar();
                                        },
                                    }}>
                                    {snackmessage}
             </Snackbar>
            </View>

        )
}

const styles = StyleSheet.create({
    container: {
      height: altezzaSchermoInterno,
      backgroundColor:"#fff"
    },
    barraSuperiore:{
        flexDirection:"row",
        width:Dimensions.get("window").width,
        justifyContent:"space-between",
        paddingTop:iconSize,
        paddingBottom:iconSize,
        alignItems:"center",
        backgroundColor:"white"
    },
    titolo:{
        fontSize:fontSizeTitoloPiccolo,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
    },
    testo:{
        fontSize:fontSizeSottoTitolo*0.8,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
    },
    registrati:{
        fontSize:20,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
   errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red"
    },
      immagine: {
        flex:1,

        width: Dimensions.get("window").width,
    },
    contenitoreImmagineSfondo:{
        backgroundColor:"#fff",
        alignSelf:"center",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height*0.3
    },
    contenitoreImmagine: {
        width: larghezzaDevice*0.5,
        height: larghezzaDevice*0.5,
        backgroundColor:"#fff",
        alignSelf:"center",
        alignContent:"center",
        justifyContent:"center",
        alignItems:"center"
    },
  });
  