import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite'

/*
const SUCCESS_QUERY = "SUCCESS_QUERY";

export class LocalStorage {

    static createNewTableForConversation(utenteCorrente, contactUid, callbackSuccesso, callbackErrore){

        const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);

        // QUESTO MOSTRA GLI INDICI PRESENTI (NB: NON USARLO IN PRODUZIONE, MA TIENILO PER SAPERE SE GLI INDICI SONO STATI CREATI O MENO)
        try{
            //creo tabella se non esiste
            console.log("lista indici per tabella");
            let query = "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type='index'";
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query,
                        [],
                        //in caso di successo
                        (tx,i)=>{console.log("indice-->");console.log(i); console.log("sopra c'è l'indice")},
                        //in caso di errore
                        (tx,e)=>{console.log("errore durante la ricerca dell'indice:"+e)}
                    )
                },
                callbackErrore,
                (arg)=>{ console.log("trasazione eseguita con successo:"+arg);}
            )

        }catch(e){
            throw e;
        }
        

        try{
            //creo tabella se non esiste
            console.log("creo tabella se non esiste");
            let query1 = 'CREATE TABLE IF NOT EXISTS '+ contactUid +'(row INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, date TEXT, type TEXT, content TEXT)'
            let query2 = 'CREATE UNIQUE INDEX IF NOT EXISTS indexOf'+contactUid+' ON '+ contactUid +'(row)'
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query1,
                        [],
                    );
                    tx.executeSql(
                        query2,
                        [],
                        callbackSuccesso,
                        callbackErrore
                    )
                },
                callbackErrore,
                (arg)=>{ console.log("trasazione eseguita con successo:"+arg);}
            )

        }catch(e){
            throw e;
        }
    }

    static getListOfChatMessages(utenteCorrente, contactUid, offset, callbackSuccesso, callbackErrore){
        try{
            console.log("apro database MosaicLocalDB...");
            const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);

            //altrimenti preleva i messaggi
            console.log("Avvio query...");
            //prendo tutti i messaggi e li ritorno
            let query = "SELECT * FROM "+contactUid+" ORDER BY row DESC LIMIT 10 OFFSET "+offset;
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query,
                        [],
                        //in caso di successo
                        callbackSuccesso,
                        //in caso di errore
                        callbackErrore
                    )
                },
                callbackErrore,
                (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
            )

        }catch(e){
            throw e;
        }

    }

    static storeNewMessage(utenteCorrente, contactUid,author,date,type,value,callbackSuccesso, callbackErrore){
        
        try{
            const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);
            console.log("Memorizzo nuovo messaggio");
            let update = "INSERT INTO "+contactUid+"(author,date,type,content) VALUES(?,?,?,?)";
                db.transaction(
                    (tx)=>{
                        tx.executeSql(
                            update,
                            [author,date, type,value],
                            //in caso di successo
                            callbackSuccesso(tx,value), //solo nel caso in cui sia audio value ha senso, contiene il percorso (chiamato da) saveAudioIntoFolder
                            //in caso di errore
                            callbackErrore
                        )
                    },
                    callbackErrore,
                    (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
                )
        }catch(e){
            throw e;
        }
    }

    static removeTableForConversation(utenteCorrente, contactUid,callbackSuccesso, callbackErrore){

        try{
            const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);

            console.log("rimuovo tabella");
            let update = "DROP TABLE IF EXISTS "+contactUid;
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        update,
                        [],
                        //in caso di successo
                        callbackSuccesso,
                        //in caso di errore
                        callbackErrore
                    )
                },
                callbackErrore,
                (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
            )
        }catch(e){
            throw e;
        }
    }

    static async saveAudioIntoFolder(utenteCorrente, folder,author, uri_cache, callbackSuccesso, callbackErrore){

        try {
            const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);
            console.log("salvo audio che attualmente si trova in "+uri_cache+" nel file system");
            //crea una cartella se non esiste
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + utenteCorrente+"/"+folder, {
                intermediates: true
            });
            console.log("cartella creata (se non esisteva già):");
            //scrivo il file che si trova in un uri temporanea (cache) nel database
            //quando lo scrivo utilizzo
            const audio_string = await FileSystem.readAsStringAsync(uri_cache,{ encoding: FileSystem.EncodingType.Base64 }); //NB: SE NON SI CRIPTA USARE DOWNLOAD_ASINC PER SCRIVERE DIRETTAMENTE NELLA NUOVA LOCAZIONE INVECE DI FARE READ E POI WRITE
            //ho ottenuto una stringa del contenuto audio
            console.log("audio stringa letto");
            //cripto audio stringa prima di salvare
            console.log("audio stringa criptato");
            //....(cripare stringa)
            
                salvo file criptato
                NB: non salvo la stringa nel database altrimenti ad ogni apertura di chat deve leggere miliardi di bit, piuttosto salvo
                    il file criptato e salvo nel database solo un riferimento uri per trovarlo. Sarà solo quando richiesto che lo leggerò
            
           //prelevo formato di salvataggio
           
           let indexOfFormat = uri_cache.lastIndexOf(".");
           let formato = uri_cache.substring(indexOfFormat); //es--> .mp4
            const percorso= FileSystem.documentDirectory + utenteCorrente + "/" + folder+"/"+(new Date().toUTCString().replace(/ /g,""))+formato;
            await FileSystem.writeAsStringAsync((percorso), audio_string, {encoding: FileSystem.EncodingType.Base64 });
            console.log("file salvato con successo nel file system in: "+percorso);
            //salvo nel database
            this.storeNewMessage(utenteCorrente,folder,author,"30/07/2021","audio",percorso,
                    callbackSuccesso,
                    callbackErrore);
        } catch (err) {
            console.log("errore durante il salvataggio dell'audio: "+err);
            callbackErrore();
        }
        console.log(FileSystem.documentDirectory);
    }

   
}
*/

const db = SQLite.openDatabase("MosaicLocalDB.db");

const removeTable = async (nomeTabella) => {
    return new Promise((resolve, reject) =>{
        try{
                
            let update = "DROP TABLE IF EXISTS "+nomeTabella;
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        update,
                        [],
                        //in caso di successo
                        (_, result) => { console.log("tabella eliminata"); resolve(result)},
                        //in caso di errore
                        (_, error) => { console.log("tabella non eliminata.");  reject(error)}
                    )
                },
                (error) => reject(error),
                (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
            )
        }catch(e){
            throw e;
        }
    }) 

}

/*
    Crea una nuova tabella. La colonna 'state', valido solo per gli audio, può assumere 3 possibili valori:
        1) in-progress: indica che l'audio è stato salvato in locale ma non ancora in remoto
        2) failed: indica che l'audio è stato salvato in locale ma è fallito in remoto
        3) succeed: indica che l'audio è stato salvato in locale è anche in remoto
*/

const createNewTableForConversation = async(nomeTabella) => {
        return new Promise((resolve, reject)=>{
            try{
                //creo tabella se non esiste
                console.log("creo tabella se non esiste");
                let query1 = 'CREATE TABLE IF NOT EXISTS '+ nomeTabella +'(row INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, date INTEGER, type TEXT, content TEXT, state TEXT);';             
                db.transaction(
                        (tx)=>{
                            tx.executeSql(
                                query1,
                                [],
                                (_,result)=>{ resolve("tabella creata")},
                                (_,error) => { console.log("tabella non creata")}
                            )
                        },
                        (error) => { console.log("tabella non creata")},
                        ()=>{ console.log("trasazione eseguita con successo:");}
                    )

            }catch(e){
                throw e;
            }
        })
    }

    /*QUESTO MOSTRA GLI INDICI PRESENTI (NB: NON USARLO IN PRODUZIONE, MA TIENILO PER SAPERE SE GLI INDICI SONO STATI CREATI O MENO)
    try{
        //creo tabella se non esiste
        console.log("lista indici per tabella");
        let query = "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type='index'";
        db.transaction(
            (tx)=>{
                tx.executeSql(
                    query,
                    [],
                    //in caso di successo
                    (tx,i)=>{console.log("indice-->");console.log(i); console.log("sopra c'è l'indice")},
                    //in caso di errore
                    (tx,e)=>{console.log("errore durante la ricerca dell'indice:"+e)}
                )
            },
            callbackErrore,
            (arg)=>{ console.log("trasazione eseguita con successo:"+arg);}
        )

    }catch(e){
        throw e;
    }
    */


    /*
        Crea una tabella per contenere le informazioni media del profilo. Ogni riga si riferisce a una immagine e contiene le seguenti informazioni:
            - imageName: nome dell'immagine (se di profilo sarà sempre e solo profileImage1 o profileImage2)
            - internal_path_0, internal_path_25, internal_path_50, internal_path_75, internal_path_100: percorso locale dove trovare l'immagine in tutte le sue versioni
    */
const createNewTableForProfileMedia = async(nomeTabella) => {
        return new Promise((resolve, reject)=>{
            try{
                //creo tabella se non esiste
                console.log("creo tabella se non esiste");
                let query1 = 'CREATE TABLE IF NOT EXISTS '+ nomeTabella +'_media(imageName TEXT,internal_path_0 TEXT, internal_path_25 TEXT, internal_path_50 TEXT, internal_path_75 TEXT, internal_path_100 TEXT);';             
                db.transaction(
                        (tx)=>{
                            tx.executeSql(
                                query1,
                                [],
                                (_,result)=>{ resolve("tabella creata")},
                                (_,error) => { console.log("tabella non creata")}
                            )
                        },
                        (error) => { console.log("tabella non creata")},
                        ()=>{ console.log("trasazione eseguita con successo:");}
                    )

            }catch(e){
                throw e;
            }
        })
    }

const deleteMediaFolder = async(nomeUtente) => {
    try{
        await FileSystem.deleteAsync(FileSystem.documentDirectory + nomeUtente+"/media",{idempotent:true});
    }catch(e){
        throw e;
    }
}

const deleteMediaTable = async(nomeUtente) =>{
    return new Promise((resolve, reject) =>{
        try{
            
            let update = "DROP TABLE IF EXISTS "+nomeUtente+"_media";
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        update,
                        [],
                        //in caso di successo
                        (_, result) => { resolve(result)},
                        //in caso di errore
                        (_, error) => { reject(error)}
                    )
                },
                (error) => reject(error),
                (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
            )
        }catch(e){
            throw e;
        }
    }) 

}

const saveImageLocally = async(userUid, url) => {

    return new Promise(async(resolve, reject)=>{
        try{
            //NB:eliminarla, crearla quando si crea il profilo
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + userUid+"/media", {
                intermediates: true
                });
            //controllo che l'immagine non esiste già
            let hash_url = stringToHash(url);
            console.log("controllo esistenza immagine hash "+hash_url+" in locale...");
            let info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + userUid+"/media/"+hash_url, {md5:false, size:false});
            //se non esiste, la salvo e ritorno l'uri locale
            if(info.exists==false){
                        console.log("immagine non esistente in locale. La salvo...");
                        let new_image = await FileSystem.downloadAsync(url,FileSystem.documentDirectory + userUid+"/media/"+hash_url);
                        console.log("salvata in "+new_image.uri);
                        resolve(new_image.uri);
            }
            //se invece esiste ritorna l'uri locale
            else {
                console.log("immagine esistente in "+info.uri);
                resolve(info.uri);
            }
        }catch(e){
            //throw e;
            reject(e);
        }
    })
}

const removeImageLocally = async(userUid,url) =>{
    return new Promise(async(resolve, reject)=>{
        try{
            let hash_url = stringToHash(url);
            console.log("Elimino immagine salvata in locale con nome "+hash_url);
            await FileSystem.deleteAsync(FileSystem.documentDirectory + userUid+"/media/"+hash_url, {idempotent:true});
            console.log("Immagine in locale eliminata");
            resolve(1);
        }catch(e){
            throw e;
        }
    })
}

// Convert to 32bit integer
function stringToHash(string) {
                  
    var hash = 0;
      
    if (string.length == 0) return hash;
      
    for (let i = 0; i < string.length; i++) {
        let char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
      
    return hash;
}

const addNewImage = async(userUid, 
                          nomeImmagine, 
                          local_uri_0,
                          url_25,
                          url_50,
                          url_75,
                          url_100 ) => {

        try{

            //crea una cartella se non esiste
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + userUid+"/media", {
                    intermediates: true
                    });
        console.log("scarico le 5 versioni...");
        //scarico le 5 versioni della foto
        const download_photos = [
            FileSystem.copyAsync({from:local_uri_0, to: FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+".jpg"}),
            FileSystem.downloadAsync(url_25,FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+"_25.jpg"),
            FileSystem.downloadAsync(url_50,FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+"_50.jpg"),
            FileSystem.downloadAsync(url_75,FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+"_75.jpg"),
            FileSystem.downloadAsync(url_100,FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+"_100.jpg"),
        ];

       let local_uri = await Promise.all(download_photos);
       console.log("immagini scaricate localmente in:");
       console.log(local_uri);
       return new Promise((resolve, reject)=>{
        try{
            //aggiungo immagine nella tabella
            console.log("aggiungo immagine");
            let insert_image = "INSERT INTO "+userUid+"_media(imageName,internal_path_0, internal_path_25, internal_path_50, internal_path_75, internal_path_100) VALUES(?,?,?,?,?,?)";          
            db.transaction(
                    (tx)=>{
                        tx.executeSql(
                            insert_image,
                            [nomeImmagine,FileSystem.documentDirectory+userUid+"/media/"+nomeImmagine+".jpg",local_uri[1].uri,local_uri[2].uri,local_uri[3].uri,local_uri[4].uri],
                            (_,result)=>{ resolve("immagine aggiunta")},
                            (_,error) => { console.log("immagine non aggiunta")}
                        )
                    },
                    (error) => { console.log("immagine non aggiunta")},
                    ()=>{ console.log("trasazione eseguita con successo:");}
                )

        }catch(e){
            throw e;
        }
    })
    }catch(e){
        console.log("errore local storage (addNewImage):"+e);
        throw e;
    }
}

const getMediaProfilo = async(nomeUtente) =>{
    return new Promise((resolve, reject)=>{
        try{
            //da eliminare entrambe (+ async sopra)
            //await deleteMediaFolder(nomeUtente);
            //await deleteMediaTable(nomeUtente);

            let query = "SELECT * FROM "+nomeUtente+"_media;";
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query,
                        [],
                        //in caso di successo
                        (_,{ rows: { _array } }) => { //console.log(_array); 
                                                      resolve(JSON.stringify(_array))},
                        //in caso di errore
                        (_, error) => { reject("galleria non prelevata")}
                    )
                },
                (error) =>{reject("galleria non prelevata")},
                ()=>{ console.log("transazione eseguita con successo:");}
            )
        }catch(e){
            throw e;
        }
    });
}

const checkIfTableExists = async(nomeTabella) => {
    return new Promise((resolve, reject)=>{
        try{
            let query = "SELECT name FROM sqlite_master WHERE type='table' AND name='"+nomeTabella+"';"
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        query,
                        [],
                        (_, result) => {if(result.rows._array[0]) resolve(true); else resolve(false)},
                        (_, err) => {reject(err)}
                    )
                },
                (e) => {reject(e)},
                () => {console.log("transazione eseguita con successo")}
            )
        }catch(e){
            throw e;
        }
    });
}


const createNewIndexForTableForConversation = async(nomeTabella) => {
    return new Promise((resolve, reject)=>{
        try{
            //creo tabella se non esiste
            let query1 = 'CREATE UNIQUE INDEX IF NOT EXISTS indexOf'+nomeTabella+' ON '+ nomeTabella +'(row)';
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query1,
                        [],
                        (_,result)=>{ resolve("indice creato")},
                        (_,error) => { reject("indice non creato")}
                    )
                },
                (error) => { reject(error)},
                ()=>{ console.log("trasazione eseguita con successo:");}
            )

        }catch(e){
            throw e;
        }

    })
}

const getListOfChatMessages = async (nomeTabella, offset) => {
    return new Promise((resolve, reject) => {
        try{

            console.log("Avvio query...");
            let query = "SELECT * FROM "+nomeTabella+" ORDER BY row DESC LIMIT 10 OFFSET "+offset;
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query,
                        [],
                        //in caso di successo
                        (_,{ rows: { _array } }) => { //console.log(_array); 
                                                      resolve(JSON.stringify(_array))},
                        //in caso di errore
                        (_, error) => { reject("messaggi non prelevati")}
                    )
                },
                (error) =>{reject("messaggi non prelevati")},
                ()=>{ console.log("transazione eseguita con successo:");}
            )
    
        }catch(e){
            throw e;
        }

    }) 
}

/*
    Memorizzati ci sono alcuni messaggi con state 'in-progress' o 'failed'. Questa funzione viene chiamata solo
    quando la chat viene aperta per la prima volta ad ogni nuovo riavvio dell'app. Serve a pulire i 
    vecchi messaggi (ossia quelli generati prima che il telefono killasse l'app) e che non sono mai stati inviati
*/
const cleanChatFromFailedMessages = async (nomeTabella) => {
    return new Promise((resolve, reject) => {
        try{
            console.log("Avvio pulizia messaggi...");
            let query = "DELETE FROM "+nomeTabella+" WHERE state='in-progress' OR state='failed'" ;
            db.transaction(
                (tx)=>{
                    tx.executeSql(
                        query,
                        [],
                        //in caso di successo
                        (_,{ rows: { _array } }) => { //console.log(_array); 
                                                      resolve("tabella pulita")},
                        //in caso di errore
                        (_, error) => { reject("tabella non pulita")}
                    )
                },
                (error) =>{reject("tabella non pulita")},
                ()=>{ console.log("transazione eseguita con successo:");}
            )
    
        }catch(e){
            throw e;
        }

    }) 
}

//Lo stato "state" è valido solo per gli audio vocali

const storeNewMessage = async(nomeTabella,key,author,date,type,value, state) => {//date è in millisecondi
    return new Promise((resolve, reject) => {
        try{
            //const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente+".db");
            console.log("Memorizzo nuovo messaggio");
            let update = "INSERT INTO "+nomeTabella+"(row,author,date,type,content,state) VALUES(?,?,?,?,?,?)";
                db.transaction(
                    (tx)=>{
                        tx.executeSql(
                            update,
                            [key,author,date, type,value,state],
                            //in caso di successo
                            (_, result) => {resolve(result)},
                            //in caso di errore
                            (_, error) => {reject(error)}
                        )
                    },
                    (error) => {reject(error)},
                    (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
                )
        }catch(e){
            throw e;
        }
    })
}

const saveAudioIntoFolder = async(utenteCorrente, folder,key, author,date, uri_cache) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            console.log("parametri: "+utenteCorrente+","+folder+","+key+","+author+","+date+","+uri_cache);
            //const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente+".db");
            console.log("salvo audio che attualmente si trova in "+uri_cache+" nel file system");
            //crea una cartella se non esiste
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + utenteCorrente+"/"+folder, {
                intermediates: true
            });
            
            console.log("cartella creata (se non esisteva già):"+date);
            //creo percorso di destinazione
            const percorso= FileSystem.documentDirectory + utenteCorrente + "/" + folder+"/"+(author+"_"+date+"").replace(/ /g,"")+".aac";
            console.log("salvo nel percorso: "+percorso);
            //se l'audio è stato inviato dall'utente corrente
            if(utenteCorrente==author){
                //scrivo il file che si trova in un uri temporanea (cache) nel database
                //quando lo scrivo utilizzo
                const audio_string = await FileSystem.readAsStringAsync(uri_cache,{ encoding: FileSystem.EncodingType.Base64 }); //NB: SE NON SI CRIPTA USARE DOWNLOAD_ASINC PER SCRIVERE DIRETTAMENTE NELLA NUOVA LOCAZIONE INVECE DI FARE READ E POI WRITE
                //ho ottenuto una stringa del contenuto audio
                console.log("audio stringa letto");
                //cripto audio stringa prima di salvare
                console.log("audio stringa criptato");
                //....(cripare stringa)
                /*
                    salvo file criptato
                    NB: non salvo la stringa nel database altrimenti ad ogni apertura di chat deve leggere miliardi di bit, piuttosto salvo
                        il file criptato e salvo nel database solo un riferimento uri per trovarlo. Sarà solo quando richiesto che lo leggerò
                */
            //prelevo formato di salvataggio

                //let indexOfFormat = uri_cache.lastIndexOf(".");
                //let formato = uri_cache.substring(indexOfFormat); //es--> .mp4
                await FileSystem.writeAsStringAsync((percorso), audio_string, {encoding: FileSystem.EncodingType.Base64 });
                //salvo nel database
                await storeNewMessage(utenteCorrente+folder+"",key,author,date.getTime(),"audio",percorso,"in-progress");
                console.log("file salvato con successo nel file system in: "+percorso);
            }
            else {
                let uri = await FileSystem.downloadAsync(
                    uri_cache,
                    percorso
                );
            //salvo nel database
            await storeNewMessage(utenteCorrente+folder+"",key,author,date.getTime(),"audio",percorso,"succeed");
            }
            console.log(FileSystem.documentDirectory);
            resolve(percorso);
        } catch (err) {
            console.log("errore durante il salvataggio dell'audio: "+err);
            reject();
            throw err;
        }
        

    })
}

const updateMessageState = async(nomeTabella,row, new_state) => {
    return new Promise((resolve, reject) => {
        try{
            console.log("Aggiorno stato messaggio");
            let update = "UPDATE "+nomeTabella+" SET state='"+new_state+"' WHERE row="+row;
                db.transaction(
                    (tx)=>{
                        tx.executeSql(
                            update,
                            [],
                            //in caso di successo
                            (_, result) => {resolve(result)},
                            //in caso di errore
                            (_, error) => {reject(error)}
                        )
                    },
                    (error) => {reject(error)},
                    (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
                )
        }catch(e){
            throw e;
        }
    })
}

const savePreference = async(currentUser, preferenceName, value) => {
    return new Promise(async(resolve, reject) => {
        try{

            await AsyncStorage.setItem(currentUser+"_"+preferenceName, value.toString());
            resolve(true);
        }catch(e){
            throw e;
        }
    });
}

const readPreference = async (currentUser, preferenceName) => {
    try {
        const value = await AsyncStorage.getItem(currentUser+"_"+preferenceName);
        return value;
    } catch(e) {
      throw e;
    }
  }

  /*
        NOTIFICHE
  */

    const createNewTableForNotifications = async(nomeUtente) => {
            return new Promise((resolve, reject)=>{
                try{
                    //creo tabella se non esiste
                    console.log("creo tabella se non esiste");
                    /*
                        La tabella notifiche presenta i seguenti campi:
                            - type: il tipo può essere dei seguenti standard:
                                        - JOIN: significa che qualcuno si è unito a te, ossia ha creato lui stesso una conversazione con te
                                        - BLOCKED: significa che qualcuno ti ha bloccato
                            - author: l'autore del type di notifica
                            - timestamp: timestamp di ricezione, ma nota bene che viene espresso in seconds cosi da poter ordinare le notifiche
                            - state: può assumere solo due stati:
                                        - seen: vista, non bisogna incrementare il campanello
                                        - unseen: non visto, ossia se lo si incontra bisogna incrementare di 1 il numero delle notifiche nel campanello
                    */
                    let query1 = 'CREATE TABLE IF NOT EXISTS '+ nomeUtente +'_notifications(timestamp INTEGER, type TEXT, author TEXT, state TEXT);';             
                    db.transaction(
                            (tx)=>{
                                tx.executeSql(
                                    query1,
                                    [],
                                    (_,result)=>{ resolve("tabella creata")},
                                    (_,error) => { console.log("tabella non creata")}
                                )
                            },
                            (error) => { console.log("tabella non creata")},
                            ()=>{ console.log("trasazione eseguita con successo:");}
                        )
    
                }catch(e){
                    throw e;
                }
            })
        }

        const createNewIndexForTableForNotifications = async(nomeUtente) => {
            return new Promise((resolve, reject)=>{
                try{
                    //creo tabella se non esiste
                    let query1 = 'CREATE UNIQUE INDEX IF NOT EXISTS indexOf'+nomeUtente+'_notifications_index ON '+ nomeUtente +'_notifications(timestamp)';
                    db.transaction(
                        (tx)=>{
                            tx.executeSql(
                                query1,
                                [],
                                (_,result)=>{ resolve("indice creato")},
                                (_,error) => { reject("indice non creato")}
                            )
                        },
                        (error) => { reject(error)},
                        ()=>{ console.log("trasazione eseguita con successo:");}
                    )
        
                }catch(e){
                    throw e;
                }
        
            })
        }

        const getListOfNotifications = async (user, offset) => {
            return new Promise((resolve, reject) => {
                try{
        
                    console.log("Avvio query...");
                    let query = "SELECT * FROM "+user+"_notifications ORDER BY timestamp DESC LIMIT 5 OFFSET "+offset;
                    db.transaction(
                        (tx)=>{
                            tx.executeSql(
                                query,
                                [],
                                //in caso di successo
                                (_,{ rows: { _array } }) => { console.log("ritorno lista dallo storage");
                                                              console.log(_array); 
                                                              resolve(JSON.stringify(_array))},
                                //in caso di errore
                                (_, error) => { reject("notifiche non prelevate")}
                            )
                        },
                        (error) =>{reject("notifiche non prelevate")},
                        ()=>{ console.log("transazione eseguita con successo:");}
                    )
            
                }catch(e){
                    throw e;
                }
        
            }) 
        }

        const storeNewNotification = async(user,timestamp, type, author, state) => {
            return new Promise((resolve, reject) => {
                try{
                    //const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente+".db");
                    console.log("Memorizzo nuovo messaggio");
                    let update = "INSERT INTO "+user+"_notifications(timestamp, type, author, state) VALUES(?,?,?,?)";
                        db.transaction(
                            (tx)=>{
                                tx.executeSql(
                                    update,
                                    [timestamp, type, author, state],
                                    //in caso di successo
                                    (_, result) => {resolve(result)},
                                    //in caso di errore
                                    (_, error) => {reject(error)}
                                )
                            },
                            (error) => {reject(error)},
                            (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
                        )
                }catch(e){
                    throw e;
                }
            })
        }

        const updateNotificationState = async(user,timestamp) => {
            return new Promise((resolve, reject) => {
                try{
                    console.log("Aggiorno stato notifica a 'seen'");
                    let update = "UPDATE "+user+"_notifications SET state='seen' WHERE timestamp="+timestamp;
                        db.transaction(
                            (tx)=>{
                                tx.executeSql(
                                    update,
                                    [],
                                    //in caso di successo
                                    (_, result) => {resolve(result)},
                                    //in caso di errore
                                    (_, error) => {reject(error)}
                                )
                            },
                            (error) => {reject(error)},
                            (arg)=>{ console.log("transazione eseguita con successo:"+arg);}
                        )
                }catch(e){
                    throw e;
                }
            })
        }


export default local_storage = {
    checkIfTableExists,
    removeTable,
    createNewTableForConversation,
    createNewIndexForTableForConversation,
    getListOfChatMessages,
    storeNewMessage,
    saveAudioIntoFolder,
    updateMessageState,
    cleanChatFromFailedMessages,
    createNewTableForProfileMedia,
    addNewImage,
    getMediaProfilo,
    deleteMediaTable,
    deleteMediaFolder,
    saveImageLocally,
    removeImageLocally,
    savePreference,
    readPreference,
    createNewTableForNotifications,
    createNewIndexForTableForNotifications,
    getListOfNotifications,
    storeNewNotification,
    updateNotificationState
}