import React from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import ProfileComponent from './component/profile.component';


export default function Profile({navigation}){

    return (
        <View style={styles.container} >
                 <ProfileComponent navigation={navigation} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#fff"
    }
  });