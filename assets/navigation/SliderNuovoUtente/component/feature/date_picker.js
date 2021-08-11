import React, {useEffect, useState} from 'react';
import {View,Text, Platform, TouchableOpacity, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fontSizeCampi, fontSizeSottoTitolo, fontSizeTitoloPiccolo } from '../../../../context/variabili_globali/variabiliGlobali';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import { MosCeleste } from '../../../../resources/colors';

export const DatePicker = ({setData}) => {
  const [date, setDataPickerDate] = useState(new Date()); //inizializzo sempre ad oggi
  const [stringData, setStringData] = useState("GG / MM / AAAA")
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {

    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    //se ha premuto su ok
    if(event.type=="set"){
      //setDate(currentDate);
      const dataDiNascita = new Date(currentDate);
      setDataPickerDate(dataDiNascita);
      const str_dataDiNascita = dataDiNascita.getDate()+"/"+(dataDiNascita.getMonth()+1)+"/"+dataDiNascita.getFullYear();
      setStringData(str_dataDiNascita);
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
  }
})