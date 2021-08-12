import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions,Animated, Platform, FlatList} from 'react-native';


const {width, height} = Dimensions.get("window");
const CIRCLE_SIZE = width*0.6;
//mostra il cerchio in background
const CircleBackground = ({scrollX, info_profiles}) => {

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.circleContainer]}>
                {info_profiles.map(({location},index) => {
                    const inputRange = [(index-0.55)*width,index*width,(index+0.55)*width];
                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp'
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0,0.6,0]
                    })
                    return (
                        <Animated.View 
                            key={index} 
                            style={[
                                styles.circle,
                                {
                                    backgroundColor:"orange",
                                    transform: [{scale}],
                                    opacity
                                }
                            ]}>
                        </Animated.View>
                    )
                })}
        </View>
    )
}

export default CircleBackground;

const styles = StyleSheet.create({
    circleContainer: {
       alignItems:"center",
       justifyContent: "center"
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE/2,
        position: "absolute",
        top: '15%'
    },
    
  });