import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text,View, TouchableOpacity,StyleSheet } from "react-native";
import { Dialog, Portal, Button, Divider } from "react-native-paper";
import { altezzaBarraScreen, fontSizeTitoloBarra } from "../../../../../../context/variabili_globali/variabiliGlobali";
import Loading from "../../../../aroundYou/component/loading";



const ThreeDotTab = forwardRef((props, ref) => {

    const [visibile,setVisible] = useState(false);
    const [isLoading,setIsLoading] = useState(false);

    const {removeCurrentConversation} = props;
   
    useImperativeHandle(ref, () => ({
      
        open_close_options_tab(){
            local_open_close_options_tab();
        },
        show_loading(){
            local_show_loading();
        }
       
    }));

    function local_open_close_options_tab(){
        setVisible(!visibile);
    }

    function local_show_loading(val){
        setIsLoading(val);
    }
    
   return (
    <>
    {visibile==true &&
    <View style={{flex:1, backgroundColor:"white", position:"absolute", top:altezzaBarraScreen,alignSelf:"flex-end", marginRight:10,zIndex:10, elevation:10, padding:10, paddingVertical:20}}>
        <TouchableOpacity onPress={()=>{setIsLoading(true); removeCurrentConversation()}}>
            <Text style={styles.itemMenu}>Elimina conversazione</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity>
            <Text style={styles.itemMenu}>Blocca utente</Text>
        </TouchableOpacity>
    </View>
    }
    {isLoading==true &&
        <Loading />
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