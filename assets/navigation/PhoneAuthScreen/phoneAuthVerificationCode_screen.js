import React, {useState, useEffect, useContext} from "react";
import {View,StyleSheet, Text,TouchableOpacity, ScrollView, KeyboardAvoidingView} from "react-native";
import {Button, Snackbar, ActivityIndicator, TextInput} from "react-native-paper";
import { MosCeleste, MosPurple } from "../../resources/colors";
import { Ionicons } from '@expo/vector-icons'; 
import {useFonts , Raleway_400Regular} from '@expo-google-fonts/raleway';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import { fontSizeTitolo, iconSize } from "../../context/variabili_globali/variabiliGlobali";
import {DrawerActions} from '@react-navigation/native';
import i18n from 'i18n-js'

export default function PhoneAuthVerificationCodeScreen({route,navigation}){

    console.log("PhoneAuthVerificationCode");
    console.log(route);

    const {verificationIdentity, updatePhoneNumber} = route.params;
    //contesto autenticazione
    const {controllaCodiceDiVerificaTelefono, isProfiloCompletato, setInformazioniAutenticazioneUtente, setMessaggioAuth,controllaCodiceDiVerificaTelefonoEAggiornaNumero} = useContext(AutenticazioneUtente);

    //gestisce lo snackbar per mostrare che il messaggio di verifica è stato inviato
    const [messaggioVerifica, setMessaggioVerifica] = useState(null);
    const onDismissSnackBar = () => setMessaggioVerifica(null);
    //codice di verifica inserito di volta in volta che si digita
    const [verificationCode, setVerificationCode] = useState();
    //attesa dei controlli (del codice + se ha verificato profilo)
    const [isLoading, setIsLoading] = useState(false);

    console.log("verificationId:"+verificationIdentity);
    //quando il componente viene montato si inizializza il messaggio con il numero di telefono passato
    useEffect(() => {
        if(updatePhoneNumber=="yes")
            setMessaggioVerifica(i18n.t('mexToNumberSend')+route.params.phoneNumber);
        else
            setMessaggioVerifica(i18n.t('mexToNumberSend')+route.params.phoneNumber);
      }, [route]);
    

      const controllaCodiceVerifica = async () => {
        console.log("controlla codice");
        setIsLoading(true);

        try {
            //se la procedura è per aggiornare il numero...
            if(updatePhoneNumber=="yes"){
                controllaCodiceDiVerificaTelefonoEAggiornaNumero(verificationIdentity,verificationCode)
                    .then((ris)=>{
                        setIsLoading(false);
                        console.log("numero aggiornato:"+ris);
                        //aggiorno numero anche nell'oggetto 
                        setInformazioniAutenticazioneUtente([null,route.params.phoneNumber]);
                        setMessaggioAuth(i18n.t('numberUpdated'));
                        const jumpToAction = DrawerActions.jumpTo('Home');
                        navigation.dispatch(jumpToAction);
                        navigation.navigate("Home");
                    })
                    .catch((e)=>{
                        console.log("errore:numero non aggiornato "+e.code+","+e)
                        setIsLoading(false);
                        var code = e.code;
                        var mex = i18n.t('err_generic');
                        if(code=="auth/requires-recent-login"){
                            mex= i18n.t('securityMex');
                            setErroreAuth(mex);
                            navigation.navigate("LoginScreen");
                            return;
                        }
                        else if(code=="auth/too-many-requests")
                            mex = i18n.t('err_youHaveMadeTooManyRequests');
                        else if(code=="auth/network-request-failed")
                            mex = i18n.t('err_networkProblem');
                        else if(code=="auth/invalid-verification-code"){
                            mex = i18n.t('wrongVerificationCode');
                            setMessaggioVerifica(mex);
                            return;
                        }
                        setMessaggioAuth(messaggioDiErrore);
                        const jumpToAction = DrawerActions.jumpTo('Home');
                        navigation.dispatch(jumpToAction);
                        navigation.navigate("Home");
                    });
                return;
            }
        }catch (err) {
                setIsLoading(false);
                var codiceErrore = err.code;
                var messaggioDiErrore;
                //errori generali
                if(codiceErrore=="auth/argument-error" || codiceErrore=="auth/missing-verification-code")
                    messaggioDiErrore = i18n.t('enterValidCode');
                else if(codiceErrore=="auth/network-request-failed")
                    messaggioDiErrore = i18n.t('err_networkProblem');
                else if(codiceErrore=="auth/too-many-requests")
                    messaggioDiErrore = i18n.t('err_youHaveMadeTooManyRequests');
                else
                    messaggioDiErrore = i18n.t('err_generic');
                
                console.log("errore...:"+codiceErrore+"-->"+err);

                setMessaggioAuth(messaggioDiErrore);
                const jumpToAction = DrawerActions.jumpTo('Home');
                navigation.dispatch(jumpToAction);
                navigation.navigate("Home");
      }
        try {
            //se la procedura è per login/registrazione...
                controllaCodiceDiVerificaTelefono(verificationIdentity, verificationCode)
                    .then((credenziali)=>{
                        //l'utente è autenticato
                        console.log("autenticato con successo");
                        var user = credenziali.user;
                        console.log("UID:"+user.uid);
                        //controllo se ha già completato gli step per la creazione del profilo
                        isProfiloCompletato(user.uid)
                        .then((doc)=>{
                            setIsLoading(false);
                            //se è stato completato portalo direttamente alla home
                            if (doc.exists) {
                                navigation.navigate("Home");
                            } else {
                                // se non è stato completato inviarlo allo Slider 
                                navigation.navigate("SliderNuovoUtente", {uid: user.uid});
                            }
                        }).catch((e)=>{
                            setIsLoading(false);
                            console.log("Si è verificato un errore:"+e);
                            setMessaggioVerifica(i18n.t('err_generic'));
                        })
                    
                    }).catch((e)=>{
                        setIsLoading(false);
                        const codiceErrore = e.code;
                        //errori specifici
                        if(codiceErrore=="auth/invalid-verification-code")
                            setMessaggioVerifica(i18n.t('wrongVerificationCode'));
                        else if(codiceErrore=="auth/code-expired")
                            setMessaggioVerifica(i18n.t('expiredCode'));
                        else
                            setMessaggioVerifica(i18n.t('err_generic'));
                        
                        console.log("errore x:"+e.code+":"+e);

                    })
          } catch (err) {
                    setIsLoading(false);
                    var codiceErrore = err.code;
                    var messaggioDiErrore;
                    //errori generali
                    if(codiceErrore=="auth/argument-error" || codiceErrore=="auth/missing-verification-code")
                        messaggioDiErrore =i18n.t('enterValidCode');
                    else if(codiceErrore=="auth/network-request-failed")
                        messaggioDiErrore =i18n.t('err_networkProblem');
                    else if(codiceErrore=="auth/too-many-requests")
                        messaggioDiErrore = i18n.t('err_youHaveMadeTooManyRequests');
                    else
                        messaggioDiErrore =i18n.t('err_generic');
                    
                    console.log("errore...:"+codiceErrore+"-->"+err);

                    setMessaggioVerifica(messaggioDiErrore);
          }
        }


    let [Raleway] = useFonts({Raleway_400Regular});
    if(!Raleway) {
          return (
              <View style={{justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"white"}}>
                  <ActivityIndicator animating={true} color={MosCeleste} />
              </View>
          )
    }else {
        return (
            <View style={styles.container}>

                {/* BARRA SUPERIORE */}
                <View style={styles.barraSuperiore}>
                    <TouchableOpacity onPress={() => navigation.navigate("PhoneAuthScreen")}>
                            <Ionicons name="chevron-back" size={iconSize} color={MosCeleste} />
                    </TouchableOpacity>
                </View>

                {/*COMPARE PER DIRE CHE IL CODICE DEL MESSAGGIO E' STATO INVIATO AL NUMERO SPECIFICATO PRIMA */}
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

                <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',}} behavior="padding" enabled   keyboardVerticalOffset={50}>
                 <ScrollView showsVerticalScrollIndicator={false}>
                {/* TITOLO */}
                <View>
                    <Text style={styles.titolo}>{i18n.t('verificationCodeScreenTitle')}</Text>
                </View>

                {/* AREA DOVE INSERIRE IL CODICE DI VERIFICA RICEVUTO */}
                <TextInput
                    style={{  fontSize: fontSizeTitolo*0.8, width:"80%", marginLeft:20, marginVertical:iconSize*0.8, backgroundColor:"transparent"}}
                    placeholder="123456"
                    autoFocus={false}
                    paddingBottom={10}
                    underlineColorAndroid={MosPurple}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    onChangeText={setVerificationCode}
                />

{               /*BOTTONE PER INVIARE IL MESSAGGIO A TALE NUMERO */}
                <Button icon="check" color={MosPurple} style={styles.bottoneVerifica} mode="contained" 
                    onPress={() => { 
                        if(!isLoading)
                            controllaCodiceVerifica()     
                        }}>

                   {i18n.t('verifyVerificationCode')}
                </Button>
                </ScrollView>
                </KeyboardAvoidingView>

                {/*Loading */}
                {isLoading && <ActivityIndicator animating={true} color={MosPurple} style={{paddingTop:20}} /> }
            </View>
        )
            }
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
bottoneVerifica: {
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