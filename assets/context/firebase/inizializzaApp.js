import * as firebase from 'firebase';

export default function InizializzaApp(){
    console.log("inizializzaApp.js");
    //FIREBASE-----------------------------------------------------------
      //collegare l'app a Firebase
    
      var firebaseConfig = {
        apiKey: "AIzaSyBEYn0hg3rNWeljccSt6rgMNuSz2B7b6pE",
        authDomain: "mos-test-db748.firebaseapp.com",
        projectId: "mos-test-db748",
        storageBucket: "mos-test-db748.appspot.com",
        messagingSenderId: "490821524858",
        appId: "1:490821524858:web:64c3bf57b7e4489a430ac3",
        measurementId: "G-2D69E7K6M7"
      };
    
      if(!firebase.apps.length){
        console.log("app non collegata");
        firebase.initializeApp(firebaseConfig);
      }
      console.log("app inizializzata");
    //---------------------------------------------------------------------
}


