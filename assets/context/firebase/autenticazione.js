
import React, {useState, useEffect, createContext} from "react";
import * as firebase from 'firebase';
import InizializzaApp from "./inizializzaApp";
import {_accediConEmailPassword, 
        _inviaCodiceDiVerifica, 
        _inviaEmailRecuperoPassword,
        _controllaCodiceDiVerificaTelefono,
        _controllaCodiceDiVerificaTelefonoEAggiornaNumero,
        _registraNuovoUtente,
        _inviaEmailDiVerifica,
        _logOut,
        _aggiornaEmail} from "./service/autenticazione.service";
import { _aggiornaImmagineProfilo, _caricaNuovaImmagineDiGalleria, _creaNuovoUtente, _getUrlImmagineProfiloUtente, _getUserInformation, _isProfiloCompletato, _eliminaImmagineDiGalleria, _cambiaImmagineDiProfilo, _aggiornaDettagliProfiloUtente } from "./service/firestore.service";
import { getCurrentUser } from "expo-google-sign-in";

console.log("autenticazione.js");



export const AutenticazioneUtente = createContext(); //all'inizio è falso

export const AutenticazioneUtenteProvider = ({children}) => {
    //se è true significa che siamo in fase di inizializzazione
    const [isInizializzazione, setIsInizializzazione] = useState(true);
    //contiene le informazioni dell'utente
    const [user, setUser] = useState(null);
    //se true indica che ha completato gli step necessari a configurare il profilo
    const [isUserProfileCompleted, setIsUserProfileCompleted] = useState(null);
    //parte importantissima. Contiene le informazioni dell'utente (settata dalla Home quando recupera le informazioni)
    const [informazioniProfiloUtente, setInformazioniProfiloUtente] = useState(null);
    //contiene le informazioni riguardo l'autenticazione (se email o telefono e il contenuto )
    const [informazioniAutenticazioneUtente, setInformazioniAutenticazioneUtente] = useState(null);
    //messaggio che può essere sfruttato per mostrare informazioni globali
    const [messaggioAuth, setMessaggioAuth] = useState(null);

    //quando il componente viene montato...
    useEffect(()=>{
        InizializzaApp(); //indico all'app dove si trova il database
        const unsubscribe = inizializzaAscoltatoreAutenticazione(); //mi metto in ascolto dei cambiamenti di stato dell'utente (loggato/non loggato)
        //subscriber();
        //quando il componente viene smontato elimino il listening (evitando memory leak)
        return () =>{
            console.log("elimino listener Auth autenticazione.");
            unsubscribe(); //elimino listener
        }
    },[])

    return <AutenticazioneUtente.Provider
                value = {{
                    user, //uid
                    isUserProfileCompleted,
                    isInizializzazione,
                    informazioniProfiloUtente,
                    informazioniAutenticazioneUtente,
                    messaggioAuth,
                    setMessaggioAuth,
                    setInformazioniProfiloUtente,
                    setInformazioniAutenticazioneUtente,
                    getUtenteCorrente,
                    logOut,
                    accediConEmailPassword,
                    inviaEmailRecuperoPassword,
                    inviaCodiceDiVerifica,
                    controllaCodiceDiVerificaTelefono,
                    controllaCodiceDiVerificaTelefonoEAggiornaNumero,
                    registraNuovoUtente,
                    inviaEmailDiVerifica,
                    creaNuovoUtente,
                    aggiornaImmagineProfilo,
                    isProfiloCompletato,
                    getUrlImmagineProfiloUtente,
                    getUserInformation,
                    caricaNuovaImmagineDiGalleria,
                    eliminaImmagineDiGalleria,
                    cambiaImmagineDiProfilo,
                    aggiornaEmail,
                    aggiornaDettagliProfiloUtente
                }}
                >
                {children}
            </AutenticazioneUtente.Provider>
    
    //chiamato ogni qual volta l'utente si logga o meno. La prima volta che viene chiamata serve anche a sottoscriversi all'evento
    function inizializzaAscoltatoreAutenticazione(){ 
            console.log("inizializzo ascoltatore login");

            return firebase.auth().onAuthStateChanged(function(user) {
                console.log("stato cambiato..........................................................................................");
                if (user) {
                    // User is signed in.
                    console.log("utente loggato");
                    console.log(user);
                    setUser(user.uid);
                    //controllo se il profilo è stato completato
                    isProfiloCompletato(user.uid)
                        .then((doc)=>{
                            //se è stato completato portalo direttamente alla home
                            if (doc.exists) {
                                console.log("L'utente ha completato il profilo.");
                                const metodo = [user.email,user.phoneNumber];
                                setInformazioniAutenticazioneUtente(metodo);
                                setIsUserProfileCompleted(true);
                            }else {
                                setIsUserProfileCompleted(false);
                            }
                        }).catch((e)=>{
                            console.log("Si è verificato un errore.");
                        })

                        //se l'utente non ha verificato l'email (se ha scelto questo come metodo di login allora esegui il logout)
                        if(user.email!=null && user.emailVerified==false){
                            logOut();
                            console.log("l'utente non ha ancora verificato l'email");
                        }
                } else {
                    // No user is signed in.
                    setIsUserProfileCompleted(false);
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

    function controllaCodiceDiVerificaTelefonoEAggiornaNumero(id, codice){
        console.log("verifico codice per aggiornare numero di telefono...");
        return _controllaCodiceDiVerificaTelefonoEAggiornaNumero(id,codice);

}

    //REGISTRA NUOVO UTENTE CON EMAIL E PASSWORD
    function registraNuovoUtente(email, password){
        console.log("registra nuovo utente");
        return _registraNuovoUtente(email,password);
    }

    //INVIA EMAIL DI VERIFICA
    function inviaEmailDiVerifica(user){
        console.log("invia email di verifica");
        return _inviaEmailDiVerifica();

    }
  }

  //CONTROLLA CHE IL PROFILO E' STATO COMPLETATO
   function isProfiloCompletato(uid){
    console.log("controllo che l'utente abbia completato il profilo");
    return _isProfiloCompletato(uid);
   }

   //AGGIORNA EMAIL
   function aggiornaEmail(nuovaEmail){
    console.log("aggiorno email_");
    return _aggiornaEmail(nuovaEmail);
   }

   //-------------------- METODI PER LA CREAZIONE DI UN NUOVO UTENTE ---------------------------------
    function creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso, urlImmagineProfilo){
        console.log("autenticazione: crea nuovo utente");
        return _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso, urlImmagineProfilo);
    }

    function aggiornaImmagineProfilo(idUser, blob){
        console.log("aggiorno immagine profilo");
        return _aggiornaImmagineProfilo(idUser,blob);
    }

    //-------------------- METODI PER L'UTENTE CORRENTE -----------------------------------------------
    function getUrlImmagineProfiloUtente(idUser){
        console.log("ottengo url immagine profilo");
        return _getUrlImmagineProfiloUtente(idUser);
    }

    function getUserInformation(idUser){
        console.log("ottengo info utente corrente");
        return _getUserInformation(idUser);
    }

    function caricaNuovaImmagineDiGalleria(idUser, blob){
        console.log("carico nuova immagine di galleria");
        return _caricaNuovaImmagineDiGalleria(idUser, blob);
    }

    function eliminaImmagineDiGalleria(idUser, value){
        console.log("elimino immagine di galleria_"+value);
        return _eliminaImmagineDiGalleria(idUser,value);
    }

    function cambiaImmagineDiProfilo(idUser, blob){
        console.log("cambio immagine di profilo_");
        return _cambiaImmagineDiProfilo(idUser,blob);
    }

    function aggiornaDettagliProfiloUtente(idUser,doc){
        console.log("aggiorno dettaglid del profilo utente_");
        return _aggiornaDettagliProfiloUtente(idUser,doc);
    }