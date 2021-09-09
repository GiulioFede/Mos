import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text } from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../resources/colors";
import i18n from 'i18n-js';


const GenericDialog = forwardRef((props, ref) => {

     //per il dialog
     const [isDialogVisible, setIsDialogVisible] = useState(false);
     const [titleAndContent, setTitleAndContent] = useState(["",""]); //titolo, contenuto 
     //estraggo argomenti
     const {yesAction} = props;
     
     useImperativeHandle(ref, () => ({
        close_dialog(){
            closeDialog();
        },

        open_dialog(title, content){ 
            
            setTitleAndContent([title,content]);
            openDialog();
        },
        
     }));

     function closeDialog(){
        console.log("chiudo dialog");
        setIsDialogVisible(false);
    }

    function openDialog(){

        console.log("apro dialog");
        setIsDialogVisible(true)
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
                    <Button onPress={()=>{closeDialog(); yesAction()}} color={MosViola} ><Text>{i18n.t('yes')}</Text></Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
        }
        </>
    )
}
)

export default GenericDialog;