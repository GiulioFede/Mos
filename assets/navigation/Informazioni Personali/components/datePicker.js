import React, {useContext, useEffect, useState} from 'react';
import {View,Text, Platform, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { AutenticazioneUtente } from '../../../context/firebase/autenticazione';
import { fontSizeSottoTitolo, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../resources/colors';
import i18n from 'i18n-js';


export const DatePicker = ({setData, isVisible, setIsVisible}) => {
 
  var {informazioniProfiloUtente} = useContext(AutenticazioneUtente);

  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [stringData, setStringData] = useState(i18n.t('modifyDateOfBirth')); //valido solo per android


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
