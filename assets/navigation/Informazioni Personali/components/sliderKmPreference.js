import React, {useState, useEffect,useRef, useImperativeHandle, forwardRef,} from 'react';
import { Dimensions, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import localStorage from '../../../context/local_storage/localStorage';
import { MosCeleste, MosPurple, MosViola } from '../../../resources/colors';
import Slider from '@react-native-community/slider';
import { altezzaDevice, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';

const height = 200;
const SliderKMPreference = forwardRef((props, ref) => {

    const {currentUser, modificaPreferenzaRaggioDiAzione} = props;

    const [pos, setPos] = useState(0.375);
    const [startMarker, setStartMarker] = useState(0.375);
    const ultimoValoreSalvato = useRef(-1);

    useImperativeHandle(ref, () => ({
        async resetta(){
            await inizializzaSlider();
        }
        
     }));

     async function inizializzaSlider() {
        try{
            let val = await localStorage.readPreference(currentUser,"action_range");
            console.log("Il valore di preferenza del raggio di azione è:");
            console.log(val);
            //se è nullo allora si imposta di default a zero (25KM)
            if(val==null){
                setPos(1);
                setStartMarker(0);
            }else {
                if(val<=0.33) {
                    setPos(1);
                    val=0;
                }
                else if(val<=0.66){
                    setPos(2);
                    val=0.5;
                }
                else {
                    setPos(3);
                    val=1
                }
                setStartMarker(parseFloat(val));
                ultimoValoreSalvato.current = val;
            }
        }catch(e){
            console.log(e);
        }
    }

    useEffect(()=>{
        //al caricamento leggi le preferenze in locale
        inizializzaSlider();

    },[])

    return (
        <View style = {styles.container}>
            {/* SFONDO */}
            <View style={{ flexDirection:"row", flex:1}}>
                <View style={{ justifyContent:"center", flex: pos==1?2/4:2/8}}>
                    <Text style={pos==1?styles.active:styles.off}>25Km</Text>
                </View>
                <View style={{ justifyContent:"center", flex: pos==2?2/4:2/8}}>
                    <Text style={pos==2?styles.active:styles.off}>250Km</Text>
                </View>
                <View style={{ justifyContent:"center", flex: pos==3?2/4:2/8}}>
                    <Text style={pos==3?styles.active:styles.off}>1000Km</Text>
                </View>
                
            </View>
            <Slider
                value = {startMarker}
                onValueChange = {(t) =>{
                    if(t<=0.33) setPos(1);
                    else if(t<=0.66) setPos(2);
                    else setPos(3);
                    setStartMarker(t);
                    }}
                style={{flex:1, height:altezzaDevice*0.2, width:larghezzaDevice*0.8}}
                thumbTintColor={MosViola}
                //aggiorna l'audio quando l'utente va avanti con lo slider
                onSlidingComplete={()=>{modificaPreferenzaRaggioDiAzione(ultimoValoreSalvato.current,startMarker)}} //NB: questo metodo non significa "quando lo slider arrivato alla fine", ma quando, muovendo lo slider manualmente, lo rilascio
                maximumTrackTintColor={MosCeleste}
                minimumTrackTintColor={MosCeleste}
            />
        </View>
    )
})

export default SliderKMPreference;


const styles = StyleSheet.create({
    container: {
      height:100
    },
    active: {
        fontFamily: "Raleway_400Regular",
        color: MosViola,
        fontSize:Dimensions.get("window").width*0.8*0.08
    },
    off: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:Dimensions.get("window").width*0.8*0.03
    }
});