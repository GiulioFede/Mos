import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../resources/colors";
import i18n from 'i18n-js';


const DialogCreaNuovaConversazione = forwardRef((props, ref) => {

     //per il dialog
     const [isDialogVisible, setIsDialogVisible] = useState(false);
     //estraggo argomenti
     const {creaNuovaConversazione} = props;
     const currentUserBasicInfo = useRef([]); //contiene [nome, uid, token push notification] del contatto sui cui si è aperto il dialogo

     useImperativeHandle(ref, () => ({
        close_dialog(){
            closeDialog();
        },

        open_dialog(name, uid, token){
            currentUserBasicInfo.current[0] = name;
            currentUserBasicInfo.current[1] = uid;
            currentUserBasicInfo.current[2] = token;
            openDialog();
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
                <Dialog.Title>{i18n.t('titleNewConversation')}</Dialog.Title>
                <Dialog.Content>
                    <Text>{i18n.t('subTitleNewConversation')}{currentUserBasicInfo.current[0]}?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={closeDialog} color={MosCeleste} ><Text>{i18n.t('cancel')}</Text></Button>
                    <Button onPress={()=>{creaNuovaConversazione(currentUserBasicInfo.current[1], currentUserBasicInfo.current[0], currentUserBasicInfo.current[2])}} color={MosViola} ><Text>{i18n.t('create')}</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}
)

export default DialogCreaNuovaConversazione;