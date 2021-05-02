import React from "react";
import * as firebase from 'firebase';
import * as Localization from 'expo-localization';

//____________________________________METODI PER AUTENTICARE GLI UTENTI_________________________________

//EMAIL E PASSWORD::::::::::::::::::::::::::::::::::::::::::::::
    //accedi con email e password
    export function _accediConEmailPassword(email, password){
        console.log("_accedi con email e password:"+email,password+"................................................................................");
        return firebase.auth().signInWithEmailAndPassword(email, password);

    }

    //invia email di recupero (DA RIVEDERE LA LINGUA)
    export function _inviaEmailRecuperoPassword(email){
        console.log("invio email recupero password a"+email+"................................................................................");
        const language = Localization.locale;
        console.log("linguaggio "+(language.substr(0,2)));
        firebase.auth().languageCode = 'fr';
        return firebase.auth().sendPasswordResetEmail(email);         
    }

    //registra nuovo utente con email e password
    export function _registraNuovoUtente(email, password){
        console.log("_registra nuovo utente................................................................................");
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    }

    //invia email per verificare l'account appena creato
    export function _inviaEmailDiVerifica(){
        console.log("_invia email di verifica................................................................................");
        var user = firebase.auth().currentUser;
        return user.sendEmailVerification();
    }

    //aggiorna email
    export function _aggiornaEmail(nuovaEmail){
        var user = firebase.auth().currentUser;

        return user.updateEmail(nuovaEmail);
    }

//TELEFONO::::::::::::::::::::::::::::::::::::::::::::::
    //invia codice di verifica a un numero specificato
    export function _inviaCodiceDiVerifica(numeroDiTelefono,captcha){
        console.log("_invia codice di  verifica................................................................................");
        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        return phoneProvider.verifyPhoneNumber(numeroDiTelefono, captcha);
    }

    //controlla che il codice inserito sia uguale a quello inviato dal server
    export function _controllaCodiceDiVerificaTelefono(id, codice){
        console.log("_controllo codice telefono................................................................................");
        const credential = firebase.auth.PhoneAuthProvider.credential(
            id,
            codice
          );
        return firebase.auth().signInWithCredential(credential);
    }

    //aggiorna il numero di telefono
    export function _controllaCodiceDiVerificaTelefonoEAggiornaNumero(id, codice){
        console.log("_aggiorno numero di telefono................................................................................");
        var user = firebase.auth().currentUser;
        const credential = firebase.auth.PhoneAuthProvider.credential(
            id,
            codice
          );
        
        //if(!user) throw new Error("Whoops!"); NB: inserire try catch in phoneauthverific...la dove richiama tale metodo
        return user.updatePhoneNumber(credential);
    }




//LOGOUT
    export function _logOut(){
        console.log("log out................................................................................")
        return firebase.auth().signOut();
    }


