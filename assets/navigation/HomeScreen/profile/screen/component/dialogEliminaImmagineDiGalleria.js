import React,{ useImperativeHandle, forwardRef, useState } from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../../resources/colors";



const DialogEliminaImmagineDiGalleria = forwardRef((props, ref) => {

     //per il dialog
     const [isDialogVisible, setIsDialogVisible] = useState(false);
     //estraggo argomenti
     const {eliminaImmagineDallaGalleria} = props;

     useImperativeHandle(ref, () => ({
        close_dialog(){
            closeDialog();
        },

        open_dialog(){
            openDialog();
        }
        
     }));

     function closeDialog(){
        console.log("chiudo dialog");
        setIsDialogVisible(false);
    }

    function openDialog(){

        console.log("apro dialog per potenziale eliminazione immagine ");
        setIsDialogVisible(true)
    }

    return (
        <Portal>
            <Dialog visible={isDialogVisible} onDismiss={closeDialog}>
                <Dialog.Title>Rimozione foto</Dialog.Title>
                <Dialog.Content>
                    <Text>Sei sicuro di volere eliminare la foto?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={closeDialog} color={MosCeleste} ><Text>Annulla</Text></Button>
                    <Button onPress={eliminaImmagineDallaGalleria} color={MosViola} ><Text>Elimina</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}
)

export default DialogEliminaImmagineDiGalleria;