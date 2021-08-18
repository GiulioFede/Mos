import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../resources/colors";



const DialogCreaNuovaConversazione = forwardRef((props, ref) => {

     //per il dialog
     const [isDialogVisible, setIsDialogVisible] = useState(false);
     //estraggo argomenti
     const {creaNuovaConversazione} = props;
     const nameOfCard = useRef("");

     useImperativeHandle(ref, () => ({
        close_dialog(){
            closeDialog();
        },

        open_dialog(name){
            nameOfCard.current = name;
            openDialog(name);
        }
        
     }));

     function closeDialog(){
        console.log("chiudo dialog");
        setIsDialogVisible(false);
    }

    function openDialog(){

        console.log("apro dialog per potenziale creazione conversazione");
        setIsDialogVisible(true)
    }

    return (
        <Portal>
            <Dialog visible={isDialogVisible} onDismiss={closeDialog}>
                <Dialog.Title>Nuova conversazione</Dialog.Title>
                <Dialog.Content>
                    <Text>Vuoi davvero iniziare una nuova conversazione con {nameOfCard.current}?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={closeDialog} color={MosCeleste} ><Text>Annulla</Text></Button>
                    <Button onPress={creaNuovaConversazione} color={MosViola} ><Text>Crea</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}
)

export default DialogCreaNuovaConversazione;