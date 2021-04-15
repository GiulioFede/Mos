import React, {useContext} from 'react';
import { StyleSheet, Text, View, SafeAreaView} from 'react-native';
import {AutenticazioneUtenteProvider} from './assets/context/firebase/autenticazione';
import Start from './Start';
import {ColoreBarraDiStato, ColoreBarraDiStatoProvider} from "./assets/context/variabili_globali/variabiliGlobali";



/*TODO
  1) risolvere il problema del linguaggio dell'email di recupero password.

*/

export default function App() {

  var coloreBarra = useContext(ColoreBarraDiStato);

  return (
    <AutenticazioneUtenteProvider>
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <ColoreBarraDiStatoProvider >
          <Start/>
        </ColoreBarraDiStatoProvider>
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
