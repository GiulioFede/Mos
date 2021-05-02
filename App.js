import React, {useContext} from 'react';
import { StyleSheet, Text, View, SafeAreaView} from 'react-native';
import {AutenticazioneUtenteProvider} from './assets/context/firebase/autenticazione';
import { Provider as PaperProvider } from 'react-native-paper';
import Start from './Start';
import {ColoreBarraDiStato, ColoreBarraDiStatoProvider} from "./assets/context/variabili_globali/variabiliGlobali";
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Setting a timer']);


/*TODO
  1) risolvere il problema del linguaggio dell'email di recupero password.
  2) Controllare dopo il deploy se utilizzare o meno la CACHE

*/


export default function App() {

  var coloreBarra = useContext(ColoreBarraDiStato);

  return (
    <AutenticazioneUtenteProvider>
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <PaperProvider>
          <ColoreBarraDiStatoProvider >
              <Start/>
          </ColoreBarraDiStatoProvider>
        </PaperProvider>
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
