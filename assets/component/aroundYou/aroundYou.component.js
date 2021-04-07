import React, {useRef} from "react";
import {View,FlatList,Animated,ScrollView,Dimensions} from "react-native";
import {MiniaturaImmagineProfilo} from "./feature/miniaturaProfiloUtente.feature";

/*
IMPORTANTE: l'array da dare alla flat list deve cominciare con id:1!
            una volta scaricato il verro array di utenti da mostrare bisognerà inserire all'inizio un elemento con id=0 e alla fine lo stesso con id="ultimo"
*/

export default function AroundYouComponent(){

    const scrollX = useRef(new Animated.Value(0)).current;

    //suppongo di avere 10 informazioni di utenti
    const utenti = [
        {
            id: "0"
        },
        {
            id: "1",
            nome: "Marco",
            distanza: "1",
            urlImmagineProfilo: "https://d2zcsajde7b23y.cloudfront.net/o/d1174163f0ba990fef11336f448e2656efa57e8c.jpg"
        },
        {
            id: "2",
            nome: "Giulia",
            distanza: "3",
            urlImmagineProfilo: "https://d2zcsajde7b23y.cloudfront.net/o/d1174163f0ba990fef11336f448e2656efa57e8c.jpg"
        },
        {
            id: "3",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://d2zcsajde7b23y.cloudfront.net/o/d1174163f0ba990fef11336f448e2656efa57e8c.jpg"
        },
        {
            id: "4",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://d2zcsajde7b23y.cloudfront.net/o/d1174163f0ba990fef11336f448e2656efa57e8c.jpg"
        },
        {
            id: "5",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://d2zcsajde7b23y.cloudfront.net/o/d1174163f0ba990fef11336f448e2656efa57e8c.jpg"
        },
        {
            id: "6"
        },
    ];

    const {width,height}= Dimensions.get("window");
    const SPACING = 10;
    const ITEM_SIZE= width*0.72;
    const SPACER_ITEM_SIZE= (width-ITEM_SIZE)/2;
    console.log("DIMENSIONE"+ITEM_SIZE);



    return (
        <View>
        {/*<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', flexDirection: 'column' }}>*/}
            <View style={{height:"100%", backgroundColor:"#fff"}}>
                
                {/* AREA SUPERIORE */}
                <View style={{height:"10%", alignItems:"center", justifyContent:"center"}}>
                   
                
                </View>

                {/* AREA INFERIORE */}
                <View style={{height:"90%"}}>

                <Animated.FlatList
                    showsHorizontalScrollIndicator={false}
                    data={utenti}
                    keyExtractor={(item) => item.id}
                    horizontal
                    contentContainerStyle={{alignItems:"center"}}
                    decelerationRate={0}
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {x: scrollX}}}],
                        {useNativeDriver: true}
                    )}
                    snapToInterval={ITEM_SIZE}
                    renderItem={({item})=>{                     
                        const index = item.id;
                        if(index==0 || index==utenti.length-1){
                            return <View style={{width:SPACER_ITEM_SIZE,backgroundColor:"red",height:200}}/>
                        }
                        console.log(index);
                        const inputRange = [
                            (index-2)*ITEM_SIZE,
                            (index-1)*ITEM_SIZE,
                            index*ITEM_SIZE
                        ];
                        const translateY = scrollX.interpolate({
                            inputRange,
                            outputRange:[0,-50,0]
                        })
                        return (
                            <View style={{width:ITEM_SIZE}}>
                                <Animated.View
                                    style={{
                                        marginHorizontal:SPACING,
                                        padding: SPACING*2,
                                        alignItems: "center",
                                        backgroundColor:"white",
                                        borderRadius:34,
                                        transform:[{translateY}]
                                    }}>
                                        <MiniaturaImmagineProfilo />
                                        </Animated.View>
                            </View>
                        )
                    }} />
                    

                </View>

            </View>
       {/* </ScrollView> */}
       </View>
    )
}