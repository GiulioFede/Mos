import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { ActivityIndicator, Dimensions, Text, View} from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../resources/colors";



const Loading = forwardRef((props, ref) => {


     const [isLoading, setIsLoading] = useState(false);
     const [text, setText] = useState("");


     useImperativeHandle(ref, () => ({
        on(){
            local_setIsLoading(true);
        },
        off(){
            local_setIsLoading(false);
        },
        set_message(mex){
            local_set_message(mex);
        },
        get_state(){
            local_get_state();
        }
        
     }));

     function local_setIsLoading(val){
         setIsLoading(val);
     }

     function local_set_message(mex){
         setText(mex);
     }

     function local_get_state(){
         return isLoading;
     }

    return (
        <>
        {isLoading==true &&
            <View style={{position:"absolute", zIndex:20, width:Dimensions.get("window").width, height:"100%", flex:1, backgroundColor:"rgba(255,255,255,0.75)"}}>
                    <View style={{position:"absolute",width:Dimensions.get("window").width, height:Dimensions.get("window").height,justifyContent:"center", alignItems:"center"}}>
                        <ActivityIndicator animating={true} color={MosCeleste} />
                        <Text style={{textAlign:"center", padding:20}}>{text}</Text>
                    </View>
            </View>
        }
        </>
    )
}
)

export default Loading;