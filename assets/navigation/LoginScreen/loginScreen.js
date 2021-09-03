import React, {useState, useRef, useContext, useEffect} from "react";
import {View,Button, Text, StyleSheet,Dimensions, FlatList, ScrollView,Image,Platform, TouchableOpacity,KeyboardAvoidingView,BackHandler} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { MosCeleste, MosPurple, MosViola } from "../../resources/colors";
import { FAB,TextInput, ActivityIndicator, Snackbar, Surface } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons'; 
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import { altezzaDevice, fontSizeTitolo, larghezzaDevice, fontSizeSottoTitolo, fontSizeCampi } from "../../context/variabili_globali/variabiliGlobali";
import { RFPercentage} from "react-native-responsive-fontsize";





const indici = [{id:"1"},{id:"2"},{id:"3"}];

var lastUid = null;

export default function LoginScreen({navigation}){

    console.log("LOGIN SCREEN");
 

    //EMAIL E PASSWORD::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //contesto autenticazione
    const {user,userAuth, accediConEmailPassword,isControlDone, inviaEmailRecuperoPassword, inviaEmailDiVerifica, getUtenteCorrente, isProfiloCompletato,messaggioAuth,setMessaggioAuth,setIsControlDone, isUserProfileCompleted} = useContext(AutenticazioneUtente);
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
    //indica se il bottone (per passare al login con email e password o ritornare indietro) è stato cliccato o meno
    let isEmailEPasswordClicked = useRef(false);
    //indica se il bottone (per passare dai campi email e password a quello per il recupero della password) è stato cliccato o meno
    let isRecuperaPasswordClicked = useRef(false);
    //gestiscono il bottone a comparsa quando si richiede di recuperare la password
    const [visible1, setSnackBarVisibility1] = useState(false);
    const [snackmessage, setSnackBarMessage] = useState(null);
    const onDismissSnackBar1 = () => setSnackBarVisibility1(false);
    const onDismissSnackBar2 = () => setSnackBarMessage(null);
    //tiene il conto del numero dei tentativi errati quando si accede con email e password
    let numeroDiTentativiEmailPassword = useRef(0);
    //gestisce quando visualizzare il messaggio "devi verificare l'email prima di accedere. Non hai ricevuto l'email?"
    const [snackmessageEmailVerified, setSnackmessageEmailVerified] = useState(null);
    const onSnackmessageEmailVerified = () => setSnackmessageEmailVerified(null);

    //TELEFONO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    const [mostraSchermataTelefono, setMostraSchermataTelefono] = useState(false);

    
    
    const refFlatList = useRef();

    useEffect(()=>{
        console.log("use effect home:"+userAuth);

        const backAction = () => {
            return true;
          };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            console.log("stampo dettagli");
            console.log("vado alla home con "+(userAuth!=null?userAuth.uid:null)+","+isUserProfileCompleted+","+isControlDone+",");
        if(userAuth){
            console.log(userAuth.email!=null);
            console.log(userAuth.emailVerified==true);
        }
        if(userAuth && userAuth.uid!=null && userAuth.uid!=undefined && isUserProfileCompleted==true && isControlDone==true){
            navigation.reset({routes: [{name: "Home"}]});
            setIsLoading(false);
            navigation.navigate("Home");
        }
        if(userAuth && userAuth.uid!=null && userAuth.uid!=undefined && isUserProfileCompleted==false && isControlDone==true && (userAuth.email!=null && userAuth.emailVerified==true)){
            setSnackmessageEmailVerified(true);
            setIsLoading(false);
        }

        return () => backHandler.remove();

        
    },[userAuth,isUserProfileCompleted, isControlDone ])

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    //AREA PER I BOTTONI GOOGLE E TELEFONO
    function View_Registrati_e_AccediConTelefono(){
        return (
            <View style={{width:Dimensions.get("window").width,alignItems:"center",justifyContent:"flex-end", paddingBottom:20}}>
                <FAB
                    style={{backgroundColor:MosCeleste,marginBottom:20,width:"90%"}} 
                    icon="account-plus"
                    
                    onPress={() => navigation.navigate("RegisterScreen")}
                    label="REGISTRATI"
            />

            <Text style={[styles.campiDaCompilare, {paddingBottom:20}]}> oppure </Text>

            <FAB
                style={{backgroundColor:MosPurple, width:"90%"}}
                small
                icon="cellphone-iphone"
                onPress={() => navigation.navigate("PhoneAuthScreen",{updatePhoneNumber: "no"})}
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
                    style={[styles.campiDaCompilare,{width:larghezzaDevice*0.8,paddingTop:10, backgroundColor:"transparent"}]}
                    selectionColor={MosCeleste}
                    
                    
                    mode="flat"
                    />
                {/*PASSWORD*/}
                <TextInput
                    label="Password"
                    value={password}
                    secureTextEntry={true}
                    onChangeText={text => setPassword(text.trim())}
                    style={[styles.campiDaCompilare,{width:larghezzaDevice*0.8, backgroundColor:"white"}]}
                    selectionColor={MosCeleste} 
                    maxLength={30}
                    mode="flat"
                    />

                {/*HAI DIMENTICATO LA PASSWORD?*/}
                <TouchableOpacity onPress={mostraCampoRecuperaPassword}>
                    <View style={{ paddingTop:10,alignItems:"flex-end", width:larghezzaDevice*0.8}}>
                        <Text style={[styles.campiDaCompilare,{color:MosViola}]}>Hai dimenticato la password?</Text>
                    </View>
                </TouchableOpacity>

                {/*ERRORE*/}
                <View style={{ paddingTop:10, width:larghezzaDevice*0.8}}>
                    <Text style={[styles.errore,{color:"red"}]}>{errore}</Text>
                </View>
            </View> 
            </View>
        )
    }

    //VIEW RECUPERO PASSWORD
    function ViewRecuperoPassword(){
        return (
            <View style={{width:Dimensions.get("window").width, alignItems:"center", justifyContent:"center", marginBottom:20}}>

            <TouchableOpacity style={{position:"absolute", left:20,top:0}} onPress={mostraCampiEmailEPassword}>
                <AntDesign name="arrowleft" size={24} color={MosViola}  />
            </TouchableOpacity>

            {/*Titolo*/}
            <Text style={[styles.sottoTesto,{width:larghezzaDevice*0.8}]}>Inserisci l'email alla quale contattarti.</Text>

             {/*EMAIL*/}
            <View>
                <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text.trim())}
                maxLength={30}
                style={[styles.campiDaCompilare,{width:larghezzaDevice*0.8, backgroundColor:"white"}]}
                selectionColor={MosCeleste}
                mode="flat"
                />

            {/*ERRORE*/}
            <View style={{ paddingVertical:10, width:larghezzaDevice*0.8}}>
                <Text style={styles.errore}>{errore}</Text>
            </View>
        </View> 
        </View>
     )
    }

    //_______________________________________________METODI PER ACCEDERE CON EMAIL E PASSWORD _________________________________________________

    function mostraCampiEmailEPassword(){
        isEmailEPasswordClicked.current= true;
        isRecuperaPasswordClicked.current=false;
        setErrore("");
        refFlatList.current.scrollToIndex({animated:true, index:1});
        setLabelEmailPasswordButton("ACCEDI");
    }

    function mostraCampoRecuperaPassword(){
        setErrore("");
        isRecuperaPasswordClicked.current=true;
        isEmailEPasswordClicked.current=false;
        refFlatList.current.scrollToIndex({animated:true, index:2});
        setLabelEmailPasswordButton("INVIA");
    }

    function nascondiCampiEmailEPassword(){
        isEmailEPasswordClicked.current=false;
        isRecuperaPasswordClicked.current=false;
        setErrore("");
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
            console.log("accedi a firebase...ultimo utente:"+user);
            let lastUser = user;
            try{
                accediConEmailPassword(email,password)
                .then((userCredential) => {
                    
                    // Signed in
                    console.log("autenticato:");
                    console.log(userCredential.user);
                    var local_user = userCredential.user;
                    console.log("utente di prima:"+lastUser+", utente di ora:"+local_user.uid);
                    //controllo se ha verificato l'email
                    var isEmailVerified = local_user.emailVerified;
                    console.log("is email verified? --> "+isEmailVerified);
                    if(!isEmailVerified){
                        lastUid=local_user;
                        setSnackmessageEmailVerified(true);
                        setIsLoading(false);
                    }
                    else if(lastUser==local_user.uid) {
                        console.log("utente diverso dall'ultimo salvato");
                        console.log("UID:"+local_user.uid);
                        //controllo se ha già completato gli step per la creazione del profilo
                        isProfiloCompletato(local_user.uid)
                            .then((doc)=>{
                                setIsLoading(false);
                                //se è stato completato portalo direttamente alla home
                                if (doc.exists) {
                                    console.log("documento esistente, setto lo user con "+local_user.uid);
                                    setUser(local_user.uid);
                                    navigation.navigate("Home");
                                } else {
                                    // se non è stato completato inviarlo allo Slider 
                                    navigation.navigate("SliderNuovoUtente", {uid: local_user.uid});
                                }
                            }).catch((e)=>{
                                setIsLoading(false);
                                console.log("Si è verificato un errore:"+e);
                                setErrore("Si è verificato un problema. Riprova più tardi.");
                            })
                    }

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
                    console.log(error);
                    //se il numero di tentativi supera 3 richiedi email per il recupero della password
                    console.log("numero tentativi effettuati:"+numeroDiTentativiEmailPassword.current);
                    if(numeroDiTentativiEmailPassword.current>=3)
                        setSnackBarVisibility1(true);
            
            })
        }catch(e){
            setIsLoading(false);
            console.log("errore imprevisto:"+e);
            setErrore("*errore imprevisto. Riprovare piu tardi.");
        } 
      }
    }

    function inviaEmailRecuperoPsw(){
        console.log("invia email di recupero");
        setIsLoading(true);
        try{
        inviaEmailRecuperoPassword(email)
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
                else
                    messaggioDiErrore = "Si è verificato un problema. Riprova più tardi."
                
                setIsLoading(false);
                setErrore(messaggioDiErrore);
                console.log("Si è verificato un errore:"+error);
            });
        }catch(e){
            setIsLoading(false);
            setErrore("Errore imprevisto. Riprovare più tardi.");
        }
            
    }
    //--------------------------------------------------
    
    console.log("Rendering LoginScreen.js");


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

                        
                        {/*COMPARE SOLO QUANDO IL TENTATIVO DI LOGIN CON EMAIL E PASSWORD HA SUPERATO LE 3 VOLTE */}
                        <Snackbar
                                    visible={visible1}
                                    onDismiss={onDismissSnackBar1}
                                    theme={{ colors: {surface:"white", accent: "white"},}}
                                    style={{position:"absolute",zIndex:10, elevation:10, bottom:0}}
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
                               style={{position:"absolute",zIndex:10, elevation:10, bottom:0}}
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

                        {/*COMPARE SOLO PER MOSTRARE UN MESSAGGIO DAL CONTESTO DI AUTENTICAZIZONE */}
                        <Snackbar
                               visible={messaggioAuth}
                               style={{position:"absolute",zIndex:10, elevation:10, bottom:0}}
                               onDismiss={()=>{setMessaggioAuth(null)}}
                               duration = {5000}
                               theme={{ colors: { surface: "white",accent: "white"},}}
                               action={{
                               label: 'UNDO',
                               onPress: () => {
                                    setMessaggioAuth(null);
                                },
                            }}>
                                {messaggioAuth}
                        </Snackbar>

                        {/*COMPARE SOLO PER DIRE ALL'UTENTE CHE DEVE VERIFICARE L'EMAIL PRIMA DI PROCEDERE E PERMETTE L'INVIO DELL'EMAIL DI VERIFICA NEL CASO NON SIA ARRIVATA IN FASE DI REGISTRAZIONE*/}
                        <Snackbar
                                visible={snackmessageEmailVerified ? true : false}
                                style={{position:"absolute", zIndex:10, elevation:10, bottom:0}}
                                onDismiss={onSnackmessageEmailVerified}
                                duration = {5000}
                                theme={{ colors: { surface: "white",accent: MosCeleste},}}
                                action={{
                                label: 'INVIA EMAIL',
                                onPress: () => {
                                    console.log("invia email ");
                                    var user = getUtenteCorrente();
                                    console.log("ottengo utente corrente: "+user);
                                    // invia email di verifica
                                    setIsLoading(true);
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
                                                var errorMessage="Errore imprevisto. Riprovare piu tardi.";
                                                var errorCode = error.code;
                                                if(errorCode==="auth/user-disabled")
                                                    errorMessage="L'utente è stato attualmente disabilitato.";
                                                else if(errorCode==="auth/too-many-requests" || errorCode=="TOO_MANY_ATTEMPTS_TRY_LATER")
                                                    errorMessage="Hai effettuato troppe richieste. Riprova più tardi.";
                                                else if(errorCode==="auth/network-request-failed")
                                                    errorMessage="Problema di rete. Non è possibile registrarsi.";
                                                    
                                                setSnackBarMessage(errorMessage);
                                                console.log("errore: email di verifica non inviata:"+error.code+","+error);
                                            });
                                        }catch(e){
                                            setIsLoading(false);
                                            setSnackBarMessage("Si è verificato un problema. Riprovare più tardi.");
                                            console.log("errore: email di verifica non inviata:"+e);
                                        }
                                    onSnackmessageEmailVerified();
                                },
                            }}>
                                Devi verificare l'email per accedere. Non hai ricevuto l'email?
                            </Snackbar>   

                        <ScrollView alignItems="center" justifyContent="center" showsVerticalScrollIndicator={false}>
                            <View style={{alignItems:"center", justifyContent:"center", paddingBottom:20}}>
                                <Image source={require("../../resources/images/logoMosaic.png")} style={{width:altezzaDevice*0.18,height:altezzaDevice*0.18 , alignSelf:"center"}}/> 
                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.titolo}>Accedi a Mosaic</Text>
                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.testo}>Prima la mente, poi il corpo</Text>
                                    {/*BOTTONE ACCEDI CON EMAIL/PASSWORD*/}

                                    {/*MOSTRO I BOTTONI REGISTRATI,TELEFONO e nella seconda parte I CAMPI EMAIL E PASSWORD DA COMPILARE*/}
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
                                            index==0?View_Registrati_e_AccediConTelefono():(index==1?ViewEmailEPassword():ViewRecuperoPassword())}
                                    />

                                    <FAB
                                    style={{backgroundColor:MosViola, width:"90%"}}
                                    small
                                    icon="email-lock"
                                    onPress={() => {
                                        if(isEmailEPasswordClicked.current==true)
                                            accediConEmail();
                                        else if(isRecuperaPasswordClicked.current==true)
                                            inviaEmailRecuperoPsw();
                                        else
                                            mostraCampiEmailEPassword();
                                    }}
                                    label={labelEmailPasswordButton}
                                    />                             
                   
                            </View>
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
        fontSize:fontSizeTitolo*0.9, //*0.5 di font size equivale al 40% della vera altezza del device 
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
        alignSelf:"center",
    },
    testo:{
        fontSize:fontSizeSottoTitolo*0.9,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        alignSelf:"center"
    },
    sottoTesto:{
        fontSize:fontSizeSottoTitolo,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        alignSelf:"center"
    },
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
    },
    errore:{
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_200ExtraLight",
        color: "red"
    },
    registrati:{
        fontSize:altezzaDevice*0.04,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
  });
  