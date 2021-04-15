import React, {useState,useEffect,useContext, useRef} from "react";
import {View, Text,StyleSheet, FlatList,Animated, KeyboardAvoidingView,ScrollView, Dimensions} from "react-native";
import {Snackbar} from "react-native-paper";
import { ColoreBarraDiStato } from "../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../resources/colors";
import IndicatoreSlide from "./component/indicatore_slide";
import ProgressiveButton from "./component/progressive_button";
import SlidePage from "./component/slide_page";

import slider_data from './resources/slider_data';

export default function SliderNuovoUtente(){

    var coloreBarra = useContext(ColoreBarraDiStato)

    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const viewableItemsChanged = useRef(({viewableItems})=>{
        setCurrentIndex(viewableItems[0].index);
    }).current;
    const viewConfig = useRef({viewAreaCoveragePercentThreshold:50}).current;
    const slidesRef = useRef(null);

    //qui mantengo tutti i valori che mi servono per creare l'utente
    let name = useRef("");
    let dataDiNascita = useRef("");

    //funzioni per modificare i dati sopra
    function setName(nome){
        if(nome.length<3)
            setSnackError("Inserisci un nome almeno di 3 lettere");
        else
            name = nome;
        
        console.log("DATI UTENTE:"+name+","+dataDiNascita);
    }

    function setDataDiNascita(data){
        console.log("data di nascita settata: "+data);
        //l'oggetto data è di tipo Date
        const today = new Date();
        if(data.getFullYear()>today.getFullYear())
            setSnackError("Inserisci una data valida.");
        else if (Math.abs(today.getFullYear()- data.getFullYear()<14))
            setSnackError("Devi avere almeno 14 anni per usare Mosaic.");
        else
            dataDiNascita=data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
        
        console.log("DATI UTENTE:"+nome+","+dataDiNascita);

    }

    //per l'errore
    const [snackError, setSnackError] = useState(null);
    const hideSnackError = () => setSnackError(null);

    function scrollSlider(){
        if(currentIndex < slider_data.length-1){
            slidesRef.current.scrollToIndex({index: currentIndex+1});
        }else
            console.log("last item");
    }

    useEffect(()=>{
        coloreBarra.setColore(MosCeleste);
    },[])

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                keyboardVerticalOffset={20}
                behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
            <View style={{flex:3, justifyContent:"center", alignItems:"center"}} >
                <ScrollView>
                        <FlatList
                            data = {slider_data}
                            renderItem = {({item}) => 
                                                <SlidePage 
                                                    item={item} 
                                                    setNomeUtente={setName}
                                                    setDataUtente={setDataDiNascita}
                                                    setError = {setSnackError}
                                                />}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            keyExtractor={(item) => item.id}
                            
                            onScroll = {Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}],{
                                useNativeDriver: false
                            })}
                            onViewableItemsChanged={viewableItemsChanged}
                            viewabilityConfig={viewConfig}
                            ref={slidesRef}
                        />
                    <IndicatoreSlide data={slider_data} scrollX={scrollX}/> 
                    <ProgressiveButton  percentage={(currentIndex+1)*(100/slider_data.length)} scrollSlide={scrollSlider}/>

                    {/*MOSTRA L'ERRORE SE SI RIEMPIE UN CAMPO IN MODO ERRATO */}
                    <Snackbar
                        visible={snackError ? true : false}
                        onDismiss={hideSnackError}
                        duration= {5000}
                        action={{
                        label: 'Undo',
                        onPress: () => {
                            // Do something
                            hideSnackError();
                        },
                        }}>
                        {snackError}
                    </Snackbar>
                 
               </ScrollView>
            </View>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:MosCeleste
    }
})
