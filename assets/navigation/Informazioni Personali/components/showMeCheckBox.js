import React,{ useImperativeHandle, forwardRef, useState, useEffect} from "react";
import { Checkbox } from 'react-native-paper';
import { MosCeleste } from '../../../resources/colors';

const ShowMe = forwardRef((props, ref) => {
  const [checked, setChecked] = React.useState(false);

  const {modificaShowMe, initialValue} = props;

  useImperativeHandle(ref, () => ({
    set_check(val){
        local_setCheck(val);
    },
    get_checkValue(){
        return local_getValue();
    }
    
 }));

 function local_setCheck(val){
     setChecked(val);
 }

 function local_getValue(){
    return checked;
 }

 useEffect(()=>{
    setChecked(initialValue);
 },[])


  return (
    <Checkbox
      status={checked ? 'checked' : 'unchecked'}
      theme={{ colors:{primary:MosCeleste, accent:MosCeleste}}}
      onPress={() => {
        modificaShowMe(!checked);
        setChecked(!checked);
      }}
    />
  );

});

export default ShowMe;