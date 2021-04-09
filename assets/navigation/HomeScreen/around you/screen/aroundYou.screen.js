import React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import AroundYouComponent from './component/aroundYou.component';

export default function AroundYou({navigation}){
    return (
        <View style={styles.container}>
            <AroundYouComponent  navigation={navigation}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });