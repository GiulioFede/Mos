
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
import { _aggiornaImmagineProfilo, _caricaNuovaImmagineDiGalleria, _creaNuovoUtente,_creaNuovoProfiloUtente, _getUrlImmagineProfiloUtente, _getUserInformation, _isProfiloCompletato, _eliminaImmagineDiGalleria, _cambiaImmagineDiProfilo, _aggiornaDettagliProfiloUtente, _caricaNuovaImmagine, _scaricaUrlImmagine, _eliminaImmagineDiProfilo, _getGalleriaUtente, _getMediaProfiloUtente, _getNomeImmagineDaUrl, _getListOfConversations, _getChatSummaryInformation, _getMediaProfiloContatto,_getAllMediaOfCurrentUser,_inviaNuovoMessaggio, _ottieniAscoltatoreNuoviMessaggi,_ottieniAscoltatoreNuoveNotifiche, _findNextTenClosestUsers, _updateAge, _createNewConversation, _removeNotification, _saveNewPushNotificationToken} from "./service/firestore.service";

console.log("autenticazione.js");



export const AutenticazioneUtente = createContext(); //all'inizio è falso

export const AutenticazioneUtenteProvider = ({children}) => {
    //se è true significa che siamo in fase di inizializzazione
    const [isInizializzazione, setIsInizializzazione] = useState(true);
    //contiene solo lo uid dell'utente
    const [user, setUser] = useState(null);
    //se true indica che ha completato gli step necessari a configurare il profilo
    const [isUserProfileCompleted, setIsUserProfileCompleted] = useState(null);
    //parte importantissima. Contiene le informazioni dell'utente (settata dalla Home quando recupera le informazioni)
    const [informazioniProfiloUtente, setInformazioniProfiloUtente] = useState(null);
    //contiene le informazioni riguardo l'autenticazione (se email o telefono e il contenuto )
    const [informazioniAutenticazioneUtente, setInformazioniAutenticazioneUtente] = useState(null);
    //messaggio che può essere sfruttato per mostrare informazioni globali
    const [messaggioAuth, setMessaggioAuth] = useState(null);
    /*
        contiene le chat dell'utente come array di mappe nel formato:
        {
            conversations: [
                0: {
                    chatId: "AHNCDJ..."
                    uid: "YSTRN..."
                },
                1: {
                    chatId: "BHNCDJ..."
                    uid: "ZSTRN..."
                }
            ]
        }

    */
    const [listOfConversations, setListOfConversations] = useState(null);

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
                    listOfConversations,
                    setMessaggioAuth,
                    setInformazioniProfiloUtente,
                    setInformazioniAutenticazioneUtente,
                    setListOfConversations,
                    getUtenteCorrente,
                    logOut,
                    saveNewPushNotificationToken,
                    accediConEmailPassword,
                    inviaEmailRecuperoPassword,
                    inviaCodiceDiVerifica,
                    controllaCodiceDiVerificaTelefono,
                    controllaCodiceDiVerificaTelefonoEAggiornaNumero,
                    registraNuovoUtente,
                    inviaEmailDiVerifica,
                    creaNuovoUtente,//vecchio, prendi quello sotto
                    creaNuovoProfiloUtente, //nuovo
                    aggiornaImmagineProfilo,
                    isProfiloCompletato,
                    getUrlImmagineProfiloUtente,
                    getUserInformation,
                    caricaNuovaImmagineDiGalleria,
                    eliminaImmagineDiGalleria,
                    cambiaImmagineDiProfilo,
                    updateAge,
                    aggiornaEmail,
                    aggiornaDettagliProfiloUtente,
                    caricaNuovaImmagine,
                    scaricaUrlImmagine,
                    eliminaImmagineDiProfilo,
                    getMediaProfiloUtente,
                    getNomeImmagineDaUrl,
                    getListOfConversations,
                    getChatSummaryInformation,
                    getMediaProfiloContatto,
                    inviaNuovoMessaggio,
                    ottieniAscoltatoreNuoviMessaggi,
                    ottieniAscoltatoreNuoveNotifiche,
                    removeNotification,
                    getAllMediaOfCurrentUser,
                    findNextTenClosestUsers,
                    createNewConversation
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

    async function saveNewPushNotificationToken(token){
        try{
            return await _saveNewPushNotificationToken(token);
        }catch(e){
            throw e;
        }
    }



  /*
            AROUND YOU
  */

        async function findNextTenClosestUsers(startAt, endAt, ageRange){
            try{
                return _findNextTenClosestUsers(startAt,endAt, informazioniProfiloUtente.gender_preference, ageRange);
            }catch(e){
                throw e;
            }
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
   //vecchio 
   function creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso){
        console.log("autenticazione: crea nuovo utente");
        return _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso);
    }
    //nuovo
    function creaNuovoProfiloUtente(base64,
                                    name,
                                    date_of_birth,
                                    age,
                                    biological_sex,
                                    gender_identity,
                                    gender_preference,
                                    self_description,
                                    hash,
                                    lat,
                                    lng,
                                    city,
                                    region,
                                    country,
                                    occupazione,
                                    keywords){
        try{
            console.log("creaNuovoProfiloUtente....");
            return _creaNuovoProfiloUtente( base64,
                                            name,
                                            date_of_birth,
                                            age,
                                            biological_sex,
                                            gender_identity,
                                            gender_preference,
                                            self_description,
                                            hash,
                                            lat,
                                            lng,
                                            city,
                                            region,
                                            country,
                                            occupazione,
                                            keywords);
        }catch(e){
            throw e;
        }
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

    //NEW
    function eliminaImmagineDiGalleria(nome){
        console.log("elimino immagine di galleria di nome "+nome);
        return _eliminaImmagineDiGalleria(nome);
    }

    function cambiaImmagineDiProfilo(idUser, blob){
        console.log("cambio immagine di profilo_");
        return _cambiaImmagineDiProfilo(idUser,blob);
    }

    function aggiornaDettagliProfiloUtente(idUser,doc){
        console.log("aggiorno dettaglid del profilo utente_");
        return _aggiornaDettagliProfiloUtente(idUser,doc);
    }

    //l'età (age) può essere inconsistente con quella di date_of_birth
    function updateAge(age){
        try{
            return _updateAge(age);
        }catch(e){
            throw e;
        }
    }

    //NEW:Caricare una nuova immagine di profilo (isForProfile=true e in tal caso nomeImmagine ha senso) oppure di galleria (isForProfile=false)
    function caricaNuovaImmagine(base64, isForProfile, nomeImmagine){
        console.log("carico nuova immagine");
        try{
            return _caricaNuovaImmagine(base64, isForProfile, nomeImmagine);
        }catch(e){
            throw e;
        }
    }

    //NEW: ottieni url immagine
    function scaricaUrlImmagine(path){
        console.log("ottieni url immagine");
        return _scaricaUrlImmagine(path);
    }

    //NEW: elimina immagine di profilo
    function eliminaImmagineDiProfilo(nome){
        console.log("elimina immagine di profilo");
        return _eliminaImmagineDiProfilo(nome);
    }

    //NEW2: ottieni media profilo utente
    function getMediaProfiloUtente(){
        console.log("ottengo media profilo utente");
        return _getMediaProfiloUtente();
    }

    //NEW2: ottieni nome immagine da url
    function getNomeImmagineDaUrl(url){
        return _getNomeImmagineDaUrl(url);
    }

    /*
        NEW2: ottieni la lista delle conversazioni nel formato:
                {
            conversations: [
                0: {
                    chatId: "AHNCDJ..."
                    uid: "YSTRN..."
                },
                1: {
                    chatId: "BHNCDJ..."
                    uid: "ZSTRN..."
                }
            ]
        }
    */
   function getListOfConversations(){
       return _getListOfConversations();
   }

   /*
    Data la mappa di sopra, ritorna le informazioni riassuntive su ogni chat nel formato:
        {
            lastMessage: {
                author: "YTRFS..."
                timestamp: "2021-07-..."
                type= "text"
                value = "Ciao!"
            }
            numberOfMessages: 37
        }
   */
  function getChatSummaryInformation(idChat){
      return _getChatSummaryInformation(idChat);
  }

  /*
    ottiene i media del profilo dell'utente con uid e livello di visibilità specificati:
        - profileImageUrl
        - gallery (array di url delle immagini di galleria dell'utente)
  */
  function getMediaProfiloContatto(uid, visibility){
      return _getMediaProfiloContatto(uid,visibility);
  }

  function getAllMediaOfCurrentUser(){
      return _getAllMediaOfCurrentUser();
  }

  /*
            METODI PER LA MESSAGGISTICA
  */

  //crea nuova conversazione
  async function createNewConversation(uidNewContact, nameNewContact, myName){
      try{
          return await _createNewConversation(uidNewContact, nameNewContact, myName);
      }catch(e){
          throw e;
      }
  }

  //invia un messaggio a un contactUid
  function inviaNuovoMessaggio(chatId, contactUid, type, value, callbackSuccess, callbackFailure){
      try{
       return _inviaNuovoMessaggio(chatId, contactUid, type, value, callbackSuccess, callbackFailure);
      }catch(e){
          console.log("errore in inviaNuovoMessaggio");
          throw e;
      }
  }

  function ottieniAscoltatoreNuoviMessaggi(chatID, channelID, lastTimestampStored){
      return _ottieniAscoltatoreNuoviMessaggi(chatID, channelID, lastTimestampStored);
  }

  function ottieniAscoltatoreNuoveNotifiche(ultimoTimestamp){//NB: ultimoTimestamp deve essere un numero (i secondi)
      try{
        return _ottieniAscoltatoreNuoveNotifiche(ultimoTimestamp);
      }catch(e){
            throw e;
      }
    }

    async function removeNotification(documentID){
        try{
            return await _removeNotification(documentID);
        }catch(e){
            throw e;
        }
    }



