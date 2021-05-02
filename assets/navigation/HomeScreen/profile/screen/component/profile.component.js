import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Entypo} from "@expo/vector-icons";
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import {navbarHeight, fontSizeTitolo, altezzaBarraScreen, larghezzaDevice, fontSizeTitoloBarra, altezzaMenuNavigazione } from '../../../../../context/variabili_globali/variabiliGlobali';
import CachedImage from 'react-native-expo-cached-image'; //installa yarn add react-native-expo-cached-image
import * as ImagePicker from 'expo-image-picker';
import { AutenticazioneUtente } from "../../../../../context/firebase/autenticazione";
import GalleriaImmagini from './galleriaImmagini';
/*
    MISURE
    altezza barra profilo --> 10%
    altezza sezione immagine profilo --> 30%
    altezza area dettagli utenti --> 10%

    altezza area galleria
*/
const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSezioneImmagineProfilo = Dimensions.get("window").height*0.3;
const altezzaDettagliUtenti = Dimensions.get("window").height*0.1;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.5-altezzaMenuNavigazione-20;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

export default function ProfileComponent(props){

    //contesto autenticazione
    var {caricaNuovaImmagineDiGalleria, user,eliminaImmagineDiGalleria,cambiaImmagineDiProfilo, informazioniProfiloUtente} = useContext(AutenticazioneUtente);

    //dati utente
    var {navigation} = props;

    //inizializzo la galleria
    const [galleria, setGalleria] = useState([]);

    const inizializzaGalleria = () =>{
        var tmp = [];
        if(informazioniProfiloUtente.gallery) 
            informazioniProfiloUtente.gallery.forEach((item, i) => {tmp.push({key: i, url: item})});
        tmp.reverse();
        setGalleria(tmp);
    }

    useEffect(()=>{
        inizializzaGalleria();
    },[informazioniProfiloUtente])

    //per l'errore
    const [snackMessage, setSnackMessage] = useState(null);
    const hideSnackMessage = () => setSnackMessage(null);

    //per il caricamento
    const [isLoading, setIsLoading] = useState(false);

    //per il dialog
    const [isDialogVisible, setIsDialogVisible] = React.useState(false);
    //contiene l'indice della foto da eliminare
    const indiceFotoDaEliminare = useRef(-1);

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>
    
    //APRO MENU
    function apriUserSettings(){
        navigation.openDrawer();
    }

    //APRO GALLERIA IMMAGINI::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function apriGalleria(){
        console.log(isLoading);
        if(isLoading==false){
        //chiedo permessi
        try{
        setIsLoading(true);
        console.log("apro galleria immagini");
        ImagePicker.requestMediaLibraryPermissionsAsync(false)
            .then((ris)=>{
                console.log(ris);
                //se ha bloccato la possibilità di chiedere i permessi
                if(ris.canAskAgain==false){
                    setSnackMessage("Vai in impostazioni e consenti a Mosaic di chiedere i permessi per accedere alla galleria.");
                    setIsLoading(false);
                    return;
                }
                //se non ha bloccato, ma ha rifiutato di concedere i permessi
                if(ris.status!="granted"){
                    setSnackMessage("Mosaic ha bisogno del tuo permesso per aprire la galleria.");
                    setIsLoading(false);
                    return;
                }
                //se sono qui i permessi sono stati dati
                //apro galleria
                ImagePicker.launchImageLibraryAsync({
                                                        mediaTypes: ImagePicker.MediaTypeOptions.Images, //permetto la selezione di sole immagini
                                                        allowsEditing: true, //apro un editor col quale edito la foto
                                                        aspect: [4, 4], //l'editor permette solo un crop quadrato
                                                        quality: 1,
                                                    })
                    .then((ris)=>{
                        console.log("galleria aperta");
                        console.log(ris);
                        //se l'operazione non è stata annullata
                        if(!ris.cancelled){
                            //prendo l'uri e lo uso per settare l'immagine di galleria ma anche per caricarlo sullo storage
                            console.log(ris.uri);
                            const localUri = ris.uri;
                            //prendo il file
                            fetch(localUri)
                                .then((response)=>{
                                    //il file è stato preso, creo il blob dal file
                                    response.blob()
                                        .then((blob)=>{
                                            //blob creato
                                            console.log("blob img galleria creato");
                                            //chiamo firebase per salvarla sullo storage
                                            caricaNuovaImmagineDiGalleria(user,blob)
                                                .then((remoteUrl)=>{
                                                    console.log("immagine di galleria caricata sullo storage");
                                                    //aggiungo immagine galleria (se vuota)
                                                    if(galleria.length==0)
                                                        var tmp = [{key: 0, url: remoteUrl, localUrl: localUri},...galleria];
                                                    //aggiungo l'immagine alla galleria se esistono già foto (usando l'uri interno per evitare di scaricarla)
                                                    else
                                                        var tmp = [{key: (galleria[0].key+1), url: remoteUrl, localUrl: localUri},...galleria];
                                                    setGalleria(tmp);
                                                    //utilizzo lo snack per dire all'utente che il caricamento è stato completato
                                                    setSnackMessage("Immagine caricata con successo.");
                                                    setIsLoading(false);
                                                }).catch((e)=>{
                                                   var code = e.code;
                                                    var message = "Si è verificato un problema. Riprova più tardi.";
                                                    if(code=="storage/retry-limit-exceeded")
                                                        message = "La richiesta ha impiegato troppo tempo. Riprovare.";
                                                    else if(code=="storage/canceled")
                                                        message = "Operazione annullata.";
                                                    else if(code=="storage/cannot-slice-blob")
                                                        message = "Si è verificato un errore: il file locale è stato cambiato.";
                        
                                                    console.log("Errore caricamento immagine di galleria:"+code+","+e.code);
                                                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                                    setIsLoading(false);
                                                })

                                        }).catch((e)=>{
                                            setIsLoading(false);
                                            console.log("Errore scaricamento immagine:"+e.code+","+e);
                                            setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                        })
                                  }).catch((e)=>{
                                    setIsLoading(false);
                                    console.log("Errore scaricamento immagine:"+code+","+e.code);
                                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                  })
                        }
                        else 
                            //se l'operazione è stata annullata
                            setIsLoading(false);

                        })}).catch((e)=>{
                setIsLoading(false);
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                console.log("photo.js errore1:"+e);
            })
        }catch(e){
            setIsLoading(false);
            setSnackMessage("Si è verificato un problema. Riprova più tardi.");
            console.log("errore galleria:"+e);
        }
    }else {
        setSnackMessage("Attendi la fine del caricamento prima di procedere.");
    }
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //apri finestra per eliminare foto (gli passo la key (NB: non l'indice) della foto della galleria che potenzialmente vorrei eliminare)
    function openDialog(key){

        console.log("apro dialog per potenziale eliminazione immagine "+key);
        setIsDialogVisible(true)
        indiceFotoDaEliminare.current = key;
    }
    //chiudo la finestra (resettando l'indice della foto da eliminare)  
    function closeDialog(){
        console.log("chiudo dialog");
        setIsDialogVisible(false);
        indiceFotoDaEliminare.current = -1;
    }

    //ELIMINA FOTO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //si basa sull'indice della foto che è stato settato quando abbiamo chiamato openDialog
    function eliminaImmagineDallaGalleria(){
        console.log("STA CARICANDO?"+isLoading);
        if(isLoading==false){
            try{
            setIsLoading(true);
            const index = indiceFotoDaEliminare.current;
            const url = galleria[indiceFotoDaEliminare.current].url;
            closeDialog();
            //elimino
            eliminaImmagineDiGalleria(user,url)
                .then((ris)=>{
                    setIsLoading(false);
                    console.log("Immagine eliminata con successo");
                    var tmp = [...galleria];
                    tmp.splice(index,1);
                    setGalleria(tmp);
                    setSnackMessage("Foto eliminata con successo.");
                    
                }).catch((e)=>{
                    setIsLoading(false);
                    console.log("Errore nell'eliminazione dell'immagine ");
                    console.log(e);
                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                })
        
            }catch(e){
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                setIsLoading(false);
            }

        }else {
            setSnackMessage("Attendi la fine del caricamento prima di procedere.");
            setIsLoading(false);
            closeDialog();
        }     
    }

    //CAMBIA IMMAGINE PROFILO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function cambiaImmagineProfilo(){
        if(isLoading==false){

            //chiedo permessi
        try{
            setIsLoading(true);
            console.log("apro galleria immagini");
            ImagePicker.requestMediaLibraryPermissionsAsync(false)
                .then((ris)=>{
                    console.log(ris);
                    //se ha bloccato la possibilità di chiedere i permessi
                    if(ris.canAskAgain==false){
                        setSnackMessage("Vai in impostazioni e consenti a Mosaic di chiedere i permessi per accedere alla galleria.");
                        setIsLoading(false);
                        return;
                    }
                    //se non ha bloccato, ma ha rifiutato di concedere i permessi
                    if(ris.status!="granted"){
                        setSnackMessage("Mosaic ha bisogno del tuo permesso per aprire la galleria.");
                        setIsLoading(false);
                        return;
                    }
                    //se sono qui i permessi sono stati dati
                    //apro galleria
                    ImagePicker.launchImageLibraryAsync({
                                                            mediaTypes: ImagePicker.MediaTypeOptions.Images, //permetto la selezione di sole immagini
                                                            allowsEditing: true, //apro un editor col quale edito la foto
                                                            aspect: [4, 4], //l'editor permette solo un crop quadrato
                                                            quality: 1,
                                                        })
                        .then((ris)=>{
                            console.log("galleria aperta");
                            console.log(ris);
                            //se l'operazione non è stata annullata
                            if(!ris.cancelled){
                                //prendo l'uri e lo uso per settare l'immagine di profilo ma anche per caricarlo sullo storage
                                console.log(ris.uri);
                                const localUri = ris.uri;
                                //prendo il file
                                fetch(localUri)
                                    .then((response)=>{
                                        //il file è stato preso, creo il blob dal file
                                        response.blob()
                                            .then((blob)=>{
                                                //blob creato
                                                console.log("blob img galleria creato");
                                                //chiamo firebase per salvarla sullo storage
                                                cambiaImmagineDiProfilo(user,blob)
                                                    .then((remoteUrl)=>{
                                                        console.log("immagine di profilo caricata sullo storage");
                                                        //aggiungo immagine galleria (se vuota)
                                                        informazioniProfiloUtente.urlProfileImage = localUri;
                                                        //utilizzo lo snack per dire all'utente che il caricamento è stato completato
                                                        setSnackMessage("Immagine di profilo aggiornata.");
                                                        setIsLoading(false);
                                                    }).catch((e)=>{
                                                       var code = e.code;
                                                        var message = "Si è verificato un problema. Riprova più tardi.";
                                                        if(code=="storage/retry-limit-exceeded")
                                                            message = "La richiesta ha impiegato troppo tempo. Riprovare.";
                                                        else if(code=="storage/canceled")
                                                            message = "Operazione annullata.";
                                                        else if(code=="storage/cannot-slice-blob")
                                                            message = "Si è verificato un errore: il file locale è stato cambiato.";
                            
                                                        console.log("Errore caricamento immagine di galleria:"+code+","+e.code);
                                                        setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                                        setIsLoading(false);
                                                    })
    
                                            }).catch((e)=>{
                                                setIsLoading(false);
                                                console.log("Errore scaricamento immagine:"+e.code+","+e);
                                                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                            })
                                      }).catch((e)=>{
                                        setIsLoading(false);
                                        console.log("Errore scaricamento immagine:"+code+","+e.code);
                                        setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                                      })
                            }
                            else 
                                //se l'operazione è stata annullata
                                setIsLoading(false);
    
                            })}).catch((e)=>{
                    setIsLoading(false);
                    setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                    console.log("photo.js errore1:"+e);
                })
            }catch(e){
                setIsLoading(false);
                setSnackMessage("Si è verificato un problema. Riprova più tardi.");
                console.log("errore galleria:"+e);
            }

        }else {
            setSnackMessage("Attendi la fine del caricamento prima di procedere.");
            setIsLoading(false);
            closeDialog();
        }  
    }

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Profile</Text>
                <TouchableOpacity onPress={apriUserSettings} style={{position:"absolute", right:Dimensions.get("window").width*0.03}}>
                        <MaterialIcons name="menu" size={fontSizeTitoloBarra} color="#52575D" />
                </TouchableOpacity>
                <ActivityIndicator animating={isLoading} size={fontSizeTitoloBarra} color={MosCeleste} style={{position:"absolute", left:Dimensions.get("window").width*0.03}} />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start'}}>
                    
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={{uri:informazioniProfiloUtente.urlProfileImage}} resizeMode="cover"  style={styles.immagineProfilo}/>
                        </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* icona chat */}
                        <TouchableOpacity style={styles.modificaImmagineProfiloIcon} onPress={cambiaImmagineProfilo}>
                            <Entypo name="pencil" size={altezzaSezioneImmagineProfilo*0.1} color={MosCeleste} />
                        </TouchableOpacity>
                    </View>

                    {/* NOME */}
                    <View style = {styles.areaDettagliUtente}>
                        <Text style={styles.nome}>{informazioniProfiloUtente.name.charAt(0).toUpperCase()+informazioniProfiloUtente.name.slice(1)}</Text>
                    </View>

                {/*SEZIONE DELLA GALLERIA */}  
                    <View style={styles.sezioneGalleria}>

                        {/* GALLERIA */}

                        <GalleriaImmagini galleria={galleria} openDialog={openDialog} />

                        {/*Bottone aggiungi foto */}
                        <FAB
                                style={styles.bottoneAggiungiFoto}
                                small
                                icon="plus"
                                color={MosCeleste}
                                onPress={() => apriGalleria()}/>

                        {/*MOSTRA L'ERRORE */}
                        <Snackbar
                                    visible={snackMessage ? true : false}
                                    onDismiss={hideSnackMessage}
                                    duration= {5000}
                                    style={{elevation:12, zIndex:12}}
                                    action={{
                                    label: 'Chiudi',
                                    onPress: () => {
                                        // Do something
                                        hideSnackMessage();
                                    },
                                    }}>
                                    {snackMessage}
                        </Snackbar>

                        <Portal>
                            <Dialog visible={isDialogVisible} onDismiss={closeDialog}>
                                <Dialog.Title>Rimozione foto</Dialog.Title>
                                <Dialog.Content>
                                    <Text>Sei sicuro di volere eliminare la foto?</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button onPress={closeDialog} color={MosCeleste}>Annulla</Button>
                                    <Button onPress={eliminaImmagineDallaGalleria} color={MosViola}>Elimina</Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        
                    </View>

                </View>
                
</>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice,
    },
    barraSuperiore:{
        width:larghezzaDevice,
        height:altezzaBarraScreen,
        justifyContent:"center",
        paddingTop:24,
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
    nome:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreMediaProfilo:{
        paddingTop:10,
        alignItems:"center",
        justifyContent:"center",
        height: altezzaSezioneImmagineProfilo, //altezza sezione immagine profilo
        width: Dimensions.get("window").width,
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    contenitoreImmagineProfilo: {
        width: altezzaSezioneImmagineProfilo,
        height: altezzaSezioneImmagineProfilo,
        borderRadius: altezzaSezioneImmagineProfilo/2,
        overflow: "hidden",
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 4
            }
        })
    },
    onlineCircle: {
        backgroundColor: "#00ff40",
        elevation: 10,
        position: "absolute",
        left:(larghezzaSchermo/2)-altezzaSezioneImmagineProfilo/2*0.8071,
        top:(altezzaSezioneImmagineProfilo/2)+altezzaSezioneImmagineProfilo/2*0.6071,
        height:altezzaSezioneImmagineProfilo*0.1,
        width: altezzaSezioneImmagineProfilo*0.1,
        borderRadius:altezzaSezioneImmagineProfilo*0.1/2
    },
    //questa la lascio per poi utilizzarla quando si vuole mostrare il profilo dell'utente con cui si messaggia
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        left:(larghezzaSchermo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        top:(altezzaSezioneImmagineProfilo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        height:altezzaSezioneImmagineProfilo*0.2,
        width: altezzaSezioneImmagineProfilo*0.2,
        borderRadius:altezzaSezioneImmagineProfilo*0.2/2,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5
    },
    modificaImmagineProfiloIcon: {
        backgroundColor: "white",
        position: "absolute",
        left:(larghezzaSchermo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        top:(altezzaSezioneImmagineProfilo/2)+altezzaSezioneImmagineProfilo/2*0.5071,
        height:altezzaSezioneImmagineProfilo*0.2,
        width: altezzaSezioneImmagineProfilo*0.2,
        borderRadius:altezzaSezioneImmagineProfilo*0.2/2,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5
    },
    areaDettagliUtente: {
        alignSelf: "center",
        alignItems:"center",
        width:larghezzaSchermo,
        height: altezzaDettagliUtenti, //area dettagli utenti
        justifyContent:"center",
        alignItems:"center"
    },
    sezioneGalleria: {
        width:larghezzaSchermo,
        height:altezzaSezioneGalleria,  //sezione galleria
        justifyContent: 'center',
        alignItems:"center",
    },
    immagineGalleria: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreGalleria: {
        alignItems:"flex-end",
        justifyContent:"flex-end",
        flexGrow:1,
    },
    contenitoreFotoGalleria: {
        width:dimensioneFotoGalleria-5, 
        height:dimensioneFotoGalleria-5,
        borderRadius:(larghezzaSchermo/2-2.5)*10/200,
        overflow: "hidden",
        marginHorizontal:2.5
    },
    bottoneAggiungiFoto: {
        position: 'absolute',
        right: larghezzaSchermo*0.05,
        bottom:altezzaSezioneGalleria*0.05,
        backgroundColor:"white",
        ...Platform.select({
            android: {
                elevation:10
            }
        })
      },
      bottoneEliminaFoto: {
        position: 'absolute',
        right: 0,
        width:altezzaSezioneGalleria*0.1,
        height:altezzaSezioneGalleria*0.1,
        backgroundColor:"white",
        borderBottomLeftRadius:altezzaSezioneGalleria*0.1/2,
        justifyContent:"flex-end",
        alignItems:"flex-end",
        zIndex:10,
        ...Platform.select({
            android: {
                elevation:12
            }
        })
      }
  });