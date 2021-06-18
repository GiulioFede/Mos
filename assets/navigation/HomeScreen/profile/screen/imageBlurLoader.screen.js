/*
    Questa sezione fa quanto segue:
    1) viene chiamata di solito quando una immagine è stata caricata dal locale 
    2) mostra 5 immagini di quella appena caricata dal locale con differenti blur
    3) li carica su firebase
*/
import React,{useState, useContext, useEffect} from "react";
import {ImageBackground,Image,View, Text, StyleSheet, Dimensions, ActivityIndicator, Platform, BackHandler} from "react-native";
import {useFonts as useFonts2, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitolo, fontSizeTitoloBarra, fontSizeTitoloPiccolo } from "../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple } from "../../../../resources/colors";
import {LinearGradient} from "expo-linear-gradient";
import { AutenticazioneUtente } from "../../../../context/firebase/autenticazione";
import * as firebase from 'firebase';

export default function ImageBlurLoader({navigation,route}){

    console.log(route.params);
    
    //contesto autenticazione
    var {caricaNuovaImmagine,setMessaggioAuth, informazioniProfiloUtente, setInformazioniProfiloUtente, eliminaImmagineDiProfilo} = useContext(AutenticazioneUtente);


    const [isLoading,setIsLoading]=useState(true);
    const [isImg1Visible,setIsImg1Visible] = useState(true);



    function caricaNuovaImmagineUtente(){
        console.log("Carico nuova immagine"+route.params.isProfileImage);
        //carico nuova immagine passandogli la base 64 dell'immagine e indicando se si tratta di una immagine di profilo o meno
        //nel caso si tratta di immagine di profilo il nome dell'immagine del profilo che passo è utile dopo
        caricaNuovaImmagine(route.params.base64,route.params.isProfileImage, informazioniProfiloUtente.profileImageName) 
          .then((ris)=>{
            console.log("chiamata riuscita");
            console.log(ris);
            if(route.params.isProfileImage==true){
              //aggiorno localmente l'immagine di profilo
              informazioniProfiloUtente.urlProfileImage = route.params.uri;
              //elimino le vecchie copie
              eliminaImmagineDiProfilo(informazioniProfiloUtente.profileImageName)
                .then((ris)=>{
                  console.log("tutte le vecchie versioni dell'immagine di profilo sono state eliminate");
                }).catch((e)=>{
                  console.log("non è stato possibile eliminare tutte le vecchie versioni dell'immagine di profilo: "+e);
                }).finally(()=>{
                  //aggiorno localmente il nuovo nome
                  var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                  nuoveInformazioniProfilo.profileImageName = ris.data; //profileImage1 o profileImage2
                  setInformazioniProfiloUtente(nuoveInformazioniProfilo); 
                  setMessaggioAuth("Immagine di profilo aggiornata.");
                })
              }else {
               //aggiorno localmente l'immagine di galleria
                var nuoveInformazioniProfilo = JSON.parse(JSON.stringify(informazioniProfiloUtente));
                nuoveInformazioniProfilo.gallery.push(ris.data);
                nuoveInformazioniProfilo.urlGalleryImages.push(route.params.uri);
                setInformazioniProfiloUtente(nuoveInformazioniProfilo);
                   
               setMessaggioAuth("Immagine caricata con successo.");
            }
          }).catch((e)=>{
            console.log("errore: chiamata non riuscita");
            console.log(e);
            setMessaggioAuth("Si è verificato un problema. Riprova più tardi.");
          }).finally(() => navigation.navigate("ProfileScreen"));

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