
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
        return " ha avviato una nuova conversazione con te.";
    }
    else if(item.type=="UPGRADE_VISIBILITY"){
        return " siete entrambi daccordo per passare al livello successivo!.";
    }
    else if(item.type=="NO_UPGRADE_VISIBILITY"){
        return ". Continuate a conoscervi un altro pò."
    }
    else if(item.type=="TOTAL_DISCLOSURE"){
        return " avete raggiunto il massimo della visibilità!."
    }
    else if(item.type=="YOUR_CHAT_REMOVAL"){
        return "Hai rimosso la conversazione con "
    }
    else if(item.type=="CHAT_REMOVAL"){
        return " ha rimosso la conversazione."
    }
    else if(item.type=="YOUR_CHAT_BLOCKER"){
        return "Hai bloccato "
    }
    else if(item.type=="CHAT_BLOCKED"){
        return " ti ha bloccato. Non potrai più conversare con "+item.author+" fino a quando non ti avrà sbloccato."
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
                    {item.type=="UPGRADE_VISIBILITY" && <Text style={styles.type}>Congratulazioni! Tu e <Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
                    {item.type=="NO_UPGRADE_VISIBILITY" && <Text style={styles.type}>Forse è troppo presto per te e <Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
                    {item.type=="TOTAL_DISCLOSURE" && <Text style={styles.type}>Congratulazioni! Tu e <Text style={styles.author}>{item.author}</Text>{getNotificationStringFromJSON(item)}</Text>}
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
