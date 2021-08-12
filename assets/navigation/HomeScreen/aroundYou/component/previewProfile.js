import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions,Animated, Platform, FlatList} from 'react-native';
import { nodeFromRef, SharedElement } from 'react-native-shared-element';

const {width, height} = Dimensions.get("window");

export default function PreviewProfile({navigation, item,index,scrollX}){
    const inputRange = [(index-1)*width, index*width,(index+1)*width];
    const inputRangeOpacity = [(index-0.4)*width, index*width,(index+0.4)*width];
    const imageScale = scrollX.interpolate({
        inputRange,
        outputRange: [0.2,1,0.2]
    })
    const translateXHeading = scrollX.interpolate({
        inputRange,
        outputRange: [width*0.2,0,-width*0.2]
    });
    const translateXDescription = scrollX.interpolate({
        inputRange,
        outputRange: [width*0.6,0,-width*0.6]
    });
    const opacity = scrollX.interpolate({
        inputRange: inputRangeOpacity,
        outputRange: [0,1,0]
    })

    let startAncestor;
    let startNode;

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={()=>{navigation.navigate('AroundYouProfileDetails',{item})}} style={{width:width, alignItems:"center"}} ref ={ref =>startAncestor = nodeFromRef(ref)}>
            <SharedElement id={item.id} style={styles.imageStyle} onNode={node => startNode = node}>
            <Animated.Image 
                source={{uri: item.profileImageUrl}} 
                style={[styles.imageStyle,
                {
                    transform: [{scale: imageScale}]
                }]} />
            </SharedElement>
            <View style={styles.textContainer}>
                <Animated.Text 
                    style={[styles.heading,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         {item.name}
                </Animated.Text>
                <Animated.Text 
                    style={[styles.description,{
                        opacity,
                        transform: [{translateX: translateXDescription}]
                     },]}>
                         {item.self_description}
                </Animated.Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    imageStyle: {
        width: width*0.75,
        height: width*0.75,
        backgroundColor:"red",
        flex:1
    },
    textContainer: {
        alignItems: 'flex-start',
        alignSelf: 'flex-end',
        flex:0.5
    },
    heading: {
        color: '#444',
        textTransform: 'uppercase',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 2
    },
    description: {
        color: '#ccc',
        fontWeight: '600',
        textAlign: 'left',
        width: width*0.75,
        marginRight:10,
        fontSize:16,
        lineHeight:16*1.5
    }
    
  });