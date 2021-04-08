import React, {useRef} from "react";
import {View,Text, FlatList,Animated,StyleSheet,Dimensions, Image} from "react-native";
import {MiniaturaImmagineProfilo} from "./miniaturaProfiloUtente.feature";
import MaskedView from '@react-native-community/masked-view';
import Svg, {Line, Rect} from 'react-native-svg';
import {LinearGradient} from "expo-linear-gradient";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';

/*
IMPORTANTE: l'array da dare alla flat list deve cominciare con id:1!
            una volta scaricato il verro array di utenti da mostrare bisognerà inserire all'inizio un elemento con id=0
*/

const {width,height}= Dimensions.get("window");
const SPACING = 10;
const ITEM_SIZE= width*0.72;
const SPACER_ITEM_SIZE= 0;
const BACKDROP_HEIGHT = height*0.6;
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function AroundYouComponent(){

    const scrollX = useRef(new Animated.Value(0)).current;

    //suppongo di avere 10 informazioni di utenti
    const utenti = [
        {
            id: "0" //aggiunto in modo fittizio!
        },
        {
            id: "1",
            nome: "Marco",
            distanza: "1",
            urlImmagineProfilo: "https://i.pinimg.com/originals/64/8b/84/648b84943ca0377b36840e559deb9e19.jpg"
        },
        {
            id: "2",
            nome: "Giulia",
            distanza: "3",
            urlImmagineProfilo: "https://i.pinimg.com/originals/64/8b/84/648b84943ca0377b36840e559deb9e19.jpg"
        },
        {
            id: "3",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://i.pinimg.com/originals/64/8b/84/648b84943ca0377b36840e559deb9e19.jpg"
        },
        {
            id: "4",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://i.pinimg.com/originals/64/8b/84/648b84943ca0377b36840e559deb9e19.jpg"
        },
        {
            id: "5",
            nome: "Elisa",
            distanza: "5",
            urlImmagineProfilo: "https://i.pinimg.com/originals/64/8b/84/648b84943ca0377b36840e559deb9e19.jpg"
        }
    ];


    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                        <Text style={styles.titolo}>Around You</Text>
            </View>
                {/* LISTA UTENTI:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/}
                <MostraListaUtenti utenti={utenti} scrollX={scrollX}/> 
       </View>
    )
}



const MostraListaUtenti = ({utenti, scrollX}) =>{

        //carico font
        let [Raleway] = useFonts({Raleway_200ExtraLight});
        let [Raleway2] = useFonts2({Raleway_400Regular});
        if(!Raleway || !Raleway2)
            return <View></View>

    return (

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
                    snapToInterval={width}
                    renderItem={({item})=>{                     
                        const index = item.id;
                        if(index==0){
                            return <View style={{width:SPACER_ITEM_SIZE,backgroundColor:"red",height:200}}/>
                        }
                        console.log(index);
                        const inputRange = [
                            (index-2)*width,
                            (index-1)*width,
                            index*width
                        ];
                        const translateY = scrollX.interpolate({
                            inputRange,
                            outputRange:[0,-50,0]
                        })
                        return (
                            <View>
                               <Image
                                    //sostituire la source con l'immagine dell'utente i-esimo 
                                    source={require("../../../../../../assets/resources/images/profilePicture2.jpg")}
                                    style={{width,height:BACKDROP_HEIGHT, resizeMode:'cover', position:"absolute", bottom:0, left:-SPACER_ITEM_SIZE}} 
                                />
                                
                                <LinearGradient
                                colors={['transparent','white']}
                                style={{
                                    width,
                                    height: BACKDROP_HEIGHT,
                                    position: 'absolute',
                                    bottom:0,
                                    left:-SPACER_ITEM_SIZE
                                    
                                }}/>
                              <View style={{width}}>
                                <Animated.View
                                    style={{
                                        alignItems: "center",
                                        left:-SPACER_ITEM_SIZE,
                                        borderRadius:34,
                                        transform:[{translateY}]
                                    }}>
                                        <MiniaturaImmagineProfilo />
                                        
                                </Animated.View>
                            </View>
                            </View>
                        )
                    }} />
    )

} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#fff"
    },   
    titolo:{
        fontSize:25,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
    },
    barraSuperiore:{
        flexDirection:"row",
        justifyContent:"center",
        paddingTop:24,
        paddingBottom: 24,
        marginHorizontal:16,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
})