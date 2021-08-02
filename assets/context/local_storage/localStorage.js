import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite'

const SUCCESS_QUERY = "SUCCESS_QUERY";

export class LocalStorage {

    static createNewTableForConversation(utenteCorrente, contactUid, callbackSuccesso, callbackErrore){

        const db = SQLite.openDatabase("MosaicLocalDB."+utenteCorrente);

        /* QUESTO MOSTRA GLI INDICI PRESENTI (NB: NON USARLO IN PRODUZIONE, MA TIENILO PER SAPERE SE GLI INDICI SONO STATI CREATI O MENO)*/
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
            /*
                salvo file criptato
                NB: non salvo la stringa nel database altrimenti ad ogni apertura di chat deve leggere miliardi di bit, piuttosto salvo
                    il file criptato e salvo nel database solo un riferimento uri per trovarlo. Sarà solo quando richiesto che lo leggerò
            */
            const percorso= FileSystem.documentDirectory + utenteCorrente + "/" + folder+"/"+(new Date().toUTCString().replace(/ /g,""));
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