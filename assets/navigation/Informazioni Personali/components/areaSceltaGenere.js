import React, {useEffect} from 'react';
import { Dimensions, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import { altezzaDevice, fontSizeCampi } from '../../../context/variabili_globali/variabiliGlobali';
import { MosPurple } from '../../../resources/colors';

const AreaSceltaGenere = (props) => {
  const [visible, setVisible] = React.useState(false);

  const hideDialog = () => props.setApriArea(false);

  function setGender(gender){
    console.log("genere:"+gender);
    props.setIdentitaDiGenere(gender);
    hideDialog();
  }

  useEffect(()=>{
    setVisible(props.apriArea);
  },[props.apriArea])

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.ScrollArea>
            <View style={{height:altezzaDevice*0.6, paddingVertical:20, justifyContent:"center",alignItems:"center"}}>
          <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} showsVerticalScrollIndicator={false}>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("maschio")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Maschio</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("femmina")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Femmina</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("agender")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Agender</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("androgino")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Androgino</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("terzo genere")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Terzo genere</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("intergender")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Intergender</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("bigender")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Bigender</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("trigender")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Trigender</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("pangender")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Pangender</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("genderfluid")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Genderfluid</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("genderflux")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Genderflux</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("transexual")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Transessuale</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("demi boy")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Demi boy</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("demi girl")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Demi girl</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("demi androgino")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Demi androgino</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("demi fluid")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Demi fluid</Text>
          </TouchableOpacity>
          <TouchableOpacity color={MosPurple} onPress={()=>{setGender("demi flux")}}>
              <Text style={[styles.sottoCampo,{textAlign:"center", justifyContent:"center", color:MosPurple}]}>Demi flux</Text>
          </TouchableOpacity>
          </ScrollView>
          </View>
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>
  );
};

export default AreaSceltaGenere;

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      height: Dimensions.get("window").height,
      flex:1
    },
    sottoCampo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeCampi*1.2,
        paddingTop:30
    },
})