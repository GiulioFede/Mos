import React,{ useImperativeHandle, forwardRef, useState, useEffect, useRef} from "react";
import {StyleSheet, View, Text} from 'react-native'
import { ProgressBar, Colors } from 'react-native-paper';
import { altezzaBarraScreen, fontSizeTitoloBarra, larghezzaDevice } from '../../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../../../../resources/colors';
import i18n from 'i18n-js'

const ProgressRequest = forwardRef((props, ref) => {

    const [progress,setProgress] = useState(0);
    const [visible, setVisible] = useState(true);
    const {threshold} = props;
    const isMounted = useRef(false);

    useEffect(()=>{
        isMounted.current = true;

        return () => isMounted.current = false;
    })
   
    useImperativeHandle(ref, () => ({
      
        set_percentage(newNumberOfMessages){
            local_set_percentage(newNumberOfMessages);
        },
        make_invisible(){
            local_make_invisible();
        }
       
    }));

    function local_set_percentage(newNumberOfMessages){
        console.log("progresso con:"+newNumberOfMessages+" -_> "+(newNumberOfMessages/threshold));
        if(newNumberOfMessages>threshold) newNumberOfMessages=threshold;
        if(isMounted.current == true)
            setProgress(parseInt((newNumberOfMessages/threshold)*100));
    }

    function local_make_invisible(){
        if(isMounted.current == true)
            setVisible(false);
    }
    
    return (
        <>
        {visible==true &&
        <View style={{ width:larghezzaDevice, height:altezzaBarraScreen*0.4, justifyContent:"center"}}>
            <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                <Text style={styles.prossimaRichiesta}>{i18n.t('nextRequest')}</Text>
                <ProgressBar progress={progress/100} color={MosCeleste} style={{width:100, height:fontSizeTitoloBarra*0.15, borderRadius:fontSizeTitoloBarra}}/>
                <Text style={[styles.prossimaRichiesta,{paddingLeft:3}]}>{progress}%</Text>
            </View>
        </View>
        }
        </>
        )
    }
)

export default ProgressRequest;

const styles = StyleSheet.create({
    prossimaRichiesta:{
        fontSize:fontSizeTitoloBarra*0.4,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        paddingRight:10
    },
})