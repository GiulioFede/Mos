import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import {AutenticazioneUtenteProvider} from './assets/context/firebase/autenticazione';
import Start from './Start';

/*TODO
  1) risolvere il problema del linguaggio dell'email di recupero password.

*/

export default function App() {

  return (
    <AutenticazioneUtenteProvider>
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Start/>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" 
        />
      </SafeAreaView>
    </View>
    </AutenticazioneUtenteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  safeArea:{
    flex:1
  }
});
