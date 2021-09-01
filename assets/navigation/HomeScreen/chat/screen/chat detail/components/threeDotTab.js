import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text,View, TouchableOpacity,StyleSheet, Dimensions, Touchable } from "react-native";
import { Dialog, Portal, Button, Divider } from "react-native-paper";
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import Loading from "../../../../aroundYou/component/loading";



const ThreeDotTab = forwardRef((props, ref) => {

    const [visibile,setVisible] = useState(false);

    const {optionsDialogRef,contactName} = props;
   
    useImperativeHandle(ref, () => ({
      
        open_close_options_tab(){
            local_open_close_options_tab();
        },
       
    }));

    function local_open_close_options_tab(){
        setVisible(!visibile);
    }
    
   return (
    <>
    {visibile==true &&
    <View style={{backgroundColor:"rgba(0,0,0,0.4)", flex:1, position:"absolute", width:larghezzaDevice, height:altezzaDevice}}>
        <TouchableOpacity onPress={()=>{setVisible(false)}} style={{width:larghezzaDevice, height:altezzaDevice, position:"absolute"}}>
            <View />
        </TouchableOpacity>
        <View style={{flex:1, backgroundColor:"white", position:"absolute", top:altezzaBarraScreen,alignSelf:"flex-end", zIndex:10, right:Dimensions.get("window").width*0.03, elevation:10, padding:10, paddingVertical:20, borderRadius:10}}>
            <TouchableOpacity onPress={()=>{optionsDialogRef.current.open_dialog("Eliminazione conversazione", "Vuoi davvero eliminare la conversazione con "+contactName+"?",0)}}>
                <Text style={styles.itemMenu}>Elimina conversazione</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity onPress={()=>{optionsDialogRef.current.open_dialog("Blocca contatto", "Vuoi davvero bloccare "+contactName+"? L'intera conversazione verrà rimossa e "+contactName+" non potrà più contattarti fino a quando non sbloccherai il contatto.",1)}}>
                <Text style={styles.itemMenu}>Blocca utente</Text>
            </TouchableOpacity>
        </View>
    </View>
    }
    </>
   )
}
)

export default ThreeDotTab;

const styles = StyleSheet.create({
    itemMenu:{
        fontSize:fontSizeTitoloBarra*0.6,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        paddingVertical:10
    },
    
})