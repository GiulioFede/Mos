
import React, {useState, useEffect, createContext} from "react";
import * as firebase from 'firebase';
import InizializzaApp from "./inizializzaApp";
import {_accediConEmailPassword, 
        _inviaCodiceDiVerifica, 
        _inviaEmailRecuperoPassword,
        _controllaCodiceDiVerificaTelefono,
        _registraNuovoUtente,
        _inviaEmailDiVerifica,
        _logOut} from "./service/autenticazione.service";
import { _aggiornaImmagineProfilo, _creaNuovoUtente, _isProfiloCompletato } from "./service/firestore.service";

console.log("autenticazione.js");



export const AutenticazioneUtente = createContext(); //all'inizio è falso

export const AutenticazioneUtenteProvider = ({children}) => {
    //se è true significa che siamo in fase di inizializzazione
    const [isInizializzazione, setIsInizializzazione] = useState(true);
    //contiene le informazioni dell'utente
    const [user, setUser] = useState(null);

    //quando il componente viene montato...
    useEffect(()=>{
        InizializzaApp(); //indico all'app dove si trova il database
        const unsubscribe = inizializzaAscoltatoreAutenticazione(); //mi metto in ascolto dei cambiamenti di stato dell'utente (loggato/non loggato)
        //subscriber();
        //quando il componente viene smontato elimino il listening (evitando memory leak)
        return () =>{
            console.log("elimino listenter Auth autenticazione.");
            unsubscribe(); //elimino listener
        }
    },[])

    return <AutenticazioneUtente.Provider
                value = {{
                    user,
                    isInizializzazione,
                    getUtenteCorrente,
                    logOut,
                    accediConEmailPassword,
                    inviaEmailRecuperoPassword,
                    inviaCodiceDiVerifica,
                    controllaCodiceDiVerificaTelefono,
                    registraNuovoUtente,
                    inviaEmailDiVerifica,
                    creaNuovoUtente,
                    aggiornaImmagineProfilo,
                    isProfiloCompletato
                }}
                >
                {children}
            </AutenticazioneUtente.Provider>
    
    //chiamato ogni qual volta l'utente si logga o meno. La prima volta che viene chiamata serve anche a sottoscriversi all'evento
    function inizializzaAscoltatoreAutenticazione(){ 
            console.log("inizializzo ascoltatore login");

            return firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    console.log("utente loggato");
                    setUser(user.uid);
                } else {
                    // No user is signed in.
                    console.log("utente non loggato");
                    setUser(null);
                }
                
                //se l'app era in fase di inizializzazione la sblocco (succede solo la prima volta che la funzione viene chiamata)
                if(isInizializzazione)
                    setIsInizializzazione(false);
            });
    }

    function getUtenteCorrente(){
        return user;
    }

    function logOut(){
        return _logOut();
    }

    //-------------------- METODI DI AUTENTICAZIONE ---------------------------------

    //EMAIL E PASSWORD
    function accediConEmailPassword(email, password){
        console.log("accedi con email e password");
        return _accediConEmailPassword(email,password)         
    }

    function inviaEmailRecuperoPassword(email){
        return _inviaEmailRecuperoPassword(email);
    }

    //TELEFONO
    function inviaCodiceDiVerifica(numeroDiTelefono, captcha){
        console.log("invia codice di  verifica...");
        return _inviaCodiceDiVerifica(numeroDiTelefono,captcha);
    }

    function controllaCodiceDiVerificaTelefono(id, codice){
            console.log("verifico codice...");
            return _controllaCodiceDiVerificaTelefono(id,codice);

    }

    //REGISTRA NUOVO UTENTE CON EMAIL E PASSWORD
    function registraNuovoUtente(email, password){
        console.log("registra nuovo utente");
        return _registraNuovoUtente(email,password);
    }

    //INVIA EMAIL DI VERIFICA
    function inviaEmailDiVerifica(user){
        console.log("invia email di verifica");
        return _inviaEmailDiVerifica(user);

    }
  }

  //CONTROLLA CHE IL PROFILO E' STATO COMPLETATO
   function isProfiloCompletato(uid){
    console.log("controllo che l'utente abbia completato il profilo");
    return _isProfiloCompletato(uid);
   }

   //-------------------- METODI PER LA CREAZIONE DI UN NUOVO UTENTE ---------------------------------
    function creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso){
        console.log("autenticazione: crea nuovo utente");
        return _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso);
    }

    function aggiornaImmagineProfilo(idUser, blob){
        console.log("aggiorno immagine profilo");
        return _aggiornaImmagineProfilo(idUser,blob);
    }