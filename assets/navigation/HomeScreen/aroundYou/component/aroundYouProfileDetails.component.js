import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Animated, FlatList} from 'react-native';
import {MaterialIcons, Entypo} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import * as Animatable from 'react-native-animatable'
import { MosPurple } from '../../../../resources/colors';

const {width, height} = Dimensions.get("window");
const CIRCLE_SIZE = Math.sqrt(Math.pow(height,2) + Math.pow(width,2));

const letterAnimation = {
    0: {opacity: 0, translateY: -42},
    1: {opacity:1, translateY: 0}
}

export default function AroundYouProfileDetailsComponent(props){
    
    var {navigation, route} = props;
    const {item} = route.params;
    return (
        <>
        <View style={{width:width,flex:1}}>
            <Image source={{uri: item.profileImageUrl}} style={{position:"absolute", width:width, height:height}} blurRadius={30} />
            <View
                style={[ 
                    {alignItems: 'center', justifyContent: 'center', flex:1}
                ]}>
                    <View 
                        style={{
                            position:'absolute',
                            width: CIRCLE_SIZE,
                            height: CIRCLE_SIZE,
                            borderRadius: CIRCLE_SIZE,
                            opacity: 0.2,
                            backgroundColor: "orange",

                        }} />
                    <Image source={{uri: item.profileImageUrl}} style={styles.image} />
                    <View style={styles.container}>
                        <View style={{flexDirection:'row', height: 52}}>
                            {item.name.split('').map((letter, index) =>{
                                return (
                                    <Animatable.Text
                                        useNativeDriver
                                        animation={letterAnimation}
                                        delay={300+index*50}
                                        key={`${letter}-${index}`}
                                        style={styles.heading}
                                    >
                                        {letter}
                                    </Animatable.Text>
                                )
                            })}
                        </View>
                        <View style={{overflow: 'hidden'}}>
                            <Animatable.Text
                                useNativeDriver
                                animation={letterAnimation}
                                delay={300+item.gender_identity.split('').length*50+50}
                                style={{
                                    fontSize:20,
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    color: MosPurple
                                }}>
                                    {item.gender_identity}
                            </Animatable.Text>

                        </View>
                </View>
                </View>
                <View style={{flex:0.4}}>
                    <View style={{flex:0.2, }}/>
                </View>
            </View>
                        
</>
    )

    
}


const styles = StyleSheet.create({
    container: {
      position:"absolute",
      top: 10,
      left: 10,
      flex:0.2,
    },
    heading: {
        color: '#444',
        textTransform: 'uppercase',
        fontSize: 42,
        height:52,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom:20
    },
    image: {
        width: width,
        height: width,
        alignSelf: 'center',
        marginTop: 90,
        flex:0.7,
        backgroundColor:"red"
    }
    
  });