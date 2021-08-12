import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions,Animated, Platform, FlatList} from 'react-native';

const KILOMETER_TEXT_HEIGHT = 40;
const {width, height} = Dimensions.get("window");

function getDistance(lat, lng){

    //ritorna distanza in kilometri
    return "50Km";

}
//mostra i kilometri di distanza in alto ad ogni foto
const KilometerView = ({scrollX, info_profiles}) => {

    const inputRange = [-width,0,width];
    const translateY = scrollX.interpolate({
        inputRange,
        outputRange: [KILOMETER_TEXT_HEIGHT, 0, -KILOMETER_TEXT_HEIGHT]
    })

    return (
        <View style={styles.kilometerContainer}>
            <Animated.View style={{ transform: [{translateY}]}}>
                {info_profiles.map(({location}, index) => {
                    return (
                        <Text key={index} style={styles.kilometerText}>
                            {getDistance(location.lat, location.lng)}
                        </Text>
                    )
                })}
            </Animated.View>
        </View>
    )
}

export default KilometerView;

const styles = StyleSheet.create({
    kilometerContainer: {
       position: 'absolute',
       top: 40,
       left: 20,
       overflow: 'hidden',
       height: KILOMETER_TEXT_HEIGHT
    },
    kilometerText: {
        fontSize: KILOMETER_TEXT_HEIGHT,
        lineHeight: 40,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '800'  
    },
    
  });