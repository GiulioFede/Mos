import React, {useContext, useEffect, useState} from 'react';
import {View,Text, Platform, TouchableOpacity, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { AutenticazioneUtente } from '../../../context/firebase/autenticazione';

export const DatePicker = ({setData, isVisible, setIsVisible}) => {

  var {informazioniProfiloUtente} = useContext(AutenticazioneUtente);

  const [date, setDataPickerDate] = useState(new Date()); //inizializzo sempre ad oggi
  const [stringData, setStringData] = useState("GG / MM / AAAA")
  const [mode, setMode] = useState('date');

  useEffect(()=>{

    console.log("Data di nascita:"+informazioniProfiloUtente.date_of_birth);
    setDataPickerDate(new Date(informazioniProfiloUtente.date_of_birth));

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
