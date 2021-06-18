import React from "react";
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions'


export function _creaNuovoUtente(userId, nome, dataDiNascita, posizione, sesso, preferenzaSesso){
   console.log("servizio: crea nuovo utente................................................................................");

    var db = firebase.firestore();

    return db.collection("users").doc(userId).set({ //utilizzo set perchè voglio un id custom e non random
            name: nome,
            dateOfBirth: dataDiNascita,
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

    /*
        Per prima cosa si elimina il riferimento su firestore. In questo modo se sullo storage qualcosa dovesse fallire in ogni
        caso per l'utente l'immagine continuerebbe ad essere eliminata.
        Se sullo storage qualche immagine viene eliminata e qualcun'altra no non ci sono problemi.
        Se sullo storage alcune foto da eliminare mancano non ci sono problemi.
    */
    export function _eliminaImmagineDiGalleria(idUser, url, nome){
        console.log("elimino immagine................................................................................:");
        var db = firebase.firestore();

        var userDocument = db.collection("users").doc(idUser);
        return userDocument.update({
            gallery: firebase.firestore.FieldValue.arrayRemove(nome)
            }).then((ris)=>{
                //riferimento in firestore eliminato...
                //elimino dallo storage tutte le 5 versioni
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

            }).catch((e)=>{
                throw e;
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


    //NUOVA VERSIONE 
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

    