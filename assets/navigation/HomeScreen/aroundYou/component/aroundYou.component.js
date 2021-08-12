import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity, ScrollView, Image, Dimensions, Animated, FlatList} from 'react-native';
import {MaterialIcons, Entypo} from "@expo/vector-icons";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB, Snackbar, ActivityIndicator, Dialog, Portal, Button, Divider } from 'react-native-paper';
import { altezzaBarraScreen, fontSizeTitoloBarra, larghezzaDevice } from '../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste } from '../../../../resources/colors';
import SnackMessage from '../../profile/screen/component/snackMessage';
import PreviewProfile from './previewProfile';

import {geohashQueryBounds} from "geofire-common";
import KilometerView from './kilometerView';
import CircleBackground from './circleBackground';


export default function AroundYouComponent(props){

    var {navigation, route} = props;
    
    const [isLoading, setIsLoading] = useState(true);

    const snackMessageRef = useRef();
    var {navigation, route} = props;

    //APRO MENU
    function apriUserSettings(){
        //navigation.openDrawer();
 
    }
/*
    useEffect(()=>{

        //DA ELIMINARE
        // Find cities within 50km of London
        const center = [51.5074, 0.1278];
        const radiusInM = 50 * 1000;

        // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
        // a separate query for each pair. There can be up to 9 pairs of bounds
        // depending on overlap, but in most cases there are 4.
        console.log("NEIGHBORHOODS")
        const bounds = geohashQueryBounds(center, radiusInM);
        console.log(bounds);
        const promises = [];
        for (const b of bounds) {
            console.log(b);

        }
    },[])*/

    const scrollX = React.useRef(new Animated.Value(0)).current;

    const info_profiles = [
        {
            id: "1",
            name: "Marco",
            self_description: "Sono uno studente di Palermo.",
            date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
            biologica_sex: "maschio",
            gender_identity: "demi boy",
            gender_preference: "demi girl",
            location: {
                geohash: "sqc0p129br",
                lat: 37.97,
                lng: 12.96
            },
            current_occupation: "student",
            hobbies_interests_and_passions: "Ballare, cantare, pallavolo, dipingere",
            profileImageUrl: "https://expertphotography.b-cdn.net/wp-content/uploads/2020/08/social-media-profile-photos-3.jpg",
            gallery: {
                1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
                2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
                3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
            }
        },
        {
            id: "2",
            name: "Lisa",
            self_description: "Sono una studentessa di Palermo.",
            date_of_birth: "Fri Mar 07 1983 09:08:10 GMT+0100 (CET)",
            biologica_sex: "femmina",
            gender_identity: "demi girl",
            gender_preference: "pangender",
            location: {
                geohash: "sqc0p129br",
                lat: 38.97,
                lng: 7.96
            },
            current_occupation: "student",
            hobbies_interests_and_passions: "Dipingere, calcio",
            profileImageUrl: "https://d2qp0siotla746.cloudfront.net/img/use-cases/profile-picture/template_3.jpg",
            gallery: {
                1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
                2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
                3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
            }
        },
        {
            id: "3",
            name: "Giuseppe",
            self_description: "Sono un barista",
            date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
            biologica_sex: "maschio",
            gender_identity: "demi boy",
            gender_preference: "demi girl",
            location: {
                geohash: "sqc0p129br",
                lat: 37.97,
                lng: 12.96
            },
            current_occupation: "worker",
            hobbies_interests_and_passions: "Ballare, cantare, pallavolo, dipingere",
            profileImageUrl: "https://www.mensjournal.com/wp-content/uploads/mf/1280-selfie.jpg?quality=86&strip=all",
            gallery: {
                1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
                2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
                3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
            }
        },
        {
            id: "4",
            name: "Sonia",
            self_description: "Sono una infermiera.",
            date_of_birth: "Fri Mar 07 1975 09:08:10 GMT+0100 (CET)",
            biologica_sex: "femmina",
            gender_identity: "femmina",
            gender_preference: "maschio",
            location: {
                geohash: "sqc0p129br",
                lat: 41.97,
                lng: 21.96
            },
            current_occupation: "worker",
            hobbies_interests_and_passions: "Leggere",
            profileImageUrl: "https://souvlakimoo.gr/wp-content/uploads/2019/02/t2.jpg",
            gallery: {
                1:"https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F1_100?alt=media&token=ed35bd57-a4ba-4622-90b4-0cdf33a7decd",
                2: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F2_100?alt=media&token=9bf093c2-0ddd-437b-b1ae-0bd3e7a00b2b",
                3: "https://firebasestorage.googleapis.com/v0/b/mos-test-db748.appspot.com/o/users%2FobYCXDPHLKXlsvi9TPrPlYginj62%2F3_100?alt=media&token=ba091c55-a5c0-468f-83a3-cfabfaf18cb4" 
            }
        },
    ]

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                <Text style={styles.titolo}>Around You</Text>
                <ActivityIndicator animating={!isLoading} size={fontSizeTitoloBarra} color={MosCeleste} style={{position:"absolute", left:Dimensions.get("window").width*0.03}} />
            </View>

            <View style={[styles.container,{flex:1}]}>

            {/*CERCHIO IN BACKGROUND*/}
            <CircleBackground scrollX={scrollX} info_profiles={info_profiles} />
            {/* GALLERIA PROFILI */}
            <Animated.FlatList
                keyExtractor={(item) => item.id}
                data = {info_profiles}
                renderItem={({item,index}) => <PreviewProfile item = {item} index={index} scrollX = {scrollX} navigation={navigation} />}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                horizontal
                onScroll={Animated.event(
                    [{ nativeEvent: {contentOffset: {x: scrollX}}}],
                    {useNativeDriver: true}
                )}
                scrollEventThrottle={16}
                />
                <KilometerView scrollX = {scrollX} info_profiles = {info_profiles} />
            </View>
                
            {/*MOSTRA L'ERRORE */}
            <SnackMessage ref = {snackMessageRef} />


                        
</>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      flex:1
    },
    titolo:{
        fontSize:fontSizeTitoloBarra,
        position:"absolute",
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
        textAlign:"center",
        alignItems:"center",
        width:larghezzaDevice,
    },
    barraSuperiore:{
        width:larghezzaDevice,
        height:altezzaBarraScreen,
        justifyContent:"center",
        paddingTop:24,
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
    
  });