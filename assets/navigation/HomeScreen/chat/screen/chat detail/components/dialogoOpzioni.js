import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../../../resources/colors";
import Loading from "../../../../aroundYou/component/loading";
import i18n from 'i18n-js'


const OptionsDialog = forwardRef((props, ref) => {

     //per il dialog
     const [isDialogVisible, setIsDialogVisible] = useState(false);
     const [titleAndContent, setTitleAndContent] = useState(["","",0]); //titolo, contenuto e tipo di azione (0 eliminazione conversazione, 1 blocco utente)
     //estraggo argomenti
     const {eliminaConversazione, bloccaContatto} = props;
     const loadingRef = useRef();
     
     useImperativeHandle(ref, () => ({
        close_dialog(){
            closeDialog();
        },

        open_dialog(title, content,type){ //type contiene valore 0 o 1 a seconda se rispettivamente si vuole eliminare o bloccare l'utente
            
            setTitleAndContent([title,content,type]);
            openDialog();
        },
        show_loading(val){
            local_show_loading(val);
        }
        
     }));

     function closeDialog(){
        console.log("chiudo dialog");
        setIsDialogVisible(false);
        loadingRef.current.off();
    }

    function openDialog(){

        console.log("apro dialog per potenziale creazione conversazione");
        setIsDialogVisible(true)
    }

    function local_show_loading(val){

        if(val==true){
            loadingRef.current.on();
            setIsDialogVisible(false);
        }
        else
            loadingRef.current.off();
    }

    return (
        <>
        {isDialogVisible==true &&
        <Portal>
            <Dialog visible={isDialogVisible} onDismiss={closeDialog}>
                <Dialog.Title>{titleAndContent[0]}</Dialog.Title>
                <Dialog.Content>
                    <Text>{titleAndContent[1]}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={closeDialog} color={MosCeleste} ><Text>{i18n.t('cancel')}</Text></Button>
                    <Button onPress={()=>{titleAndContent[2]==0?eliminaConversazione():bloccaContatto()}} color={MosViola} ><Text>{i18n.t('yes')}</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
        }

        <Loading ref={loadingRef} />
        </>
    )
}
)

export default OptionsDialog;