import React,{useEffect, useState, useCallback, useRef} from "react"
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Keyboard,KeyboardAvoidingView, TextInput, FlatList, BackHandler} from "react-native"
import {ActivityIndicator, Divider, FAB, ProgressBar, Snackbar} from "react-native-paper"
import {Octicons, Ionicons, MaterialIcons, FontAwesome} from "@expo/vector-icons";
import { fontSizeTitolo, fontSizeTitoloPiccolo, larghezzaDevice } from "../../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosViola } from "../../../../../resources/colors";
import i18n from 'i18n-js';

const SliderDetails = ({dettagli}) => {

    const [slideNumber, setSlideNumber] = useState(0);

    function getDetailViewFromSection(item){

        if(item.section=="location"){
            return (
                <View style={{width:larghezzaDevice-20, borderColor:MosViola, borderLeftWidth:3, flexDirection:"row", padding:10, margin:10, justifyContent:"center", alignItems:"center"}}>
                    <View style={{width:larghezzaDevice-40, flexDirection:"column", justifyContent:"center"}}>
                        <Ionicons name="location-sharp" size={fontSizeTitoloPiccolo} color={MosCeleste} style={{alignSelf:"center", alignContent:"center", alignItems:"center"}} />
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center", textAlign:"center"}]}>{item.city}</Text>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center",textAlign:"center"}]}>{item.region}</Text>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1}  style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center",textAlign:"center"}]}>{item.country}</Text>
                    </View>
                </View>
            )
        }
        else if(item.section=="sex and gender"){
            return (
                <View style={{ width:larghezzaDevice-20, borderColor:MosViola, borderLeftWidth:3, padding:10, margin:10, justifyContent:"center",alignItems:"center"}}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center", color:MosViola}]}>{i18n.t('sex')}:<Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center"}]}> {item.sex}</Text></Text>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center",color:MosViola}]}>{i18n.t('genderIdentity')}:<Text style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center"}]}> {item.gender_identity}</Text></Text>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center",color:MosViola}]}>{i18n.t('genderPreferenceLabel')}:<Text style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center"}]}> {item.gender_preference}</Text></Text>
                    </View>
            )
        }
        else if(item.section=="occupation and decription"){
            return (
                <View style={{ width:larghezzaDevice-20, borderColor:MosViola, borderLeftWidth:3, padding:10, margin:10, justifyContent:"center",alignItems:"center"}}>
                    <Text style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center", color:MosViola}]}>{i18n.t('currentOccupation')}</Text>
                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center"}]}> {item.occupation}</Text>

                    <Text style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center",color:MosViola}]}>{i18n.t('personalDescription')}</Text>
                    <Text style={[styles.nome,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center"}]}> {item.description}</Text>
                </View>
            )
        }
        else if(item.section=="hobbies interests and passions"){
            return (
                <View style={{ width:larghezzaDevice-20, borderColor:MosViola, borderLeftWidth:3, padding:10, margin:10, justifyContent:"center"}}>
                    <Text style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.6, textAlignVertical:"center", color:MosViola, marginBottom:5}]}>{i18n.t('hobbiesInterestsAndPassions')}</Text>
                    <View style={{flexDirection:"row", flex:1, flexWrap:"wrap"}}>
                    {item.hobbies_interests_and_passions.map((data)=>{
                        return (
                            <View key={data} style={{padding:5, margin:3, backgroundColor:MosCeleste, borderRadius:fontSizeTitoloPiccolo*0.2, justifyContent:"center"}}><Text style={[styles.nomeGrassetto,{fontSize:fontSizeTitoloPiccolo*0.4, textAlignVertical:"center", color:"white"}]}>{data}</Text></View>
                        )
                    })} 
                    </View>
                </View>
            )
        }
    }

    const _onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
        console.log("Visible items are", viewableItems);
        console.log("Changed in this iteration", changed);
        setSlideNumber(viewableItems[0].index);
    }, []);

    const _viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }
    

    return (
        <>
        <FlatList
            data={dettagli}
            horizontal={true}
            snapToInterval={larghezzaDevice}
            decelerationRate="fast"
            onViewableItemsChanged={_onViewableItemsChanged}
            viewabilityConfig={_viewabilityConfig}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            keyExtractor={(item)=>item.section}
            renderItem={({item,index})=>{
                    return (
                        getDetailViewFromSection(item)
                    )
            }}
        />
        <View style={{flexDirection:"row", backgroundColor:"#fff", height:25, width:larghezzaDevice, justifyContent:"center", alignItems:"center"}}>
            <View style={{backgroundColor:slideNumber==0?MosCeleste:"rgba(227, 227, 227,0.7)", width:10, height:10, marginRight:5, borderRadius:5}}/>
            <View style={{backgroundColor:slideNumber==1?MosCeleste:"rgba(227, 227, 227,0.7)", width:10, height:10,marginRight:5, borderRadius:5}}/>
            <View style={{backgroundColor:slideNumber==2?MosCeleste:"rgba(227, 227, 227,0.7)", width:10, height:10, marginRight:5, borderRadius:5}}/>
            <View style={{backgroundColor:slideNumber==3?MosCeleste:"rgba(227, 227, 227,0.7)", width:10, height:10,marginRight:5, borderRadius:5}}/>
        </View>
        </>
    )
}

export default SliderDetails;

const styles = StyleSheet.create({
    nome:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:fontSizeTitolo*0.7
    },
    nomeGrassetto:{
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        fontSize:fontSizeTitolo*0.7
    },

})