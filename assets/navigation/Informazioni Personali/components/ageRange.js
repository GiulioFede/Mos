import React, {useState, useCallback, useEffect,useRef, useImperativeHandle, forwardRef,} from 'react';
import { Dimensions, ScrollView, TouchableOpacity, StyleSheet, View, FlatList, TextInput } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import localStorage from '../../../context/local_storage/localStorage';
import { MosCeleste, MosPurple, MosViola } from '../../../resources/colors';
import Slider from '@react-native-community/slider';
import { altezzaDevice, fontSizeCampi, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';
import { LinearGradient } from "expo-linear-gradient";
import { getAgeFromTimestamp } from '../../../context/utilities/functions.utilities';



const AgeRange = forwardRef((props, ref) => {

    const {uid, dateOfBirth, modificaPreferenzaRangeDiEta} = props;

    

    useImperativeHandle(ref, () => ({
        async resetta(){
            await inizializzaRange();
        }
        
     }));

     async function inizializzaRange() {
        try{
            let val = await localStorage.readPreference(uid,"age_range");
            console.log("Il valore di preferenza del range di età è:"); //nella forma "minima, massima"
            console.log(val);
            /*
                se è nullo allora si imposta di default è [etàUtente-5, etàUtente+5] se l'utente ha l'età compresa
                tra 23 e 84 (altrimenti va fuori range)
            */
          
            if(val==null){
                let age = getAgeFromTimestamp(dateOfBirth);
                console.log("eta corrente user: "+age);
                setMinima(age.toString());
                if(age<=94)
                    setMassima((age+5).toString());
                else
                    setMassima(age.toString());
                
            }else {
                val = val.split(","); //[0] conterrà eta minima, [1] la massima
                setMinima(val[0]);
                setMassima(val[1]);
                
            }
        }catch(e){
            console.log(e);
        }finally{
            setError1(false);
            setError2(false);
        }
    }

    useEffect(()=>{
        //al caricamento leggi le preferenze in locale
            inizializzaRange();

    },[])

    const [minima, setMinima] = useState("18");  
    const [massima, setMassima] = useState("18");
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);

    return (
        <View style = {styles.container}>
            <Text style={styles.title}>min: </Text>
            <View style={{ backgroundColor:error1==false?"rgba(245, 245, 245,0.7)":"rgba(255,0,0,0.1)"}}>
                <TextInput
                    value={minima}
                    onChangeText={(val)=>{
                        let num = val.replace(/\D/g,'');
                        if(!isNaN(num)){
                            setMinima(num.trim());
                        }
                    }}
                    style={error1==false?styles.active:styles.error}
                    onFocus={()=>{console.log("focus")}}
                    onBlur={()=>{
                        if(parseInt(minima)<18 || parseInt(minima)>=100){ //100 per sicurezza anche se la maxLenght=2 lo rende impossibile come evento
                            setError1(true);
                        }else {
                            setError1(false);
                            setMassima((parseInt(minima)+5).toString())
                            setError2(false);
                            if(parseInt(minima)>=18 && parseInt(minima)<100 && parseInt(massima)>=parseInt(minima) && parseInt(massima)<=parseInt(minima)+9 && error1==false && error2==false)
                                modificaPreferenzaRangeDiEta(minima, massima);
                        }
                    }}
                    onSubmitEditing={()=>{
                        if(parseInt(minima)<18 || parseInt(minima)>=100){ //100 per sicurezza anche se la maxLenght=2 lo rende impossibile come evento
                            setError1(true);
                        }else {
                            setError1(false);
                            setMassima((parseInt(minima)+5).toString())
                            setError2(false);
                            if(parseInt(minima)>=18 && parseInt(minima)<100 && parseInt(massima)>=parseInt(minima) && parseInt(massima)<=parseInt(minima)+9 && error1==false && error2==false)
                                modificaPreferenzaRangeDiEta(minima, massima);
                        }
                    }}
                    underlineColorAndroid='transparent'
                    keyboardType="numeric"
                    maxLength={2}
                />
                
            </View>
            <Text style={styles.title}>max: </Text>
            <View style={{ backgroundColor:error2==false?"rgba(245, 245, 245,0.7)":"rgba(255,0,0,0.1)"}}>
                <TextInput
                    value={massima}
                    onChangeText={(val)=>{
                        let num = val.replace(/\D/g,'');
                        if(!isNaN(num)){
                            setMassima(num.trim());
                        }
                    }}
                    style={error2==false?styles.active:styles.error}
                    onFocus={()=>{console.log("focus")}}
                    onBlur={()=>{
                        if(parseInt(massima)<18 || parseInt(massima)>=100 || (parseInt(massima)<parseInt(minima) || parseInt(massima)>(parseInt(minima)+9))){ //100 per sicurezza anche se la maxLenght=2 lo rende impossibile come evento
                            setError2(true);
                        }else
                            setError2(false);
                        if(parseInt(minima)>=18 && parseInt(minima)<100 && parseInt(massima)>=parseInt(minima) && parseInt(massima)<=parseInt(minima)+9 && error1==false && error2==false)
                            modificaPreferenzaRangeDiEta(minima, massima);
                    }}
                    onSubmitEditing={()=>{
                        if(parseInt(massima)<18 || parseInt(massima)>=100 || (parseInt(massima)<parseInt(minima) || parseInt(massima)>(parseInt(minima)+9))){ //100 per sicurezza anche se la maxLenght=2 lo rende impossibile come evento
                            setError2(true);
                        }else
                            setError2(false);
                        if(parseInt(minima)>=18 && parseInt(minima)<100 && parseInt(massima)>=parseInt(minima) && parseInt(massima)<=parseInt(minima)+9 && error1==false && error2==false)
                            modificaPreferenzaRangeDiEta(minima, massima);
                    }}
                    underlineColorAndroid='transparent'
                    keyboardType="numeric"
                    maxLength={2}
                />
                
            </View>
        </View>
    )
})

export default AgeRange;


const styles = StyleSheet.create({
    container: {
      flexDirection:"row"
    },
    minima_massima: {
        fontFamily: "Raleway_400Regular",
        color: MosViola,
        fontSize:Dimensions.get("window").width*0.8*0.1,
        padding:5,
        margin:3,
        borderColor:MosViola,
        borderBottomWidth:2
    },
    active: {
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:Dimensions.get("window").width*0.8*0.08,
        padding:5,
        margin:3,
        borderColor:"#52575D",
        
        borderBottomWidth:1
    },
    error: {
        fontFamily: "Raleway_400Regular",
        color: "red",
        fontSize:Dimensions.get("window").width*0.8*0.08,
        padding:5,
        margin:3,
        borderColor:"red",
        
        borderBottomWidth:1
    },
    off: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:Dimensions.get("window").width*0.8*0.03
    },
    title: {
        fontFamily: "Raleway_200ExtraLight",
        color: MosViola,
        fontSize:fontSizeCampi*1.3,
        textAlignVertical:"center",
        paddingLeft:Dimensions.get("window").width*0.06,
        marginTop:5
    }
});