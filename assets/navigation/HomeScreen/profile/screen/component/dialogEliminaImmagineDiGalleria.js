import React,{ useImperativeHandle, forwardRef, useState } from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../../resources/colors";
import i18n from 'i18n-js';


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
                <Dialog.Title>{i18n.t('removePhoto')}</Dialog.Title>
                <Dialog.Content>
                    <Text>{i18n.t('areYouSureToRemovePhoto')}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={closeDialog} color={MosCeleste} ><Text>{i18n.t('cancel')}</Text></Button>
                    <Button onPress={eliminaImmagineDallaGalleria} color={MosViola} ><Text>{i18n.t('remove')}</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}
)

export default DialogEliminaImmagineDiGalleria;