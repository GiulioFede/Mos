import React from "react";
import * as firebase from 'firebase';
import * as Localization from 'expo-localization';

//____________________________________METODI PER AUTENTICARE GLI UTENTI_________________________________

//EMAIL E PASSWORD::::::::::::::::::::::::::::::::::::::::::::::
    //accedi con email e password
    export function _accediConEmailPassword(email, password){
        console.log("_accedi con email e password:"+email,password);
        return firebase.auth().signInWithEmailAndPassword(email, password);

    }

    //invia email di recupero (DA RIVEDERE)
    export function _inviaEmailRecuperoPassword(email){
        console.log("invio email recupero password a"+email);
        const language = Localization.locale;
        console.log("linguaggio "+(language.substr(0,2)));
        firebase.auth().languageCode = 'fr';
        return firebase.auth().sendPasswordResetEmail(email);

            
    }
