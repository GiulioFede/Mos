import AsyncStorage from "@react-native-async-storage/async-storage";
import React,{ useImperativeHandle, forwardRef, useState, useContext, useEffect} from "react";
import { Dimensions,TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text, Button, Provider } from 'react-native-paper';
import { AutenticazioneUtente } from "../../../../../../../context/firebase/autenticazione";
import localStorage from "../../../../../../../context/local_storage/localStorage";
import { fontSizeTitoloBarra } from "../../../../../../../context/variabili_globali/variabiliGlobali";


var numeroNotifiche = 0;
const IconaNotifiche = forwardRef((props, ref) => {

    //contesto autenticazione
    const {user} = useContext(AutenticazioneUtente);

    const [notificationNumber, setNotificationNumber] = useState(0);
    
     useImperativeHandle(ref, () => ({
       
        async increment_notification_number(){
            await local_increment_notification_number();
        }
        ,
        reset_notification_number(){
            local_reset_notification_number();
        }
        ,
        async decrement_notification_number(){
            await local_decrement_notification_number();
        }
        
     }));

     async function local_increment_notification_number(){
         console.log("incremento numero notifiche:"+numeroNotifiche);
         numeroNotifiche = numeroNotifiche + 1;
         await localStorage.savePreference(user,"notification_number",numeroNotifiche.toString());
         setNotificationNumber(numeroNotifiche);
     }

     function local_reset_notification_number(){
         numeroNotifiche = 0;
         setNotificationNumber(0);
     }

     async function local_decrement_notification_number(){
         numeroNotifiche = numeroNotifiche<=1?0:(numeroNotifiche-1); //per evitare (per qualche ragione) notifiche negative
         await localStorage.savePreference(user,"notification_number",numeroNotifiche.toString());
         setNotificationNumber(numeroNotifiche);
     }

     function getNumberOfNotifications(){
         if(notificationNumber<10)
            return notificationNumber;
        else
            return "+9";
     }

     console.log("NOTIFICATION NUMBER");
     console.log(notificationNumber);

     //al suo montaggio controllo la variabile di preferenza notification_number e inizializzo a quel numero la view
     useEffect(()=>{

        async function init(){
            let n = await AsyncStorage.getItem(user+"_notification_number");
            if(n==null){
                numeroNotifiche = 0;
                setNotificationNumber(0);
            }else {
                numeroNotifiche = parseInt(n);
                setNotificationNumber(parseInt(n));
            }
        }

        init();
     },[])
    

    return (
        <>
        {notificationNumber>0 && 
            <View style={{position:"absolute", justifyContent:"center",top:2, left:Dimensions.get("window").width*0.05+fontSizeTitoloBarra/2, backgroundColor:"red", width:fontSizeTitoloBarra, height:fontSizeTitoloBarra, borderRadius:fontSizeTitoloBarra/2}}>
                <Text style={{textAlign:"center", color:"white", fontSize:fontSizeTitoloBarra*0.5}}>{getNumberOfNotifications()}</Text>
            </View>
            }
        </>
    )
}
)

export default IconaNotifiche;