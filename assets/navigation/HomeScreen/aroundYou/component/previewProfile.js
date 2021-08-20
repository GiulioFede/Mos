import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions,Animated, Platform, FlatList} from 'react-native';
import {Divider} from 'react-native-paper'
import { fontSizeSottoTitolo } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosViola } from '../../../../resources/colors';

const {width, height} = Dimensions.get("window");
const VISIBLE_ITEMS = 4;
const IMAGE_WIDTH = width*0.86;
const IMAGE_HEIGHT = width*0.86*1.5;


export default function PreviewProfile(props){

    const {item,index} = props;
    console.log(item);

    const animatedValue = React.useRef(new Animated.Value(0)).current;
                        const inputRange = [index -1, index, index +1]
                        const translateY = animatedValue.interpolate({
                            inputRange,
                            outputRange: [15, 0, 15]
                        });
                        const opacity = animatedValue.interpolate({
                            inputRange,
                            outputRange: [-1 -1/VISIBLE_ITEMS, 1, 0]
                            //outputRange: [-1, 1, 1]
                        });
                        const scale = animatedValue.interpolate({
                            inputRange,
                            outputRange: [0.92, 1, 1.2]
                        });
   
   return (
<>
<Animated.View style={{position:'absolute',width:width, height:height, opacity, transform: [{translateY}, {scale} ] }}>
        <TouchableOpacity onPress={()=>{}}>

                                        <Image source = {{ uri: item.profileImageUrl}} style={styles.image} />
                                    <View style={{position:"absolute", height:IMAGE_HEIGHT*0.2, bottom:0, overflow:"hidden", width:IMAGE_WIDTH, borderBottomLeftRadius: 16, borderBottomRightRadius:16}}>
                                        <Image source = {{ uri: item.profileImageUrl}} style={{flex:1, position:"absolute",top:-IMAGE_HEIGHT+IMAGE_HEIGHT*0.2,  height:IMAGE_HEIGHT, width:IMAGE_WIDTH}} blurRadius={3} />
                                    </View>
                                    <View style={{position: 'absolute', bottom:20, left:20}}>
                                        <Text style={styles.name}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                        </Animated.View>
</>
   )

                    }
    
const styles = StyleSheet.create({
    image: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    name : {
        textTransform: 'uppercase',
        color: '#fff',
        fontSize: 36,
        fontWeight: '900'
    }
    
    });












/*

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

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.8} onPress={()=>{navigation.navigate('AroundYouProfileDetails',{item})}} style={{width:width, alignItems:"center"}}>
            <Animated.Image 
                source={{uri: item.profileImageUrl}} 
                style={[styles.imageStyle,
                {
                    transform: [{scale: imageScale}]
                }]} />
            <View style={styles.textContainer}>
                <Animated.Text 
                    style={[styles.heading,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         {item.name} 32
                </Animated.Text>

                <Animated.Text 
                    style={[styles.campi,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         sesso
                </Animated.Text>
                <Animated.Text 
                    style={[styles.gender_identity,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         {item.biological_sex}
                </Animated.Text>

                <Animated.Text 
                    style={[styles.campi,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         genere
                </Animated.Text>
                <Animated.Text 
                    style={[styles.gender_identity,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         {item.gender_identity}
                </Animated.Text>

                <Animated.Text 
                    style={[styles.campi,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         genere di preferenza
                </Animated.Text>
                <Animated.Text 
                    style={[styles.gender_identity,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         {item.gender_preference}
                </Animated.Text>

                <Animated.View 
                    style={[{ backgroundColor:"#444", width:width*0.75, height:1, marginVertical:10,
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                        
                </Animated.View>

                <Animated.Text 
                    style={[styles.campi,{
                        opacity,
                        transform: [{translateX: translateXHeading}]
                     },]}>
                         Descrizione
                </Animated.Text>
                <Animated.Text 
                    style={[styles.description,{
                        opacity,
                        transform: [{translateX: translateXDescription}]
                     },]}>
                         {item.self_description}, sh dfd fjbbjb dfjbbfeb fbjbfebej efbjbfjfb f f f f f fe fejebfejbfe sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
                </Animated.Text>
            </View>
        </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    imageStyle: {
        width: width,
        height: width,
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
        fontSize: fontSizeSottoTitolo,
        fontWeight: '800',
        letterSpacing: 2
    },
    gender_identity: {
        color: MosViola,
        textTransform: 'uppercase',
        fontSize: fontSizeSottoTitolo*0.7,
        fontWeight: '800',
        letterSpacing: 2
    },
    campi: {
        color:  '#444',
        fontSize: fontSizeSottoTitolo*0.7,
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
  */

