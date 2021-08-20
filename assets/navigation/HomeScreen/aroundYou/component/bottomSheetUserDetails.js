import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React,{ useImperativeHandle, forwardRef, useState, useRef} from "react";
import { Text, View,StyleSheet, Dimensions, Image } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import { getAgeFromDate } from "../../../../context/utilities/functions.utilities";
import { altezzaBarraScreen, altezzaDevice, altezzaMenuNavigazione, altezzaSchermoInterno, fontSizeSottoTitolo, fontSizeTitolo } from "../../../../context/variabili_globali/variabiliGlobali";
import { MosCeleste, MosPurple, MosViola } from "../../../../resources/colors";
import {Entypo} from "@expo/vector-icons";



const BottomSheetUserDetails = forwardRef((props, ref) => {

    const bottomSheetRef = useRef();
    const isBottomSheetOpened = useRef(false);
    const userInformationViewRef = useRef();

    var {IMAGE_HEIGHT} = props;

    const altezzaBottomSheetUserDetails = IMAGE_HEIGHT*1.1;

     useImperativeHandle(ref, () => ({
        expandOrClose(){
            local_expandOrClose();
        },
        setNewUserInformationDetails(item){
            local_setNewUserInformationDetails(item);
        }
        
     }));

     function local_expandOrClose(){
        //setRefresh(!refresh);
        if(isBottomSheetOpened.current == false){
            bottomSheetRef.current.expand();
            isBottomSheetOpened.current = true;
        }
        else {
            bottomSheetRef.current.close();
            isBottomSheetOpened.current = false;
        }
     }


    function local_setNewUserInformationDetails(item){
        userInformationViewRef.current.updateUserInformation(item);
    }

     
    return (
        <>
            <BottomSheet
                            
                            ref = {bottomSheetRef}
                            snapPoints={[0,10000]}
                            
                            onAnimate={(n,i)=>{
                                //se n==1 significa che il menu viene chiuso
                                if(n==1) console.log(n);
                                if(n==1) isBottomSheetOpened.current=false;
                            }}
                           
                            
                        >
                            <BottomSheetScrollView>
                                 <View >
                                     <UserInformationView ref={userInformationViewRef}/>
                                 </View>
                                
                            </BottomSheetScrollView>
                        </BottomSheet>
            </>
        )
    }
)

export default BottomSheetUserDetails;

/*
    Utilizzo due Elementi (BottomSheetUserDetails e UserInformationView) perchè ho bisogno costantemente
    di re-renderizzare il contenuto testuale, cosa che mi bloccherebbe il menu se mettessi tutto insieme. In
    questo modo invece renderizzo solo lo UserInformationView.
*/

let cityTmp,regionTmp,countryTmp;

const UserInformationView = forwardRef((props, ref) => {

    const currentUserDisplayed = useRef(null);
    var galleryCurrentUser = useRef([]);
    const [refresh, setRefresh] = useState(false);

     useImperativeHandle(ref, () => ({
       updateUserInformation(item){
           local_updateUserInformation(item);
       }
        
     }));

     function local_updateUserInformation(item){
        currentUserDisplayed.current = item;
        galleryCurrentUser.current = Object.keys(currentUserDisplayed.current.gallery).map(function(key){
            return {key:key, url:currentUserDisplayed.current.gallery[key]}
        })
        //console.log(galleryCurrentUser);
        setRefresh(!refresh);
     }

     function getDistance(){
         return "50km";
     }

     function getHobbiesInterestsAndPassions(){
         return currentUserDisplayed.current.hobbies_interests_and_passions.map((hobby, index)=>{
             return <Text key={index} style={styles.keyword}>{hobby}</Text>
         });
     }

function getCityRegionCountryView(city, region, country){
    console.log(city+","+region+","+country);
    cityTmp=null,regionTmp=null,countryTmp=null;
    if(city!="null" && region!="null" && country!="null"){
        cityTmp = city;
        regionTmp = ","+region;
        countryTmp = ","+country;
    }
    else if(city=="null" && region!="null" && country!="null"){
        regionTmp = region;
        countryTmp = ","+country;
    }
    else if(city=="null" && region=="null" && country!="null"){
        countryTmp = country;
    }
    else if(city!="null" && region=="null" && country!="null"){
        cityTmp = city;
        countryTmp = ","+country;
    }

    return (
        <View style={{marginBottom:10, paddingLeft:10, flexDirection:"row"}}>
            {(cityTmp!=null || countryTmp!=null || regionTmp!=null) && <Entypo name="location-pin" size={fontSizeSottoTitolo} color="#444" />}
            {cityTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: fontSizeSottoTitolo, color:"#444"}}>{cityTmp}</Text>}
            {regionTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: fontSizeSottoTitolo, color:"#444"}}>{regionTmp}</Text>}
            {countryTmp!=null && <Text style={{fontFamily:"Raleway_200ExtraLight", fontSize: fontSizeSottoTitolo, color:"#444"}}>{countryTmp}</Text>}
        </View>
    )
}

     function getCurrentUserInformation(){
         if(currentUserDisplayed.current!=null)
         return (
             <>
                <View style={{flexDirection:"row", paddingBottom:5}}>
                    <Text style={styles.name}>{currentUserDisplayed.current.name}</Text>
                    <Text style={styles.age}>{currentUserDisplayed.age}</Text>
                </View>

                {getCityRegionCountryView(currentUserDisplayed.current.location.city,currentUserDisplayed.current.location.region,currentUserDisplayed.current.location.country)}
                
                <Text style={[styles.fieldBold,{marginTop:20}]}>Occupazione</Text>
                <Text style={[styles.fieldLight,{paddingBottom:20, paddingLeft:20, color:MosCeleste}]}>{currentUserDisplayed.current.current_occupation}</Text>

                <Text style={styles.fieldBold}>Sesso biologico</Text>
                <Text style={styles.content}>{currentUserDisplayed.current.biological_sex}</Text>
                <Text style={styles.fieldBold}>Identità di genere</Text>
                <Text style={styles.content}>{currentUserDisplayed.current.gender_identity}</Text>
                <Text style={styles.fieldBold}>Genere di preferenza</Text>
                <Text style={styles.content}>{currentUserDisplayed.current.gender_preference}</Text>

                <Divider style={{margin:10}} />

                <Text style={styles.fieldBold}>Hobby, interessi e passioni</Text>
                <View style={{margin:10, flexDirection:"row", flexGrow:1, flexWrap:"wrap"}}>
                    {getHobbiesInterestsAndPassions()}
                </View>

                <Divider style={{margin:10}} />

                <Text style={styles.fieldBold}>Descrizione di sé</Text>
                <Text style={[styles.fieldLight,{margin:10}]}>{currentUserDisplayed.current.self_description}</Text>

                <Divider style={{margin:10}} />

                <Text style={styles.fieldBold}>Galleria profilo</Text>
                <View style={{margin:20}}>
                    <FlatList
                        data = {galleryCurrentUser.current}
                        keyExtractor={(item)=>item.key}
                        horizontal
                        renderItem = {({item,index})=>{
                            console.log(index);
                            return (
                                <View>
                                    <Image source={{uri:item.url}} style={styles.imageGallery} />
                                </View>
                            )
                        }}
                    />
                </View>
            </>
         )
     }
     


    return (
        <View>
            {getCurrentUserInformation()}
        </View>
        )
    }
)


const styles = StyleSheet.create({
    
    name : {
        fontFamily: "Raleway_400Regular",
        color: '#444',
        fontSize: fontSizeTitolo*0.8,
        fontWeight: '900',
        paddingLeft:10
    },
    age : {
        fontFamily: "Raleway_200ExtraLight",
        color: '#444',
        fontSize: fontSizeTitolo*0.8,
        fontWeight: '900',
        paddingLeft:10
    },
    content: {
        fontFamily: "Raleway_200ExtraLight",
        color: MosCeleste,
        fontSize: fontSizeSottoTitolo*0.8,
        fontWeight: '900',
        margin:10,
        padding:10,
        paddingTop:0,
        marginTop:0
    },
    fieldLight: {
        fontFamily: "Raleway_200ExtraLight",
        color: '#444',
        fontSize: fontSizeSottoTitolo*0.8,
        fontWeight: '900',
        paddingLeft:10 
    },
    fieldBold: {
        fontFamily: "Raleway_400Regular",
        color: '#444',
        fontSize: fontSizeSottoTitolo*0.8,
        fontWeight: '900',
        paddingLeft:10 
    },
    keyword: {
        fontFamily: "Raleway_200ExtraLight",
        color: "#fff",
        backgroundColor:MosViola,
        borderRadius:10,
        fontSize: fontSizeSottoTitolo*0.8,
        fontWeight: '900',
        margin:10,
        padding:10
    },
    imageGallery:{
        width:Dimensions.get("window").width/2,
        height:Dimensions.get("window").width/2,
        marginRight:5
    }
    
  });