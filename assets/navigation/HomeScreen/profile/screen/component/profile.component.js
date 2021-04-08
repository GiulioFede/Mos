import React from 'react';
import {View, Text, StyleSheet, ScrollView, Image, Dimensions, Platform} from 'react-native';
import {MaterialIcons, Fontisto, Ionicons} from "@expo/vector-icons";
import { MosCeleste } from '../../../../../resources/colors';
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { FAB } from 'react-native-paper';


export default function ProfileComponent(){

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    return (
        <>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                        <MaterialIcons name="arrow-back-ios" size={24} color="#52575D"/>
                        <Text style={styles.titolo}>Profile</Text>
                        <Fontisto name="more-v" size={24} color="#52575D" />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', flexDirection: 'column' }}style={{ paddingTop:10, paddingBottom: 40 }}>
                <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                    
                    {/* IMMAGINE PROFILO */}
                    <View style={styles.contenitoreMediaProfilo}>
                        {/* immagine */}
                        <View style={styles.contenitoreImmagineProfilo}>
                            <Image source={require("../../../../../../assets/resources/images/profilePicture.jpg")} resizeMode="cover"  style={styles.immagineProfilo}></Image>
                        </View>
                        {/* pallino online */}
                        <View style={styles.onlineCircle} />
                        {/* icona chat */}
                        <View style={styles.chatIcon}>
                            <Ionicons name="ios-chatbubble-outline" size={24} color={MosCeleste} />
                        </View>
                    </View>

                    {/* NOME */}
                    <View style = {styles.areaDettagliUtente}>
                        <Text style={styles.testo}>Julie</Text>
                    </View>

                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        {/* GALLERIA */}
                        <View>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria1.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria2.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria3.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria4.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                                <View style={styles.contenitoreFotoGalleria}>
                                    <Image source={require("../../../../../../assets/resources/images/fotoGalleria5.jpg")} style={styles.immagineGalleria} resizeMode="cover" />
                                </View>
                            </ScrollView>
                        </View>

                        {/*Bottone aggiungi foto */}
                        <FAB
                            style={styles.bottoneAggiungiFoto}
                            small
                            icon="plus"
                            color={MosCeleste}
                            onPress={() => console.log('Pressed')}/>
                 </View>
    </ScrollView>
</>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:"#fff",
      flex:1
    },
    titolo:{
        fontSize:25,
        paddingRight:20,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
    },
    barraSuperiore:{
        flexDirection:"row",
        justifyContent:"space-between",
        paddingTop:24,
        paddingBottom: 24,
        marginHorizontal:16,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.7,
    },
    testo:{
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
        fontSize:36
    },
    immagineProfilo: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreMediaProfilo:{
        alignSelf:"center",
        ...Platform.select({
            ios:{
                shadowOffset: { width: 3, height: 3 },
                shadowColor: 'black',
                shadowOpacity: 0.3
            }
        })
    },
    contenitoreImmagineProfilo: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: "hidden",
        backgroundColor: '#52575D',
        ...Platform.select({
            android: {
                elevation: 4
            }
        })
    },
    onlineCircle: {
        backgroundColor: "#00ff40",
        elevation: 10,
        position: "absolute",
        bottom: 28,
        left:10,
        padding:4, 
        height:20,
        width: 20,
        borderRadius:10
    },
    chatIcon: {
        backgroundColor: "white",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        margin:8
    },
    areaDettagliUtente: {
        alignSelf: "center",
        alignItems:"center",
        marginTop: 16
    },
    immagineGalleria: {
        flex:1,
        width: undefined,
        height: undefined
    },
    contenitoreGalleria: {
        alignItems:"flex-end",
        justifyContent:"flex-end",
        backgroundColor:"black",
        flexGrow:1
    },
    contenitoreFotoGalleria: {
        width:Dimensions.get("window").width/2-8, 
        height:Dimensions.get("window").width/2-8,
        borderRadius:(Dimensions.get("window").width/2-2.5)*10/200,
        overflow: "hidden",
        marginLeft:5
    },
    bottoneAggiungiFoto: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor:"white",
        ...Platform.select({
            android: {
                elevation:10
            }
        })
      }
  });