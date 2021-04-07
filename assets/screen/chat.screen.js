import React from 'react';
import {Text, View, StyleSheet } from 'react-native';

export default function ChatScreen(){
    return (
        <View style={styles.container} >
            <Text>ChatScreen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });