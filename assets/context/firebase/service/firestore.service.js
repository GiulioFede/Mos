import React from "react";
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions'
const bucketName = "mos-test-db748.appspot.com"; // NB: CAMBIA 'mos-test-db748' QUANDO CAMBI NOME DATABASE
import NetInfo from '@react-native-community/netinfo';

export function _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso){
   console.log("servizio: crea nuovo utente................................................................................");

    var db = firebase.firestore();

    return db.collection("users").doc(userId).set({ //utilizzo set perchè voglio un id custom e non random
            name: nome,
            dateOfBirth: dataDiNascita,
            gallery: [],
            position: posizione,
            sex: sesso,
            sexPreference: preferenzaSesso,
            profileImageName: "profileImage1"
        });
}

export function _aggiornaImmagineProfilo(idUser, blob){
    console.log("servizio: aggiorno immagine profilo................................................................................");

    var storage = firebase.storage();
    // ottengo un riferimento dello storage
    var storageRef = storage.ref();
    //accedo/creo la cartella codiceUtente/profilo
    var imgProfileFolderRef = storageRef.child('users/'+idUser+'/profile/immagineProfilo.jpg');
    
    return imgProfileFolderRef.put(blob);

}

export function _isProfiloCompletato(uid){
    console.log("controllo completamento profilo................................................................................");
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(uid);

    return docRef.get();
}


//:::::::::::::::::::::::::::::::::::::::::::: METODI PER L'UTENTE CORRENTE :::::::::::::::::::::::::::::::::::::::

    //recupera l'immagine di profilo
    export function _getUrlImmagineProfiloUtente(idUser){
        console.log("ottengo url immagine profilo................................................................................");
        var storage = firebase.storage();
        // ottengo un riferimento dello storage
        var storageRef = storage.ref();
        //accedo/creo la cartella codiceUtente/profilo
        var userProfileImageRef = storageRef.child('users/'+idUser+'/profile/immagineProfilo.jpg');
        //ritorno l'URL dell'immagine
        return userProfileImageRef.getDownloadURL();
    }

    /*
    ottiene i dati dell'utente nel formato (dentro .data):
        - dateOfBirth
        - name
        - position
        - sex
        - sexPreference
    */
    export function _getUserInformation(idUser){
        console.log("ottengo info utente................................................................................");
        var db = firebase.firestore();

        var userDocument = db.collection("users").doc(idUser);
        return userDocument.get();
    }

    /*
    ottiene i media del profilo dell'utente:
        - profileImageUrl
        - gallery (array di url delle immagini di galleria dell'utente)
    */
   export function _getMediaProfiloUtente(){
        console.log("ottengo media profilo utente................................................................................");
        var db = firebase.firestore();

        var mediaDocument = db.collection("users").doc(firebase.auth().currentUser.uid).collection("media").doc("0"); //0 indica a risoluzione massima di visibilità
        return mediaDocument.get();
   }

    export function _caricaNuovaImmagineDiGalleria(idUser, blob){
        console.log("carico nuova immagine di galleria..................................................................");

        var storage = firebase.storage();
        // ottengo un riferimento dello storage
        var storageRef = storage.ref();
        //genero nome dal timestamp di oggi cosi da non avere mai duplicati
        let nomeFoto = new Date();
        nomeFoto = (nomeFoto.toString()).replace(/ /g,'');
        //accedo/creo la cartella codiceUtente/galleria
        var imgGalleryFolderRef = storageRef.child('users/'+idUser+'/profile/'+nomeFoto+'.jpg');


        //inserisco l'immagine nello storage (ricorda: anche se gestisco qui le promise, il fatto di ritornare la prima mi permette di gestirla anche al di fuori)
        return imgGalleryFolderRef.put(blob)
                    .then((ris)=>{
                        //scarico l'immagine
                        return _getUrlImmagineUtente(idUser, nomeFoto)
                            .then((url)=>{
                                console.log("url immagine nello storage ottenuto");
                                //salvo url nel profilo
                                var db = firebase.firestore();
                                //prendo il profilo
                                var profilo = db.collection("users").doc(idUser);
                                //aggiungo l'url all'attuale array galleria
                                return profilo.update({
                                    gallery: firebase.firestore.FieldValue.arrayUnion(url)
                                }).then((ris)=>{
                                    console.log("profilo aggiornato con l'url dela nuova immagine di galleria.");
                                    return url; //ritorno l'url remoto
                                }).catch((e)=>{
                                    throw e;
                                })
                            }).catch((e)=>{
                                throw e;
                            })
                    }).catch((e)=>{
                        throw e;
                    })
        
    }

    //recupera l'url dell'immagine il cui nome è indicato
    function _getUrlImmagineUtente(idUser, nomeFoto){
            console.log("ottengo url immagine ...............................................................................");
            var storage = firebase.storage();
            // ottengo un riferimento dello storage
            var storageRef = storage.ref();
            //accedo/creo la cartella codiceUtente/profilo
            var userProfileImageRef = storageRef.child('users/'+idUser+'/profile/'+nomeFoto+'.jpg');
            //ritorno l'URL dell'immagine
            return userProfileImageRef.getDownloadURL();
    }

    /*
        Per prima cosa si elimina il riferimento su firestore. In questo modo se sullo storage qualcosa dovesse fallire in ogni
        caso per l'utente l'immagine continuerebbe ad essere eliminata.
        Se sullo storage qualche immagine viene eliminata e qualcun'altra no non ci sono problemi.
        Se sullo storage alcune foto da eliminare mancano non ci sono problemi.
    */
    export function _eliminaImmagineDiGalleria(url, nome){
        console.log("elimino immagine................................................................................:");
        var db = firebase.firestore();
        const idUser = firebase.auth().currentUser.uid;
        console.log(nome);
        console.log(url);
        console.log(url.replace(nome,nome+"_25"));
        //faccio un batch per eliminare tutti i riferimenti su firestore nei 4 documenti dei media
        var batch = db.batch();
            //elimino riferimento immagine originale
        var eliminoUrlImmagineOriginale = db.collection("users").doc(idUser).collection("media").doc("0");
        batch.update(eliminoUrlImmagineOriginale,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 25
        var eliminoUrlImmagine25 = db.collection("users").doc(idUser).collection("media").doc("25");
        batch.update(eliminoUrlImmagine25,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 50
        var eliminoUrlImmagine50 = db.collection("users").doc(idUser).collection("media").doc("50");
        batch.update(eliminoUrlImmagine50,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 75
        var eliminoUrlImmagine75 = db.collection("users").doc(idUser).collection("media").doc("75");
        batch.update(eliminoUrlImmagine75,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 100
        var eliminoUrlImmagine100 = db.collection("users").doc(idUser).collection("media").doc("100");
        batch.update(eliminoUrlImmagine100,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});

        //faccio il commit del batch
        return batch.commit().then((ris)=>{
            //riferimento in firestore eliminato...
            //elimino dallo storage tutte le 5 versioni
            console.log("Elimino le 5 versioni sullo storage");
            var storage = firebase.storage().ref();
            
            var immagineOriginale = storage.child("users/"+idUser+"/"+nome);
            var immagine25 = storage.child("users/"+idUser+"/"+nome+"_25");
            var immagine50 = storage.child("users/"+idUser+"/"+nome+"_50");
            var immagine75 = storage.child("users/"+idUser+"/"+nome+"_75");
            var immagine100 = storage.child("users/"+idUser+"/"+nome+"_100");

            const promises = [immagineOriginale.delete(), immagine25.delete(), immagine50.delete(),immagine75.delete(), immagine100.delete()];
            return Promise.all(promises)
                        .then((ris)=>{
                            console.log("Le 5 versioni sono state correttamente eliminate");
                            return "all-versions-deleted";
                        }).catch((e)=>{
                            console.log("Non tutte le versioni sono state eliminate");
                            return "only-reference-removed";
                        })

            }).catch((e)=>{
                return e;
            })

    }

    //NEW
    export function _eliminaImmagineDiProfilo(nome){
        console.log("elimino immagine................................................................................:");
        var idUser = firebase.auth().currentUser.uid;
        //elimino dallo storage tutte le 5 versioni dell'immagine di profilo
        var storage = firebase.storage().ref();
        
        var immagineOriginale = storage.child("users/"+idUser+"/"+nome);
        var immagine25 = storage.child("users/"+idUser+"/"+nome+"_25");
        var immagine50 = storage.child("users/"+idUser+"/"+nome+"_50");
        var immagine75 = storage.child("users/"+idUser+"/"+nome+"_75");
        var immagine100 = storage.child("users/"+idUser+"/"+nome+"_100");

        const promises = [immagineOriginale.delete(), immagine25.delete(), immagine50.delete(),immagine75.delete(), immagine100.delete()];
        return Promise.all(promises)
                    .then((ris)=>{
                        return "all-versions-deleted";
                    }).catch((e)=>{
                        return "only-reference-removed";
                    })

    }

    //cambia immagine di profilo
    export function _cambiaImmagineDiProfilo(idUser, blob){
        var db = firebase.firestore();
        console.log("cambio immagine di profilo...............................................................................:");
        
        return _aggiornaImmagineProfilo(idUser,blob)
                 .then((ris)=>{
                    console.log("immagine di profilo aggiornata...ottengo url");
                                            //scarico l'immagine
                                            return _getUrlImmagineUtente(idUser, "immagineProfilo")
                                            .then((url)=>{
                                                console.log("url immagine di profilo nello storage ottenuto");
                                                //salvo url nel profilo
                                                var db = firebase.firestore();
                                                //prendo il profilo
                                                var profilo = db.collection("users").doc(idUser);
                                                //aggiono l'url all'attuale campo
                                                return profilo.update({
                                                    urlProfileImage: url
                                                }).then((ris)=>{
                                                    console.log("profilo aggiornato con l'url dela nuova immagine profilo.");
                                                    return url; //ritorno l'url remoto
                                                }).catch((e)=>{
                                                    throw e;
                                                })
                                            }).catch((e)=>{
                                                throw e;
                                            })
                 }).catch((e)=>{
                     throw e;
                 })
    }

    export function _aggiornaDettagliProfiloUtente(idUser, doc){
        var db = firebase.firestore();
        console.log("aggiorno dettali utente...............................................................................:");

        return db.collection("users").doc(idUser).update(doc);
    }


    //NUOVA VERSIONE (ok)
    //Caricare una nuova immagine di profilo (isForProfile=true) oppure di galleria (isForProfile=false)
    export function _caricaNuovaImmagine(base64, isForProfile, nomeImmagine){
        console.log("_carico immagine "+isForProfile);
        var uploadNewUserImage = firebase.functions().httpsCallable('uploadImage');

        /*
            Se l'immagine da cambiare è quella di profilo adotteremo la seguente strategia per assicurare la consistenza:
            1) l'immagine del profilo può avere solo due nomi: profileImage1 e profileImage2.
            2) Se attualmente il nome è profileImage1 si sceglierà come nome profileImage2 e viceversa.
            3) Si registrano le 5 versioni e poi si salva su firestore il nome (profileImage1 o profileImage2)
                a. se tutto va bene si prova ad eliminare le 5 vecchie versioni.
                    a.1 se le 5 vecchie versioni non vengono eliminate (per qualsiasi problema) al prossimo
                        aggiornamento del profilo dato che il riferimento è stato aggiornato nel punto 'a' 
                        queste verrebbero sovrascritte
                b. se le nuove 5 versioni non vengono memorizzate o vengono memorizzate parzialmente il riferimento
                   su firestore è ancora quello vecchio e si riferisce alle 5 versioni vecchie ancora presenti
            
            Nel caso peggiore ci sono 4 immagini ridondanti.
        */

        //se l'immagine da cambiare è quella del profilo
        var nomeImmagineProfilo = "";
        if(isForProfile==true){
            if(nomeImmagine == "profileImage1") nomeImmagineProfilo="profileImage2";
            else nomeImmagineProfilo = "profileImage1";
        }

        return uploadNewUserImage({ isForProfile: isForProfile, imageName:nomeImmagineProfilo, image: base64, idUser: firebase.auth().currentUser.uid });
    }

    export function _scaricaUrlImmagine(nomeImmagine){
        console.log("_ottieni url immagine");
        var storage = firebase.storage();
        var pathReference = storage.ref("users/"+firebase.auth().currentUser.uid+"/"+nomeImmagine);
        return pathReference.getDownloadURL();
    }

    //Nuova2
    export function _getNomeImmagineDaUrl(url){
        var httpsReference = firebase.storage().refFromURL(url);
        return httpsReference.name;
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
    export function _getListOfConversations(){
        console.log("ottengo lista conversazioni................................................................................:");

        var db = firebase.firestore();

        var listOfConversations = db.collection("users").doc(firebase.auth().currentUser.uid).collection("chats").doc("Conversations"); 
        return listOfConversations.get();

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
    export function _getChatSummaryInformation(idChat){
        console.log("ottengo informazioni chat riassuntive "+idChat+" ................................................................................:");

        var db = firebase.firestore();

        var chatSummary = db.collection("chats").doc(idChat);
        return chatSummary.get();
    }

    /*
    ottiene i media del profilo dell'utente con uid e livello di visibilità specificati:
        - profileImageUrl
        - gallery (array di url delle immagini di galleria dell'utente)
    */
        export function _getMediaProfiloContatto(uid, visibility){
            console.log("ottengo media profilo utente con uid="+uid+" ................................................................................");
            var db = firebase.firestore();
    
            var mediaDocument = db.collection("users").doc(uid).collection("media").doc(visibility); 
            return mediaDocument.get();
       }



    /*
            METODI PER LA MESSAGISTICA
    */
/*
    //invia un messaggio
    export async function _inviaNuovoMessaggio(chatId, contactUid, type, value){
        console.log("invio messaggio...")
        var db = firebase.firestore();
        
        //se il messaggio è un semplice testo
        if(type=="mex"){
            return db.collection("chats") //nella sezione chats
                     .doc(chatId) //nella conversazione chatId
                     .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                     .add({
                         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                         type: type,
                         value: value
                     });
        }
        else if (type=="audio"){
            try{
                //salvo sullo storage
                //in questo caso 'value' contiene l'uri locale (in cache) del file audio
                console.log("carico su firebase storage l'audio in "+value);
                let file = await fetch(value);
                let blob = await file.blob();
                let storage = firebase.storage();
                let name = getRandomString(10);
                let token = getRandomString(10);
                console.log("token:"+token);
                let destinationFolderRef = storage.ref("chats/"+chatId+"/"+name+".m4a");
                //aggiungo il file 
                await destinationFolderRef.put(blob);
                let downloadUrl = await destinationFolderRef.getDownloadURL();
                //in caso di successo invio anche su firestore un riferimento
                return db.collection("chats") //nella sezione chats
                     .doc(chatId) //nella conversazione chatId
                     .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                     .add({
                         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                         type: type,
                         value: downloadUrl
                     });
            }catch(e){
                throw e;
            }
                
        }
    }*/
    var array_of_requests = [];
    var array_of_new_requests = [];
    export async function _inviaNuovoMessaggio( chatId, 
                                                contactUid, 
                                                type, 
                                                value,
                                                callbackSuccess,
                                                callbackFailure){

            //se manca la connessione chiamo subito la callback di failure
            let connection_state = await NetInfo.fetch();
            if(connection_state.isConnected==false) callbackFailure();

            if(array_of_requests.length==0){
                array_of_requests.push([chatId,contactUid,type,value,{'onSuccess': function()  {callbackSuccess();}},{'onSuccess': function()  {callbackFailure();}}]);
                    try{
                        let served = 0;
                        while(1){
                            console.log("eseguo richieste di invio messaggi");
                            await array_of_requests.reduce( async(oldPromise,request_params) =>{
                                try{
                                    served++;
                                    await oldPromise;
                                    console.log("SUCCESSO: ESEGUO RICHIESTA ARRAY_REQUESTS");
                                    console.log(request_params[0]+","+request_params[1]+","+request_params[2]+","+request_params[3]);
                                    console.log(request_params[4]);
                                    //invio messaggio
                                    await _inviaMessaggio(request_params[0],request_params[1],request_params[2],request_params[3], served);
                                    console.log("messaggio inviato");
                                    //se è andato tutto bene eseguo la callback di successo
                                    await request_params[4]['onSuccess']();
                                    //indico alla successiva iterazione che è andato tutto bene
                                    Promise.resolve((1));
                                }catch(e){
                                        console.log("messaggio non inviato:"+e);
                                        //se è andato male eseguo la callback di fallimento
                                        request_params[5];
                                        //indico alla successiva iterazione che è andato male
                                        //Promise.reject(0);
                                        callbackFailure();
                                    }
                                },Promise.resolve(1));
                                //
                                console.log("FINE esecuzione richieste messaggi");
                                array_of_requests = [];
                                if(array_of_new_requests.length==0){
                                    break;
                                } 
                                else {
                                    array_of_requests = [...array_of_new_requests];
                                    array_of_new_requests = [];
                                }
                            }
                    }catch(err){
                        console.log("errore durante l'esecuzione di firestore.service._inviaNuovoMessaggio:"+err);
                        callbackFailure();
                    }finally{
                        array_of_requests = [];
                    }
                }else 
                    array_of_new_requests.push([chatId,contactUid,type,value,{'onSuccess': function()  {callbackSuccess();}},{'onSuccess': function()  {callbackFailure();}}]);
        }

    export async function _inviaMessaggio(chatId, 
                                    contactUid, 
                                    type, 
                                    value,
                                    served){
        console.log("invio messaggio...")
        var db = firebase.firestore();
        
        //se il messaggio è un semplice testo
        if(type=="mex"){
            try{
                return db.collection("chats") //nella sezione chats
                     .doc(chatId) //nella conversazione chatId
                     .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                     .add({
                         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                         type: type,
                         value: value,
                         served: served
                     });
            }catch(e){
                throw e;
            }
        }
        else if (type=="audio"){
            try{
                //salvo sullo storage
                //in questo caso 'value' contiene l'uri locale (in cache) del file audio
                console.log("carico su firebase storage l'audio in "+value);
                let file = await fetch(value);
                let blob = await file.blob();
                let storage = firebase.storage();
                let name = getRandomString(10);
                let token = getRandomString(10);
                console.log("token:"+token);
                let destinationFolderRef = storage.ref("chats/"+chatId+"/"+name+".m4a");
                //aggiungo il file 
                await destinationFolderRef.put(blob);
                let downloadUrl = await destinationFolderRef.getDownloadURL();
                //in caso di successo invio anche su firestore un riferimento
                return db.collection("chats") //nella sezione chats
                     .doc(chatId) //nella conversazione chatId
                     .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                     .add({
                         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                         type: type,
                         value: downloadUrl,
                         served: served
                     });
            }catch(e){
                console.log(e);
                throw e;
            }
                
        }
    }



    function getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for ( var i = 0; i < length; i++ ) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    export function _ottieniAscoltatoreNuoviMessaggi(chatID,channelID, lastTimestampStored){
        //ascolto documenti in una raccolta
        let db = firebase.firestore();
        //se lastTimestampStored == "-1" significa che la chat è appena iniziata
        if(lastTimestampStored=="-1")
            return db.collection("chats")
            .doc(chatID)
            .collection(channelID)
            .orderBy("timestamp");
        else
            return db.collection("chats")
                    .doc(chatID)
                    .collection(channelID)
                    .where("timestamp",">",new Date(lastTimestampStored))
                    .orderBy("timestamp");
    }


    