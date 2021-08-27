import React,{useEffect, useState, useContext, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Keyboard,KeyboardAvoidingView, TextInput, FlatList, BackHandler} from "react-native"
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../../../../resources/colors";
import MessageModel from "./messageModel";
import AudioModel from "./audioModel";
import { RowsOfMessagesToUpdate } from "../../context/chatContext";

const ListaMessaggi = ({lista_messaggi, refFlatList, caricaSuccessivi10Messaggi, getUtenteCorrente, setSnackBarMessage, contactUid, ultimaData}) => {

    
    const {updates} = useContext(RowsOfMessagesToUpdate);
    console.log("LISTA MESSAGGI________________________________________________(lunghezza):"+lista_messaggi.lenght);
    return (
        <View style={styles.areaMessaggi}>
           <FlatList
            ref={refFlatList} 
            inverted={true}
            data={lista_messaggi}
            onEndReachedThreshold={0.1}
            onEndReached={()=>{console.log("lista caricata"); caricaSuccessivi10Messaggi();}} //quando si raggiunge il top si caricano i successivi 10 mex
            horizontal={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.row.toString()}
            renderItem={({ item, index }) => {   
                //console.log("rendering messaggio:"+index); 
                if(index==0) ultimaData = null;
                //se esiste un aggiornamento per quella chat di id contactUid...
                if(updates[contactUid]!=undefined){
                    //console.log("esiste un aggiornamento");
                    //se esiste un aggiornamento per questo item
                    if(updates[contactUid][item.row]!=undefined){
                        //console.log("è per "+item.row);
                        if(updates[contactUid][item.row]=="succeed") item.state = "succeed";
                        else if(updates[contactUid][item.row]=="failed") item.state = "failed";
                        //elimino aggiornamento
                        delete updates[contactUid][item.row];
                    }
                }
                //NB: la flatlist renderizza da sotto (più recenti) a sopra (più vecchi)
                let dataAttuale = new Date(item.date).setHours(0,0,0,0);
                let dataPrecedente = null;
                //se esiste un successivo
                if(lista_messaggi[index+1]) dataPrecedente = new Date(lista_messaggi[index+1].date).setHours(0,0,0,0);
                //console.log("data attuale"+item.date);
                if(dataPrecedente!=null){
                    //console.log("data precedente"+lista_messaggi[index+1].date);
                }
                else{
                    //console.log("data precedente null");
                }
                if(dataPrecedente==null || dataPrecedente<dataAttuale){
                        //console.log("dentro");
                        if(item.type=="mex")
                            return (
                                    <MessageModel messaggio = {item} utenteCorrente={getUtenteCorrente()} mostraNuovaData={true}/>
                            )
                        else if(item.type=="audio")
                            return (
                                    <AudioModel messaggio = {item} utenteCorrente={getUtenteCorrente()} mostraMessaggioErrore={setSnackBarMessage} mostraNuovaData={true}/>
                            )
                    }
                    else {
                    //console.log("fuori");
                        if(item.type=="mex")
                            return (
                                    <MessageModel messaggio = {item} utenteCorrente={getUtenteCorrente()} mostraNuovaData={false}/>
                            )
                        else if(item.type=="audio")
                            return (
                                    <AudioModel messaggio = {item} utenteCorrente={getUtenteCorrente()} mostraMessaggioErrore={setSnackBarMessage} mostraNuovaData={false}/>
                            )
                    }
                }}
            />
        </View>
    )
}

export default ListaMessaggi;

const styles = StyleSheet.create({
    areaMessaggi: {
        flex:1,
        backgroundColor:"#fff",
    },

})