import React from "react";
import * as firebase from 'firebase';
import 'firebase/firestore';


export function _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso, urlImmagineProfilo){
   console.log("servizio: crea nuovo utente................................................................................");

    var db = firebase.firestore();

    return db.collection("users").doc(userId).set({ //utilizzo set perchè voglio un id custom e non random
            name: nome,
            dateOfBirth: dataDiNascita,
            position: posizione,
            sex: sesso,
            sexPreference: preferenzaSesso,
            urlProfileImage: urlImmagineProfilo
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

    //ottiene i dati dell'utente
    export function _getUserInformation(idUser){
        console.log("ottengo info utente................................................................................");
        var db = firebase.firestore();

        var userDocument = db.collection("users").doc(idUser);
        return userDocument.get();
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

    //ritorna tutti gli url delle immagini della galleria (NB: value è l'url -->firestore elimina elementi array solo per valore e non per indice)
    export function _eliminaImmagineDiGalleria(idUser, value){
        console.log("elimino immagine................................................................................:");
        var db = firebase.firestore();

        var userDocument = db.collection("users").doc(idUser);
        return userDocument.update({
            gallery: firebase.firestore.FieldValue.arrayRemove(value)
            }).then((ris)=>{
                //immagine in firestore eliminata...
                //elimino dallo storage
                var storage = firebase.storage();
                // ottengo un riferimento dello storage dove si trova l'immagine utilizzando il suo url
                var storageRef = storage.refFromURL(value);
                //elimino
                return storageRef.delete();

            }).catch((e)=>{
                throw e;
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