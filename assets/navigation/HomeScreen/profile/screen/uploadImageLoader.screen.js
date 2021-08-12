/*
    Questa sezione fa quanto segue:
    1) viene chiamata di solito quando una immagine è stata caricata dal locale 
    2) chiama la cloud function "updateImage" per caricare l'immagine (le sue 5 versioni)
    3) ritorna un risultato (contenuto dentro result.data) del nome e dell'url dell'immagina a visibilità originale 
      (utile perchè quando la elimineremo dall'array su firestore, quest'ultimo non lavorerà con gli indici ma con i valori)
*/
import React,{useState, useContext, useEffect} from "react";
import {ImageBackground,Image,View, Text, StyleSheet, Dimensions, ActivityIndicator, Platform, BackHandler} from "react-native";
import {useFonts as useFonts2, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloBarra, fontSizeTitoloPiccolo } from "../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple } from "../../../../resources/colors";
import {LinearGradient} from "expo-linear-gradient";
import { AutenticazioneUtente } from "../../../../context/firebase/autenticazione";
import * as firebase from 'firebase';

export default function UploadImageLoader({navigation,route}){

    console.log(route.params);
    
    //contesto autenticazione
    var {caricaNuovaImmagine,setMessaggioAuth,getUtenteCorrente, informazioniProfiloUtente, setInformazioniProfiloUtente, eliminaImmagineDiProfilo} = useContext(AutenticazioneUtente);


    const [isLoading,setIsLoading]=useState(true);
    const [isImg1Visible,setIsImg1Visible] = useState(true);



    function caricaNuovaImmagineUtente(){
        console.log("Carico nuova immagine"+route.params.isProfileImage);
        //carico nuova immagine passandogli la base 64 dell'immagine e indicando se si tratta di una immagine di profilo o meno
        //nel caso si tratta di immagine di profilo il nome dell'immagine del profilo che passo è utile dopo
        //prendo il nome dell'immagine di profilo attuale (estraendola dall'url)
        //let nomeNuovaImmagine = (informazioniProfiloUtente.urlProfileImage).includes("profileImage1") ? "profileImage2" : "profileImage1";
        //se però non è di profilo allora le do come nome quello della data di oggi
        //if(route.params.isProfileImage==false) nomeNuovaImmagine = new Date().toISOString().replace(/ /g,"").replace(/[.]/g,":");
        caricaNuovaImmagine(route.params.base64,route.params.isProfileImage, route.params.nomeNuovaImmagine) 
          .then((result)=>{ 
            /*
              ritorna (dentro result.data):
                name: fileName,
                url_0: urls[0],
                url_25: urls[1],
                url_50: urls[2],
                url_75: urls[3],
                url_100: urls[4]
            */
            console.log("chiamata riuscita. Nuovo url generato:");
            console.log(result);
            if(route.params.isProfileImage==true){
              //aggiorno localmente l'immagine di profilo
              //elimino le vecchie copie
              eliminaImmagineDiProfilo((route.params.nomeNuovaImmagine=="profileImage1"?"profileImage2":"profileImage1"))
                .then((ris)=>{
                  console.log("tutte le vecchie versioni dell'immagine di profilo sono state eliminate");
                }).catch((e)=>{
                  console.log("non è stato possibile eliminare tutte le vecchie versioni dell'immagine di profilo: "+e);
                }).finally(()=>{
                  //aggiorno localmente. Elimino localmente le vecchie foto memorizzate
                  Promise.all([local_storage.removeImageLocally(getUtenteCorrente(),informazioniProfiloUtente.urlProfileImage.url_0),
                                       local_storage.removeImageLocally(getUtenteCorrente(),informazioniProfiloUtente.urlProfileImage.url_25),
                                       local_storage.removeImageLocally(getUtenteCorrente(),informazioniProfiloUtente.urlProfileImage.url_50),
                                       local_storage.removeImageLocally(getUtenteCorrente(),informazioniProfiloUtente.urlProfileImage.url_75),
                                       local_storage.removeImageLocally(getUtenteCorrente(),informazioniProfiloUtente.urlProfileImage.url_100)]).finally(()=>{
                    informazioniProfiloUtente.urlProfileImage = {url_0: result.data.url_0, url_25: result.data.url_25, url_50: result.data.url_50, url_75: result.data.url_75, url_100: result.data.url_100}; 
                    var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                    setInformazioniProfiloUtente(nuoveInformazioniProfilo); 
                    setMessaggioAuth("Immagine di profilo aggiornata.");
                  })
                })
              }else {
                console.log("Nuova immagine di galleria aggiunta");
               //aggiorno localmente l'immagine di galleria
                var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                console.log(nuoveInformazioniProfilo);
                //nuoveInformazioniProfilo.urlGalleryImages[result.data.name]=result.data.url;
                nuoveInformazioniProfilo.urlGalleryImages.push({name: result.data.name, url_0: result.data.url_0, url_25: result.data.url_25, url_50: result.data.url_50, url_75: result.data.url_75, url_100: result.data.url_100});
                console.log(nuoveInformazioniProfilo);
                setInformazioniProfiloUtente(nuoveInformazioniProfilo);
              }
                navigation.navigate({name:"ProfileScreen",params: {uploadImageMex: "Immagine caricata con successo."}, merge: true});
               //setMessaggioAuth("Immagine caricata con successo.");
               //navigation.setParams({uploadImageMex: "Immagine caricata con successo."});
          }).catch((e)=>{
            console.log("errore: chiamata non riuscita");
            console.log(e);
            //setMessaggioAuth("Si è verificato un problema. Riprova più tardi.");
            navigation.navigate({name:"ProfileScreen",params: {uploadImageMex: "Caricamento immagine fallito."}, merge: true});
          });//.finally(() => navigation.navigate("ProfileScreen"));

    }

    //detect quando preme il bottone indietro
    useEffect(()=>{
          const backAction = () => {
              return true;
            };
        
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        
            return () => backHandler.remove(); //rimuovo quando il componente viene smontato per evitare memory leak
      },[])

    let [Raleway2] = useFonts2({Raleway_200ExtraLight});
    if(!Raleway2)
        return <View></View>

    return (
        <View style={styles.container} >
            <View style={{height:Dimensions.get("window").height*0.3,alignItems:"center", justifyContent:"center"}}>
              <Text style={styles.titolo}>Il livello di dettaglio con cui gli altri potranno vederti dipenderà dallo stato della conversazione</Text>
            </View>
            <View style={styles.contenitoreImmagine}>
                {isImg1Visible==true && <Image source={{uri:route.params.uri}} resizeMode="cover" onLoadEnd={caricaNuovaImmagineUtente} style={styles.immagine1} />}
            </View>
            <View style={styles.areaLoading}>
              <ActivityIndicator animating={isLoading} size={fontSizeTitoloBarra} color={MosCeleste}/>
              <Text style={styles.titoloLoading}>Stiamo elaborando l'immagine per assicurarti il massimo della privacy...</Text>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1,
      width:Dimensions.get("window").width,
      position:"absolute",
      alignItems:"center"
    },
    titolo:{
      fontSize:fontSizeTitoloPiccolo,
      padding:20,
      zIndex:10,
      color:MosCeleste,
      fontFamily:"Raleway_200ExtraLight"
    },
    titoloLoading:{
      fontSize:fontSizeCampi,
      padding:20,
      zIndex:10,
      color:MosCeleste,
      fontFamily:"Raleway_200ExtraLight"
    },
    bottoneCarica:{
        fontSize:fontSizeCampi,
        padding:10,
        color:MosCeleste
      },
    contenitoreImmagine:{
      elevation:10,
      ...Platform.select({
        ios:{
            shadowOffset: { width: 3, height: 3 },
            shadowColor: 'black',
            shadowOpacity: 0.3
        }
    })
    },
    immagine1:{
      width: Dimensions.get("window").height*0.4,
      height: Dimensions.get("window").height*0.4,
      borderRadius:Dimensions.get("window").height*0.4,
      marginBottom:20,
    },
    areaLoading: {
      height: Dimensions.get("window").height*0.25, 
      justifyContent:"center"
    }
    
})