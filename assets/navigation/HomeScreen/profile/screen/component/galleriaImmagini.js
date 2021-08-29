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

    console.log("GALLERIA COMPONENTE");
    console.log(galleria);

        //Questa funzione renderizza ogni singola immagine della flatlist (galleria)
       function ImmagineGalleria({item, index}){
            //console.log("renderizzo item di galleria:"+index);
            //console.log(item);

            /*
                Esempio struttura di item galleria: NB: index (argomento sopra) è l'indice dell'array dentro cui si trova

                Object {
                    "name": "0",
                    "url_0": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0?alt=media&token=2d34475c-1f41-4e49-bbba-3159a5b487f7",
                    "url_100": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_100?alt=media&token=73c5d130-0ff9-4b98-851f-4b6beb256842",
                    "url_25": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_25?alt=media&token=4e35c4a0-bf98-4937-95b8-cf0b86cc37f1",
                    "url_50": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_50?alt=media&token=23f08d55-4ff1-45a7-b696-cfb5b2100094",
                    "url_75": "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F0_75?alt=media&token=80a85840-bd69-46e6-a9e2-010022f88f85",
                },

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
                    if(visibility=="0") actual_remote_uri = item.url_0;
                    else if(visibility=="25") actual_remote_uri = item.url_25;
                    else if(visibility=="50") actual_remote_uri = item.url_50;
                    else if(visibility=="75") actual_remote_uri = item.url_75;
                    else if(visibility=="100") actual_remote_uri = item.url_100;

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
                    <TouchableOpacity style={styles.bottoneEliminaFoto} onPress={()=>{openDialog(index)}}>
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
            horizontal={true}
            ItemSeparatorComponent={()=><Divider/>}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.name.toString()}
            renderItem={({ item, index }) => <ImmagineGalleria item={item} visibility={visibility} index={index}/>}
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
        width:larghezzaDevice*0.5, 
        height:larghezzaDevice*0.5,
        borderRadius:larghezzaDevice*0.5/2*0.2,
        padding:1,
        borderColor:"white",
        borderWidth:1,
        overflow: "hidden",
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