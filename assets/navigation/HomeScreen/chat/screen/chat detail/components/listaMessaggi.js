import React,{useEffect, useState, useContext, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Keyboard,KeyboardAvoidingView, TextInput, FlatList, BackHandler} from "react-native"
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, fontSizeCampi, fontSizeTitoloBarra, larghezzaDevice } from "../../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste } from "../../../../../../resources/colors";
import MessageModel from "./messageModel";
import AudioModel from "./audioModel";


const ListaMessaggi = ({lista_messaggi, refFlatList, caricaSuccessivi10Messaggi, getUtenteCorrente, setSnackBarMessage, rowsToUpdate}) => {

    console.log("Lista messaggi");
    console.log(lista_messaggi);
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
            renderItem={({ item }) => {
                //se l'elemento ha lo stato da aggiornare, lo modifico
                if(rowsToUpdate[item.row]!=undefined){
                    if(rowsToUpdate[item.row]=="succeed") item.state = "succeed";
                    else if(rowsToUpdate[item.row]=="failed") item.state = "failed";
                }
                if(item.type=="mex")
                    return <MessageModel messaggio = {item} utenteCorrente={getUtenteCorrente()}/>
                else if(item.type=="audio")
                    return <AudioModel messaggio = {item} utenteCorrente={getUtenteCorrente()} mostraMessaggioErrore={setSnackBarMessage}/>
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