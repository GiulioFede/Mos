import React, {useEffect,useRef} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Svg, {G, Circle} from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons'; 
import { altezzaSchermoInterno, larghezzaDevice } from "../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple, MosViola } from "../../../resources/colors";

export default function ProgressiveButton({percentage, scrollSlide, scrollBack, showLeftArrow, showForwardArrow}){

    const size = altezzaSchermoInterno*0.05;
    const strokeWidth = 2;
    const center = size/2;
    const radius = size/2.1-strokeWidth/2.1;
    const circumference = 2*Math.PI*radius;
    const progressAnimation = useRef(new Animated.Value(0)).current;
    const progressRef = useRef(null);
    const animation = (toValue) => {
        return Animated.timing(progressAnimation, {
            toValue,
            duration: 250,
            useNativeDriver: true
        }).start()
    }

    useEffect(()=>{
        animation(percentage);
    }, [percentage])

    useEffect(()=>{

        console.log("bottone montato");

        progressAnimation.addListener((value)=>{
            const strokeDashoffset = circumference - (circumference*value.value)/100;
            if(progressRef.current) {
                progressRef.current.setNativeProps({
                    strokeDashoffset
                });
            }
        }, [percentage]
      );

      return () => {
          console.log("bottone smontato");
          progressAnimation.removeAllListeners();
      }
    },[])

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} style={{ justifyContent:"center", alignItems:"center"}} >
                <G rotation="-90" origin={center} >
                <Circle stroke="rgb(255,255,255,0.2)" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
                <Circle ref={progressRef} stroke={MosCeleste} cx={center} cy={center} r={radius} strokeWidth={strokeWidth} strokeDasharray={circumference} />
                </G>
            </Svg>
            { showForwardArrow &&
                <TouchableOpacity onPress={scrollSlide} style={styles.button} activeOpacity={0.6}>
                    <MaterialIcons name="arrow-forward-ios" size={altezzaSchermoInterno*0.03} color={MosCeleste} />
                </TouchableOpacity>
            }
            {showLeftArrow &&
            <TouchableOpacity onPress={scrollBack} style={styles.leftButton} activeOpacity={0.6}>
                <MaterialIcons name="arrow-back-ios" size={altezzaSchermoInterno*0.03} color={MosCeleste} />
            </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        height: altezzaSchermoInterno*0.06,
        justifyContent:"center",
        alignItems:"center"
    },
    button: {
        position:"absolute",
        alignSelf:"center",
        borderRadius: 100
    },
    leftButton: {
        position:"absolute",
        alignSelf:"flex-start",
        paddingLeft:larghezzaDevice*0.1,
        borderRadius: 100
    }
})