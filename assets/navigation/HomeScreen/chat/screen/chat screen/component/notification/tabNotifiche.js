import React,{ useImperativeHandle, forwardRef, useState,useRef, useEffect, useContext} from "react";
import { Dimensions,TouchableOpacity, View, StyleSheet, FlatList } from "react-native";
import { Modal, Portal, Text, Button, Provider , Divider} from 'react-native-paper';
import { AutenticazioneUtente } from "../../../../../../../context/firebase/autenticazione";
import localStorage from "../../../../../../../context/local_storage/localStorage";
import { altezzaDevice, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../../../../../resources/colors";
import NotificationMessageModel from "./notificationMessageModel";



var unsubscribe = null;
//tale contatore,se di valore N, indica che N sono le notifiche mostrate, dalla più recente alla meno. Utile per offset
var contatoreNumeroNotificheMostrate = 0;

/*
    IDEA: il numero delle notifiche viene memorizzato come preferenze (chiave: notification_number)
          Quando viene montato un altro componente, iconaNotifica, viene caricato tale numero.
          Ogni volta che arriva una nuova notifica, se la tab notifiche è chiusa, lo salvo con state 'unseen'
          e incremento la preferenza notification_number, altrimenti se l'utente sta appunto guardando le notifiche
          in diretta, se ne arriva una nel mentre la salvo solo come stato seen e stop, non incremento nulla.
          Quando l'utente apre la tab la flatlist renderizza ogni elemento. Ogni elemento viene gestito dal componente
          'notificationMessageModel' che nel suo useEffect se il suo stato è unseen lo aggiorna come seen e decrementa il
          numero della preferenza notification_number.

*/

const TabNotifiche = forwardRef((props, ref) => {

    const [visible, setVisible] = useState(false);
    const [list, setList] = useState([]);
    const listOfNotifications = useRef([]);
    const [isLoading, setIsLoading] = useState(false);
    const [forceToHideRedBallon, setForceToHideRedBallon] = useState(false);

    const {snackMessageRef, incrementaNumeroNotifiche, resettaNumeroNotifiche, decrementaNumeroNotifiche, setIsNotificationTabOpened} = props;

    //contesto autenticazione
    const {ottieniAscoltatoreNuoveNotifiche, user, removeNotification} = useContext(AutenticazioneUtente);

    async function apriTabNotifiche(){
        setForceToHideRedBallon(false);
        setVisible(true);
    }

    const hideModal = () => {
        setForceToHideRedBallon(true);
        setVisible(false);
    }
    const containerStyle = { backgroundColor: 'white',height:"100%", width:"100%",borderRadius:altezzaDevice*0.01};

     useImperativeHandle(ref, () => ({
        openCloseNotificationTab(){
            local_openCloseNotificationTab();
        }
     }));

     function local_openCloseNotificationTab(){
        if(visible==false)
            apriTabNotifiche();
        else
            hideModal();
     }

     function chiudiNotificaTab(){
         setIsNotificationTabOpened(false);
         hideModal();
     }

     //carica altre notifiche (non ancora mostrate) quando si preme il bottone "Mostra altre notifiche"
     async function mostraAltreNotifiche(){

        /*
            attualmente le notifiche mostrate sono contatoreNumeroNotificheMostrate. Per recuperare altre N,
            devo richiedere di ottenere altri N messaggi con offset di contatoreNumeroNotificheMostrate.
        */
            let listOfNotificationsResult = await localStorage.getListOfNotifications(user,contatoreNumeroNotificheMostrate);
            let listOfNotificationsResultArray = [...JSON.parse(listOfNotificationsResult)];
            listOfNotifications.current = [...listOfNotifications.current,...listOfNotificationsResultArray];
            setList([...list,...listOfNotificationsResultArray]);

            //aggiorno contatore
            contatoreNumeroNotificheMostrate = contatoreNumeroNotificheMostrate + listOfNotificationsResultArray.length;

     }

     //al caricamento, per prima cosa carico le vechie notifiche. Quando ho finito setto la variabile mettitiInAscolto cosi da far partire il secondo useEffect
     useEffect(()=>{

        async function init(){
            try{
                resettaNumeroNotifiche();
                console.log("creo tabella notifiche se non esiste");
                //da eliminare (entrambi)
                //await localStorage.removeTable(user+"_notifications");
                //await localStorage.savePreference(user,"notification_number","0");

                await localStorage.createNewTableForNotifications(user);
                await localStorage.createNewIndexForTableForNotifications(user);
                console.log("tabella e indice notifiche creati");

                //prelevo vecchie notifiche e inizializzo l'array listOfNotifications
                let listOfNotificationsResult = await localStorage.getListOfNotifications(user,0);
                //console.log("lista notifiche recuperate in locale:");
                //console.log(listOfNotificationsResult);
                let listOfNotificationsResultArray = [...JSON.parse(listOfNotificationsResult)];
                listOfNotifications.current = [...listOfNotificationsResultArray];
                setList([...listOfNotificationsResultArray]);
                //console.log("lista locale trasformata in array");
                //console.log(listOfNotificationsResultArray);

                //inizializzo il contatore per indicare quante notifiche sono mostrate
                contatoreNumeroNotificheMostrate = listOfNotificationsResultArray.length;

                //indico di mettersi in ascolto di nuove notifiche
                if(listOfNotificationsResultArray.length!=0)
                    mettitiInAscoltoNuoveNotifiche(listOfNotificationsResultArray[0].timestamp);
                else
                    mettitiInAscoltoNuoveNotifiche(-1);
            }catch(e){
                console.log(e);
               // snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un problema.");
            }
        }

        init();

        //rilascia listener
        return () => {
            if(unsubscribe!=null){
                console.log("rimuovo listener notifiche...");
                unsubscribe();
            }
        }

     },[])

     function mettitiInAscoltoNuoveNotifiche(lastStoredTimestamp){

        unsubscribe = null;
        console.log("mi metto in ascolto di nuove notifiche:"+lastStoredTimestamp);
        //passo all'ascoltatore l'ultimo timestamp ricevuto cosi da mettermi in ascolto su notifiche maggiori di quello
            unsubscribe = ottieniAscoltatoreNuoveNotifiche(lastStoredTimestamp)
                .onSnapshot(async(snapshot) => {

                    setIsLoading(true);
                    console.log("inizio notifiche");
                    let arrayTmp = [];
                    //NB: utilizzando for await invece di forEach mi metto in ascolto di un documento alla volta e per ognuno attendo determinate operazioni.
                    //    solo quando ho finito esco dal for
                    for await (let change of snapshot.docChanges()){
                                try{
                                    console.log("ascolto nuovo doc in notifiche");
                                    if (change.type != "added") 
                                        return;
                                    
                                    //se sono qui allora c'è una nuova notifica
                                    console.log("documento di notifica nuovo:");
                                    let doc = change.doc.data();
                                    //console.log(doc);
                                    doc.state = "unseen";
                                    
                                    //la elimino da remoto. Elimino tutte le notifiche con data inferiore o uguale al documento corrente
                                    await removeNotification(doc.timestamp);
                                    //la memorizzo
                                    console.log("Memorizzo"+doc.timestamp);
                                    //se lo schermo è visibile allora metto stato "seen", altrimenti "unseeen";
                                    await localStorage.storeNewNotification(user,doc.timestamp, doc.type,doc.author,visible==false?"unseen":"seen");
                                    //l'aggiungo all'array temporaneo
                                    doc.timestamp = doc.timestamp;
                                    arrayTmp.push(doc);
                                    //incremento contatore
                                    contatoreNumeroNotificheMostrate = contatoreNumeroNotificheMostrate + 1;
                                    //se lo schermo è visibile non incremento le notifiche, altrimenti si
                                    if(visible==false) {
                                        //incremento anche le notifiche in preferenza
                                        await incrementaNumeroNotifiche();
                                    }
                                    
                                }catch(e){
                                    console.log("errore durante la ricezione della notifica"+e);
                                    //snackMessageRef.current.setta_messaggio_da_mostrare("Si è verificato un errore.");
                                }
                                
                            }
                        //console.log("aggiorno notifiche");
                        //console.log(listOfNotifications.current);
                        //console.log(arrayTmp);
                        let lastListOfNotifications = [...listOfNotifications.current];
                        listOfNotifications.current = [ ...arrayTmp, ...listOfNotifications.current];
                         //aggiorno lo stato con l'array di notifiche prelevate
                        if(arrayTmp.length!=0)
                            setList([ ...arrayTmp, ...lastListOfNotifications]);
                        setIsLoading(false);

                        })
            }


     //console.log("LISTA NOTIFICHE");
     //console.log(list);

    return (
        <>
            
            <Provider>
                <Portal >
                    <Modal visible={visible} onDismiss={chiudiNotificaTab} contentContainerStyle={containerStyle} style={{height:altezzaDevice*0.7, margin:10, flex:1, alignItems:"flex-start"}} >
                        <View style={{flex:1, height:"100%"}}>

                            {/* TITOLO NOTIFICA */}
                            <View style={{flex:1/6, textAlign:"center", justifyContent:"center", backgroundColor:MosCeleste, borderTopLeftRadius:altezzaDevice*0.01, borderTopRightRadius:altezzaDevice*0.01}}>
                                <Text style={styles.titolo}>Notifiche</Text>
                            </View>
                            <Divider />

                            {/* LISTA NOTIFICHE*/}
                            <View style={{flex:1}}>
                                <FlatList
                                    data={list}
                                    horizontal={false}
                                    keyExtractor={item => item.timestamp.toString()}
                                    renderItem={({item})=>{return ( 
                                        <View style={{flex:1}}>
                                            <NotificationMessageModel item={item} forceToHideRedBallon={forceToHideRedBallon} user={user} decrementaNumeroNotifiche={decrementaNumeroNotifiche}/>
                                            <Divider /> 
                                        </View>
                                        ) }}
                                />
                               
                            </View>
                            <Divider />
                            {/* BOTTONE PER MOSTRARNE ANCORA*/}
                            <View style={{flex:1/6, textAlign:"center", justifyContent:"center", backgroundColor:"white", borderBottomLeftRadius:altezzaDevice*0.01, borderBottomRightRadius:altezzaDevice*0.01}}>
                                <TouchableOpacity onPress={mostraAltreNotifiche}>
                                    <Text style={styles.footer}>Mostra altre notifiche</Text>
                                </TouchableOpacity>
                            </View>
                            <Divider />
                        </View>
                    </Modal>
                </Portal>
            </Provider>
           
        </>
    )
}
)

export default TabNotifiche;

const styles = StyleSheet.create({
    titolo: {
        fontSize:fontSizeTitoloBarra*0.8,
        fontFamily: "Raleway_400Regular",
        color: "white",
        textAlign:"left",
        left:10,
        alignItems:"center",
        width:larghezzaDevice,
    },
    footer: {
        fontSize:fontSizeTitoloBarra*0.6,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice,
    }
});