import React from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import ProfileComponent from '../component/profile/profile.component';

export default function Profile(){

    return (
        <View style={styles.container} >
                 <ProfileComponent />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#fff"
    }
  });