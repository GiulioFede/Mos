import React, {useState, memo, useEffect, useContext, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Platform, FlatList} from 'react-native';
import {MaterialIcons, Ionicons, Entypo} from "@expo/vector-icons";
import {navbarHeight, fontSizeTitolo, larghezzaDevice } from '../../../../../context/variabili_globali/variabiliGlobali';
import { FAB, Snackbar, ActivityIndicator, Divider } from 'react-native-paper';
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import { AutenticazioneUtente } from '../../../../../context/firebase/autenticazione';
import local_storage from "../../../../../context/local_storage/localStorage";


const larghezzaSchermo = Dimensions.get("window").width;
const altezzaSezioneGalleria = Dimensions.get("window").height*0.47-navbarHeight;
const dimensioneFotoGalleria = (larghezzaSchermo/2>altezzaSezioneGalleria) ? (altezzaSezioneGalleria): (larghezzaSchermo/2);

function GalleriaImmagini({galleria, openDialog, getUtenteCorrente, visibility}){

        //contesto autenticazione
        const {scaricaUrlImmagine} = useContext(AutenticazioneUtente);

    //console.log("GALLERIA COMPONENTE");
    //console.log(galleria);

        //Questa funzione renderizza ogni singola immagine della flatlist (galleria)
       function ImmagineGalleria({item}){
          // console.log("renderizzo item di galleria");
            //console.log(item);

            /*
                Esempio struttura di item galleria:

                Object {
                    "key": 0,
                    "name": "2021-08-10T07:42:23:333Z",
                    "urls": Object {
                        "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z?alt=media&token=fcb7581b-0feb-4edb-bee4-1e6fbc91cf2f",
                        "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_100?alt=media&token=2cc1e97a-6747-4ee9-ab4d-225598950933",
                        "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_25?alt=media&token=acbedbc0-d8bf-4104-a63b-0281d6d7f525",
                        "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_50?alt=media&token=18e69acc-f5f8-4b1a-8e71-1212ecc6e3fa",
                        "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2021-08-10T07%3A42%3A23%3A333Z_75?alt=media&token=dd079c57-d70f-4dbc-86b9-8cf616e5c344",
                    },
                    }

            */
            
            //se l'immagine viene scaricata e visualizzata allora faccio spuntare il bottone per eliminarla
            const [isImageLoaded, setIsImageLoaded] = useState(false);
            const [error, setError] = useState(false);
            const [localUri, setLocalUri] = useState("url_0");
            const isMounted = useRef(false);

            //ogni volta che nella galleria principale si cambierà visibility allora chiamerò lo use effect
            useEffect(()=>{

                const getLocalUri = async() =>{
                    let actual_remote_uri = "";
                    if(visibility=="0") actual_remote_uri = item.urls.url_0;
                    else if(visibility=="25") actual_remote_uri = item.urls.url_25;
                    else if(visibility=="50") actual_remote_uri = item.urls.url_50;
                    else if(visibility=="75") actual_remote_uri = item.urls.url_75;
                    else if(visibility=="100") actual_remote_uri = item.urls.url_100;

                    try{
                        let local_uri = await local_storage.saveImageLocally(getUtenteCorrente(),actual_remote_uri);
                        console.log("Local uri:"+local_uri);
                        if(isMounted.current==true){
                            setLocalUri(local_uri);
                            setIsImageLoaded(true);
                        }
                    }catch(e){
                        if(isMounted.current==true)
                            setError(true);
                        console.log("eccezione galleria: "+e);
                    }

                }

                getLocalUri();

            },[visibility])

            useEffect(()=>{
                isMounted.current=true;

                return ()=> isMounted.current=false;
            })

            return  (
                <View style={styles.contenitoreFotoGalleria}>
                    {isImageLoaded && 
                    <TouchableOpacity style={styles.bottoneEliminaFoto} onPress={()=>{openDialog(item.name)}}>
                        <Entypo name="cross" size={20} color={MosViola} />
                    </TouchableOpacity>
                    }
                    <ActivityIndicator animating={!isImageLoaded} color={MosCeleste} style={{position:"absolute", right:0, left:0, top:0, bottom:0}} />
                    {isImageLoaded==true && error == false && <Image source={{uri:localUri}} style={styles.immagineGalleria} 
                                                onLoad={()=>{setIsImageLoaded(true)}} resizeMode="cover" 
                                                onError={(e) => {setError(true); setIsImageLoaded(true)}}/>}
                    {error==true && <Text style={{position:"absolute", textAlign:"center", textAlignVertical:"center", top:"40%"}}>Non è stato possibile recuperare l'immagine.</Text>}
                 </View>
            )
            
        }

    return (
        <View>
        <FlatList
            data={galleria}
            //contentContainerStyle={{alignItems:'center', justifyContent:"center"}}
            //horizontal={false}
            numColumns={3}
            ItemSeparatorComponent={()=><Divider/>}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.key.toString()}
            renderItem={({ item }) => <ImmagineGalleria item={item} visibility={visibility}/>}
        />
        </View>
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
        
    },
    contenitoreFotoGalleria: {
        width:larghezzaDevice/3, 
        height:larghezzaDevice/3,
        borderColor:"white",
        borderWidth:1
        //overflow: "hidden",
        //marginHorizontal:2.5
    },
    bottoneEliminaFoto: {
        position: 'absolute',
        right: 0,
        width:20,
        height:20,
        backgroundColor:"white",
        borderBottomLeftRadius:10,
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