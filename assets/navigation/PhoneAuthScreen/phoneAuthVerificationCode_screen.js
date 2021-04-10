import React, {useState, useEffect, useContext} from "react";
import {View,StyleSheet, Text,TouchableOpacity} from "react-native";
import {Button, Snackbar, ActivityIndicator, TextInput} from "react-native-paper";
import { MosCeleste, MosPurple } from "../../resources/colors";
import { Ionicons } from '@expo/vector-icons'; 
import {useFonts , Raleway_400Regular} from '@expo-google-fonts/raleway';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";

export default function PhoneAuthVerificationCodeScreen({route,navigation}){

    const {verificationIdentity} = route.params;
    //contesto autenticazione
    const {controllaCodiceDiVerificaTelefono} = useContext(AutenticazioneUtente);

    //gestisce lo snackbar per mostrare che il messaggio di verifica è stato inviato
    const [messaggioVerifica, setMessaggioVerifica] = useState(null);
    const onDismissSnackBar = () => setMessaggioVerifica(null);
    //codice di verifica inserito di volta in volta che si digita
    const [verificationCode, setVerificationCode] = useState();

    console.log("verificationId:"+verificationIdentity);
    //quando il componente viene montato si inizializza il messaggio con il numero di telefono passato
    useEffect(() => {
        setMessaggioVerifica("Un messaggio col codice di verifica è stato inviato al numero "+route.params.phoneNumber)
      }, [route]);
    

      const controllaCodiceVerifica = async () => {
        console.log("controlla codice");
        try {
            controllaCodiceDiVerificaTelefono(verificationIdentity, verificationCode)
                .then((user)=>{
                    console.log("autenticato con successo");
                    setMessaggioVerifica("autenticato con successo!");
                    console.log(user);
                }).catch((e)=>{
                    const codiceErrore = e.code;
                    //errori specifici
                    if(codiceErrore=="auth/invalid-verification-code")
                        setMessaggioVerifica("Codice errato.");
                    else if(codiceErrore=="auth/code-expired")
                        setMessaggioVerifica("Codice non più valido.")
                    else
                        setMessaggioVerifica("Si è verificato un problema. Riprova più tardi.");
                    
                    console.log("errore col codice:"+e.code);

                })
          } catch (err) {
                var codiceErrore = err.code;
                var messaggioDiErrore;
                //errori generali
                if(codiceErrore=="auth/argument-error" || codiceErrore=="auth/missing-verification-code")
                    messaggioDiErrore ="Inserire un codice valido.";
                else if(codiceErrore=="auth/network-request-failed")
                    messaggioDiErrore ="Problemi di rete. Riprovare più tardi.";
                else if(codiceErrore=="auth/too-many-requests")
                    messaggioDiErrore ="Hai effettuato troppe richieste. Riprovare più tardi.";
                else
                    messaggioDiErrore ="Si è verificato un problema. Riprovare più tardi.";
                
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
                            <Ionicons name="chevron-back" size={24} color={MosCeleste} />
                    </TouchableOpacity>
                </View>

                {/* TITOLO */}
                <View>
                    <Text style={styles.titolo}>Inserisci il codice di verifica ricevuto via SMS</Text>
                </View>

                {/* AREA DOVE INSERIRE IL CODICE DI VERIFICA RICEVUTO */}
                <TextInput
                    style={{ marginVertical: 10, fontSize: 30, width:250, marginLeft:20, backgroundColor:"transparent"}}
                    placeholder="123456"
                    autoFocus
                    paddingBottom={10}
                    underlineColorAndroid={MosPurple}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    onChangeText={setVerificationCode}
                />

{               /*BOTTONE PER INVIARE IL MESSAGGIO A TALE NUMERO */}
                <Button icon="check" color={MosPurple} style={styles.bottoneVerifica} mode="contained" 
                    onPress={() => { controllaCodiceVerifica() }}>

                    VERIFICA
                </Button>  

                {/*COMPARE PER DIRE CHE IL CODICE DEL MESSAGGIO E' STATO INVIATO AL NUMERO SPECIFICATO PRIMA */}
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
    paddingTop:24,
    paddingBottom: 24,
    marginHorizontal:16,
    alignItems:"center"
},
titolo:{
    fontFamily: "Raleway_400Regular",
    color: MosPurple,
    fontSize:36,
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
    width:250
}
})