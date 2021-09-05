import React, {useContext, useEffect, useState} from 'react';
import {View,Text, Platform, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { AutenticazioneUtente } from '../../../context/firebase/autenticazione';
import { fontSizeSottoTitolo, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../resources/colors';
/*
export const DatePicker = ({setData, isVisible, setIsVisible}) => {

  var {informazioniProfiloUtente} = useContext(AutenticazioneUtente);

  const [date, setDataPickerDate] = useState(new Date()); //inizializzo sempre ad oggi
  const [stringData, setStringData] = useState("GG / MM / AAAA")
  const [mode, setMode] = useState('date');

  useEffect(()=>{

    console.log("Data di nascita:"+informazioniProfiloUtente.date_of_birth);
    setDataPickerDate(new Date(informazioniProfiloUtente.date_of_birth.seconds*1000));

  },[informazioniProfiloUtente.date_of_birth])

  console.log("apro datepicker"+isVisible);

  const onChange = (event, selectedDate) => {

    const currentDate = selectedDate || date;
    setIsVisible(Platform.OS === 'ios');
    //se ha premuto su ok
    if(event.type=="set"){
      //setDate(currentDate);
      const dataDiNascita = new Date(currentDate);
      setDataPickerDate(dataDiNascita);
      const str_dataDiNascita = dataDiNascita.getDate()+"/"+(dataDiNascita.getMonth()+1)+"/"+dataDiNascita.getFullYear();
      setStringData(str_dataDiNascita);
      console.log("set data to:"+dataDiNascita);
      setData(dataDiNascita);

    }
    
    setIsVisible(false);
   
    
  };

  const showMode = (currentMode) => {
   setIsVisible(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  //carico font
  let [Raleway] = useFonts({Raleway_200ExtraLight});
  if(!Raleway)
    return <View></View>

  return (
    <View>
      {isVisible==true && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          maximumDate={new Date()}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

import React, {useEffect, useState} from 'react';
import {View,Text, Platform, Button, StyleSheet, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { MosCeleste } from '../../../../resources/colors';
*/

export const DatePicker = ({setData, isVisible, setIsVisible}) => {
 
  var {informazioniProfiloUtente} = useContext(AutenticazioneUtente);

  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [stringData, setStringData] = useState("modifica data di nascita"); //valido solo per android


  useEffect(()=>{

    console.log("Data di nascita:"+informazioniProfiloUtente.date_of_birth);
    setDate(new Date(informazioniProfiloUtente.date_of_birth.seconds*1000));

  },[informazioniProfiloUtente.date_of_birth])

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    setData( new Date(currentDate));
    setIsVisible(false);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
    setIsVisible(true);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  return (
    <View style={{paddingLeft:Dimensions.get("window").width*0.06}}>
      <View style={{width:larghezzaDevice*0.7, marginBottom:5}}>
        <TouchableOpacity onPress={showDatepicker}>
          <Text style={{fontSize:fontSizeSottoTitolo*0.8, fontFamily:"Raleway_200ExtraLight", color:MosCeleste}}>{stringData}</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker2"
          value={date}
          mode={mode}
          maximumDate={new Date().setFullYear(new Date().getFullYear()-16)} //TODO inserire 18 se bisogna farlo per i maggiorenni
          minimumDate={new Date().setFullYear(new Date().getFullYear()-99)}
          style={{justifyContent:"center"}}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};
