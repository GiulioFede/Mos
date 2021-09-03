import React,{ useState, useRef} from 'react';
import { Text, View, StyleSheet, Platform,TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import CountryPicker, { getAllCountries, getCallingCode } from 'react-native-country-picker-modal';
import { MosPurple } from '../../../resources/colors';
import {List, Divider} from 'react-native-paper'
import { fontSizeTitolo, larghezzaDevice } from '../../../context/variabili_globali/variabiliGlobali';

export default function CountryCodePicker ({callingCode}) {

    const [selectedCountry, setSelectedCountry] = useState({"cca2":'IT', callingCode:[39]});

    console.log(callingCode.current);

    function getListOfCallingCodes(){
        
        //se i calling code sono uno solo allora seleziono quello
        if(selectedCountry.callingCode.length==1) callingCode.current = selectedCountry.callingCode[0];
        //se invece sono tanti metto a null l'ultimo callingCode cosi da permettergli di selezionarne uno
        else callingCode.current = null;

        return selectedCountry.callingCode.map((code, index)=>{
            return <TouchableOpacity onPress={()=>{callingCode.current = code; let sl = JSON.parse(JSON.stringify(selectedCountry)); sl.callingCode = [selectedCountry.callingCode[index]]; setSelectedCountry(sl)}}  
                                     key={index} style={{justifyContent:"center", alignItems:"center"}}>
                        <View style={{ backgroundColor:selectedCountry.callingCode.length>1?"rgba(1,1,1,0.1)":"#fff"}}>
                            <Text style={styles.code}>+{code}</Text>
                            {selectedCountry.callingCode.length>1 && <Divider style={{ width:fontSizeTitolo}}/>}
                        </View>
                    </TouchableOpacity>
        });
    }

    return (
      <View style={{flexDirection:"row", justifyContent:"center",}}>
      <View style={styles.container}>
        <CountryPicker
          withEmoji
          translation='eng'
          placeholder="+..."
          onSelect={(item) =>{setSelectedCountry(item)}}
          withModal
          withCountryNameButton
          countryCode={selectedCountry.cca2}
          //withCallingCodeButton={true}
        />    
      </View>
      <View style={styles.cca2}>
            {getListOfCallingCodes()}
        </View>
        <View style={styles.bar} />
    </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    marginLeft:10,
    width:fontSizeTitolo*1.2,
    height:fontSizeTitolo*1.2,
    borderRightColor:MosPurple,
    borderRightWidth:2,
    justifyContent:"center",
    alignItems:"center",
  },
  code:{
    height:fontSizeTitolo*1.2,
    padding:1,
    paddingHorizontal:5,
    textAlign:"center",
    textAlignVertical:"center",
    ...Platform.select({
        ios: {
            lineHeight: fontSizeTitolo*0.95
        }
    })
  },
  cca2:{
    
  },
  bar:{
    borderRightColor:MosPurple,
    borderRightWidth:2,
    height:fontSizeTitolo*1.2,
  }
});