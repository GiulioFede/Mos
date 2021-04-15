import React, {useEffect, useState} from 'react';
import {View,Text, Platform, TouchableOpacity, Touchable} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fontSizeCampi, fontSizeTitoloPiccolo } from '../../../../context/variabili_globali/variabiliGlobali';

export const DatePicker = ({setData}) => {
  const [date, setDataPickerDate] = useState(new Date()); //inizializzo sempre ad oggi
  const [stringData, setStringData] = useState("GG / MM / AAAA")
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    //setDate(currentDate);
    const dataDiNascita = new Date(currentDate);
    setDataPickerDate(dataDiNascita);
    const str_dataDiNascita = dataDiNascita.getDate()+"/"+(dataDiNascita.getMonth()+1)+"/"+dataDiNascita.getFullYear();
    setStringData(str_dataDiNascita);
    setData(dataDiNascita);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  return (
    <View>
      <View>
          <TouchableOpacity onPress={showDatepicker} >
              <Text style={{fontSize:fontSizeTitoloPiccolo, color:"white"}}> 
                {stringData}
              </Text>
          </TouchableOpacity>
        
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};