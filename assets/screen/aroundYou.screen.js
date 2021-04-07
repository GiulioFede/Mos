import React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import AroundYouComponent from '../component/aroundYou/aroundYou.component';

export default function AroundYou(){
    return (
        <View style={styles.container}>
            <AroundYouComponent />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });