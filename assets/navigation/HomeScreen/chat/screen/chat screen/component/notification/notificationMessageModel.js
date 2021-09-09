
// Import react
import React, { useState, useEffect, useRef } from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text
} from 'react-native'
import localStorage from '../../../../../../../context/local_storage/localStorage';
import { fromDateToGGMMYYYYHHMM } from '../../../../../../../context/utilities/functions.utilities';
import { fontSizeSottoTitolo, larghezzaDevice } from '../../../../../../../context/variabili_globali/variabiliGlobali';
import { MosPurple, MosViola } from '../../../../../../../resources/colors';
import i18n from 'i18n-js'

/*
Questa funzione ritorna, dato un item json del genere:
    {
        "author": "Teresa",
        "id": 0,
        "state": "unseen",
        "timestamp": "26=09/2021",
        "type": "JOIN"
    }
un messaggio (es. Teresa ha avviato una conversazione con te).
*/
function getNotificationStringFromJSON(item){
    if(item.type=="JOIN"){
        return i18n.t('join');
    }
    else if(item.type=="UPGRADE_VISIBILITY"){
        return i18n.t('upgradeVisibility');
    }
    else if(item.type=="NO_UPGRADE_VISIBILITY"){
        return  i18n.t('noUpgradeVisibility');
    }
    else if(item.type=="TOTAL_DISCLOSURE"){
        return i18n.t('totalDisclosure');
    }
    else if(item.type=="YOUR_CHAT_REMOVAL"){
        return i18n.t('yourChatRemoval');
    }
    else if(item.type=="CHAT_REMOVAL"){
        return i18n.t('chatRemoval');
    }
    else if(item.type=="YOUR_CHAT_BLOCKER"){
        return i18n.t('yourChatBlocked');
    }
    else if(item.type=="CHAT_BLOCKED"){
        return i18n.t('chatBlocked_pt1')+item.author+i18n.t('chatBlocked_pt2')
    }
}

export default function NotificationMessageModel({user, item, decrementaNumeroNotifiche, forceToHideRedBallon}){

    const [showRedBallon, setShowRedBallon] = useState(false);

    const isMounted = useRef(false);

    //all'inizio, controllo se lo stato è 'unseen'. Se è cosi lo aggiorno a seen
    useEffect(()=>{
        async function init(){
            if(item.state=='unseen'){
                //anche se aggiorno lo stato, mostro il pallino rosso ad indicare una nuova notifica. Tanto al successivo reload verrà resettata
                if(isMounted.current==true)
                    setShowRedBallon(true);
                //aggiorno stato
                await localStorage.updateNotificationState(user, item.timestamp);
                //decremento numero notifiche visuali
                await decrementaNumeroNotifiche();
                item.state = 'seen';
            }
        }

        init();

        return ()=>{
            console.log("chiudo");
            if(isMounted.current==true)
                setShowRedBallon(false);
        }
    },[])

    useEffect(()=>{
        isMounted.current = true;

        return () => isMounted.current = false;
    },[])
   

    return (
            <View style={styles.container}>
                <View style={{flexDirection:"row", alignSelf:"flex-end", padding:1, margin:2, alignItems:"center"}}>
                    {showRedBallon==true && <View style={{marginRight:5, width:fontSizeSottoTitolo*0.5, height:fontSizeSottoTitolo*0.5, borderRadius:fontSizeSottoTitolo*0.5, backgroundColor:"red"}} />}
                    <Text style={styles.timestamp}>{fromDateToGGMMYYYYHHMM(item.timestamp)}</Text>
                </View>
                <View style={{borderLeftColor:MosViola, borderLeftWidth:3, margin:1, padding:5}} >
                    {item.type=="JOIN" && <Text style={styles.author}>{item.author}<Text style={styles.type}>{getNotificationStringFromJSON(item)}</Text></Text> }
                    {item.type=="UPGRADE_VISIBILITY" && <Text style={styles.type}>{i18n.t('congratulations')}<Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
                    {item.type=="NO_UPGRADE_VISIBILITY" && <Text style={styles.type}>{i18n.t('maybeIsToEarly')}<Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
                    {item.type=="TOTAL_DISCLOSURE" && <Text style={styles.type}>{i18n.t('congratulations')}<Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
                    {item.type=="YOUR_CHAT_REMOVAL" && <Text style={styles.type}>{getNotificationStringFromJSON(item)}<Text style={styles.author}>{item.author}</Text>.</Text>}
                    {item.type=="CHAT_REMOVAL" && <Text style={styles.author}>{item.author}<Text style={styles.type}>{getNotificationStringFromJSON(item)}</Text></Text> }
                    {item.type=="YOUR_CHAT_BLOCKER" && <Text style={styles.type}>{getNotificationStringFromJSON(item)}<Text style={styles.author}>{item.author}</Text>.</Text>}
                    {item.type=="CHAT_BLOCKED" && <Text style={styles.author}>{item.author}<Text style={styles.type}>{getNotificationStringFromJSON(item)}</Text></Text> }
                </View>
            </View>
        )
    }


const styles = StyleSheet.create({  
    container:{
        margin:10,
        maxWidth:larghezzaDevice,
    },
    author: {
        fontFamily: "Raleway_400Regular",
        color:MosPurple,
        fontSize:fontSizeSottoTitolo*0.8
    },
    type: {
        fontFamily: "Raleway_200ExtraLight",
        color:"#444",
        fontSize:fontSizeSottoTitolo*0.8,
    },
    timestamp: {
        fontFamily: "Raleway_200ExtraLight",
        color:"#444",
        fontSize:fontSizeSottoTitolo*0.6,
        textAlign:"right"
    }
  });
