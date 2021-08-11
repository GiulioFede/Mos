import React, {useState, useRef, useContext, useEffect} from "react";
import {View, Text,Dimensions,StyleSheet, TouchableOpacity, TextInput, ScrollView,KeyboardAvoidingView, Button, Platform,BackHandler} from "react-native"
import { FAB, Snackbar, ActivityIndicator, Divider, Checkbox } from 'react-native-paper';
import { altezzaDevice, fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloBarra, fontSizeTitoloCampo, iconSize, larghezzaDevice } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple, MosViola } from "../../resources/colors";
import {Ionicons} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { DatePicker } from "./components/datePicker";
import * as Location from 'expo-location';
import { AutenticazioneUtente } from "../../context/firebase/autenticazione";
import { geohashForLocation } from "geofire-common";
import AreaSceltaGenere from "./components/areaSceltaGenere";

export default function InformazioniPersonali({ navigation }) {

    var {user,informazioniProfiloUtente, informazioniAutenticazioneUtente, aggiornaEmail, inviaEmailDiVerifica,messaggioAuth, setMessaggioAuth,aggiornaDettagliProfiloUtente,logOut} = useContext(AutenticazioneUtente);

    const [isLoading, setIsLoading] = useState(false);
    //indica se ci è stato un errore globale 
    var erroreGlobale = false;

    const scrollView = useRef();

    //indica dove è stata fatta la modifica (dataDiNascita, descrizione, posizione, identità di genere)
    var indiciModifiche = useRef([false,false,false,false,false]);

    const [auth, setAuth] = useState((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]);
    const [erroreAuth, setErroreAuth] = useState(null);

    const [nome, setNome] = useState("");

    const [descrizione, setDescrizione] = useState(informazioniProfiloUtente.self_description);

    const [dataDiNascita, setDataDiNascita] = useState(informazioniProfiloUtente.date_of_birth);
    const [erroreData, setErroreData] = useState(null);

    const [isLocationLoading, setIsLocationLoading] = useState("");

    var posizioneUtente = useRef("");

    const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

    //messaggio snack
    const [snackMessage, setSnackMessage] = useState(null);



    function controllaEmail(){
        console.log("controllo email...");
        setErroreAuth(null);
        if(auth==informazioniAutenticazioneUtente[0]){
            setErroreAuth("*questo indirizzo email è già attivo.");
            return false;
        }
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(auth))
        {
            //se è corretta
            setErroreAuth(null);
            //avverto che è avvenuta una modifica
            indiciModifiche.current[0]=true;
            return true;
        }
        
        setErroreAuth("*errore: inserisci una email valida.");
        return false;
    }

    function aggiornaEmailUtente(){
        if(!controllaEmail()) return;
        console.log("aggiorna email:"+auth);
        if(erroreAuth==null){
            try{
                setIsLoading(true);
                aggiornaEmail(auth)
                    .then((ris)=>{
                        console.log("email cambiata:"+ris);
                        //invia email di verifica
                        inviaEmailDiVerifica(user).then((ris)=>{
                            setMessaggioAuth("Una email di verifica è stata inviata al nuovo indirizzo email "+auth+". Verifica l'email prima di procedere al login.");
                        }).catch((e)=>{
                            
                        });
                        //in ogni caso esegui il log out. L'utente avrà comunque possibilità di farsi mandare l'email di verifica se non l'ha ricevuta.
                        setIsLoading(false);
                        logOut();
                        navigation.navigate("LoginScreen");
                    }).catch((e)=>{
                        setIsLoading(false);
                        var code = e.code;
                        var mex = "*si è verificato un errore. Riprova più tardi";
                        if(code=="auth/requires-recent-login")
                            mex= "*per motivi di sicurezza ti chiediamo di accedere nuovamente per poter aggiornare l'email.";
                        else if(code=="auth/too-many-requests")
                            mex = "*hai effettuato troppe richieste. Riprova più tardi.";
                        else if(code=="auth/network-request-failed")
                            mex = "*si è verificato un problema di rete. Riprova più tardi.";
                        else if(code=="auth/invalid-email")
                            mex = "*l'email non è formattata correttamente.";

                        setErroreAuth(mex);
                        console.log("errore interno nell'aggiornare l'email: "+e.code+","+e);
                    })
            }catch(e){
                setIsLoading(false);
                console.log("errore nell'aggiornare l'email: "+e.code+","+e);
                setErroreAuth("*si è verificato un errore. Riprova più tardi");
            }
        }
}


function aggiornaPhoneNumber(){
    navigation.closeDrawer();
    console.log("aggiorno numero di telefono:"+auth);
    //apro phoneauth
    navigation.navigate("PhoneAuthScreen",{updatePhoneNumber:"yes", oldNumber:informazioniAutenticazioneUtente[1]}); //indico che tale schermo deve essere aperto per eseguire l'aggiornamento del numero di telefono
}

    function notificaModifiche(){
        for(var i=0; i<5; i++){
            if(indiciModifiche.current[i]==true){
                console.log("modifica "+i);
                scrollView.current.scrollToEnd({animated: true});
                return;
            }
        }
    }

    //DATA DI NASCITA::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function modificaDataDiNascita(data){
        console.log("data di nascita settata: "+data);
        //l'oggetto data è di tipo Date
        const today = new Date();
        if (Math.abs(today.getFullYear()- data.getFullYear()<14)){
            setErroreData("*errore: devi avere almeno 14 anni per usare Mosaic.");
        }
        else {
            setErroreData(null);
            let data_str = data+"";//.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
            console.log("setto data di nascita in modificaDataDiNascita uguale a "+data_str);
            setDataDiNascita(data_str);
            //console.log(informazioniProfiloUtente.date_of_birth+","+data_str);
            //avverto che è avvenuta una modifica se questa è diversa dalla precedente
            if(informazioniProfiloUtente.date_of_birth!=data_str){
                indiciModifiche.current[0]=true;
                notificaModifiche();
            }else {
                indiciModifiche.current[0]=false;
                notificaModifiche();
            }
        }
    }

    function apriDatePicker(){
        setIsDatePickerOpened(true);
    }

    const [apriArea, setApriArea] = useState(false);
    const [apriArea2, setApriArea2] = useState(false);
    function apriAreaSceltaGenere(){

    }

    //LOCATION::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function ottieniPosizioneUtente(){

        setIsLocationLoading("loading");
        //controllo se la locazione è attiva...
        try{
        Location.hasServicesEnabledAsync()
            .then((ris)=>{
                //se la locazione non è attiva
                if(ris==false){
                    setSnackMessage("Per conoscere la tua posizione devi attivare la geolocalizzazione.");
                    setIsLocationLoading("");
                }
                //altrimenti se è attiva...
                else {
                    //controlla se l'utente ha già accontentito a darci i permessi
                    Location.requestForegroundPermissionsAsync()
                        .then((ris)=>{
                            //se l'utente non ha permesso più di chiedere la posizione ancora una volta...
                            if(ris.canAskAgain==false){
                                setIsLocationLoading("");
                                setSnackMessage("Vai in impostazioni e consenti a Mosaic di chiedere di nuovo la posizione.");
                                return;
                            }
                            var isAccepted= "none";                            
                            if(Platform.OS==="android")
                                isAccepted = ris.android.scope;
                            else if(Platform.OS==="ios")
                                isAccepted = ris.scope;
                            
                            if(isAccepted=="none"){
                                //non ha accettato
                                setIsLocationLoading("");
                                setSnackMessage("Non è possibile aggiornare la tua posizione se non consenti a Mosaic di accedervi.");
                                return;
                            }else {
                                //ha accettato
                                Location.getCurrentPositionAsync()
                                    .then((pos)=>{
                                        setIsLocationLoading("aggiornata");
                                        //ottieni la posizione
                                        const user_position = [pos.coords.latitude,pos.coords.longitude];
                                        console.log(pos);
                                        console.log(user_position);
                                        posizioneUtente.current=user_position;
                                        //avverto che è avvenuta una modifica
                                        indiciModifiche.current[2]=true;
                                        notificaModifiche();
                                    }).catch((e)=>{
                                        setIsLocationLoading("");
                                        setSnackMessage("Si è verificato un errore. Riprovare più tardi.")
                                    });
                            } 
                        }).catch((e)=>{
                            setIsLocationLoading("");
                            setSnackMessage("Si è verificato un errore. Riprovare più tardi.")
                        })

                }
            }).catch((e)=>{
                setIsLocationLoading("");
                setSnackMessage("Si è verificato un errore. Riprovare più tardi.")
                console.log("si è verificato un problema:"+e);
            })
        }catch(e){
            setIsLocationLoading("");
            setSnackMessage("Si è verificato un errore. Riprovare più tardi.")
        }
    }

    function modificaSesso(tipo){
        console.log(tipo+","+informazioniProfiloUtente.sex);
        if(tipo==informazioniProfiloUtente.sex)
            indiciModifiche.current[2]=false;
        else
            indiciModifiche.current[2]=true;

        notificaModifiche();
    }

    function modificaDescrizione(){
        //se era diversa da prima
        if(descrizione != informazioniProfiloUtente.self_description)
            indiciModifiche.current[1]=true;
        else
            indiciModifiche.current[1]=false;
        notificaModifiche();
    }

    const [identitaDiGenere, setIdentitaDiGenere] = useState(informazioniProfiloUtente.gender_identity);
    function modificaIdentitaDiGenere(newGender){
        setIdentitaDiGenere(newGender);
        //se è diversa dalla precedente
        if(newGender != informazioniProfiloUtente.gender_identity)
            indiciModifiche.current[3] = true;
        else
            indiciModifiche.current[3] = false;
        
        notificaModifiche();
    }

    
    const [orientamentoSessuale, setOrientamentoSessuale] = useState("");
    function modificaOrientamentoSessuale(tipo){
        console.log("attrazione:"+tipo);
        setOrientamentoSessuale(tipo);

        if(tipo==informazioniProfiloUtente.gender_preference)
            indiciModifiche.current[4]=false;
        else
            indiciModifiche.current[4]=true;

        notificaModifiche();
    }

    console.log("data di birh:"+dataDiNascita);
    function salvaDettagliUtente(){

        var doc = {};
        for(var i=0; i<5; i++){
            if(indiciModifiche.current[i]==true){
                if(i==0) doc["date_of_birth"]=dataDiNascita+"";
                else if(i==1) doc["self_description"] = descrizione;
                else if(i==2) {
                    doc["location.lat"]=posizioneUtente.current[0];
                    doc["location.lng"]=posizioneUtente.current[1];
                    let hash = geohashForLocation([posizioneUtente.current[0], posizioneUtente.current[1]]);
                    doc["location.geohash"] = hash;
                }
                else if(i==3) doc["gender_identity"]= identitaDiGenere;
                else if(i==4) doc["gender_preference"]=orientamentoSessuale;
            }
        }

        console.log(doc);

        if(Object.entries(doc).length !== 0){
            setIsLoading(true);
            try{
                aggiornaDettagliProfiloUtente(user,doc)
                    .then((ris)=>{
                        setIsLoading(false);
                        //aggiorno autenticazione
                        for(var i=0; i<5; i++){
                            if(indiciModifiche.current[i]==true){
                                if(i==0) informazioniProfiloUtente.date_of_birth=dataDiNascita+"";
                                else if(i==1) informazioniProfiloUtente.self_description = descrizione;
                                else if(i==2) informazioniProfiloUtente.position=posizioneUtente.current;
                                else if(i==3) informazioniProfiloUtente.gender_identity=identitaDiGenere;
                                else if(i==4) informazioniProfiloUtente.gender_preference=orientamentoSessuale;
                            }
                        }
                        //resetto
                        resetta();
                        setSnackMessage("Profilo aggiornato con successo.");
                    }).catch((e)=>{
                        console.log("errore:"+e.code+","+e);
                        setIsLoading(false);
                        setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                    })
            }catch(e){
                console.log("errore:"+e);
                setIsLoading(false);
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
            }
        }

    }

    function resetta(){
        //prima resetto tutti i campi con l'ultima modifica salvata
        setAuth((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]);
        //setDataDiNascita(informazioniProfiloUtente.dateOfBirth);
        setIsLocationLoading("");
        setDataDiNascita(informazioniProfiloUtente.date_of_birth);
        setIdentitaDiGenere(informazioniProfiloUtente.gender_identity);
        setOrientamentoSessuale(informazioniProfiloUtente.gender_preference);

        //resetto tutti gli errori
        scrollView.current.scrollTo({y: 0});
        indiciModifiche.current = [false,false,false,false,false];
        setErroreAuth(null);
        setErroreData(null);
        setIsDatePickerOpened(false);
        setSnackMessage(null);
    }

    function tornaIndietro(){
        resetta();
        navigation.goBack();
    }

    //all'inizio 
    useEffect(()=>{

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

        const backAction = () => {
            tornaIndietro();
            return true;
          };
      
          const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

          //inizializzo elementi
          setAuth((informazioniAutenticazioneUtente[0]!=null)?informazioniAutenticazioneUtente[0]:informazioniAutenticazioneUtente[1]);
          setNome(informazioniProfiloUtente.name);
          setDescrizione(informazioniProfiloUtente.self_description);
          //let dataDiNascitaTMP = new Date(informazioniProfiloUtente.date_of_birth);
          console.log("setto data di nascita:"+informazioniProfiloUtente.date_of_birth);
          setDataDiNascita(informazioniProfiloUtente.date_of_birth);
          setIsLocationLoading("");
          setIdentitaDiGenere(informazioniProfiloUtente.gender_identity);
          setOrientamentoSessuale(informazioniProfiloUtente.gender_preference);
      
          return () => backHandler.remove();

    },[informazioniProfiloUtente, informazioniAutenticazioneUtente]) //metto come dipendenza l'informazione del profilo utente cosi da richiamare useEffect ogni volta che un nuovo utente (o anche il vecchio che riaccede di nuovo) ricarico gli elementi nuovi


    function getFormattedData(){
        let dataDiNascitaTMP = new Date(dataDiNascita);
        console.log("ritorno di "+dataDiNascita+" il valore: "+dataDiNascitaTMP.getDate()+"/"+(dataDiNascitaTMP.getMonth()+1)+"/"+dataDiNascitaTMP.getFullYear());
        return dataDiNascitaTMP.getDate()+"/"+(dataDiNascitaTMP.getMonth()+1)+"/"+dataDiNascitaTMP.getFullYear()
    }

        //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
            return <View></View>

    return (
      <View style={styles.container} >

          {/* schermo di caricamento */}
          {isLoading &&
          <View style={{position:"absolute",backgroundColor:"rgba(230,230,230,0.8)", zIndex:100, width:larghezzaDevice, height:altezzaDevice, justifyContent:"center", alignItems:"center"}} >
            <ActivityIndicator animating={isLoading} color={MosCeleste} />
          </View> }

          {/* BARRA SUPERIORE */}
          <View style={styles.barraSuperiore}>
                <TouchableOpacity onPress={tornaIndietro} style={{position:"absolute",left:0, paddingLeft:Dimensions.get("window").width*0.03}}>
                    <Ionicons name="chevron-back" size={iconSize} color="#52575D" />
                </TouchableOpacity>
                <ActivityIndicator animating={isLoading} color={MosCeleste} style={{position:"absolute",right:0, paddingRight:Dimensions.get("window").width*0.03}} />
                <Text style={styles.titolo}>Informazioni personali</Text>
            </View>

            <KeyboardAvoidingView
                keyboardVerticalOffset={30}
                style={{ flex: 1 }}
                 behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
                <View>
                    <ScrollView 
                        ref={scrollView}>

                        {/*DESCRIZIONE*/}
                        <Text style={[styles.titoloCampo,{marginBottom:20,marginTop: 25, color:MosPurple}]}>Questa sezione ospita le tue informazioni personali. Sentiti libero di cambiarle come e quando vuoi.</Text>
                        
                        <Divider />
                        <Text style={[styles.campo,{marginTop: 25, color:MosPurple, textAlign:"center"}]}>Autenticazione</Text>
                        {/*EMAIL oppure TELEFONO*/}
                        {informazioniAutenticazioneUtente[0]!=null && <Text style={[styles.titoloCampo,{marginTop:20}]}>Email</Text>}
                        {informazioniAutenticazioneUtente[0]==null && <Text style={[styles.titoloCampo,{marginTop:20}]}>Telefono</Text>}
                        <View>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                   style={styles.campo}
                                   editable={informazioniAutenticazioneUtente[0]!=null}
                                   onChangeText={text => setAuth(text.trim())}
                                   onSubmitEditing={()=>setAuth(auth)}
                                   onBlur={()=> setAuth(auth)} //focus perso
                                   value={auth}
                                   placeholder={(informazioniAutenticazioneUtente[0]!=null)?"email":"telefono"}
                                   defaultValue = {auth}
                                   keyboardType="name-phone-pad"
                                    />
                            {erroreAuth && <Text style={[styles.errore,{marginVertical:10}]}>{erroreAuth}</Text>}
                            {informazioniAutenticazioneUtente[0]!=null && <Text style={[styles.errore,{marginVertical:10, color:MosCeleste}]}>Inserisci la tua nuova email e premi sul pulsante sotto. La password rimarrà la stessa con la quale accedevi prima. Ricorda che una volta cambiata, la vecchia email non sarà più abilitata agli accessi futuri, ma sarà comunque possibile ritornare ad usarla eseguendo la stessa procedura. </Text>}
                            {informazioniAutenticazioneUtente[0]==null && <Text style={[styles.errore,{marginVertical:10, color:MosCeleste}]}>Questo è il tuo attuale numero di telefono. Per cambiarlo premi il pulsante sotto. Per motivi di sicurezza ti chiediamo di autenticarti nuovamente prima di procedere. </Text>}
                        </View>
                        <TouchableOpacity color={MosPurple} style={[styles.saveButton,{backgroundColor:MosPurple, padding:10, textAlign:"center"}]} onPress={(informazioniAutenticazioneUtente[0]!=null)?aggiornaEmailUtente:aggiornaPhoneNumber}><Text style={[styles.sottoCampo,{textAlign:"center", color:"white"}]}>{(informazioniAutenticazioneUtente[0]!=null)?"AGGIORNA EMAIL":"AGGIORNA NUMERO DI TELEFONO"}</Text></TouchableOpacity>
                        
                        </View>
                        <Divider />

                        <Text style={[styles.campo,{marginTop: 25, color:MosPurple, textAlign:"center"}]}>Dettagli personali</Text>
                        {/*NOME*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Nome</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                    editable={false}
                                    style={styles.campo}
                                    defaultValue={nome} />
                            <Text style={styles.sottoCampo}>(non modificabile)</Text>
                        </View>
                        <Divider />
                        
                        {/*DATA DI NASCITA*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Data di nascita</Text>
                        <TouchableOpacity onPress={apriDatePicker}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {getFormattedData()} </Text>
                                {erroreData && <Text style={[styles.errore,{marginTop:10}]}>{erroreData}</Text>}
                            </View>
                        </TouchableOpacity>
                        <DatePicker setData={modificaDataDiNascita} isVisible={isDatePickerOpened} setIsVisible={setIsDatePickerOpened} />
                        <Divider />

                        {/*DESCRIZIONE*/}
                        <View style={{ flex:0.8, width:"100%",marginBottom:10}}>
                                <Text style={[styles.titoloCampo,{marginTop:20}]}>Descrizione</Text>
                                <View style={{paddingLeft:Dimensions.get("window").width*0.03}}>
                                    <TextInput
                                        style={styles.campo}
                                        autoCapitalize="none"
                                        onChangeText={text => setDescrizione(text)}
                                        onSubmitEditing={()=>modificaDescrizione()}
                                        onBlur={()=> modificaDescrizione()} //focus perso
                                        value={descrizione}
                                        keyboardType="name-phone-pad"
                                        multiline={true}
                                        placeholder='...'
                                        underlineColorAndroid='transparent'
                                        maxLength={150}
                                    />
                                </View>
                            </View>
                            <Divider />

                        {/*AGGIORNA LA TUA POSIZIONE*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Aggiorna la tua posizione</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10,flexDirection:"row", }}>
                        <TouchableOpacity 
                                style={{ 
                                borderRadius:Dimensions.get("window").width*0.4/2,
                                justifyContent: 'center', 
                                alignItems:'center',
                                marginRight:10
                                }}
                                onPress = { () => ottieniPosizioneUtente()}
                                > 
                            { (isLocationLoading!="aggiornata")  && <Text style={[styles.campo,{color:MosViola}]}>AGGIORNA</Text>}
                            { (isLocationLoading=="aggiornata")  && <Text style={[styles.campo,{color:"#15e302"}]}>AGGIORNATA</Text>}
                        </TouchableOpacity>
                        { isLocationLoading=="loading" && <ActivityIndicator animating={true} color={MosCeleste}/>}
                        </View>
                        <Divider />

                        {/*SESSO*/}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Sesso</Text>
                        <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                            <TextInput autoCapitalize="none"
                                    editable={false}
                                    style={styles.campo}
                                    defaultValue={informazioniProfiloUtente.biological_sex} />
                            <Text style={styles.sottoCampo}>(non modificabile)</Text>
                        </View>
                        <Divider />
                        
                        {/* IDENTITA' DI GENERE */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Identità di genere</Text>
                        <TouchableOpacity onPress={()=>{setApriArea(true)}}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {identitaDiGenere} </Text>
                            </View>
                        </TouchableOpacity>
                        <AreaSceltaGenere apriArea={apriArea} setApriArea={setApriArea} setIdentitaDiGenere={modificaIdentitaDiGenere} />

                        <Divider/>

                        {/* ORIENTAMENTO SESSUALE */}
                        <Text style={[styles.titoloCampo,{marginTop:20}]}>Da chi sei più attratto?</Text>
                        <TouchableOpacity onPress={()=>{setApriArea2(true)}}>
                            <View style={{ padding:Dimensions.get("window").height*0.01, marginBottom:10}}>
                                <Text
                                        style={[styles.campo,{color:MosViola}]}
                                        defaultValue={"..."}> {orientamentoSessuale} </Text>
                            </View>
                        </TouchableOpacity>
                        <AreaSceltaGenere apriArea={apriArea2} setApriArea={setApriArea2} setIdentitaDiGenere={modificaOrientamentoSessuale} />

                        <Divider/>

                    {/*BOTTONE PER SALVARE*/}
                    <TouchableOpacity color={MosPurple} style={[styles.saveButton,{backgroundColor:MosPurple, padding:10, textAlign:"center"}]} onPress={salvaDettagliUtente}><Text style={[styles.sottoCampo,{textAlign:"center", color:"white"}]}>SALVA DETTAGLI</Text></TouchableOpacity>

                    </ScrollView>
                    
                </View>
            </KeyboardAvoidingView>

            {/*MESSAGGIO */}
            <Snackbar
                visible={snackMessage}
                onDismiss={()=>{setSnackMessage(null)}}
                action={{
                label: 'Chiudi',
                onPress: () => {
                    // Do something
                },
             }}>
                {snackMessage}
            </Snackbar>
    
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        paddingBottom: 24,
    },
    barraSuperiore:{
        width:Dimensions.get("window").width,
        height: Dimensions.get("window").height*0.1,
        flexDirection:"row",
        justifyContent:"center",
        paddingTop:24,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
        textAlign:"center",
        backgroundColor:"#fff",

    },
    titoloCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        fontSize:fontSizeSottoTitolo,
        paddingLeft:Dimensions.get("window").width*0.03
    },
    campo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.3,
        paddingLeft:Dimensions.get("window").width*0.03
    },
    sottoCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi,
        paddingLeft:Dimensions.get("window").width*0.03
    },
    saveButton:{
        fontFamily: "Raleway_200ExtraLight",
        fontSize:fontSizeCampi*1.3,
    },
    errore: {
        fontFamily: "Raleway_200ExtraLight",
        color: "red",
        fontSize:fontSizeCampi,
        paddingLeft:Dimensions.get("window").width*0.03
    }
})