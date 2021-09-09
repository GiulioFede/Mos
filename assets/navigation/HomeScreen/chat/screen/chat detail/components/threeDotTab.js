import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text,View, TouchableOpacity,StyleSheet, Dimensions, Touchable } from "react-native";
import { Dialog, Portal, Button, Divider } from "react-native-paper";
import { altezzaBarraScreen, altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import Loading from "../../../../aroundYou/component/loading";
import i18n from 'i18n-js'


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
            <TouchableOpacity onPress={()=>{optionsDialogRef.current.open_dialog(i18n.t('threeDotRemoveConversation'), i18n.t('threeDotRemoveConversationSubTitle')+contactName+"?",0)}}>
                <Text style={styles.itemMenu}>{i18n.t('threeDotRemoveConversation')}</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity onPress={()=>{optionsDialogRef.current.open_dialog(i18n.t('threeDotBlockUser'), i18n.t('threeDotBlockUserSubTitle_pt1')+contactName+i18n.t('threeDotBlockUserSubTitle_pt2')+contactName+i18n.t('threeDotBlockUserSubTitle_pt3'),1)}}>
                <Text style={styles.itemMenu}>{i18n.t('threeDotBlockUser')}</Text>
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