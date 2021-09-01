import React from "react";
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions'
const bucketName = "mos-test-db748.appspot.com"; // NB: CAMBIA 'mos-test-db748' QUANDO CAMBI NOME DATABASE
import NetInfo from '@react-native-community/netinfo';
import { sendPushNotification } from "../../push_notifications/functions";

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
    export function _eliminaImmagineDiGalleria(nome){
        console.log("elimino immagine................................................................................:");
        var db = firebase.firestore();
        const idUser = firebase.auth().currentUser.uid;
        
        //faccio un batch per eliminare tutti i riferimenti su firestore nei 2 documenti dei media
        var batch = db.batch();
            //elimino riferimento immagine originale
        var eliminoUrlImmagineOriginale = db.collection("users").doc(idUser).collection("media").doc("0");
        batch.update(eliminoUrlImmagineOriginale,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 25
        //var eliminoUrlImmagine25 = db.collection("users").doc(idUser).collection("media").doc("25");
        //batch.update(eliminoUrlImmagine25,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 50
        var eliminoUrlImmagine50 = db.collection("users").doc(idUser).collection("media").doc("50");
        batch.update(eliminoUrlImmagine50,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 75
        //var eliminoUrlImmagine75 = db.collection("users").doc(idUser).collection("media").doc("75");
        //batch.update(eliminoUrlImmagine75,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});
            //elimino riferimento immagine 100
        var eliminoUrlImmagine100 = db.collection("users").doc(idUser).collection("media").doc("100");
        batch.update(eliminoUrlImmagine100,{[`gallery.${nome}`]: firebase.firestore.FieldValue.delete()});

        //faccio il commit del batch
        return batch.commit().then((ris)=>{
            //riferimento in firestore eliminato...
            //elimino dallo storage tutte le 5 versioni
            console.log("Elimino le 3 versioni sullo storage");
            var storage = firebase.storage().ref();
            
            var immagineOriginale = storage.child("users/"+idUser+"/"+nome);
            //var immagine25 = storage.child("users/"+idUser+"/"+nome+"_25");
            var immagine50 = storage.child("users/"+idUser+"/"+nome+"_50");
            //var immagine75 = storage.child("users/"+idUser+"/"+nome+"_75");
            var immagine100 = storage.child("users/"+idUser+"/"+nome+"_100");

            //const promises = [immagineOriginale.delete(), immagine25.delete(), immagine50.delete(),immagine75.delete(), immagine100.delete()];
            const promises = [immagineOriginale.delete(), immagine50.delete(), immagine100.delete()];
            
            return Promise.all(promises)
                        .then((ris)=>{
                            console.log("Le 3 versioni sono state correttamente eliminate");
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
        //elimino dallo storage tutte le 3 versioni dell'immagine di profilo
        var storage = firebase.storage().ref();
        
        var immagineOriginale = storage.child("users/"+idUser+"/"+nome);
        //var immagine25 = storage.child("users/"+idUser+"/"+nome+"_25");
        var immagine50 = storage.child("users/"+idUser+"/"+nome+"_50");
        //var immagine75 = storage.child("users/"+idUser+"/"+nome+"_75");
        var immagine100 = storage.child("users/"+idUser+"/"+nome+"_100");

        //const promises = [immagineOriginale.delete(), immagine25.delete(), immagine50.delete(),immagine75.delete(), immagine100.delete()];
        const promises = [immagineOriginale.delete(), immagine50.delete(), immagine100.delete()];
        
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
        console.log("aggiorno dettali utente "+idUser+"...............................................................................:");

        return db.collection("users").doc(idUser).update(doc);
    }

    export function _updateAge(age){
        try{
            var db = firebase.firestore();
            console.log("aggiorno età utente a "+age);
    
            return db.collection("users").doc(firebase.auth().currentUser.uid).update({age:age});
        }catch(e){
            throw e;
        }
    }

    //NUOVA VERSIONE
    export function _creaNuovoProfiloUtente(base64,
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
            console.log("_creaNuovoProfiloUtente...");
            var creaProfilo = firebase.functions().httpsCallable('createNewUserProfile');
            return creaProfilo({
                image: base64,
                name: name,
                date_of_birth: date_of_birth.toString(),
                age: age,
                biological_sex: biological_sex,
                gender_identity: gender_identity,
                gender_preference: gender_preference,
                self_description: self_description,
                hash: hash,
                lat: lat,
                lng: lng,
                city: city,
                region: region,
                country: country,
                occupation: occupazione,
                keywords: keywords
            });
        }catch(e){
            throw e;
        }
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

        try{
            console.log("carico nuova immagine "+nomeImmagine+" con isForProfile="+isForProfile);
            return uploadNewUserImage({ isForProfile: isForProfile, imageName:nomeImmagine, image: base64, idUser: firebase.auth().currentUser.uid });
        }catch(e){
            throw e;
        }
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
        //console.log("ottengo informazioni chat riassuntive "+idChat+" ................................................................................:");

        var db = firebase.firestore();

        var chatSummary = db.collection("chats").doc(idChat);
        return chatSummary.get();
    }

    /*
    ottiene i media del profilo dell'utente con uid e livello di visibilità specificati:
        - profileImageUrl
        - gallery (array di url delle immagini di galleria dell'utente)
    */
        export async function _getMediaProfiloContatto(uid, visibility){
            try{
                console.log("ottengo media profilo utente con uid="+uid+" ................................................................................");
                var db = firebase.firestore();
        
                var mediaDocument = db.collection("users").doc(uid).collection("media").doc(visibility); 
                return mediaDocument.get();
            }catch(e){
                throw e;
            }
       }

       export async function _getAllMediaOfCurrentUser(){
            let uid = firebase.auth().currentUser.uid;
            return Promise.all([_getMediaProfiloContatto(uid,"0"),
                               //_getMediaProfiloContatto(uid,"25"),
                               _getMediaProfiloContatto(uid,"50"),
                               //_getMediaProfiloContatto(uid,"75"),
                               _getMediaProfiloContatto(uid,"100")])
                                    .then((ris)=>{
                                        let media = new Object();
                                        //media["profileImageUrl"]={url_0: ris[0].data().profileImageUrl, url_25: ris[1].data().profileImageUrl, url_50: ris[2].data().profileImageUrl, url_75: ris[3].data().profileImageUrl, url_100: ris[4].data().profileImageUrl }
                                        media["profileImageUrl"]={url_0: ris[0].data().profileImageUrl, url_50: ris[1].data().profileImageUrl, url_100: ris[2].data().profileImageUrl }
                                        media["gallery"] = {};
                                        let gallery = [];
                                        for(let key in ris[0].data().gallery){
                                            //console.log("chiave:"+key);
                                            //console.log("media attuali:");
                                            //console.log(media);
                                            //gallery.push({name: key, url_0: ris[0].data().gallery[key], url_25: ris[1].data().gallery[key], url_50: ris[2].data().gallery[key], url_75: ris[3].data().gallery[key], url_100: ris[4].data().gallery[key] });
                                            gallery.push({name: key, url_0: ris[0].data().gallery[key], url_50: ris[1].data().gallery[key], url_100: ris[2].data().gallery[key] });
                                        
                                        }
                                        
                                        /*let newMedia = new Object();
                                        Object.keys(media["gallery"]).sort(function(a,b){if(a>b) return 0; else return 1}).reduce((prev,succ)=>{if(prev!=undefined) newMedia.push({[`${prev}`]: media["gallery"][prev]}); newMedia.push({[`${succ}`]: media["gallery"][succ]});})
                                        
                                        media["gallery"] = newMedia;*/
                                        media["gallery"] = gallery;
                                        //console.log("media fiinali:");
                                        //console.log(media["gallery"]);
                                        return media;
                                    })

       }



    /*
            METODI PER LA MESSAGISTICA
    */

    //creazione nuova conversazione
    export async function _createNewConversation(uidNewContact, nameNewContact, myName){
        try{

            var db = firebase.firestore();

            //riferimento utente con cui voglio conversare
            var contactDoc = db.collection("users").doc(uidNewContact);
            //riferimento nuova conversazione
            var nuovaConversazionePath = db.collection("chats").doc(); //random id
            //riferimento mio documento users/me/Conversations/conversations
            var myConversations = db.collection("users").doc(firebase.auth().currentUser.uid).collection("chats").doc("Conversations");
            //riferimento documento contatto users/me/Conversations/conversations
            var contactConversations = db.collection("users").doc(uidNewContact).collection("chats").doc("Conversations");
            //avviso (oltre che con la push notifications che verrà fatta dal chiamante della funzione) l'utente con una notifica
            var contactNotificationChannel = db.collection("users").doc(uidNewContact).collection("notifications").doc();

            return db.runTransaction(async (transaction) =>{
                /*
                    non controllo se il documento chats/Conversations esiste già in quanto lo creo (anche vuoto)
                    in fase di creazione del profilo. In questo modo l'utente X che vuole parlare con Y avrà come
                    autorizzazione solo la possibilità di incrementare l'array conversation col suo id
                */

                /*
                    controllo che l'utente con cui voglio conversare esista ancora. Infatti è possibile vedere in "Around You"
                    una vista non aggiornata.
                */
               let contactInfo = await transaction.get(contactDoc);
               if(!contactInfo.exists){
                   throw "User not exists";
               }

               //scarico conversazioni contatto
               let contact_conversations_info = await transaction.get(contactConversations);
               //se il contatto possiede già una conversazione in cui come uid possiede noi allora fermo tutto
               //oppure se il contatto ha bloccato l'utente allora fermo tutto
               if(!contact_conversations_info.exists){
                   console.log("errore transazione creazione conversazione: non è stato possibile trovare le informazioni dell'utente");
                   throw "General error";
               }
               else {
                   //return contact_conversations_info.data();
                   for(let i=0; i<contact_conversations_info.data().conversations.length; i++){
                       //se esistiamo già mando errore
                       if(contact_conversations_info.data().conversations[i].uid==firebase.auth().currentUser.uid){
                           //se però è anche blocked
                           if(contact_conversations_info.data().conversations[i].hasOwnProperty("blocked")){
                                console.log("errore transazione creazione conversazione: l'utente corrente è stato bloccato dal contatto'");
                                throw "The user blocked you";
                           }else {
                                console.log("errore transazione creazione conversazione: la chat esiste già");
                                throw "A conversation already exists";
                           }
                       }
                   }
               }

               //se tutto va bene allora creo conversazione
               //creo nuova chat nella collezione chats
               let nomeCampoContatto = uidNewContact+"_response";
               let nomeCampoUtenteCorrente = firebase.auth().currentUser.uid+"_response";
               await transaction.set(nuovaConversazionePath, {
                                                              lastMessage:{
                                                                  author:null,
                                                                  timestamp:null,
                                                                  type:null,
                                                                  value:null
                                                                },
                                                               level_of_visibility:0,
                                                               statistics:{
                                                                    [`${nomeCampoContatto}`]:null, 
                                                                    administrator: firebase.auth().currentUser.uid, 
                                                                    //lastAuthor: null, 
                                                                    number_of_messages:0, 
                                                                    [`${nomeCampoUtenteCorrente}`]:null
                                                               }
                                                            });
                //siccome per eliminare la conversazione ci sarà bisogno di un campo data uguale, lo creo prima
                let now = new Date().getTime();
                 //creo nel mio profilo la coppia {chatId: nuovoId, uid: contatto, creation_data: data di oggi}
                transaction.update(myConversations,{conversations: firebase.firestore.FieldValue.arrayUnion({chatId:nuovaConversazionePath.id, uid:uidNewContact, contactName: nameNewContact, creation_data: now})});
                //creo nel profilo del contatto la coppia {chatId: nuovoId, uid: mioUid, creation_data: data di oggi}
                transaction.update(contactConversations,{conversations: firebase.firestore.FieldValue.arrayUnion({chatId:nuovaConversazionePath.id, uid:firebase.auth().currentUser.uid,contactName: myName, creation_data: now})});   
                //creo nel profilo del contatto una notifica
                transaction.set(contactNotificationChannel,{author: myName, type: "JOIN", timestamp: now}); 

                return [nuovaConversazionePath.id, now];
            });

        }catch(e){
            console.log("errore transazione creazione chat:"+e);
            throw e;
        }
    }
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
                                                lastAuthor,
                                                callbackSuccess,
                                                callbackFailure){


            console.log("_invia nuovo messaggio "+type);
            //se manca la connessione chiamo subito la callback di failure
            let connection_state = await NetInfo.fetch();
            if(connection_state.isConnected==false) callbackFailure();

            if(array_of_requests.length==0){
                array_of_requests.push([chatId,contactUid,type,value,lastAuthor,{'onSuccess': function()  {callbackSuccess();}},{'onSuccess': function()  {callbackFailure();}}]);
                    try{
                        while(1){
                            console.log("eseguo richieste di invio messaggi");
                            await array_of_requests.reduce( async(oldPromise,request_params) =>{
                                try{
                                    await oldPromise;
                                    console.log("SUCCESSO: ESEGUO RICHIESTA ARRAY_REQUESTS");
                                    console.log(request_params[0]+","+request_params[1]+","+request_params[2]+","+request_params[3]);
                                    console.log(request_params[4]);
                                    //invio messaggio
                                    await _inviaMessaggio(request_params[0],request_params[1],request_params[2],request_params[3],request_params[4]);
                                    console.log("messaggio inviato");
                                    //se è andato tutto bene eseguo la callback di successo
                                    await request_params[5]['onSuccess']();
                                    //indico alla successiva iterazione che è andato tutto bene
                                    Promise.resolve((1));
                                }catch(e){
                                        console.log("messaggio non inviato:"+e);
                                        //se è andato male eseguo la callback di fallimento
                                        request_params[6];
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
                    array_of_new_requests.push([chatId,contactUid,type,value,lastAuthor,{'onSuccess': function()  {callbackSuccess();}},{'onSuccess': function()  {callbackFailure();}}]);
        }

    export async function _inviaMessaggio(chatId, 
                                    contactUid, 
                                    type, 
                                    value,
                                    lastAuthor
                                    ){
        console.log("invio messaggio...")
        var db = firebase.firestore();
        var batch = db.batch();
        //se il messaggio è un semplice testo
        if(type=="mex"){
            try{
                let data = new Date().getTime();
                var inserisciNelCanale = db.collection("chats") //nella sezione chats
                     .doc(chatId) //nella conversazione chatId
                     .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                     .doc();
                batch.set(inserisciNelCanale,{
                         timestamp: data,
                         type: type,
                         value: value
                     });
                var aggiornaUltimoMessaggio = db.collection("chats")
                     .doc(chatId);
                
                if(lastAuthor!="MAXIMUM VISIBILITY ACHIVED"){
                    batch.update(aggiornaUltimoMessaggio,{
                        lastMessage: {
                            author: firebase.auth().currentUser.uid,
                            timestamp: data,
                            type: type,
                            value: value
                        },
                        'statistics.number_of_messages': firebase.firestore.FieldValue.increment( (lastAuthor==null || lastAuthor!=firebase.auth().currentUser.uid)?1:0)
                    }, {merge:true})
                }else {
                    batch.update(aggiornaUltimoMessaggio,{
                        lastMessage: {
                            author: firebase.auth().currentUser.uid,
                            timestamp: data,
                            type: type,
                            value: value
                        },
                    }, {merge:true})
                }

                return batch.commit();
                     
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
                /*
                    Come nome del file utilizzo il timestamp in millisecondi. In questo modo quando l'utente si collegherà,
                    aprirà la chat e ci saranno per esempio 5 nuovi messaggi lui li preleverà tutti e 5 e solo dopo avvierà 
                    una eliminazione dei 5 file con questo ordine:
                        1) lista tutti i file
                        2) per ogni file presente, se il suo nome è minore o uguale dell'ultimo nome/timestamp ricevuto allora lo elimina
                        3) se la 2) per un file non risulta vera è il caso in cui, mentre scarico i 5 file se ne aggiunge un 6 che però non ho ancora salvato in locale
                           quindi grazie alla logica della 2) non lo elimino ma sarà l'ultimo file (il 6°) a far ciò
                */
                let name = new Date().getTime(); //NB: crealo adesso e utilizzalo come nome e come timestamp per la chat perchè altrimenti se utilizzi new Date due volte saranno diversi
                let token = getRandomString(10);
                console.log("token:"+token);
                let destinationFolderRef = storage.ref("chats/"+chatId+"/"+name.toString()+".m4a");
                //aggiungo il file 
                await destinationFolderRef.put(blob);
                let downloadUrl = await destinationFolderRef.getDownloadURL();
                //in caso di successo invio anche su firestore un riferimento

                var inserisciNelCanale = db.collection("chats") //nella sezione chats
                                            .doc(chatId) //nella conversazione chatId
                                            .collection(contactUid) //nel canale destinato al contatto col quale si sta messaggiando
                                            .doc();
                batch.set(inserisciNelCanale,{
                            timestamp: name,
                            type: type,
                            value: downloadUrl
                        });
                var aggiornaUltimoMessaggio = db.collection("chats")
                                                .doc(chatId);
                batch.update(aggiornaUltimoMessaggio,{
                        lastMessage: {
                            author: firebase.auth().currentUser.uid,
                            timestamp: name,
                            type: type,
                            value: "" 
                        },
                        'statistics.number_of_messages': firebase.firestore.FieldValue.increment( (lastAuthor==null || lastAuthor!=firebase.auth().currentUser.uid)?1:0)
                    }, {merge:true})

                return batch.commit();
            }catch(e){
                console.log(e);
                throw e;
            }
                
        }
    }

    export async function _removeMessages(chatId, seconds){ //per messaggi si intende sia testuale che audio, ma se audio rimuove solo il messaggio su firestore. Ci penserà la _removeGroupOfAudiosBeforeTimestamp a fare il resto
        try {
            let db = firebase.firestore();
            console.log("elimino messaggi con timestamp minore di "+new Date(seconds*1000).toString());
            return await db.collection("chats")
                     .doc(chatId)
                     .collection(firebase.auth().currentUser.uid)
                     .where("timestamp","<=",seconds)
                     .get().then(function(querySnapshot){
                        querySnapshot.forEach(function(doc){
                            console.log("elimino doc:"+doc.id);
                            doc.ref.delete();
                        })
                     })
        }catch(e){
            throw e;
        }
    }

    export async function _removeGroupOfAudiosBeforeTimestamp(chatId,milliseconds){
        try {
            var storage = firebase.storage();
            // ottengo un riferimento dello storage
            var storageRef = storage.ref();
            //accedo alla cartella chats/chatId
            var chatFolder = storageRef.child('chats/'+chatId);
            console.log("elimino tutti gli audio con timestamp/nome minore di "+milliseconds);
            return chatFolder.listAll().then((listResults)=>{
                console.log("listo tutti i files");
                listResults.items.forEach(async(itemRef)=>{
                    //se il nome di tale elemento (che è un timestamp ) è minore o uguale all'ultimo, allora lo elimino
                    let name = parseInt(itemRef.name.split('.')[0]);
                    if(name <= milliseconds){
                        console.log("l'emento "+name+" è minore o uguale a quello di riferimento "+ milliseconds)
                        await itemRef.delete();
                        console.log("elemento "+name+" eliminato");
                    }
                })
            })
            
        }catch(e){
            throw e;
        }
    }

    export async function _removeMediaFolderOnStorage(userId){
        try {
            var storage = firebase.storage();
            // ottengo un riferimento dello storage
            var storageRef = storage.ref();
            //accedo alla cartella chats/chatId
            var mediaFolder = storageRef.child('users/'+userId);

            return mediaFolder.listAll().then((listResults)=>{
                console.log("listo tutti i files");
                listResults.items.forEach(async(itemRef)=>{
                        await itemRef.delete();
                })
            })
            
        }catch(e){
            throw e;
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

    export function _ottieniAscoltatoreNuoviMessaggi(chatID,channelID, lastMillisecondsStored){
        //ascolto documenti in una raccolta
        let db = firebase.firestore();
        console.log("ottenimento ascoltatore per messaggi con timestamp maggiore di "+lastMillisecondsStored);
        console.log("argomenti:"+chatID+","+channelID+","+lastMillisecondsStored);
        //se lastTimestampStored == -1 significa che la chat è appena iniziata
        if(lastMillisecondsStored==-1)
            return db.collection("chats")
            .doc(chatID)
            .collection(channelID)
            .orderBy("timestamp", "asc");
        else
            return db.collection("chats")
                    .doc(chatID)
                    .collection(channelID)
                    .where("timestamp",">",lastMillisecondsStored)
                    .orderBy("timestamp", "asc");
    }

    export function _ottieniAscoltatoreNuoveNotifiche(ultimoTimestamp){ //NB: ultimoTimestamp deve essere un numero (i secondi)
        try{
        //ascolto documenti in una raccolta
            let db = firebase.firestore();
            //se non esiste alcun timestamp (ossia non esiste neppure una notifica memorizzata in locale)
            if(ultimoTimestamp==-1)
                return db.collection("users")
                         .doc(firebase.auth().currentUser.uid)
                         .collection("notifications")
                         .where("timestamp",">", new Date().getTime()); //perchè? Ogni volta che scarico una notifica la salvo in locale e la elimino in remoto. 
                                                              //Se quest'ultima operazione dovesse fallire allora potrei avere su un device diverso
                                                              //il download della stessa notifica anche se sono passati molti giorni. Ho bisogno quindi
                                                              //di un punto di inizio fermo.
            else {
                return db.collection("users")
                         .doc(firebase.auth().currentUser.uid)
                         .collection("notifications")
                         .where("timestamp",'>',ultimoTimestamp);
            }
        }catch(e){
            throw e;
        }
        
    }

    export function _ottieniAscoltatoreStatistics(chatID){
        try{
            //ascolto documento statistics nella raccolta chats/chatID/events
            let db = firebase.firestore();
            return db.collection("chats")
                .doc(chatID)
        }catch(e){
            throw e;
        }
    }

    
    export function _ottieniAscoltatoreUltimoMessaggio(chatID){
        try{
            //ascolto documento ultimo messaggio nella raccolta chats/chatID/events
            let db = firebase.firestore();
            return db.collection("chats")
                     .doc(chatID)
        }catch(e){
            throw e;
        }
    }
    

    export function _ottieniAscoltatoreNuoveConversazioni(){
        try{
            //ascolto documento conversations nella raccolta users/chats/Conversations/
            let db = firebase.firestore();
            return db.collection("users")
                     .doc(firebase.auth().currentUser.uid)
                     .collection("chats")
                     .doc("Conversations");
        }catch(e){
            throw e;
        }
    }

    export async function _removeNotification(seconds){
        try {
            let db = firebase.firestore();
            console.log("elimino notifiche con timestamp minore di "+new Date(seconds).toString());
            return await db.collection("users")
                     .doc(firebase.auth().currentUser.uid)
                     .collection("notifications")
                     .where("timestamp","<=",seconds)
                     .get().then(function(querySnapshot){
                        querySnapshot.forEach(function(doc){
                            console.log("elimino doc:"+doc.id);
                            doc.ref.delete();
                        })
                     })
        }catch(e){
            throw e;
        }
    }

    
    /*
            AROUND YOU
    */

    const MAX_CARD_INTO_LIST = 3;
    export async function _findNextTenClosestUsers(startAt, endAt, gender_preference, ageRange){
        return new Promise(async(resolveMaster, rejectMaster)=>{
            try{
            let db = firebase.firestore();

            if(typeof(startAt)=="string"){
                console.log("Cerco utenti con geohash compreso tra "+startAt +" e "+endAt+" genere di identità "+gender_preference+" ed data compresa tra "); console.log(ageRange);
            }else{
                console.log("Cerco utenti con geohash compreso tra "+startAt.data().name +" e "+endAt+" genere di identità "+gender_preference+" ed data compresa tra "); console.log(ageRange);
            }

            try{
            
                let nearest_users_snapshot = null;

            //ageRange è un array di 10 elementi, per sicurezza lo tronco a 10
            ageRange = ageRange.slice(0,9);
            //se lo startAt non è un documento...
            if(typeof(startAt)=="string"){
            console.log("query tipo startAt");
            nearest_users_snapshot = await db.collection('users') //questa query richiede un indice
                    .where("gender_identity","==",gender_preference)
                    .where("show_me","==",true)
                    .where("age","in",ageRange) //in supporta al massimo 10 elementi nell'array
                    .orderBy('location.geohash')
                    .startAt(startAt)
                    .endAt(endAt)
                    .limit(MAX_CARD_INTO_LIST)
                    .get();
            }else {
                console.log("query tipo startAfter");
                nearest_users_snapshot = await db.collection('users') //questa query richiede un indice
                    .where("gender_identity","==",gender_preference)
                    .where("age","in",ageRange) //in supporta al massimo 10 elementi nell'array
                    .where("show_me","==",true)
                    .orderBy('location.geohash')
                    .startAfter(startAt)
                    .endAt(endAt)
                    .limit(MAX_CARD_INTO_LIST)
                    .get();
            }

            let new_info_profiles = [];
            let docTmp = null;
            var promises = [];
            console.log("trovo gli utenti");
            //trovati i 10 (massimo) utenti, per ciascuno scarico i media 100
            await nearest_users_snapshot.docs.forEach(async(doc)=>{
                try{
                        console.log("trovo gli utenti 2");
                        await new Promise((resolve,reject)=>{
                            try{
                            //se il documento esiste
                            console.log("trovo gli utenti 3");
                            if(doc.exists){
                                console.log("Trovato: "+doc.data().location.geohash);
                                //e se il suo id è diverso da quello dell'utente corrente
                                if(doc.id != firebase.auth().currentUser.uid){
                                    //scarico media, ma solo quelli con granatura massima (evito controllo rules, ottimo per prestazioni)
                                    
                                    promises.push(_getMediaProfiloContatto(doc.id,"100"));
                                    console.log("fine "+doc.data().location.geohash);
                                }
                            }
                        }catch(e){
                            console.log("trovo gli utenti 4");
                            reject("fallito");
                        }
                        }).catch((e)=>{
                            console.log("trovo gli utenti 5");
                            console.log(e); rejectMaster(e); })
                    }catch(e){
                        console.log("trovo gli utenti 6");
                        console.log("eccezione firestore:"+e);
                    }
            })

            console.log("utenti trovati");

            let media_results = await Promise.all(promises);
            let i =0;
            let newlastDocumentDownloaded = null;
            console.log("gli associo immagini");
            nearest_users_snapshot.docs.forEach(async(doc)=>{
                return await new Promise((resolve, reject)=>{
                    try {
                        
                docTmp = null;
                //se il documento esiste
                if(doc.exists){
                    
                    //se è diverso da quello dell'utente corrente
                    if(doc.id != firebase.auth().currentUser.uid){
                        console.log("Trovato: "+doc.data().name);
                        newlastDocumentDownloaded = doc;
                        docTmp = doc.data();
                        //unisco id
                        docTmp.id = doc.id;
                        /*
                            unisco key (sarà utile alla flat list come key extractor). Utilizzo un random number concatenato all'id
                            cosi che se lo stesso elemento dovesse per sbaglio (cosa possibile con geohash) essere ricaricato due o 
                            più volte, comunque avrebbe una key che è diversa solo per la fine.
                        */
                        docTmp.key = doc.id+(Math.floor(Math.random() * 1000)).toString();
                        //unisco media
                        docTmp.gallery = media_results[i].data().gallery;
                        docTmp.profileImageUrl = media_results[i].data().profileImageUrl;
                        i++;
                        new_info_profiles.push(docTmp);
                        //console.log(docTmp);
                    }
                }
            }catch(e){
                reject(e);
            }
            }).catch((e)=>{console.log("errore firestore durante l'associamento delle immagini ai profili:"+e); rejectMaster(e);})
            });
                console.log("ritorno utenti trovati.");
                //ritorno i nuovi profili e l'ultimo documento di questi
                resolveMaster([new_info_profiles, newlastDocumentDownloaded]);
            }catch(e){
                console.log("firestore solleva errore.");
                throw e;
            }
        }catch(e){
            console.log("promise solleva errore:"+e);
            throw e;
        }
    })
    }


    /*
        PUSH NOTIFICATIONS
    */

    export async function _saveNewPushNotificationToken(token){
        try{
            let db = firebase.firestore();
            return db.collection("users")
                     .doc(firebase.auth().currentUser.uid)
                     .set({
                         push_notification_token: token
                     }, {merge: true});

        }catch(e){
            throw e;
        }
    }

    export function _makeDecision(response, chatID){ //response deve essere true o false
        try{
            let nomeCampo = "statistics."+firebase.auth().currentUser.uid+"_response";
            let db = firebase.firestore();
            return db.collection("chats")
                     .doc(chatID)
                     .update({
                        [`${nomeCampo}`]: response
                     },{merge:true})
        }catch(e){
            throw e;
        }
    }

    /*
        Poichè a volte tale funzione viene richiamata anche 10 volte in un'unica botta (ho cercato l'errore e ho trovato una soluzione che evitasse a level_of_visibility
        di essere incrementato più volte, però in ogni caso 10 notifiche vengono inviate), è necessario creare una variabile che contenga il timestamp di ultima chiamata.
        Se la successiva chiamata è stata fatta prima di 5 min dalla precedente (in realtà basta mettere anche 10 secondi) allora non viene fatta.
    */
   let timestampUltimaChiamataUpgradeConversation = null;
   
   function once(fn, context){
       var called = false;
       return async function(){
          console.log("chiamo once con called="+called);
           if(!called){
               called = true;
               let res = await fn.apply(context || this, arguments);
              setTimeout(()=>{
                    called = false;
               },10000)
               return res;
           }else{
               console.log("tentativo di chiamata multipla!");
           }
       }
   }

   export var _upgradeConversation = once(_newUpgradeConversation);

   async function _newUpgradeConversation(chatID, isUpgrade, contactUid, nameContactUid, myName, contactToken, myToken,lastLevelOfVisibility){
        try{
            console.log("ultimo timestamp:"+timestampUltimaChiamataUpgradeConversation);
            console.log("corrente timestamp:"+new Date().getTime());
            if(timestampUltimaChiamataUpgradeConversation==null || (timestampUltimaChiamataUpgradeConversation!=null && ((new Date().getTime())-timestampUltimaChiamataUpgradeConversation>10000))){

            console.log(firebase.auth().currentUser.uid+" chiama upgradeConversation con i seguenti argomenti:");
            console.log(chatID+","+isUpgrade+","+contactUid+","+nameContactUid+","+myName+","+contactToken+","+myToken+","+lastLevelOfVisibility);

            let db = firebase.firestore();
            var batch = firebase.firestore().batch();
            //path documento riassuntivo
            const pathDocumentoRiassuntivo = db.collection("chats").doc(chatID);

            //path documento notifiche utente corrente
            const pathCurrentUserNotification = db.collection("users").doc(firebase.auth().currentUser.uid).collection("notifications").doc();
            //path documento notifiche contatto
            const pathCurrentContactNotification = db.collection("users").doc(contactUid).collection("notifications").doc();
            
            let date = new Date().getTime();
            
            //se c'è un upgrade modifico livello di visibilità
            if(isUpgrade==true){
                batch.update(pathDocumentoRiassuntivo,{
                    level_of_visibility: lastLevelOfVisibility+1
                },{merge:true});

                //inoltre invio una notifica a entrambi sul successo!
                batch.set(pathCurrentUserNotification,{
                    author: nameContactUid,
                    type: lastLevelOfVisibility==0?"UPGRADE_VISIBILITY":"TOTAL_DISCLOSURE",
                    timestamp: date
                });
                batch.set(pathCurrentContactNotification,{
                    author: myName,
                    type: lastLevelOfVisibility==0?"UPGRADE_VISIBILITY":"TOTAL_DISCLOSURE",
                    timestamp: date
                })
            }else {
                //inoltre invio una notifica a entrambi sul mancato successo
                batch.set(pathCurrentUserNotification,{
                    author: nameContactUid,
                    type: "NO_UPGRADE_VISIBILITY",
                    timestamp: date
                });
                batch.set(pathCurrentContactNotification,{
                    author: myName,
                    type: "NO_UPGRADE_VISIBILITY",
                    timestamp: date
                })
            }
            
            //in ogni caso resetto il documento statistiche  (e resetto number_of_messages per sbloccare la chat)
            let nomeCampoContatto = "statistics."+contactUid+"_response";
            let nomeCampoUtenteCorrente = "statistics."+firebase.auth().currentUser.uid+"_response";
            batch.update(pathDocumentoRiassuntivo,
                {
                    'statistics.number_of_messages': 0,
                    [`${nomeCampoContatto}`]: null,
                    [`${nomeCampoUtenteCorrente}`]: null
                },{merge:true})

            await batch.commit();
            //invio push notification solo se c'è stato l'upgrade
            if(isUpgrade==true){
                    if(lastLevelOfVisibility==0){
                        console.log("invio push notification a "+nameContactUid+" con token "+contactToken+" e a me,"+myName+", con token "+myToken);
                        await sendPushNotification(contactToken, "Tu e "+myName+" siete passati al livello successivo!","Tu e "+myName+" siete entrambi daccordo per passare al livello successivo",{});
                        await sendPushNotification(myToken, "Tu e "+nameContactUid+" siete passati al livello successivo!","Tu e "+nameContactUid+" siete entrambi daccordo per passare al livello successivo",{});
                    }else {
                        console.log("invio push notification a "+nameContactUid+" con token "+contactToken+" e a me,"+myName+", con token "+myToken);
                        await sendPushNotification(contactToken, "Congratulazioni! Tu e "+myName+" siete visibili al 100%!","",{});
                        await sendPushNotification(myToken, "Congratulazioni! Tu e "+nameContactUid+" siete visibili al 100%!","",{});
                    }
                } 
                
            timestampUltimaChiamataUpgradeConversation = new Date().getTime();
            }        
        }catch(e){
            throw e;
        }
    }

    /*
        IDEA: quando voglio bloccare un utente faccio gli stessi steps di quando rimuovo la conversazione. Di diverso faccio solo che,
        nelle mie sole conversazioni, non elimino la chat ma metto a true il campo blocked. In questo modo quando l'utente bloccato, che 
        non ha più la chat nelle sue conversazioni, vuole iniziare una nuova chat, la funzione createNewConversations controllerà se tra le
        conversazioni del contatto ce n'è una (ormai inesistente nel concreto) che riporta come contactUid il suo nome e come campo blocked il valore true.
    */

    export async function _blockContact(chatID, contactUid, contactName, myName, chatCreationData){
        
        try{
            console.log("bloccaggio utente e rimozione chat "+chatID+" con utente "+contactName+" di id "+contactUid+" da parte di "+myName+" con data di creazione sotto:");
            console.log(chatCreationData);

            var db = firebase.firestore();
            const idUser = firebase.auth().currentUser.uid;
            //path channel utente corrente
            const pathChannelCurrentUser = db.collection("chats").doc(chatID).collection(idUser);
            //path channel contatto
            const pathChannelContact= db.collection("chats").doc(chatID).collection(contactUid);
            //path chat
            const pathChat = db.collection("chats").doc(chatID);
            //oggetto chat da rimuovere nella mia collezione 
            const myChatObj = {
                chatId: chatID,
                contactName: contactName,
                creation_data: chatCreationData,
                uid: contactUid
            }
            //nuovo oggetto da inserire nelle mie conversazioni
            const blockedChatObj = {
                uid: contactUid,
                contactName: contactName,
                blocked: true,
                lock_timestamp: new Date().getTime()
            }
            //oggetto chat da rimuovere nella sua collezione
            const contactChatObj = {
                chatId: chatID,
                contactName: myName,
                creation_data: chatCreationData,
                uid: idUser
            }
            //path conversations utente corrente
            const pathConversationsCurrentUser = db.collection("users").doc(idUser).collection("chats").doc("Conversations");
            //path conversations contatto
            const pathConversationsContatto = db.collection("users").doc(contactUid).collection("chats").doc("Conversations");
            //path documento notifiche utente corrente
            const pathCurrentUserNotification = db.collection("users").doc(idUser).collection("notifications").doc();
            //path documento notifiche contatto
            const pathCurrentContactNotification = db.collection("users").doc(contactUid).collection("notifications").doc();

            var batch = db.batch();

            console.log("eliminazione documenti sulla mia collezione");
            //elimino tutti i messaggi sul mio canale
            let snaphot1 = await pathChannelCurrentUser.get();
            for(let i=0; i<snaphot1.docs.length; i++){
                batch.delete(snaphot21.docs[i].ref)
            }

            console.log("eliminazione documenti sulla sua collezione");
            //elimino tutti i messaggi sul canale del contatto
            let snaphot2 = await pathChannelContact.get();
            for(let i=0; i<snaphot2.docs.length; i++){
                batch.delete(snaphot2.docs[i].ref)
            }

            console.log("elimino chat");
            //elimino chat
            batch.delete(pathChat);

            console.log("elimino la chat dalle mie conversazioni");
            //elimino chat dentro le mie conversazioni
            batch.update(pathConversationsCurrentUser,{
                "conversations": firebase.firestore.FieldValue.arrayRemove(myChatObj)
            });
            //ne aggiungo una con due soli campi contenenti lo uid del contatto e il label blocked
            batch.update(pathConversationsCurrentUser,{
                "conversations": firebase.firestore.FieldValue.arrayUnion(blockedChatObj)
            });

            console.log("elimino la chat dalle sue conversazioni")
            //elimino chat dentro le sue conversazioni
            batch.update(pathConversationsContatto,{
                "conversations": firebase.firestore.FieldValue.arrayRemove(contactChatObj)
            })

            let date = new Date().getTime();
            //inoltre invio una notifica a entrambi sul bloccaccio della chat
            batch.set(pathCurrentUserNotification,{
                author: contactName,
                type: "YOUR_CHAT_BLOCKER",
                timestamp: date
            });
            batch.set(pathCurrentContactNotification,{
                author: myName,
                type: "CHAT_BLOCKED",
                timestamp: date
            });

            return await batch.commit().then(async()=>{
                return await _removeGroupOfAudiosBeforeTimestamp(chatID,date)
            })

        }catch(e){
            throw e;
        }

    }

    export async function _removeConversation(chatID, contactUid, contactName, myName, chatCreationData){
        
        try{
            console.log("rimozione chat "+chatID+" con utente "+contactName+" di id "+contactUid+" da parte di "+myName+" con data di creazione sotto:");
            console.log(chatCreationData);

            var db = firebase.firestore();
            const idUser = firebase.auth().currentUser.uid;
            //path channel utente corrente
            const pathChannelCurrentUser = db.collection("chats").doc(chatID).collection(idUser);
            //path channel contatto
            const pathChannelContact= db.collection("chats").doc(chatID).collection(contactUid);
            //path chat
            const pathChat = db.collection("chats").doc(chatID);
            //oggetto chat da rimuovere nella mia collezione 
            const myChatObj = {
                chatId: chatID,
                contactName: contactName,
                creation_data: chatCreationData,
                uid: contactUid
            }
            //oggetto chat da rimuovere nella sua collezione
            const contactChatObj = {
                chatId: chatID,
                contactName: myName,
                creation_data: chatCreationData,
                uid: idUser
            }
            //path conversations utente corrente
            const pathConversationsCurrentUser = db.collection("users").doc(idUser).collection("chats").doc("Conversations");
            //path conversations contatto
            const pathConversationsContatto = db.collection("users").doc(contactUid).collection("chats").doc("Conversations");
            //path documento notifiche utente corrente
            const pathCurrentUserNotification = db.collection("users").doc(idUser).collection("notifications").doc();
            //path documento notifiche contatto
            const pathCurrentContactNotification = db.collection("users").doc(contactUid).collection("notifications").doc();

            var batch = db.batch();

            console.log("eliminazione documenti sulla mia collezione");
            //elimino tutti i messaggi sul mio canale
            let snaphot1 = await pathChannelCurrentUser.get();
            for(let i=0; i<snaphot1.docs.length; i++){
                batch.delete(snaphot21.docs[i].ref)
            }

            console.log("eliminazione documenti sulla sua collezione");
            //elimino tutti i messaggi sul canale del contatto
            let snaphot2 = await pathChannelContact.get();
            for(let i=0; i<snaphot2.docs.length; i++){
                batch.delete(snaphot2.docs[i].ref)
            }

            console.log("elimino chat");
            //elimino chat
            batch.delete(pathChat);

            console.log("elimino la chat dalle mie conversazioni");
            //inserisco label blocked dentro la chat delle mie conversazioni
            batch.update(pathConversationsCurrentUser,{
                "conversations": firebase.firestore.FieldValue.arrayRemove(myChatObj)
            //conversations: conversations.filter(chat => chat.chatId != chatID)
            });

            console.log("elimino la chat dalle sue conversazioni")
            //elimino chat dentro le sue conversazioni
            batch.update(pathConversationsContatto,{
                "conversations": firebase.firestore.FieldValue.arrayRemove(contactChatObj)
                //conversations: conversations.filter(chat => chat.chatId != chatID)
            })

            let dateTime = new Date().getTime();
            //inoltre invio una notifica a entrambi sulla rimozione della chat
            batch.set(pathCurrentUserNotification,{
                author: contactName,
                type: "YOUR_CHAT_REMOVAL",
                timestamp: dateTime
            });
            batch.set(pathCurrentContactNotification,{
                author: myName,
                type: "CHAT_REMOVAL",
                timestamp: dateTime
            });

            return await batch.commit().then(async()=>{
                return await _removeGroupOfAudiosBeforeTimestamp(chatID,date)
            })
        }catch(e){
            try{
                if(e.code=="not-found")
                    return _removeConversationLocally(chatID,contactUid,contactName,chatCreationData);
            }catch(e){
                throw e;
            }

            throw e;
        }

    }

    //Questa funzione viene eseguita solo quando la madre ("removeConveration ") non trova il documento del contatto.
    //siccome il contatto probabilmente si sarà eliminato da Mosaic, procedo a eliminare la chat solo dall'utente corrente
    //Viene anche chiamata quando si scaricano le chat e quando si richiede le informazioni del contatto queste non si trovano
    //non elimino la chat in remoto in quanto è stata eliminata dal contatto quando si è disinscritto
    export async function _removeConversationLocally(chatID, contactUid, contactName, chatCreationData){
        
        try{
            console.log("Sto rimuovendo la chat localmente perchè il contatto non esiste più");
            var db = firebase.firestore();
            const idUser = firebase.auth().currentUser.uid;

            //oggetto chat da rimuovere nella mia collezione 
            const myChatObj = {
                chatId: chatID,
                contactName: contactName,
                creation_data: chatCreationData,
                uid: contactUid
            }

            //path conversations utente corrente
            const pathConversationsCurrentUser = db.collection("users").doc(idUser).collection("chats").doc("Conversations");
            //path documento notifiche utente corrente
            const pathCurrentUserNotification = db.collection("users").doc(idUser).collection("notifications").doc();
            
            var batch = db.batch();

            console.log("elimino la chat dalle mie conversazioni");
            //inserisco label blocked dentro la chat delle mie conversazioni
            batch.update(pathConversationsCurrentUser,{
                "conversations": firebase.firestore.FieldValue.arrayRemove(myChatObj)
            //conversations: conversations.filter(chat => chat.chatId != chatID)
            });

            //inoltre invio una notifica a me spiegandomi che la chat è stata forzatamente eliminata perchè il contatto si è disinscritto
            batch.set(pathCurrentUserNotification,{
                author: contactName,
                type: "YOUR_CHAT_REMOVAL",
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });


            return await batch.commit();

        }catch(e){
            throw e;
        }

    }

    export async function _unlockContact(contactName, lock_timestamp, contactUid){
        try{
            var db = firebase.firestore();
            const idUser = firebase.auth().currentUser.uid;
            //path conversations utente corrente
            const pathConversationsCurrentUser = db.collection("users").doc(idUser).collection("chats").doc("Conversations");
            //oggetto da eliminare
            const removeObj = {
                blocked:true,
                contactName: contactName,
                lock_timestamp: lock_timestamp,
                uid: contactUid
            }

            console.log("elimino la chat bloccata dalle mie conversazioni");
            return pathConversationsCurrentUser.update({
                "conversations": firebase.firestore.FieldValue.arrayRemove(removeObj)
            });

        }catch(e){
            throw e;
        }
    }


    /*
        TEST FATTI (conclusi con successo):
        1) Caso generale: l'utente corrente ha N chat e ogni N utente è ancora iscritto e ha ancora la chat sia sulle proprie conversazioni che sulla chats/idChat
        2) Caso particolare1: a qualcuno degli N utenti manca la chat
        3) Caso particolare2: qualcuno degli N utenti ha l'array conversations vuoto
        4) Caso particolare3: una delle chat (in chats/idChat) manca
        5) Caso particolare4: l'utente corrente non ha conversazioni nè notifications
        6) Caso particolare5: uno degli utenti non esiste più
    */

    export async function _deleteUserAccount(myName){

        try{
            return new Promise(async(resolve,reject)=>{
                var db = firebase.firestore();
                //DA CORREGGERE
                const currentUser = "fake_user63";//firebase.auth().currentUser.uid;
                //DA ELIMINARE
                myName="fake_user63";

                //array contenente le promise per eliminare sullo storage i dati
                let storagePromises = [];
                
                try{
                    await db.runTransaction(async (transaction) =>{
                        try{
                            let idContatto = null;
                            let contactConversationsPath = null;
                            let contactConversations = null;
                            let contactChatObj = null;
                            let pathChat = null;
                            let pathMyChannel = null;
                            let myMessages = null;
                            let pathContactChannel = null;
                            let contactMessages = null;
                            let chat = null;
                            //scarico documento conversations dell'utente corrente
                            console.log("scarico mie conversazioni...");
                            let currentUserConversationsPath = db.collection("users").doc(currentUser).collection("chats").doc("Conversations");
                            let currentUserConversations = await transaction.get(currentUserConversationsPath);
                            console.log(currentUserConversations);

                            //se ha delle conversazioni procedo a cancellare tutti i riferimenti esterni
                            if(currentUserConversations.exists && currentUserConversations.data()["conversations"].length>0){
                                console.log("l'utente ha delle conversazioni. Procedo a eliminare i riferimenti");
                                let conversations = currentUserConversations.data()["conversations"];
                                //per ogni elemento di conversations...(prima aggancio tutti i documenti di tutti e poi alla fine elimino tutto il mio (non c'è bisogno che faccio arrayRemove sul mio ogni volta))
                                for(let i=0; i<conversations.length; i++){
                                    console.log("elimino conversazione "+i+"-esima:");
                                    console.log(conversations[i]);
                                    //controllo se l'utente esiste ancora... (magari ha eliminato il suo account)
                                    //invece di scaricare il suo doc scarico le sue conversazioni, tanto se non esistono quelle allora non esiste neppure l'utente, cosi risparmio banda
                                    idContatto = conversations[i].uid;
                                    contactConversationsPath = db.collection("users").doc(idContatto).collection("chats").doc("Conversations");
                                    contactConversations = await contactConversationsPath.get();
                                    //se esiste...devo eliminare la nostra conversazione anche dalle sue conversations
                                    if(contactConversations.exists){
                                        console.log("il contatto "+conversations[i].contactName+" esiste ancora")
                                        //creo oggetto chat per contatto
                                        contactChatObj = {
                                            uid: currentUser,
                                            contactName: myName,
                                            chatId: conversations[i].chatId,
                                            creation_data: conversations[i].creation_data
                                        }
                                        //elimino 
                                        console.log("elimino chat "+conversations[i].chatId+" nel profilo del contatto");
                                        await transaction.update(contactConversationsPath,{
                                            "conversations": firebase.firestore.FieldValue.arrayRemove(contactChatObj)
                                        })
                                        //aggiungo la promise per eliminare la chat dallo storage
                                        storagePromises.push(_removeGroupOfAudiosBeforeTimestamp(conversations[i].chatId,new Date().getTime()));
                                    }else
                                        console.log("il contatto "+conversations[i].contactName+" non esiste più")
                                    
                                    console.log("elimino channel "+currentUser);
                                    pathMyChannel = db.collection("chats").doc(conversations[i].chatId).collection(currentUser);
                                    myMessages = await pathMyChannel.get();
                                    myMessages.docs.map(async(doc) =>{
                                        console.log("elimino documento di id:"+doc.id)
                                        await transaction.delete(doc.ref);
                                    })

                                    console.log("elimino channel "+conversations[i].uid);
                                    pathContactChannel = db.collection("chats").doc(conversations[i].chatId).collection(conversations[i].uid);
                                    contactMessages = await pathContactChannel.get();
                                    contactMessages.docs.map(async(doc) =>{
                                        console.log("elimino documento di id:"+doc.id)
                                        await transaction.delete(doc.ref);
                                    })

                                    console.log("elimino chat in chats")
                                    pathChat = db.collection("chats").doc(conversations[i].chatId);
                                    chat = await pathChat.get();
                                    //se esiste la chat, la elimino
                                    if(chat.exists){
                                        await transaction.delete(pathChat);
                                        console.log("chat eliminata");
                                    }
                                }
                            }else 
                                console.log("l'utente non ha conversazioni.");

                            //terminato il ciclo for ho eliminato tutti i riferimenti alle chat negli altri contatti, ed eliminato la chat stessa
                            //adesso procedo a eliminare il documento conversations
                            await transaction.delete(currentUserConversationsPath);
                            //adesso procedo a eliminare i media
                            let mediaPathDoc0 = db.collection("users").doc(currentUser).collection("media").doc("0");
                            let mediaPathDoc50 = db.collection("users").doc(currentUser).collection("media").doc("50");
                            let mediaPathDoc100 = db.collection("users").doc(currentUser).collection("media").doc("100");
                            await transaction.delete(mediaPathDoc0);
                            await transaction.delete(mediaPathDoc50);
                            await transaction.delete(mediaPathDoc100);

                            //procedo ad eliminare le notifiche
                            let notificationPath = db.collection("users").doc(currentUser).collection("notifications");
                            const notifications = await notificationPath.get();
                            notifications.docs.map(async(doc) =>{
                                console.log("elimino notifica "+doc.id);
                                await transaction.delete(doc.ref);
                            })

                            //elimino il documento principale
                            let mainPath = db.collection("users").doc(currentUser);
                            await transaction.delete(mainPath);
                        }catch(e){
                            throw e;
                        }
                    });
                

                    //se sono qua tutto è andato bene su firestore. Elimino documento chat su storage
                    for(let i=0; i<storagePromises.length; i++)
                        await storagePromises[i];
                    
                    //infine elimino cartella users/id sullo storage contenente i miei media
                    await _removeMediaFolderOnStorage(currentUser);
                    
                    resolve(true);
                }catch(e){
                    reject(e);
                    throw e;
                }
            });
        }catch(e){
            throw e;
    }

    }

    export async function createFakeUser(){
        var db = firebase.firestore();
        let nome_id = "fake_user64";//"fake_user"+Math.floor(Math.random() * 1000);
        let contatto1 = "fake_user63";
        let contatto2 = "whd3uAlHjQQGBa2la1tooVjoXmd2";
       //aggiungo documento
        await db.collection("users").doc(nome_id)
            .set({
                age:27,
                biological_sex: "male",
                current_occupation: "impiegata",
                date_of_birth: new Date(30*12*30*24*50*60*1000),
                gender_identity: "trigender",
                gender_preference: "trigender",
                hobbies_interests_and_passions: ["cantare", "volare", "ballare", "giocare", "leggere"],
                location: {
                    city: "Alcamo",
                    country: "Italia",
                    geohash: "sqc0p",
                    lat: "37.970",
                    lng: "12.965",
                    region:"Sicilia"
                },
                name: nome_id,
                push_notification_token:null,
                self_description:" Sono il fake user di nome "+nome_id,
                show_me: true
            })
            //aggiungo media
        await db.collection("users").doc(nome_id)
            .collection("media")
            .doc("0")
            .set({
                profileImageUrl: "https://i.pinimg.com/736x/38/93/07/389307d6af5c4be0051b7d3c4f93bf3d.jpg",
                gallery: [
                    "https://images.squarespace-cdn.com/content/v1/51773f51e4b054c7ac3739b7/1500601873116-Y6YQOMZCW6DYY5DWN0FG/Antonio_L_178.JPG?format=1500w",
                    "https://i.pinimg.com/736x/a9/54/0b/a9540b12f85f1c467d4de74a49ce048e.jpg"
                ]
            });
        await db.collection("users").doc(nome_id)
            .collection("media")
            .doc("50")
            .set({
                profileImageUrl: "https://i.pinimg.com/736x/38/93/07/389307d6af5c4be0051b7d3c4f93bf3d.jpg",
                gallery: [
                    "https://images.squarespace-cdn.com/content/v1/51773f51e4b054c7ac3739b7/1500601873116-Y6YQOMZCW6DYY5DWN0FG/Antonio_L_178.JPG?format=1500w",
                    "https://i.pinimg.com/736x/a9/54/0b/a9540b12f85f1c467d4de74a49ce048e.jpg"
                ]
            })
        await db.collection("users").doc(nome_id)
            .collection("media")
            .doc("100")
            .set({
                profileImageUrl: "https://i.pinimg.com/736x/38/93/07/389307d6af5c4be0051b7d3c4f93bf3d.jpg",
                gallery: [
                    "https://images.squarespace-cdn.com/content/v1/51773f51e4b054c7ac3739b7/1500601873116-Y6YQOMZCW6DYY5DWN0FG/Antonio_L_178.JPG?format=1500w",
                    "https://i.pinimg.com/736x/a9/54/0b/a9540b12f85f1c467d4de74a49ce048e.jpg"
                ]
            })

        //aggiungo notifiche
        await db.collection("users").doc(nome_id)
            .collection("notifications")
            .doc("1")
            .set({
                type:"uno"
            })
        await db.collection("users").doc(nome_id)
            .collection("notifications")
            .doc("2")
            .set({
                type:"due"
            })
        await db.collection("users").doc(nome_id)
            .collection("notifications")
            .doc("3")
            .set({
                type:"tre"
            })
        await db.collection("users").doc(nome_id)
            .collection("notifications")
            .doc("4")
            .set({
                type:"quattro"
            })

        //aggiungo chats
        let data = new Date().getTime();
        await db.collection("users").doc(nome_id)
        .collection("chats")
        .doc("Conversations")
        .set({
            "conversations": firebase.firestore.FieldValue.arrayUnion({
                chatId: "fakeChat1",
                uid: contatto1,
                contactName: "Giulio",
                creation_data: data
            })
        })
        await db.collection("users").doc(nome_id)
        .collection("chats")
        .doc("Conversations")
        .update({
            "conversations": firebase.firestore.FieldValue.arrayUnion({
                chatId: "fakeChat2",
                uid: contatto2,
                contactName: "sara",
                creation_data: data
            })
        })
//aggiungo chat, i due canali e qualche messaggio
          await db.collection("chats")
            .doc("fakeChat1")
            .set({
                lastMessage:{
                    author: nome_id,
                    timestamp: new Date().getTime(),
                    type:"mex",
                    value: "sono un fake mex"
                },
                level_of_visibility: 1,
                statistics:{
                    administrator:nome_id,
                    "contatto1_response": null,
                    "fake_response": null,
                    number_of_messages: 2,
                }
            });
        db.collection("chats")
          .doc("fakeChat1")
          .collection(nome_id)
          .doc("1")
          .set({
                field: "...."
          });
        db.collection("chats")
          .doc("fakeChat1")
          .collection(nome_id)
          .doc("2")
          .set({
                field: "...."
          });
        db.collection("chats")
          .doc("fakeChat1")
          .collection(nome_id)
          .doc("3")
          .set({
                field: "...."
          })
        db.collection("chats")
          .doc("fakeChat1")
          .collection(contatto1)
          .doc("1")
          .set({
                field: "...."
          });
        db.collection("chats")
          .doc("fakeChat1")
          .collection(contatto1)
          .doc("2")
          .set({
                field: "...."
          });
        db.collection("chats")
          .doc("fakeChat1")
          .collection(contatto1)
          .doc("3")
          .set({
                field: "...."
          })

        
        db.collection("chats")
          .doc("fakeChat2")
          .set({
              lastMessage:{
                  author: nome_id,
                  timestamp: new Date().getTime(),
                  type:"mex",
                  value: "sono un fake mex"
              },
              level_of_visibility: 1,
              statistics:{
                  administrator:nome_id,
                  "contatto2_response": null,
                  "fake_response": null,
                  number_of_messages: 2,
              }
          });
      db.collection("chats")
        .doc("fakeChat2")
        .collection(nome_id)
        .doc("1")
        .set({
              field: "...."
        });
      db.collection("chats")
        .doc("fakeChat2")
        .collection(nome_id)
        .doc("2")
        .set({
              field: "...."
        });
      db.collection("chats")
        .doc("fakeChat2")
        .collection(nome_id)
        .doc("3")
        .set({
              field: "...."
        })
      db.collection("chats")
        .doc("fakeChat2")
        .collection(contatto2)
        .doc("1")
        .set({
              field: "...."
        });
      db.collection("chats")
        .doc("fakeChat2")
        .collection(contatto2)
        .doc("2")
        .set({
              field: "...."
        });
      db.collection("chats")
        .doc("fakeChat2")
        .collection(contatto2)
        .doc("3")
        .set({
              field: "...."
        })

        //aggiungo a obYCXDPHLKXlsvi9TPrPlYginj62 e a whd3uAlHjQQGBa2la1tooVjoXmd2 la chat di id fakeChat
        await db.collection("users").doc(contatto1)
          .collection("chats")
          .doc("Conversations")
          .update({
              "conversations": firebase.firestore.FieldValue.arrayUnion({
                  chatId: "fakeChat1",
                  uid: nome_id,
                  contactName: nome_id,
                  creation_data: data
              })
          })
        await db.collection("users").doc(contatto2)
          .collection("chats")
          .doc("Conversations")
          .update({
               "conversations": firebase.firestore.FieldValue.arrayUnion({
                  chatId: "fakeChat2",
                  uid: nome_id,
                  contactName: nome_id,
                  creation_data: data
              })
          })

          

        //carico dati sulle chat storage
        let file = await fetch("file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540giuliofederico%252FMos/whd3uAlHjQQGBa2la1tooVjoXmd2/m0Wz5EsEnmYJChGoM99mmAGy7rr2/m0Wz5EsEnmYJChGoM99mmAGy7rr2_TueAug31202111:33:39GMT+0200(CEST).aac");
        let blob = await file.blob();
        let storage = firebase.storage();
        let name = 0; //NB: crealo adesso e utilizzalo come nome e come timestamp per la chat perchè altrimenti se utilizzi new Date due volte saranno diversi
 
        let destinationFolderRef = storage.ref("chats/fakeChat1/"+name.toString()+".m4a");
        //aggiungo il file alla prima chat
        await destinationFolderRef.put(blob);
        name = 1;
        destinationFolderRef = storage.ref("chats/fakeChat1/"+name.toString()+".m4a");
        await destinationFolderRef.put(blob);
        name = 2;
        destinationFolderRef = storage.ref("chats/fakeChat1/"+name.toString()+".m4a");
        await destinationFolderRef.put(blob);
        //aggiungo il file alla seconda chat
        destinationFolderRef = storage.ref("chats/fakeChat2/"+name.toString()+".m4a");
        await destinationFolderRef.put(blob);
        name = 1;
        destinationFolderRef = storage.ref("chats/fakeChat2/"+name.toString()+".m4a");
        await destinationFolderRef.put(blob);
        name = 3;
        destinationFolderRef = storage.ref("chats/fakeChat2/"+name.toString()+".m4a");
        await destinationFolderRef.put(blob);
        
       //aggiungo cartella media utente sullo storage
       console.log("creo falsi media");
       file = await fetch("https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=976&q=80");
       blob = await file.blob();
       name = getRandomString(10);
       destinationFolderRef = storage.ref("users/"+nome_id+"/"+name.toString()+".jpg");
       await destinationFolderRef.put(blob);
       file = await fetch("https://images.unsplash.com/photo-1497316730643-415fac54a2af?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80");
       blob = await file.blob();
       name = getRandomString(10);
       destinationFolderRef = storage.ref("users/"+nome_id+"/"+name.toString()+".jpg");
       await destinationFolderRef.put(blob);
       file = await fetch("https://images.unsplash.com/photo-1520155707862-5b32817388d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80");
       blob = await file.blob();
       name = getRandomString(10);
       destinationFolderRef = storage.ref("users/"+nome_id+"/"+name.toString()+".jpg");
       await destinationFolderRef.put(blob);
    }
