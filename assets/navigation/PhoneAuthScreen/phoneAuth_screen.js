import React, {useContext, useState} from "react";
import {View,Text, StyleSheet, TouchableOpacity, ActivityIndicator,ScrollView, TextInput, Dimensions} from "react-native";
import {Button, Snackbar} from "react-native-paper";
import { Ionicons } from '@expo/vector-icons'; 
import { MosCeleste, MosPurple } from "../../resources/colors";
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha'; //INSTALLA expo install expo-firebase-recaptcha  e   expo install react-native-webview
import * as firebase from 'firebase';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import {KeyboardAvoidingView} from "react-native";
import { fontSizeTitolo, iconSize } from "../../context/variabili_globali/variabiliGlobali";

export default function PhoneAuthScreen({navigation}){

    //contesto autenticazione
    const {inviaCodiceDiVerifica} = useContext(AutenticazioneUtente);

    //gestisce lo snackbar per mostrare se il messaggio di verifica è stato inviato o meno
    const [messaggioVerifica, setMessaggioVerifica] = useState(null);
    const onDismissSnackBar = () => setMessaggioVerifica(null);

        //TELEFONO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    const recaptchaVerifier = React.useRef(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const firebaseConfig = firebase.apps.length ? firebase.app().options : undefined;
    const attemptInvisibleVerification = false;

        //invia il codice di verifica
    const inviaCodiceVerificaNumero = async () => {
        console.log("invio codice di verifica");
        
        if(phoneNumber.length==0){
            setMessaggioVerifica("Inserire un numero di telefono valido.");
            return;
        }
            try {
                
              //attendo che il messaggio sia inviato. 
              inviaCodiceDiVerifica(phoneNumber, recaptchaVerifier.current)
                .then((verificationID)=>{
                    //setVerificationId(verificationID);
                    console.log("il messaggio è stato inviato al tuo numero. VerificatioId="+verificationID);
                    navigation.navigate("PhoneAuthVerificationCodeScreen", {verificationIdentity:verificationID, phoneNumber: phoneNumber});
                    //setPhoneNumber("");
                }).catch((e)=>{
                    const codiceErrore = e.code;
                    //errori specifici
                    if(codiceErrore=="ERR_FIREBASE_RECAPTCHA_CANCEL"){
                        return;
                    }
                    else if(codiceErrore=="auth/captcha-check-failed")
                        setMessaggioVerifica("Captcha invalido.");
                    else if(codiceErrore=="auth/invalid-phone-number" || codiceErrore=="auth/missing-phone-number")
                        setMessaggioVerifica("Inserire un numero di telefono valido.");
                    else if(codiceErrore=="auth/too-many-requests")
                        setMessaggioVerifica("Hai effettuato troppe richieste. Riprova più tardi");
                    else
                        setMessaggioVerifica("Si è verificato un problema. Riprova più tardi.");
                    
                    console.log("il messaggio non è stato inviato al tuo numero:"+e.code);
                })

            } catch (err) {
                var codiceErrore = err.code;
                var messaggioDiErrore;
                //errori generali
                if(codiceErrore=="auth/argument-error")
                    messaggioDiErrore ="Inserire un numero di telefono valido.";
                else if(codiceErrore=="auth/network-request-failed")
                    messaggioDiErrore ="Problemi di rete. Riprovare più tardi.";
                else if(codiceErrore=="auth/too-many-requests")
                    messaggioDiErrore ="Hai effettuato troppe richieste. Riprovare più tardi.";
                else
                    messaggioDiErrore ="Si è verificato un problema. Riprovare più tardi.";
                
                setMessaggioVerifica(messaggioDiErrore);
                
            }
            
     }

    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway2)
        return (
            <View style={{justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"white"}}>
                <ActivityIndicator animating={true} color={MosCeleste} />
            </View>
        )

    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                        <Ionicons name="chevron-back" size={iconSize} color={MosCeleste} />
                </TouchableOpacity>
            </View>

            {/*COMPARE SOLO PER DARE UNA RISPOSTA SE L'EMAIL E' STATA INVIATA O MENO */}
            <Snackbar
                visible={messaggioVerifica}
                onDismiss={onDismissSnackBar}
                duration = {5000}
                theme={{ colors: { surface: "white",accent: MosPurple},}}
                action={{
                label: 'UNDO',
                onPress: () => {
                    onDismissSnackBar();
                    },
                }}>
                    {messaggioVerifica}
            </Snackbar>

            <KeyboardAvoidingView
                keyboardVerticalOffset={20}
                 behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
            <ScrollView>
                        {/* TITOLO */}
                        <View>
                                <Text style={styles.titolo}>Inserisci il tuo numero di telefono</Text>
                        </View>

                        {/* CAPTCHA PER VERIFICARE CHE NON SI E' ROBOT */}
                        <FirebaseRecaptchaVerifierModal
                                ref={recaptchaVerifier}
                                title='Completa il test per procedere'
                                firebaseConfig={firebaseConfig}
                                attemptInvisibleVerification={attemptInvisibleVerification}
                        />

                        {/*AREA DOVE INSERIRE IL NUMERO DI TELEFONO */}
                        <TextInput
                        style={{ marginVertical: 10, fontSize: fontSizeTitolo*0.8, width:"80%", marginLeft:20, backgroundColor:"transparent"}}
                        placeholder="+1 999 999 9999"
                        autoFocus
                        paddingBottom={10}
                        underlineColorAndroid={MosPurple}
                        autoCompleteType="tel"
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                        onChangeText={phoneNumber => setPhoneNumber(phoneNumber)}
                        />

                        {/*BOTTONE PER INVIARE IL MESSAGGIO A TALE NUMERO */}
                        <Button icon="cellphone-message" color={MosPurple} style={styles.bottoneInviaCodiceVerifica} mode="contained" 
                            onPress={() => { inviaCodiceVerificaNumero() }}>

                            INVIA CODICE DI VERIFICA
                        </Button>  

                        
                    </ScrollView>
                </KeyboardAvoidingView>
        </View>
    )



}

const styles = StyleSheet.create({
    container: {
      flex:1,
      backgroundColor:"#fff"
    },
    barraSuperiore:{
        flexDirection:"row",
        justifyContent:"space-between",
        paddingTop:iconSize,
        paddingBottom: iconSize,
        marginHorizontal:16,
        alignItems:"center"
    },
    titolo:{
        fontFamily: "Raleway_400Regular",
        color: MosPurple,
        fontSize:fontSizeTitolo,
        padding:15
    },
    bottoneInviaCodiceVerifica: {
        marginRight:40,
        marginLeft:20,
        marginTop:10,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:MosPurple,
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff',
        width:"80%"
    }
})