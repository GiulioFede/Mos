import React from 'react';
import {Text, View, StyleSheet } from 'react-native';

export default function AroundYou(){
    return (
        <View style={styles.container}>
            <Text>AroundYou</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });