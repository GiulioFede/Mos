import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { ActivityIndicator, Dimensions, Text, View} from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import { MosCeleste, MosViola } from "../../../../resources/colors";



const Loading = forwardRef((props, ref) => {


     const [isLoading, setIsLoading] = useState(true);


     useImperativeHandle(ref, () => ({
        on(){
            local_setIsLoading(true);
        },
        off(){
            local_setIsLoading(false);
        }
        
     }));

     function local_setIsLoading(val){
         setIsLoading(val);
     }

    return (
        <View style={{position:"absolute", width:Dimensions.get("window").width, height:Dimensions.get("window").height, justifyContent:"center", alignItems:"center", flex:1, backgroundColor:"rgba(255,255,255,0.5)"}}>
                <ActivityIndicator animating={isLoading} color={MosCeleste} />
        </View>
    )
}
)

export default Loading;