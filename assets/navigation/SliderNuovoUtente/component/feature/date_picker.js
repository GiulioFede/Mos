import React, {useEffect, useState} from 'react';
import {View,Text, Platform, Button, StyleSheet, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { MosCeleste } from '../../../../resources/colors';

export const DatePicker = ({setData}) => {
 /* const [date, setDataPickerDate] = useState(new Date()); //inizializzo sempre ad oggi
  const [stringData, setStringData] = useState("GG / MM / AAAA")
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    console.log("cambiata");
    console.log(selectedDate);
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    //se ha premuto su ok (su android)
    if(event.type=="set" || Platform.OS === 'ios'){
      //setDate(currentDate);
      const dataDiNascita = new Date(currentDate);
      setDataPickerDate(dataDiNascita);
      const str_dataDiNascita = dataDiNascita.getDate()+"/"+(dataDiNascita.getMonth()+1)+"/"+dataDiNascita.getFullYear();
      if(Platform.OS === 'android') setStringData(dataDiNascita);
      setData(dataDiNascita);
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
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
      <View>
          <TouchableOpacity onPress={showDatepicker} >
              <Text style={styles.data}> 
                {stringData}
              </Text>
          </TouchableOpacity>
        
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
         // minimumDate TODO DA METTERE
          maximumDate={new Date()}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  data: {
    fontSize:fontSizeSottoTitolo,
    fontFamily: "Raleway_200ExtraLight",
    color: MosCeleste,
    textAlign:"center"
  }
})*/
const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [stringData, setStringData] = useState("imposta data"); //valido solo per android

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    if(Platform.OS === 'android'){
      const str_dataDiNascita = currentDate.getDate()+"/"+(currentDate.getMonth()+1)+"/"+currentDate.getFullYear();
      setStringData(str_dataDiNascita);
    }
    setData( new Date(currentDate));
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View style={{alignContent:"center"}}>
      <View style={{width:larghezzaDevice*0.7, marginBottom:5}}>
        <TouchableOpacity onPress={showDatepicker}>
          <Text style={{fontSize:fontSizeSottoTitolo*0.8, textAlign:"center",fontFamily:"Raleway_200ExtraLight", color:MosCeleste}}>{stringData}</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
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