import React from "react";
import * as firebase from 'firebase';
import 'firebase/firestore';


export function _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso){
   console.log("servizio: crea nuovo utente");

    var db = firebase.firestore();

    return db.collection("users").doc(userId).set({ //utilizzo set perchè voglio un id custom e non random
            name: nome,
            dateOfBirth: dataDiNascita,
            position: posizione,
            sex: sesso,
            sexPreference: preferenzaSesso
        });
}

export function _aggiornaImmagineProfilo(idUser, blob){
    console.log("servizio: aggiorno immagine profilo");

    var storage = firebase.storage();
    // ottengo un riferimento dello storage
    var storageRef = storage.ref();
    //accedo/creo la cartella codiceUtente/profilo
    var imgProfileFolderRef = storageRef.child('users/'+idUser+'/profile/immagineProfilo.jpg');
    
    return imgProfileFolderRef.put(blob);

}

export function _isProfiloCompletato(uid){
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(uid);

    return docRef.get();
}