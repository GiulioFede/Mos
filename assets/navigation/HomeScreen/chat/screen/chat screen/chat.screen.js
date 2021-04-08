import React from "react";
import {View, Text, StyleSheet, FlatList,Button, TouchableOpacity} from "react-native";
import {MaterialIcons, AntDesign} from "@expo/vector-icons";
import {useFonts, Raleway_400Regular} from '@expo-google-fonts/raleway';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ChatPreview from "./component/chat_preview.component";

//qui è dove simulo l'array contenente le preview delle chat NB: ci deve essere anche l'urlImmagineProfilo che però
//non posso dare in quanto il componente ChatPreview vuole l'url statico se usa require.
//noi in ChatPreview invece useremo (forse) fetch e allora potremmo passaglierlo
const Chat = [
    {
        id:"1",
        userName: 'Tom',
        messageTime: '4 minuti fa',
        messageText: 'Hey ciao!'
    },
    {
        id:"2",
        userName: 'Giovanna',
        messageTime: '15 minuti fa',
        messageText: 'Buongiorno!'
    },
    {
        id:"3",
        userName: 'Carlotta',
        messageTime: '1 ora fa',
        messageText: 'Va benissimo, a presto!'
    },
    {
        id:"4",
        userName: 'Michele',
        messageTime: 'ieri',
        messageText: 'Top! domani alle 15?'
    },
    {
        id:"5",
        userName: 'Katia',
        messageTime: '06/04/2021',
        messageText: 'Ahahahah ok ciao!'
    }
]

function HomeScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          onPress={() => navigation.navigate('Notifications')}
          title="Go to notifications"
        />
      </View>
    );
  }
  
  function NotificationsScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button onPress={() => navigation.goBack()} title="Go back home" />
      </View>
    );
  }

const Drawer = createDrawerNavigator();

export default function ChatScreen(){

    let [Raleway] = useFonts({Raleway_400Regular});
    if(!Raleway)
    return <View></View>

    //quando si clicca sull'icona 'menu': apri il menu laterale
    function apriUserSettings(){
        console.log("apri menu laterale");
    }
    

    return (
        <View style={styles.container}>
            {/* BARRA SUPERIORE */}
            <View style={styles.barraSuperiore}>
                    <TouchableOpacity onPress={apriUserSettings} >
                        <MaterialIcons name="menu" size={24} color="#52575D" />
                    </TouchableOpacity>
                        <Text style={styles.titolo}>Chat</Text>
                        <AntDesign name="bells" size={24} color="#52575D" />
            </View>
            {/* LISTA CHAT */}
            <FlatList
                data={Chat}
                keyExtractor={item=>item.id}
                renderItem={({item})=>(
                    <ChatPreview nome={item.userName}
                                 //urlImmagineProfilo={item.urlProfileImage}  quando lo avremo..
                                 dataUltimoMessaggio={item.messageTime}
                                 ultimoMessaggio={item.messageText}
                                 />
                )}
            >

            </FlatList>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:"#fff"
    },
    barraSuperiore:{
        flexDirection:"row",
        justifyContent:"space-between",
        paddingTop:24,
        paddingBottom: 24,
        marginHorizontal:16,
        alignItems:"center",
        borderBottomColor:"#e6e6e6",
        borderBottomWidth:0.2
    },
    titolo:{
        fontSize:25,
        fontFamily: "Raleway_400Regular",
        color: "#52575D",
    }
})