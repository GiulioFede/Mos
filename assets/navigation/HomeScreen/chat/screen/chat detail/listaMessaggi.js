import React, {useState, memo} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Ionicons, Entypo} from "@expo/vector-icons";
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import { larghezzaDevice, navbarHeight } from '../../../../../context/variabili_globali/variabiliGlobali';
import TextMessageModel from './components/textMessageModel';
import MessageModel from './components/messageModel';



const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.47-navbarHeight;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

function ListaMessaggi({lista}){

    console.log("GALLERIA COMPONENTE");

        //Questa funzione renderizza ogni singola immagine della flatlist (galleria)
       function Messaggio({item}){

            //se l'immagine viene scaricata e visualizzata allora faccio spuntare il bottone per eliminarla
            const [isImageLoaded, setIsImageLoaded] = useState(false);
            return  (
                <View style={{width:larghezzaDevice,alignItems:"flex-end"}}>
                    <TextMessageModel messaggio="hey ciao!" />
                 </View>
            )
        }


    return (
        <FlatList
            data={lista}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <MessageModel item={item}/>}
        />
    )
  }

  //questa funzione serve per dire quando renderizzare GalleriaImmagini
  function compareFunction(prevProps, nextProps){
      console.log("COMPARO PER RENDERING");
      console.log(prevProps);
      console.log(nextProps);
    if(prevProps.lista!=nextProps.lista)
        return false; //renderizza  
    
    return true; //altrimenti non renderizzare
  }

export default memo(ListaMessaggi,compareFunction);

const styles = StyleSheet.create({  
    immagineGalleria: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreFotoGalleria: {
        width:dimensioneFotoGalleria-5, 
        height:dimensioneFotoGalleria-5,
        borderRadius:(larghezzaSchermo/2-2.5)*10/200,
        overflow: "hidden",
        marginHorizontal:2.5
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