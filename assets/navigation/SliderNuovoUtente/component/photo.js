import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import { fontSizeCampi } from "../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../resources/colors";
import * as ImagePicker from 'expo-image-picker'; //installa expo install expo-image-picker
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import i18n from 'i18n-js'

export default function PhotoManager({setErrore, setUriUtente}){


    //::::::::::::: PER LA GALLERIA ::::::::::::::::::: //

    function apriGalleria(){

        //chiedo permessi
        try{
        ImagePicker.requestMediaLibraryPermissionsAsync(false)
            .then((ris)=>{
                console.log("photo.js risultato1");
                console.log(ris);
                //se ha bloccato la possibilità di chiedere i permessi
                if(ris.canAskAgain==false){
                    setErrore(i18n.t('galleryPermissions1'));
                    return;
                }
                //se non ha bloccato, ma ha rifiutato di concedere i permessi
                if(ris.status!="granted"){
                    setErrore(i18n.t('galleryPermissions2'));
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
                            //prendo l'uri e lo uso per settare l'immagine
                            console.log(ris.uri);
                            setUriUtente(ris.uri);
                        }
                    }).catch((e)=>{
                        setErrore(i18n.t('err_generic'));
                        console.log("photo.js errore1:"+e);
                    })

            }).catch((e)=>{
                setErrore(i18n.t('err_generic'));
                console.log("photo.js errore1:"+e);
            });
        }catch(e){
            setErrore(i18n.t('err_generic'));
            console.log("photo.js errore1:"+e);
        }
    }


    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway2)
            return <View></View>

    //:::::::::::::: PER LA CAMERA :::::::::::::::::::: // 

    function apriCamera(){
        console.log("apro camera");
        ImagePicker.requestCameraPermissionsAsync()
            .then((ris)=>{
                console.log(ris);
                //se non è stato concesso il permesso
                //se ha bloccato la possibilità di chiedere i permessi
                if(ris.canAskAgain==false){
                    setErrore(i18n.t('galleryPermissions1'));
                    return;
                }
                //se non ha bloccato, ma ha rifiutato di concedere i permessi
                if(ris.status!="granted"){
                    setErrore(i18n.t('galleryPermissions2'));
                    return;
                }
                //chiedi anche permessi per l'archivio
                ImagePicker.requestMediaLibraryPermissionsAsync(false)
                .then((ris)=>{
                    console.log("photo.js risultato1");
                    console.log(ris);
                    //se ha bloccato la possibilità di chiedere i permessi
                    if(ris.canAskAgain==false){
                        setErrore(i18n.t('galleryPermissions1'));
                        return;
                    }
                    //se non ha bloccato, ma ha rifiutato di concedere i permessi
                    if(ris.status!="granted"){
                        setErrore(i18n.t('galleryPermissions2'));
                        return;
                    }
                    //se sono qui allora i permessi sono stati dati
                    ImagePicker.launchCameraAsync({
                                                    mediaTypes: ImagePicker.MediaTypeOptions.Images, //permetto solo di fare foto
                                                    allowsEditing: true, //apro un editor col quale edito la foto
                                                    aspect: [4, 4], //l'editor permette solo un crop quadrato
                                                    quality: 1,
                            }).then((ris)=>{
                                console.log(ris);
                                //se l'operazione non è stata cancellata
                                if(!ris.cancelled){
                                    setUriUtente(ris.uri);
                                }

                            }).catch((e)=>{
                                setErrore(i18n.t('err_generic'));
                                console.log("photo.js errore1:"+e);
                            })
                        }).catch((e)=>{
                            setErrore(i18n.t('err_generic'));
                            console.log("photo.js errore1:"+e);
                        })
            }).catch((e)=>{
                setErrore(i18n.t('err_generic'));
                console.log("photo.js errore1:"+e);
            })
    }

    return (
        <View>
            <TouchableOpacity onPress={apriCamera}>
                <View style={{backgroundColor:MosCeleste, borderRadius:20,marginBottom:10}}><Text style={[styles.campiDaCompilare,{color:"white", padding:10,textAlign:"center"}]}>{i18n.t('takeAPhoto')}</Text></View>
            </TouchableOpacity>


            <TouchableOpacity onPress={apriGalleria} >
                <View style={{backgroundColor:MosCeleste, borderRadius:20}}><Text style={[styles.campiDaCompilare,{color:"white", padding:10, borderRadius:20, textAlign:"center"}]}>{i18n.t('chooseFromGallery')}</Text></View>
            </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
    campiDaCompilare: {
        fontSize:fontSizeCampi,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
    }
})