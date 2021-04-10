
import React, {useState, useEffect, createContext} from "react";
import * as firebase from 'firebase';
import InizializzaApp from "./inizializzaApp";
import {_accediConEmailPassword, _inviaEmailRecuperoPassword} from "./service/autenticazione.service";

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
        inizializzaAscoltatoreAutenticazione(); //mi metto in ascolto dei cambiamenti di stato dell'utente (loggato/non loggato)
    },[])

    return <AutenticazioneUtente.Provider
                value = {{
                    user,
                    isInizializzazione,
                    accediConEmailPassword,
                    inviaEmailRecuperoPassword
                }}
                >
                {children}
            </AutenticazioneUtente.Provider>
    
    //chiamato ogni qual volta l'utente si logga o meno. La prima volta che viene chiamata serve anche a sottoscriversi all'evento
    function inizializzaAscoltatoreAutenticazione(){ 
            console.log("inizializzo ascoltatore login");
            firebase.auth().onAuthStateChanged(function(user) {
                 //se l'app era in fase di inizializzazione la sblocco (succede solo la prima volta che la funzione viene chiamata)
                if(isInizializzazione)
                    setIsInizializzazione(false);
                if (user) {
                    // User is signed in.
                    console.log("utente loggato");
                    setUser(false);
                } else {
                    // No user is signed in.
                    console.log("utente non loggato");
                    setUser(null);
                }
            });
    }

    //-------------------- METODI DI AUTENTICAZIONE ---------------------------------
    function accediConEmailPassword(email, password){
        console.log("accedi con email e password");
        return _accediConEmailPassword(email,password)         
    }

    function inviaEmailRecuperoPassword(email){
        return _inviaEmailRecuperoPassword(email);
    }
  }
