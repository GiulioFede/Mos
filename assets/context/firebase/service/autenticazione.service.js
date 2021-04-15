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

    //invia email di recupero (DA RIVEDERE LA LINGUA)
    export function _inviaEmailRecuperoPassword(email){
        console.log("invio email recupero password a"+email);
        const language = Localization.locale;
        console.log("linguaggio "+(language.substr(0,2)));
        firebase.auth().languageCode = 'fr';
        return firebase.auth().sendPasswordResetEmail(email);         
    }

    //registra nuovo utente con email e password
    export function _registraNuovoUtente(email, password){
        console.log("_registra nuovo utente");
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    }

    //invia email per verificare l'account appena creato
    export function _inviaEmailDiVerifica(user){
        console.log("_invia email di verifica");
        return user.sendEmailVerification();
    }

//TELEFONO::::::::::::::::::::::::::::::::::::::::::::::
    //invia codice di verifica a un numero specificato
    export function _inviaCodiceDiVerifica(numeroDiTelefono,captcha){
        console.log("_invia codice di  verifica");
        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        return phoneProvider.verifyPhoneNumber(numeroDiTelefono, captcha);
    }

    //controlla che il codice inserito sia uguale a quello inviato dal server
    export function _controllaCodiceDiVerificaTelefono(id, codice){
        console.log("_controllo codice telefono");
        const credential = firebase.auth.PhoneAuthProvider.credential(
            id,
            codice
          );
        return firebase.auth().signInWithCredential(credential);

    }

