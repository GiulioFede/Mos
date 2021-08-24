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
    export function _eliminaImmagineDiGalleria(nome){
        console.log("elimino immagine................................................................................:");
        var db = firebase.firestore();
        const idUser = firebase.auth().currentUser.uid;
        
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
                               _getMediaProfiloContatto(uid,"25"),
                               _getMediaProfiloContatto(uid,"50"),
                               _getMediaProfiloContatto(uid,"75"),
                               _getMediaProfiloContatto(uid,"100")])
                                    .then((ris)=>{
                                        let media = new Object();
                                        media["profileImageUrl"]={url_0: ris[0].data().profileImageUrl, url_25: ris[1].data().profileImageUrl, url_50: ris[2].data().profileImageUrl, url_75: ris[3].data().profileImageUrl, url_100: ris[4].data().profileImageUrl }
                                        media["gallery"] = {};
                                        let gallery = [];
                                        for(key in ris[0].data().gallery){
                                            console.log("chiave:"+key);
                                            console.log("media attuali:");
                                            console.log(media);
                                            //media["gallery"][key]= {url_0: ris[0].data().gallery[key], url_25: ris[1].data().gallery[key], url_50: ris[2].data().gallery[key], url_75: ris[3].data().gallery[key], url_100: ris[4].data().gallery[key] }
                                            gallery.push({name: key, url_0: ris[0].data().gallery[key], url_25: ris[1].data().gallery[key], url_50: ris[2].data().gallery[key], url_75: ris[3].data().gallery[key], url_100: ris[4].data().gallery[key] });
                                        
                                        }
                                        
                                        /*let newMedia = new Object();
                                        Object.keys(media["gallery"]).sort(function(a,b){if(a>b) return 0; else return 1}).reduce((prev,succ)=>{if(prev!=undefined) newMedia.push({[`${prev}`]: media["gallery"][prev]}); newMedia.push({[`${succ}`]: media["gallery"][succ]});})
                                        
                                        media["gallery"] = newMedia;*/
                                        media["gallery"] = gallery;
                                        console.log("media fiinali:");
                                        console.log(media["gallery"]);
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
               if(!contact_conversations_info.exists){
                   throw "General error";
               }
               else {
                   //return contact_conversations_info.data();
                   for(let i=0; i<contact_conversations_info.data().conversations.length; i++){
                       //se esistiamo già mando errore
                       if(contact_conversations_info.data().conversations[i].uid==firebase.auth().currentUser.uid)
                            throw "A conversation already exists";
                   }
               }

               //se tutto va bene allora creo conversazione
               //creo nuova chat nella collezione chats
               await transaction.set(nuovaConversazionePath, {lastMessage:
                                                                {author:null,
                                                                timestamp:null,
                                                                type:null,
                                                                value:null},
                                                               level_of_visibility:0});
                
                //creo canale events e documento statistics cosi da sentire gli update utili per l'upgrade della conversazione
                var eventsChannel = db.collection("chats").doc(nuovaConversazionePath.id).collection("events").doc("statistics");
                let nomeCampoContatto = uidNewContact+"_response";
                let nomeCampoUtenteCorrente = firebase.auth().currentUser.uid+"_response";
                transaction.set(eventsChannel,{[`${nomeCampoContatto}`]:null, administrator: firebase.auth().currentUser.uid, lastAuthor: null, number_of_messages:0, [`${nomeCampoUtenteCorrente}`]:null});
                //creo nel mio profilo la coppia {chatId: nuovoId, uid: contatto}
                transaction.update(myConversations,{conversations: firebase.firestore.FieldValue.arrayUnion({chatId:nuovaConversazionePath.id, uid:uidNewContact, contactName: nameNewContact, creation_data: new Date()})});
                //creo nel profilo del contatto la coppia {chatId: nuovoId, uid: mioUid}
                transaction.update(contactConversations,{conversations: firebase.firestore.FieldValue.arrayUnion({chatId:nuovaConversazionePath.id, uid:firebase.auth().currentUser.uid,contactName: myName, creation_data: new Date()})});   
                //creo nel profilo del contatto una notifica
                transaction.set(contactNotificationChannel,{author: firebase.auth().currentUser.uid, type: "JOIN", timestamp: new Date()}); 

                return nuovaConversazionePath.id;
            });

        }catch(e){
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

    export function _ottieniAscoltatoreNuoveNotifiche(ultimoTimestamp){ //NB: ultimoTimestamp deve essere un numero (i secondi)
        try{
        //ascolto documenti in una raccolta
            let db = firebase.firestore();
            //se non esiste alcun timestamp (ossia non esiste neppure una notifica memorizzata in locale)
            if(ultimoTimestamp==-1)
                return db.collection("users")
                         .doc(firebase.auth().currentUser.uid)
                         .collection("notifications")
                         .where("timestamp",">", new Date()); //perchè? Ogni volta che scarico una notifica la salvo in locale e la elimino in remoto. 
                                                              //Se quest'ultima operazione dovesse fallire allora potrei avere su un device diverso
                                                              //il download della stessa notifica anche se sono passati molti giorni. Ho bisogno quindi
                                                              //di un punto di inizio fermo.
            else {
                return db.collection("users")
                         .doc(firebase.auth().currentUser.uid)
                         .collection("notifications")
                         .where("timestamp",'>',new Date(ultimoTimestamp*1000));
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
                .collection("events")
                .doc("statistics");
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

    export async function _removeNotification(id){
        try {
            let db = firebase.firestore();
            return db.collection("users").doc(firebase.auth().currentUser.uid).collection("notifications").doc(id).delete();
        }catch(e){
            throw e;
        }
    }

    
    /*
            AROUND YOU
    */

    const MAX_CARD_INTO_LIST = 10;
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
            //se lo startAt non è un documento...
            if(typeof(startAt)=="string"){
            console.log("query tipo startAt");
            nearest_users_snapshot = await db.collection('users') //questa query richiede un indice
                    .where("gender_identity","==",gender_preference)
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
                                    //scarico media
                                    //console.log("scarico media per documento "+doc.id+" ...");
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
            let nomeCampo = firebase.auth().currentUser.uid+"_response";
            let db = firebase.firestore();
            return db.collection("chats")
                     .doc(chatID)
                     .collection("events")
                     .doc("statistics")
                     .set({
                        [`${nomeCampo}`]: response
                     },{merge:true})
        }catch(e){
            throw e;
        }
    }

    export function _upgradeConversation(chatID, isUpgrade, contactUid){
        try{
            let db = firebase.firestore();
            var batch = firebase.firestore().batch();
            //path documento riassuntivo
            const pathDocumentoRiassuntivo = db.collection("chats").doc(chatID);
            //path documento statistiche
            const pathDocumentoStatistiche = db.collection("chats").doc(chatID).collection("events").doc("statistics");

            //se c'è un upgrade modifico livello di visibilità
            if(isUpgrade==true){
                batch.set(pathDocumentoRiassuntivo,{
                    level_of_visibility: firebase.firestore.FieldValue.increment(1)
                },{merge:true});
            }
            //in ogni caso resetto il documento statistiche  (e incremento di 1 number_of_messages per sbloccare la chat)
            let nomeCampoContatto = contactUid+"_response";
            let nomeCampoUtenteCorrente = firebase.auth().currentUser.uid+"_response";
            batch.update(pathDocumentoStatistiche,
                {
                    number_of_messages: firebase.firestore.FieldValue.increment(1),
                    [`${nomeCampoContatto}`]: null,
                    [`${nomeCampoUtenteCorrente}`]: null
                })

            return batch.commit();
        }catch(e){

        }
    }