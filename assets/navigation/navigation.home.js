import React, {useContext, useEffect, useState} from 'react';
import {Text, View, StyleSheet } from 'react-native';
import {DrawerActions, NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import HomeScreen from './HomeScreen/homeScreen';
import { AutenticazioneUtente } from '../context/firebase/autenticazione';
import InformazioniPersonali from './Informazioni Personali/informazioniPersonali';
import { altezzaDevice, larghezzaDevice } from '../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../resources/colors';



const Drawer = createDrawerNavigator();

/*QUESTO E' IL CUORE DELL'APP: La Home Navigator definisce due sezioni:
    1) Home: sarebbe la parte centrale dell'app: chat, around you e profile.
    2) Varie sezioni: Account...

    Quella di default è la Home. In qualsiasi delle sue tre schermate è possibile aprire il menu laterale e accedere alla seconda
    parte dell'app (es. Account).
*/

export default function HomeNavigator({navigation}) {

    //contesto
    const {getUserInformation, getUtenteCorrente,user, logOut,scaricaUrlImmagine, setInformazioniProfiloUtente} = useContext(AutenticazioneUtente);

    //se true indica che il profilo non è stato ancora caricato
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    //simulo la Promise.allSettled che da problemi ma è vitale in questo caso
    //raccoglie tutti gli url delle immagini di galleria e di profilo dell'utente. I risultati errati verranno marchiati come
    //status di tipo "rejected" altrimenti come "fulfilled" e in value di trovo l'url.
    Promise.myAllSettled = promises =>
    Promise.all(
      promises.map((promise, i) =>
        promise
          .then(value => ({
            status: "fulfilled",
            value,
          }))
          .catch(reason => ({
            status: "rejected",
            reason,
          }))
      )
    );


    function AltriPulsanti(props) {
      return (
        <DrawerContentScrollView {...props}>
           {/*inserisco prima gli Screen definiti nel Drawer.Navigator*/}
          <DrawerItemList {...props} /> 
          {/*aggiungo il bottone di logOut*/}
          <DrawerItem label="Logout" onPress={() => {logOut().then((ok)=>navigation.navigate("LoginScreen")).catch((e)=>{console.log("errore al logout"); navigation.navigate("LoginScreen")});navigation.dispatch(DrawerActions.closeDrawer());}} /> 
        </DrawerContentScrollView>
      );
    }

    //all'avvio carico il profilo utente
    useEffect(()=>{
      try{
        //ottengo utente
        console.log("carico profilo utente");
        let uid = getUtenteCorrente();
        //ottengo informazioni profilo
        if(uid){
          getUserInformation(uid)
            .then((info)=>{
                console.log("ottengo info");
                //console.log(info);
                if (info.exists) {
                  console.log("Home: informazioni utente recuperate");
                  console.log(info.data());
                  const info_utente = info.data();

                  const promisesUrlImages = [];
                  if(info.data.gallery){
                    for(let i=0; i<info.data().gallery.length; i++){
                        promisesUrlImages.push(scaricaUrlImmagine(info.data().gallery[i]));
                    }
                  }
                  //aggiungo alla promise anche di scaricare l'immagine del profilo
                  promisesUrlImages.push(scaricaUrlImmagine(info.data().profileImageName));

                    //scarico gli url delle immagini
                    Promise.myAllSettled(promisesUrlImages)
                      .then((url_list)=>{
                        var arrayUrl = new Array(url_list.length);
                        console.log("tutti gli url sono stati scaricati");
                        for(var i=0; i<url_list.length; i++){
                          console.log(url_list[i].status);
                          if(url_list[i].status=="rejected")
                            arrayUrl[i]="null";
                          else
                            arrayUrl[i]=url_list[i].value;
                        }
                        //l'ultimo url è quello del profilo
                        console.log(arrayUrl);
                        var urlProfilo = arrayUrl.pop();
                        info_utente.urlGalleryImages = arrayUrl;
                        info_utente.urlProfileImage = urlProfilo;
                        console.log("di seguito le informazioni complete inizializzate dell'utente");
                        console.log(info_utente);
                      }).catch((e)=>{
                        //di norma non si va mai al catch con promise alSettled ma siccome è una implementazione personale è meglio prevedere tale casistica
                        console.log("è avvenuto un problema nello scaricare tutti gli url");
                        console.log(e);
                        var arrayUrl = new Array(promisesUrlImages.length).fill("null");
                        info_utente.urlGalleryImages = arrayUrl;
                        info_utente.urlProfileImage = "null";
                      }).finally(()=>{
                        //info contiene le info dell'utente
                        setInformazioniProfiloUtente(info_utente);
                        setIsProfileLoading(false);
                      })
              
                    
                } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
                }
            }).catch((e)=>{
              console.log("Navigation.home.js: Si è verificato un problema durante il recupero delle info dell'utente")
              console.log(e);
            })
        }
      }catch(e){
        console.log("si è verificato un errore:"+e);
      }
    },[user])

    //se il profilo sta ancora caricando...
    if(isProfileLoading){
      return (
        <View style={styles.loadingArea}>
           <ActivityIndicator animating={true} color={MosCeleste} />
        </View>
      )
    }
    //altrimenti se il caricamento è completato...
  else return (
      <Drawer.Navigator initialRouteName="Home" drawerContent={props => <AltriPulsanti {...props} />} >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Informazioni Personali" component={InformazioniPersonali} />
       
      </Drawer.Navigator>
  );
}

//-------------------



const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    loadingArea: {
      width: larghezzaDevice,
      height: altezzaDevice,
      justifyContent:"center",
      alignItems:"center"
    }
  });
  