import React, {useState} from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';
import { altezzaBarraScreen, altezzaMenuNavigazione } from '../../../../context/variabili_globali/variabiliGlobali';

const {width, height} = Dimensions.get("window");
const IMAGE_WIDTH = width*0.8;
const IMAGE_HEIGHT = (width<height/2)?width*0.8*1.5:(height-altezzaBarraScreen*2-altezzaMenuNavigazione);//(width*0.8*1.3);

const ProfileImageCard = props => {

    const [error, setError] = useState(false);
    const {profileImageUrl} = props;

    return (
        <>
            <Image source = { error==true? require('../../../../resources/images/img-profile-not-found.png') : {uri: profileImageUrl} } style={styles.image} onError={(e)=>{setError(true)}} /> 
        </>
    )

}

export default ProfileImageCard;

const styles = StyleSheet.create({
    image: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        resizeMode: 'cover',
        borderRadius: 16,
    }
    
  });