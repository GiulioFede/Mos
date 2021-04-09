import React, {useState, useRef, useEffect} from "react";
import {View, Text, StyleSheet,Dimensions, FlatList, ScrollView,Image,Platform, TouchableOpacity,KeyboardAvoidingView} from "react-native";
import {useFonts, Raleway_200ExtraLight} from '@expo-google-fonts/raleway';
import {useFonts as useFonts2, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { MosCeleste, MosPurple, MosViola } from "../../resources/colors";
import { FAB,TextInput } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons'; 


//indica se il bottone è stato cliccato o meno
var isEmailEPasswordClicked = false;

const indici = [{id:"1"},{id:"2"}];

export default function LoginScreen(){

    //label button email e password
    const [labelEmailPasswordButton, setLabelEmailPasswordButton] = useState("ACCEDI CON EMAIL/PASSWORD");
    //email
    const [email, setEmail] = useState('');
    //password
    const [password, setPassword] = useState('');
    //errore
    const [errore, setErrore] = useState("");

    const refFlatList = useRef();

    //carico font
    let [Raleway] = useFonts({Raleway_200ExtraLight});
    let [Raleway2] = useFonts2({Raleway_400Regular});
    if(!Raleway || !Raleway2)
        return <View></View>

    function ViewBonniGoogleETelefono(){
        return (
            <View style={{width:Dimensions.get("window").width,alignItems:"center", justifyContent:"flex-end", marginBottom:20}}>
                <FAB
                style={{backgroundColor:MosCeleste,marginBottom:20, width:"90%"}}
                small
                icon="google"
                onPress={() => console.log('Pressed')}
                label="ACCEDI CON GOOGLE"
            />

            <FAB
                style={{backgroundColor:MosPurple, width:"90%"}}
                small
                icon="cellphone-iphone"
                onPress={() => console.log('Pressed')}
                label="ACCEDI COL TUO NUMERO DI TELEFONO"
            /> 
            </View>
        )
    }

    function ViewEmailEPassword(){
        return (
            <View style={{width:Dimensions.get("window").width, alignItems:"center", justifyContent:"center", marginBottom:20}}>

                <TouchableOpacity style={{position:"absolute", left:20,top:0}} onPress={nascondiCampiEmailEPassword}>
                    <AntDesign name="arrowleft" size={24} color={MosViola}  />
                </TouchableOpacity>
                <View>
                    <TextInput
                    label="Email"
                    value={email}
                    onChangeText={text => setEmail(text.trim())}
                    style={{width:250, backgroundColor:"white",fontSize:15}}
                    selectionColor={MosCeleste}
                    
                    
                    mode="flat"
                    />
                <TextInput
                    label="Password"
                    value={password}
                    secureTextEntry={true}
                    onChangeText={text => setPassword(text.trim())}
                    style={{width:250, backgroundColor:"white",fontSize:15}}
                    selectionColor={MosCeleste} 
                    mode="flat"
                    />

                {/*ERRORE*/}
                <View style={{ paddingTop:10, width:250}}>
                    <Text style={{color:"red"}}>{errore}</Text>
                </View>
            </View> 
            </View>
        )
    }

    //------------------------- METODI PER ACCEDERE CON EMAIL E PASSWORD ----------------------------

    function mostraCampiEmailEPassword(){
        isEmailEPasswordClicked= true;
        refFlatList.current.scrollToIndex({animated:true, index:1});
        setLabelEmailPasswordButton("ACCEDI");
    }

    function nascondiCampiEmailEPassword(){
        isEmailEPasswordClicked=false;
        refFlatList.current.scrollToIndex({animated:true, index:0});
        setLabelEmailPasswordButton("ACCEDI CON EMAIL/PASSWORD");
    }

    //accedere a firebase
    function accedi(){
        console.log("accedi");
        if(email.length==0 || password.length==0)
            setErrore("*inserire email e password.");
        else {
            if(errore.length>0) setErrore("");
            console.log("accedi a firebase...");
        }
    }
    //--------------------------------------------------

    console.log("Rendering LoginScreen.js");

    return (

        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior= {(Platform.OS === 'ios')? "padding" : null}
            >
                <View style={{alignItems:"center", justifyContent:"center"}}>
                    <ScrollView alignItems="center" justifyContent="center">
                        {/* eliminare il marginLeft, qui l'ho messo solo perchè il logo è storto */}
                        <Image source={require('../../../assets/icon/logoMos.jpg')} style={{width:200, marginLeft:18,height:200, alignSelf:"center"}}/> 
                        <View style={{alignItems:"center", justifyContent:"center"}}>
                            <Text style={styles.titolo}>Accedi a Mosaic</Text>
                            <Text style={styles.testo}>il social network alternativo</Text>
                        </View>

                        <FlatList
                            data={indici}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{flex:1, paddingTop:50}}
                            scrollEnabled={false}
                            removeClippedSubviews={false}
                            ref={refFlatList}
                            keyExtractor={item => item.id}
                            renderItem={({item,index})=>
                                index==0?ViewBonniGoogleETelefono():ViewEmailEPassword()}
                        />

                        <FAB
                            style={{backgroundColor:MosViola, marginBottom:20, left:20, width:Dimensions.get("window").width-40}}
                            small
                            icon="email-lock"
                            onPress={() => {
                                if(!isEmailEPasswordClicked)
                                    mostraCampiEmailEPassword();
                                else
                                    accedi();
                            }}
                            label={labelEmailPasswordButton}
                        />        
                        <View style={{flexGrow:1, alignItems:"center"}}>
                            <Text style={styles.registrati}>Registrati</Text>
                        </View>

                    </ScrollView>
                
                </View>
            </KeyboardAvoidingView>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
      flex:1,
      height: Dimensions.get("window").height,
      backgroundColor:"#fff",
      justifyContent:"center",
      alignItems:"center"
    },
    titolo:{
        fontSize:35,
        fontFamily: "Raleway_400Regular",
        color: MosCeleste,
    },
    testo:{
        fontSize:20,
        fontFamily: "Raleway_200ExtraLight",
        color: "#52575D",
    },
    registrati:{
        fontSize:20,
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
    },
  });
  