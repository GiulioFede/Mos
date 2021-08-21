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
import local_storage from '../context/local_storage/localStorage';
import * as FileSystem from 'expo-file-system';
import { getAgeFromTimestamp } from '../context/utilities/functions.utilities';


const Drawer = createDrawerNavigator();

/*QUESTO E' IL CUORE DELL'APP: La Home Navigator definisce due sezioni:
    1) Home: sarebbe la parte centrale dell'app: chat, around you e profile.
    2) Varie sezioni: Account...

    Quella di default è la Home. In qualsiasi delle sue tre schermate è possibile aprire il menu laterale e accedere alla seconda
    parte dell'app (es. Account).
*/

export default function HomeNavigator({navigation}) {

    //contesto
    const {getUserInformation, getUtenteCorrente,user, logOut,scaricaUrlImmagine, setInformazioniProfiloUtente, updateAge, getListOfConversations, setListOfConversations, getAllMediaOfCurrentUser} = useContext(AutenticazioneUtente);

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
          /*
          ottiene i dati dell'utente nel formato (dentro .data):
              - dateOfBirth
              - name
              - position
              - sex
              - sexPreference
         */
      getUserInformation(uid)
        .then((info)=>{
            console.log("info ottenute");
            if (info.exists) {
              console.log("Home: informazioni utente recuperate");
              console.log(info.data());
              //creo variabile info_utente in cui inserirò tutto come unico documento (informazioni base profilo + url media)
              const info_utente = info.data();
              
              getAllMediaOfCurrentUser().then((media)=>{
             // getMediaProfiloUtente()
               // .then((media)=>{
                  console.log("media ottenuti");
                  info_utente.urlGalleryImages = media.gallery;
                  info_utente.urlProfileImage = media.profileImageUrl;
                  console.log("info complete utente:");
                  console.log(info_utente);

                                      /*
                ottengo il documento delle informazioni sulle conversazioni nel formato:
                        {
                          conversations: [
                              0: {
                                  chatId: "AHNCDJ..."
                                  uid: "YSTRN..."
                              },
                              1: {
                                  chatId: "BHNCDJ..."
                                  uid: "ZSTRN..."
                              }
                          ]
                      }
               */
                  getListOfConversations()
                  .then((chats)=>{
                    try{
                      console.log("Prelevo informazioni chat utente:");
                      if(chats.exists)
                        setListOfConversations(chats.data())
                      console.log(chats.data())

                      //controllo che l'età attuale sia uguale a quella memorizzata. Se diversa la aggiorno e se 
                      //dovessi fallire carico comunque il profilo. E' una inconsistenza comunque non grave
                      if(getAgeFromTimestamp(info_utente.date_of_birth) == info_utente.age){
                        console.log("età consistente");
                        //info contiene le info dell'utente
                        setInformazioniProfiloUtente(info_utente);
                        setIsProfileLoading(false);
                      }
                      else {
                        console.log("età inconsistente. Necessita di aggiornamento");
                        updateAge(getAgeFromTimestamp(info_utente.date_of_birth)).
                          then((ris)=>{
                            console.log("età aggiornata con successo.");
                            info_utente.age = getAgeFromTimestamp(info_utente.date_of_birth);
                          }).finally((f)=>{
                            //info contiene le info dell'utente
                            setInformazioniProfiloUtente(info_utente);
                            setIsProfileLoading(false);
                          })
                      }
                  }catch(e){
                    console.log("E' avvenuto un errore. Carico comunque il profilo:"+e);
                    setIsProfileLoading(false);
                  }

                  }).catch((err)=>{
                    console.log("Errore durante il recupero delle informazioni sulla chat dell'utente:"+err);
                  })
                }).catch((err)=>{
                  console.log("Navigation.home.js: Si è verificato un problema durante il download dei media dell'utente:"+err)
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
  