import React, {useState, useRef, useContext, formardRef} from "react";
import {View,Button, Text, StyleSheet,Dimensions, FlatList, ScrollView,Image,Platform, TouchableOpacity,KeyboardAvoidingView} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { MosCeleste, MosPurple, MosViola } from "../../resources/colors";
import { FAB,TextInput, ActivityIndicator, Snackbar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons'; 
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import * as firebase from 'firebase';





const indici = [{id:"1"},{id:"2"}];

export default function LoginScreen({navigation}){

    //EMAIL E PASSWORD::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //contesto autenticazione
    const {accediConEmailPassword, inviaEmailRecuperoPassword} = useContext(AutenticazioneUtente);
    //label button email e password
    const [labelEmailPasswordButton, setLabelEmailPasswordButton] = useState("ACCEDI CON EMAIL/PASSWORD");
    //email
    const [email, setEmail] = useState('');
    //password
    const [password, setPassword] = useState('');
    //errore
    const [errore, setErrore] = useState("");
    //se è true significa che si sta aspettando una risposta dal server
    const [isLoading, setIsLoading] = useState(false);
    //indica se il bottone è stato cliccato o meno
    let isEmailEPasswordClicked = useRef(false);
    //gestiscono il bottone a comparsa quando si richiede di recuperare la password
    const [visible1, setSnackBarVisibility1] = useState(false);
    const [snackmessage, setSnackBarMessage] = useState(null);
    const onDismissSnackBar1 = () => setSnackBarVisibility1(false);
    const onDismissSnackBar2 = () => setSnackBarMessage(null);
    //tiene il conto del numero dei tentativi errati quando si accede con email e password
    let numeroDiTentativiEmailPassword = useRef(0);

    //TELEFONO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    const recaptchaVerifier = React.useRef(null);
    const [phoneNumber, setPhoneNumber] = React.useState();
    const [verificationId, setVerificationId] = React.useState();
    const [verificationCode, setVerificationCode] = React.useState();
    const firebaseConfig = firebase.apps.length ? firebase.app().options : undefined;
    const [message, showMessage] = React.useState(
        !firebaseConfig || Platform.OS === 'web'
        ? {
            text:
                'To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device.',
            }
        : undefined
    );
    const attemptInvisibleVerification = false;
    const [mostraSchermataTelefono, setMostraSchermataTelefono] = useState(false);



    const refFlatList = useRef();

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    //AREA PER I BOTTONI GOOGLE E TELEFONO
    function ViewBonniGoogleETelefono(){
        return (
            <View style={{width:Dimensions.get("window").width,alignItems:"center", justifyContent:"flex-end", marginBottom:20}}>
                <FAB
                style={{backgroundColor:MosCeleste,marginBottom:20, width:"90%"}}
                small
                icon="google"
                onPress={() => console.log('Pressed')}
                label="ACCEDI CON GOOGLE"
            />

            <FAB
                style={{backgroundColor:MosPurple, width:"90%"}}
                small
                icon="cellphone-iphone"
                onPress={() => navigation.navigate("PhoneAuthScreen")}
                label="ACCEDI COL TUO NUMERO DI TELEFONO"
            /> 
            </View>
        )
    }

    //AREA PER I CAMPI EMAIL E PASSWORD DA COMPILARE
    function ViewEmailEPassword(){
        return (
            <View style={{width:Dimensions.get("window").width, alignItems:"center", justifyContent:"center", marginBottom:20}}>

                <TouchableOpacity style={{position:"absolute", left:20,top:0}} onPress={nascondiCampiEmailEPassword}>
                    <AntDesign name="arrowleft" size={24} color={MosViola}  />
                </TouchableOpacity>

                 {/*EMAIL*/}
                <View>
                    <TextInput
                    label="Email"
                    value={email}
                    onChangeText={text => setEmail(text.trim())}
                    maxLength={30}
                    style={{width:250, backgroundColor:"white",fontSize:15}}
                    selectionColor={MosCeleste}
                    
                    
                    mode="flat"
                    />
                {/*PASSWORD*/}
                <TextInput
                    label="Password"
                    value={password}
                    secureTextEntry={true}
                    onChangeText={text => setPassword(text.trim())}
                    style={{width:250, backgroundColor:"white",fontSize:15}}
                    selectionColor={MosCeleste} 
                    maxLength={30}
                    mode="flat"
                    />

                {/*ERRORE*/}
                <View style={{ paddingTop:10, width:250}}>
                    <Text style={{color:"red"}}>{errore}</Text>
                </View>
            </View> 
            </View>
        )
    }

    //_______________________________________________METODI PER ACCEDERE CON EMAIL E PASSWORD _________________________________________________

    function mostraCampiEmailEPassword(){
        isEmailEPasswordClicked.current= true;
        refFlatList.current.scrollToIndex({animated:true, index:1});
        setLabelEmailPasswordButton("ACCEDI");
    }

    function nascondiCampiEmailEPassword(){
        isEmailEPasswordClicked.current=false;
        refFlatList.current.scrollToIndex({animated:true, index:0});
        setLabelEmailPasswordButton("ACCEDI CON EMAIL/PASSWORD");
    }

    //ACCEDI CON EMAIL E PASSWORD
    function accediConEmail(){
        console.log("accedi");
        if(email.length==0 || password.length==0)
            setErrore("*inserire email e password.");
        else {
            setIsLoading(true);
            if(errore.length>0) setErrore("");
            console.log("accedi a firebase...");
            try{
                accediConEmailPassword(email,password)
                .then((userCredential) => {
                    // Signed in
                    setIsLoading(false);
                    console.log("autenticato:"+userCredential.user);
                    var user = userCredential.user;
                    // dovrei scrivere setUser(user) ma lo faccio fare all'ascoltatore 
                })
                .catch((error) => {
                    setIsLoading(false);
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    //gestione errori a seconda del codice
                    if(errorCode==="auth/invalid-email")
                        errorMessage="*l'indirizzo email non è formattato correttamente.";
                    else if(errorCode==="auth/user-not-found")
                        errorMessage="*non esiste alcun utente con questo indirizzo email.";
                    else if(errorCode==="auth/wrong-password"){
                        errorMessage="*la password inserita è errata."
                        //incremento il numero dei tentativi
                        numeroDiTentativiEmailPassword.current+=1;
                    }
                    else if(errorCode==="auth/user-disabled")
                        errorMessage="*l'utente è stato attualmente disabilitato.";
                    else if(errorCode==="auth/too-many-requests")
                        errorMessage="*hai effettuato troppe richieste. Riprova più tardi.";
                    else if(errorCode==="auth/network-request-failed")
                        errorMessage="*problema di rete. Non è possibile registrarsi.";
                    else
                        errorMessage="*errore imprevisto. Riprovare piu tardi.";
                    
                    setErrore(errorMessage);
                    
                    //se il numero di tentativi supera 3 richiedi email per il recupero della password
                    console.log("numero tentativi effettuati:"+numeroDiTentativiEmailPassword.current);
                    if(numeroDiTentativiEmailPassword.current>=3)
                        setSnackBarVisibility1(true);
            
            })
        }catch(e){
            setErrore("*errore imprevisto. Riprovare piu tardi.");
        } 
      }
    }

    function inviaEmailRecuperoPsw(){
        setIsLoading(true);
        try{
        inviaEmailRecuperoPassword("giuliof3derico@gmail.com")
            .then(function() {
                // Email sent.
                setIsLoading(false);
                setSnackBarMessage("Abbiamo inviato un email all'indirizzo "+email+" per il recupero della password.");
                console.log("email inviata");
                
            }).catch(function(error) {
                var messaggioDiErrore = "Nessun utente registrato con questa email.";
                var codice = error.code;
                if(codice=="auth/invalid-email")
                    messaggioDiErrore = "Email non valida."
                else if(codice=="auth/user-not-found")
                    messaggioDiErrore = "Nessun utente registrato con questa email.";
                
                setIsLoading(false);
                setSnackBarMessage(messaggioDiErrore);
            });
        }catch(e){
            setIsLoading(false);
            setSnackBarMessage("Errore imprevisto. Riprovare più tardi.");
        }
            
    }
    //--------------------------------------------------
    
    console.log("Rendering LoginScreen.js");
    console.log("snackmessage "+snackmessage);

    if(mostraSchermataTelefono)
        return (
            <View>
                {accediConNumeroDiTelefono()}
            </View>
        )
    else
        return (

            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior= {(Platform.OS === 'ios')? "padding" : null}
                >
                    <View style={{alignItems:"center", justifyContent:"center"}}>

                        {/*QUANDO SI STA ASPETTANDO LA RISPOSTA DEL SERVER isLoading=true (permette anche di non premere altri bottoni)*/}
                        {isLoading &&  <ActivityIndicator animating={true} color={MosCeleste} style={{position:"absolute", zIndex:11}} /> }
                        {isLoading  && <View style={{backgroundColor:"rgba(255,255,255,0.8)", position:"absolute", width:Dimensions.get("window").width, height:Dimensions.get("window").height, zIndex:10}}/>}


                        <ScrollView alignItems="center" justifyContent="center">
                            {/* eliminare il marginLeft, qui l'ho messo solo perchè il logo è storto */}
                            <Image source={require('../../../assets/icon/logoMos.jpg')} style={{width:200, marginLeft:18,height:200, alignSelf:"center"}}/> 
                            <View style={{alignItems:"center", justifyContent:"center"}}>
                                <Text style={styles.titolo}>Accedi a Mosaic</Text>
                                <Text style={styles.testo}>il social network alternativo</Text>
                            </View>

                            {/*MOSTRO I BOTTONI GOOGLE,TELEFONO e nella seconda parte I CAMPI EMAIL E PASSWORD DA COMPILARE*/}
                            <FlatList
                                data={indici}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={{flex:1, paddingTop:50}}
                                scrollEnabled={false}
                                removeClippedSubviews={false}
                                ref={refFlatList}
                                keyExtractor={item => item.id}
                                renderItem={({item,index})=>
                                    index==0?ViewBonniGoogleETelefono():ViewEmailEPassword()}
                            />

                            {/*BOTTONE ACCEDI CON EMAIL/PASSWORD*/}
                            <FAB
                                style={{backgroundColor:MosViola, marginBottom:20, left:20, width:Dimensions.get("window").width-40}}
                                small
                                icon="email-lock"
                                onPress={() => {
                                    if(!isEmailEPasswordClicked.current)
                                        mostraCampiEmailEPassword();
                                    else
                                        accediConEmail();
                                }}
                                label={labelEmailPasswordButton}
                            />   

                            {/*REGISTRATI*/}  
                            <View style={{flexGrow:1, alignItems:"center"}}>
                                <Text style={styles.registrati}>Registrati con email e password</Text>
                            </View>

                            {/*COMPARE SOLO QUANDO IL TENTATIVO DI LOGIN CON EMAIL E PASSWORD HA SUPERATO LE 3 VOLTE */}
                            <Snackbar
                                visible={visible1}
                                onDismiss={onDismissSnackBar1}
                                theme={{ colors: {surface:"white", accent: "white"},}}
                                action={{
                                    label: 'INVIA',
                                    onPress: () => {
                                        inviaEmailRecuperoPsw()
                                    },
                                }}>
                                Hai problemi ad accedere? Invia un email di recupero password.
                            </Snackbar>

                            {/*COMPARE SOLO PER DARE UNA RISPOSTA SE L'EMAIL E' STATA INVIATA O MENO */}
                            <Snackbar
                                visible={snackmessage ? true : false}
                                onDismiss={onDismissSnackBar2}
                                duration = {5000}
                                theme={{ colors: { surface: "white",accent: "white"},}}
                                action={{
                                    label: 'UNDO',
                                    onPress: () => {
                                        onDismissSnackBar2();
                                    },
                                }}>
                                {snackmessage}
                            </Snackbar>


                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>

        )
}

const styles = StyleSheet.create({
    container: {
      flex:1,
      height: Dimensions.get("window").height,
      backgroundColor:"#fff",
      justifyContent:"center",
      alignItems:"center"
    },
    titolo:{
        fontSize:35,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
    },
    testo:{
        fontSize:20,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
    },
    registrati:{
        fontSize:20,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
  });
  