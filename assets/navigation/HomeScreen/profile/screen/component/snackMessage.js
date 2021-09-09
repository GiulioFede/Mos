import React,{ useImperativeHandle, forwardRef, useState } from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button, Snackbar } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../../resources/colors";



const SnackMessage = forwardRef((props, ref) => {

    //per l'errore
    const [snackMessage, setSnackMessage] = useState(null);
    const hideSnackMessage = () => setSnackMessage(null);

     useImperativeHandle(ref, () => ({
        setta_messaggio_da_mostrare(mex){
            settaMessaggioDaMostrare(mex);
        }
        
     }));

     function settaMessaggioDaMostrare(mex){
         setSnackMessage(mex);
     }

     

    return (
        <>
            {/*MOSTRA L'ERRORE */}
            <Snackbar
                visible={snackMessage ? true : false}
                onDismiss={hideSnackMessage}
                duration= {3000}
                style={{elevation:12, zIndex:12}}
                action={{
                onPress: () => {
                    // Do something
                    hideSnackMessage();
                },
                }}>
                {snackMessage}
            </Snackbar>
            </>
        )
    }
)

export default SnackMessage;