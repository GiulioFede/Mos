import React, {useContext, useRef, useState} from "react";
import {View,Text, StyleSheet, TouchableOpacity, ActivityIndicator,ScrollView, TextInput, Dimensions} from "react-native";
import {Button, Snackbar} from "react-native-paper";
import { Ionicons,MaterialCommunityIcons } from '@expo/vector-icons'; 
import { MosCeleste, MosPurple } from "../../resources/colors";
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha'; //INSTALLA expo install expo-firebase-recaptcha  e   expo install react-native-webview
import * as firebase from 'firebase';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import {KeyboardAvoidingView} from "react-native";
import { fontSizeTitolo, iconSize, larghezzaDevice } from "../../context/variabili_globali/variabiliGlobali";
import CountryCodePicker from "./components/countryCodePicker";
import i18n from 'i18n-js'

export default function PhoneAuthScreen({navigation,route}){


    console.log("PhoneAuthScreen");
    console.log(route);

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
    const callingCode = useRef(39);
    const inviaCodiceVerificaNumero = async () => {
        
        if(phoneNumber.length==0){
            setMessaggioVerifica(i18n.t('inserValidPhoneNumber'));
            return;
        }
        if(callingCode.current == null){
            setMessaggioVerifica(i18n.t('insertPrefix'));
            return;
        }

        let phoneNumberWithPrefix = "+"+callingCode.current+phoneNumber;
        console.log(phoneNumberWithPrefix);

        //se sto richiedendo l'aggiornamento del numero allora controllo che non sia uguale a quello vecchio
        if(route.params.updatePhoneNumber=="yes" && phoneNumberWithPrefix==route.params.oldNumber){
            setMessaggioVerifica(i18n.t('phoneAlreadyActive'));
            return;
        }

        try {
                
              //attendo che il messaggio sia inviato. 
              inviaCodiceDiVerifica(phoneNumberWithPrefix, recaptchaVerifier.current)
                .then((verificationID)=>{
                    console.log("il messaggio è stato inviato al tuo numero. VerificatioId="+verificationID);
                    //apro screen per verificare il numero
                    navigation.navigate("PhoneAuthVerificationCodeScreen", {verificationIdentity:verificationID, phoneNumber: phoneNumberWithPrefix, updatePhoneNumber: route.params.updatePhoneNumber});
                    setPhoneNumber("");
                }).catch((e)=>{
                    const codiceErrore = e.code;
                    //errori specifici
                    if(codiceErrore=="ERR_FIREBASE_RECAPTCHA_CANCEL"){
                        return;
                    }
                    else if(codiceErrore=="auth/captcha-check-failed")
                        setMessaggioVerifica(i18n.t('invalidCaptcha'));
                    else if(codiceErrore=="auth/invalid-phone-number" || codiceErrore=="auth/missing-phone-number")
                        setMessaggioVerifica(i18n.t('inserValidPhoneNumber'));
                    else if(codiceErrore=="auth/too-many-requests")
                        setMessaggioVerifica(i18n.t('err_youHaveMadeTooManyRequests'));
                    else
                        setMessaggioVerifica(i18n.t('err_generic'));
                    
                    console.log("il messaggio non è stato inviato al tuo numero:"+e.code);
                })

            } catch (err) {
                var codiceErrore = err.code;
                var messaggioDiErrore;
                //errori generali
                if(codiceErrore=="auth/argument-error")
                    messaggioDiErrore = i18n.t('inserValidPhoneNumber');
                else if(codiceErrore=="auth/network-request-failed")
                    messaggioDiErrore = i18n.t('err_networkProblem');
                else if(codiceErrore=="auth/too-many-requests")
                    messaggioDiErrore = i18n.t('err_youHaveMadeTooManyRequests')
                else
                    messaggioDiErrore = i18n.t('err_generic')
                
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
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
                onPress: () => {
                    onDismissSnackBar();
                    },
                }}>
                    {messaggioVerifica}
            </Snackbar>

            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center'}} behavior="height" enabled   keyboardVerticalOffset={fontSizeTitolo*1.2}>
                <ScrollView>
                            {/* TITOLO */}
                            <View>
                                    {/* se la procedura è di login/registrazione.... */}
                                    {route.params.updatePhoneNumber!="yes" && <Text style={styles.titolo}>{i18n.t('phoneScreenTitle')}</Text> }
                                    {/* se la procedura è di aggiornamento numero di telefono... */}
                                    {route.params.updatePhoneNumber=="yes" && <Text style={styles.titolo}>{i18n.t('phoneScreenTitle2')}</Text> }
                            </View>

                            {/* CAPTCHA PER VERIFICARE CHE NON SI E' ROBOT */}
                            <FirebaseRecaptchaVerifierModal
                                    ref={recaptchaVerifier}
                                    title=''
                                    firebaseConfig={firebaseConfig}
                                    attemptInvisibleVerification={attemptInvisibleVerification}
                            />
                            <View style={{flexDirection:"row", alignItems:"center", marginVertical:20}}>

                                <CountryCodePicker callingCode={callingCode} />

                                {/*AREA DOVE INSERIRE IL NUMERO DI TELEFONO */}
                                <TextInput
                                style={{fontSize: fontSizeTitolo*0.5, width:"50%", marginLeft:20, backgroundColor:"transparent"}}
                                placeholder="999 999 9999"
                                numberOfLines={1}
                                autoCompleteType="tel"
                                keyboardType="phone-pad"
                                textContentType="telephoneNumber"
                                onChangeText={phoneNumber => setPhoneNumber(phoneNumber.trim())}
                                />
                            </View>

                            {/*BOTTONE PER INVIARE IL MESSAGGIO A TALE NUMERO */}
                               
                                <TouchableOpacity onPress={() => { inviaCodiceVerificaNumero() }}>
                                    <View style={styles.bottoneInviaCodiceVerifica}>
                                        <MaterialCommunityIcons name="cellphone-message" size={fontSizeTitolo*0.6} color="white" style={{marginHorizontal:10}} />
                                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{color:"white", width:larghezzaDevice*0.6, fontSize:fontSizeTitolo*0.45}}>
                                            {i18n.t('sendVerificationCode')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            

                            
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
        width:"80%",
        flexDirection:"row",
        overflow:"hidden",
        alignItems:"center"
    }
})