import React, {useState, memo, useEffect, useContext, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Ionicons, Entypo} from "@expo/vector-icons";
import {navbarHeight, fontSizeTitolo } from '../../../../../context/variabili_globali/variabiliGlobali';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button } from 'react-native-paper';
import CachedImage from 'react-native-expo-cached-image'; //installa yarn add react-native-expo-cached-image
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import { AutenticazioneUtente } from '../../../../../context/firebase/autenticazione';


const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.47-navbarHeight;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

function GalleriaImmagini({galleria, openDialog}){

        //contesto autenticazione
        const {scaricaUrlImmagine} = useContext(AutenticazioneUtente);

    console.log("GALLERIA COMPONENTE");
    console.log(galleria);

        //Questa funzione renderizza ogni singola immagine della flatlist (galleria)
       function ImmagineGalleria({item}){

            //se l'immagine viene scaricata e visualizzata allora faccio spuntare il bottone per eliminarla
            const [isImageLoaded, setIsImageLoaded] = useState( (item.url!="null")?false:true );

            return  (
                <View style={styles.contenitoreFotoGalleria}>
                   
                    {isImageLoaded && 
                    <TouchableOpacity style={styles.bottoneEliminaFoto} onPress={()=>{openDialog(galleria.findIndex(p => p.url == item.url))}}>
                        <Entypo name="cross" size={altezzaSezioneGalleria*0.1} color={MosViola} />
                    </TouchableOpacity>
                    }
                    <ActivityIndicator animating={!isImageLoaded} color={MosCeleste} style={{position:"absolute", right:0, left:0, top:0, bottom:0}} />
                    {item.url!="null" && <Image source={{uri:item.url}} style={styles.immagineGalleria} onLoad={()=>{setIsImageLoaded(true)}} resizeMode="cover" /> }
                    {item.url=="null" && <Text style={{position:"absolute", textAlign:"center", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                 </View>
            )
        }


    return (
        <FlatList
            data={galleria}
            contentContainerStyle={{alignItems:'center', justifyContent:"center"}}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.key.toString()}
            renderItem={({ item }) => <ImmagineGalleria item={item}/>}
        />
    )
  }

  //questa funzione serve per dire quando renderizzare GalleriaImmagini
  function compareFunction(prevProps, nextProps){
      console.log("COMPARO PER RENDERING");
    if(prevProps.galleria!=nextProps.galleria)
        return false; //renderizza  
    
    return true; //altrimenti non renderizzare
  }

export default memo(GalleriaImmagini,compareFunction);

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