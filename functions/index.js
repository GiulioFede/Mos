const functions = require("firebase-functions");
const path = require('path');
const admin = require('firebase-admin');
admin.initializeApp();
const {spawn,spawnSync} = require('child_process');

const os = require('os');
const fs = require('fs');
const { v4: uuid } = require("uuid");
const bucketName = "mos-test-db748.appspot.com"; // NB: CAMBIA 'mos-test-db748' QUANDO CAMBI NOME DATABASE



//Creazione nuovo profilo a 5 livelli (vecchio)
/*exports.createNewUserProfile = functions.https.onCall( async(data, context) =>{

   //controllo che l'utente si sia autenticato
   if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
         'while authenticated.');
   }
 
   //crezione multiple immagini
   try{
      var bucket = admin.storage().bucket();
      //genero una folder qualsiasi
      var folder = context.auth.uid;
      // Convert the base64 string back to an image to upload into the Google Cloud Storage bucket
      var base64EncodedImageString = data.image,
      //uuid dell'utente
      mimeType = 'image/jpeg',
      //se l'immagine è di profilo allora scelgo il nome predefinito altrimenti il timestamp del server
      fileName = "profileImage1"; 
      
      if (!fs.existsSync(os.tmpdir()+"/"+folder)){
         fs.mkdirSync(os.tmpdir()+"/"+folder);
      }
      
      functions.logger.log("Listo tutti i file presenti...")
      fs.readdirSync(os.tmpdir()+"/"+folder).forEach(file => {
         functions.logger.log(file);
      });
      
      const tempFilePath = path.join(os.tmpdir(),folder, fileName+".jpg");
      
      //scrivo il file originale
      fs.writeFileSync(tempFilePath,base64EncodedImageString,'base64',function(err){
         functions.logger.log("file scritto in"+tempFilePath);
      })
      functions.logger.log("file originale scritto in"+tempFilePath);
      
      //converto immagine
         //scrivo il file modificato del 25%
         const tempFilePath_25 = path.join(os.tmpdir(),folder, fileName+"_25.jpg");
         functions.logger.log("path creato");
         spawnSync('convert', [tempFilePath, '-scale', '10%','-scale','1000%>', tempFilePath_25]);
         functions.logger.log("file originale convertito");
         //scrivo il file modificato del 50%
         const tempFilePath_50 = path.join(os.tmpdir(),folder,fileName+"_50.jpg");
         spawnSync('convert', [tempFilePath, '-scale', '5%','-scale','2000%>', tempFilePath_50]);
         //scrivo il file modificato del 75%
         const tempFilePath_75 = path.join(os.tmpdir(),folder, fileName+"_75.jpg");
         spawnSync('convert', [tempFilePath, '-scale', '3%','-scale','3333%>', tempFilePath_75]);
         //scrivo il file modificato del 100%
         const tempFilePath_100 = path.join(os.tmpdir(),folder,  fileName+"_100.jpg");
         spawnSync('convert', [tempFilePath, '-scale', '1%','-scale','10000%>', tempFilePath_100]);
      
         //genero i 4 token. Mi saranno utili cosi da sapere già l'url di download di ciascuna senza richiedere getDownloadUrl()
         const tokenImmagineOriginale = uuid();
         const tokenImmagine25 = uuid();
         const tokenImmagine50 = uuid();
         const tokenImmagine75 = uuid();
         const tokenImmagine100 = uuid();
      
         return Promise.all([
            bucket.upload(tempFilePath, {
               destination: "users/"+folder+"/"+fileName,
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagineOriginale
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagineOriginale);
           }),
            bucket.upload(tempFilePath_25, {
               destination:  "users/"+folder+"/"+fileName+"_25",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine25
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine25);
           }),
             bucket.upload(tempFilePath_50, {
               destination:  "users/"+folder+"/"+fileName+"_50",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine50
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine50);
           }),
             bucket.upload(tempFilePath_75, {
               destination:  "users/"+folder+"/"+fileName+"_75",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine75
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine75);
           }),
             bucket.upload(tempFilePath_100, {
               destination:  "users/"+folder+"/"+fileName+"_100",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine100
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine100);
           })
         ]).then(async(urls)=>{
            //NB: nella promiseAll, se sono qui allora TUTTO è andato bene in quanto tutto va bene o tutta viene rifiutato
               functions.logger.log("File correttamente caricari.");
               functions.logger.log(urls);
               fs.unlinkSync(tempFilePath_25);
               functions.logger.log("file col 25% in locale eliminato");
               fs.unlinkSync(tempFilePath_50);
               functions.logger.log("file col 50% in locale eliminato");
               fs.unlinkSync(tempFilePath_75);
               functions.logger.log("file col 75% in locale eliminato");
               fs.unlinkSync(tempFilePath_100);
               functions.logger.log("file col 100% in locale eliminato");
               fs.unlinkSync(tempFilePath);
               functions.logger.log("file originale in locale eliminato");
      
               fs.rmdirSync(os.tmpdir()+"/"+folder);
               functions.logger.log("Cartella eliminata. Fine");
      
               //daEliminare
               functions.logger.log("Nomi paths:"+urls[0]+"   "+urls[1]+"   "+urls[2]+"   "+urls[3]+"   "+urls[4]);
      
            //inserisco in batch il documento dell'utente e i 4 riferimenti alle immagini in users/utente/media
               var batch = admin.firestore().batch();
               //1) documento utente
               var documentoProfiloUtente = admin.firestore()
                                                 .collection("users")
                                                 .doc(folder);
               batch.set(documentoProfiloUtente,{
                           name: data.name,
                           date_of_birth: new Date(data.date_of_birth),
                           age: data.age,
                           biological_sex: data.biological_sex,
                           gender_identity: data.gender_identity,
                           gender_preference: data.gender_preference,
                           self_description: data.self_description,
                           current_occupation: data.occupation,
                           hobbies_interests_and_passions: data.keywords,
                           location: {
                              geohash: data.hash,
                              lat: data.lat,
                              lng: data.lng,
                              city: data.city,
                              region: data.region,
                              country: data.country
                           }
                        });
               //1) documento originale
               var updateImmagineProfiloOriginale = admin.firestore().collection("users").doc(folder).collection("media").doc("0");
               batch.set(updateImmagineProfiloOriginale, {profileImageUrl: urls[0], gallery: new Object()});
               //2) documento 25% 
               var updateImmagineProfilo25 = admin.firestore().collection("users").doc(folder).collection("media").doc("25");
               batch.set(updateImmagineProfilo25, {profileImageUrl: urls[1],gallery: new Object()});
               //3) documento 50% 
               var updateImmagineProfilo50 = admin.firestore().collection("users").doc(folder).collection("media").doc("50");
               batch.set(updateImmagineProfilo50, {profileImageUrl: urls[2],gallery: new Object()});
               //4) documento 75% 
               var updateImmagineProfilo75 = admin.firestore().collection("users").doc(folder).collection("media").doc("75");
               batch.set(updateImmagineProfilo75, {profileImageUrl: urls[3], gallery: new Object()});
               //1) documento 100% 
               var updateImmagineProfilo100 = admin.firestore().collection("users").doc(folder).collection("media").doc("100");
               batch.set(updateImmagineProfilo100, {profileImageUrl: urls[4], gallery: new Object()});

               //creo documento conversazioni vuoto
               var createEmptyConversation = admin.firestore().collection("users").doc(folder).collection("chats").doc("Conversations");
               batch.set(createEmptyConversation, {conversations: []}); 
      
            //commit del batch
               return batch.commit().then((result)=>{
                  //i 4 documenti sono stati scritti su firestore con successo
                  functions.logger.log("i 5 documenti sono stati scritti su firestore con successo");
                  
                  //   ritorno il documento contenente gli url delle 4 versioni dell'immagine di profilo:
                  
                  return {
                     name: fileName,
                     url_0: urls[0],
                     url_25: urls[1],
                     url_50: urls[2],
                     url_75: urls[3],
                     url_100: urls[4]
                  }
               }).catch((err)=>{
                  throw new functions.https.HttpsError("errore firestore: "+err);
               })   
      
         })
           .catch((e)=>{ //viene chiamato anche se il return di sopra fallisce
            
               if (fs.existsSync(os.tmpdir()+"/"+folder)){
                  fs.unlinkSync(tempFilePath_25);
                     functions.logger.log("file col 25% in locale eliminato");
                     fs.unlinkSync(tempFilePath_50);
                     functions.logger.log("file col 50% in locale eliminato");
                     fs.unlinkSync(tempFilePath_75);
                     functions.logger.log("file col 75% in locale eliminato");
                     fs.unlinkSync(tempFilePath_100);
                     functions.logger.log("file col 100% in locale eliminato");
                     fs.unlinkSync(tempFilePath);
                     functions.logger.log("file originale in locale eliminato");
      
                     fs.rmdirSync(os.tmpdir()+"/"+folder);
                     functions.logger.log("Cartella eliminata. Fine");  
               }
                  
               throw new functions.https.HttpsError("errore:"+e);
            });
       }catch(e){
         functions.logger.log("Eccezione:"+e);
         if (fs.existsSync(os.tmpdir()+"/"+folder)){
            fs.rmdirSync(os.tmpdir()+"/"+folder);
         }
         throw new functions.https.HttpsError("errore. Eccezione interna");
      }
})*/


exports.createNewUserProfile = functions.https.onCall( async(data, context) =>{

   //controllo che l'utente si sia autenticato
   if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
         'while authenticated.');
   }
 
   //crezione multiple immagini
   try{
      var bucket = admin.storage().bucket();
      //genero una folder qualsiasi
      var folder = context.auth.uid;
      // Convert the base64 string back to an image to upload into the Google Cloud Storage bucket
      var base64EncodedImageString = data.image,
      //uuid dell'utente
      mimeType = 'image/jpeg',
      //se l'immagine è di profilo allora scelgo il nome predefinito altrimenti il timestamp del server
      fileName = "profileImage1"; 
      
      if (!fs.existsSync(os.tmpdir()+"/"+folder)){
         fs.mkdirSync(os.tmpdir()+"/"+folder);
      }
      
      functions.logger.log("Listo tutti i file presenti...")
      fs.readdirSync(os.tmpdir()+"/"+folder).forEach(file => {
         functions.logger.log(file);
      });
      
      const tempFilePath = path.join(os.tmpdir(),folder, fileName+".jpg");
      
      //scrivo il file originale
      fs.writeFileSync(tempFilePath,base64EncodedImageString,'base64',function(err){
         functions.logger.log("file scritto in"+tempFilePath);
      })
      functions.logger.log("file originale scritto in"+tempFilePath);
      
      //converto immagine
      //formula x=((100-p)/p)*100+100 --> dove p è la prima percentuale di scala (scegliamo noi) e x e la seconda che dobbiamo trovare. 
         //scrivo il file modificato del 50%
         const tempFilePath_50 = path.join(os.tmpdir(),folder,fileName+"_50.jpg");
         spawnSync('convert', [tempFilePath, '-scale', '6.8%','-scale','1470.58%>', tempFilePath_50]);

         //scrivo il file modificato del 100%
         const tempFilePath_100 = path.join(os.tmpdir(),folder,  fileName+"_100.jpg");
         spawnSync('convert', [tempFilePath, '-scale', '4%','-scale','2500%>', tempFilePath_100]);
      
         //genero i 4 token. Mi saranno utili cosi da sapere già l'url di download di ciascuna senza richiedere getDownloadUrl()
         const tokenImmagineOriginale = uuid();
         const tokenImmagine50 = uuid();
         const tokenImmagine100 = uuid();
      
         return Promise.all([
            bucket.upload(tempFilePath, {
               destination: "users/"+folder+"/"+fileName,
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagineOriginale
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagineOriginale);
           }),
             bucket.upload(tempFilePath_50, {
               destination:  "users/"+folder+"/"+fileName+"_50",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine50
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine50);
           }),
             bucket.upload(tempFilePath_100, {
               destination:  "users/"+folder+"/"+fileName+"_100",
               metadata: { contentType: mimeType,
                  metadata: {
                     firebaseStorageDownloadTokens: tokenImmagine100
                  } 
                },
             }).then((data) => {
      
               let file = data[0];
      
               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine100);
           })
         ]).then(async(urls)=>{
            //NB: nella promiseAll, se sono qui allora TUTTO è andato bene in quanto tutto va bene o tutta viene rifiutato
               functions.logger.log("File correttamente caricari.");
               functions.logger.log(urls);
               fs.unlinkSync(tempFilePath_50);
               functions.logger.log("file col 50% in locale eliminato");
               fs.unlinkSync(tempFilePath_100);
               functions.logger.log("file col 100% in locale eliminato");
               fs.unlinkSync(tempFilePath);
               functions.logger.log("file originale in locale eliminato");
      
               fs.rmdirSync(os.tmpdir()+"/"+folder);
               functions.logger.log("Cartella eliminata. Fine");
      
            //inserisco in batch il documento dell'utente e i 2 riferimenti alle immagini in users/utente/media
               var batch = admin.firestore().batch();
               //1) documento utente
               var documentoProfiloUtente = admin.firestore()
                                                 .collection("users")
                                                 .doc(folder);
               batch.set(documentoProfiloUtente,{
                           name: data.name,
                           date_of_birth: new Date(data.date_of_birth),
                           age: data.age,
                           biological_sex: data.biological_sex,
                           gender_identity: data.gender_identity,
                           gender_preference: data.gender_preference,
                           self_description: data.self_description,
                           current_occupation: data.occupation,
                           hobbies_interests_and_passions: data.keywords,
                           push_notification_token: null,
                           show_me: true,
                           location: {
                              geohash: data.hash,
                              lat: data.lat,
                              lng: data.lng,
                              city: data.city,
                              region: data.region,
                              country: data.country
                           }
                        });
               //1) documento originale
               var updateImmagineProfiloOriginale = admin.firestore().collection("users").doc(folder).collection("media").doc("0");
               batch.set(updateImmagineProfiloOriginale, {profileImageUrl: urls[0], gallery: new Object()});
               //3) documento 50% 
               var updateImmagineProfilo50 = admin.firestore().collection("users").doc(folder).collection("media").doc("50");
               batch.set(updateImmagineProfilo50, {profileImageUrl: urls[1],gallery: new Object()});
               //1) documento 100% 
               var updateImmagineProfilo100 = admin.firestore().collection("users").doc(folder).collection("media").doc("100");
               batch.set(updateImmagineProfilo100, {profileImageUrl: urls[2], gallery: new Object()});

               //creo documento conversazioni vuoto
               var createEmptyConversation = admin.firestore().collection("users").doc(folder).collection("chats").doc("Conversations");
               batch.set(createEmptyConversation, {conversations: []}); 
      
            //commit del batch
               return batch.commit().then((result)=>{
                  //i 4 documenti sono stati scritti su firestore con successo
                  functions.logger.log("i 5 documenti sono stati scritti su firestore con successo");
                  
                  //   ritorno il documento contenente gli url delle 4 versioni dell'immagine di profilo:
                  
                  return {
                     name: fileName,
                     url_0: urls[0],
                     url_50: urls[2],
                     url_100: urls[4]
                  }
               }).catch((err)=>{
                  throw new functions.https.HttpsError("errore firestore: "+err);
               })   
      
         })
           .catch((e)=>{ //viene chiamato anche se il return di sopra fallisce
            
               if (fs.existsSync(os.tmpdir()+"/"+folder)){
                     fs.unlinkSync(tempFilePath_50);
                     functions.logger.log("file col 50% in locale eliminato");
                     fs.unlinkSync(tempFilePath_100);
                     functions.logger.log("file col 100% in locale eliminato");
                     fs.unlinkSync(tempFilePath);
                     functions.logger.log("file originale in locale eliminato");
      
                     fs.rmdirSync(os.tmpdir()+"/"+folder);
                     functions.logger.log("Cartella eliminata. Fine");  
               }
                  
               throw new functions.https.HttpsError("errore:"+e);
            });
       }catch(e){
         functions.logger.log("Eccezione:"+e);
         if (fs.existsSync(os.tmpdir()+"/"+folder)){
            fs.rmdirSync(os.tmpdir()+"/"+folder);
         }
         throw new functions.https.HttpsError("errore. Eccezione interna");
      }
});





/*
//Quando l'utente carica la propria immagine si creano diverse versioni di questa
exports.uploadImageVecchio = functions.https.onCall(async(data, context) => {

   // Checking that the user is authenticated.
if (!context.auth) {
   // Throwing an HttpsError so that the client gets the error details.
   throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
}
 
try{
var bucket = admin.storage().bucket();
//ottengo l'informazione se l'immagine da caricare è di profilo (true) o meno (false)
const isForProfile = data.isForProfile; 
//genero una folder qualsiasi
var folder = data.idUser;
// Convert the base64 string back to an image to upload into the Google Cloud Storage bucket
var base64EncodedImageString = data.image,
//uuid dell'utente
mimeType = 'image/jpeg',
//se l'immagine è di profilo allora scelgo il nome predefinito altrimenti il timestamp del server
fileName = data.imageName; 

if (!fs.existsSync(os.tmpdir()+"/"+folder)){
   fs.mkdirSync(os.tmpdir()+"/"+folder);
}

functions.logger.log("Listo tutti i file presenti...")
fs.readdirSync(os.tmpdir()+"/"+folder).forEach(file => {
   functions.logger.log(file);
});

const tempFilePath = path.join(os.tmpdir(),folder, fileName+".jpg");

//scrivo il file originale
fs.writeFileSync(tempFilePath,base64EncodedImageString,'base64',function(err){
   functions.logger.log("file scritto in"+tempFilePath);
})
functions.logger.log("file originale scritto in"+tempFilePath);

//converto immagine
   //scrivo il file modificato del 25%
   const tempFilePath_25 = path.join(os.tmpdir(),folder, fileName+"_25.jpg");
   functions.logger.log("path creato");
   spawnSync('convert', [tempFilePath, '-scale', '10%','-scale','1000%>', tempFilePath_25]);
   functions.logger.log("file originale convertito");
   //scrivo il file modificato del 50%
   const tempFilePath_50 = path.join(os.tmpdir(),folder,fileName+"_50.jpg");
   spawnSync('convert', [tempFilePath, '-scale', '5%','-scale','2000%>', tempFilePath_50]);
   //scrivo il file modificato del 75%
   const tempFilePath_75 = path.join(os.tmpdir(),folder, fileName+"_75.jpg");
   spawnSync('convert', [tempFilePath, '-scale', '3%','-scale','3333%>', tempFilePath_75]);
   //scrivo il file modificato del 100%
   const tempFilePath_100 = path.join(os.tmpdir(),folder,  fileName+"_100.jpg");
   spawnSync('convert', [tempFilePath, '-scale', '1%','-scale','10000%>', tempFilePath_100]);

   //genero i 4 token. Mi saranno utili cosi da sapere già l'url di download di ciascuna senza richiedere getDownloadUrl()
   const tokenImmagineOriginale = uuid();
   const tokenImmagine25 = uuid();
   const tokenImmagine50 = uuid();
   const tokenImmagine75 = uuid();
   const tokenImmagine100 = uuid();

   return Promise.all([
      bucket.upload(tempFilePath, {
         destination: "users/"+folder+"/"+fileName,
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagineOriginale
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagineOriginale);
     }),
      bucket.upload(tempFilePath_25, {
         destination:  "users/"+folder+"/"+fileName+"_25",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine25
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine25);
     }),
       bucket.upload(tempFilePath_50, {
         destination:  "users/"+folder+"/"+fileName+"_50",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine50
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine50);
     }),
       bucket.upload(tempFilePath_75, {
         destination:  "users/"+folder+"/"+fileName+"_75",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine75
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine75);
     }),
       bucket.upload(tempFilePath_100, {
         destination:  "users/"+folder+"/"+fileName+"_100",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine100
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine100);
     })
   ]).then(async(urls)=>{
      //NB: nella promiseAll, se sono qui allora TUTTO è andato bene in quanto tutto va bene o tutta viene rifiutato
         functions.logger.log("File correttamente caricari.");
         functions.logger.log(urls);
         fs.unlinkSync(tempFilePath_25);
         functions.logger.log("file col 25% in locale eliminato");
         fs.unlinkSync(tempFilePath_50);
         functions.logger.log("file col 50% in locale eliminato");
         fs.unlinkSync(tempFilePath_75);
         functions.logger.log("file col 75% in locale eliminato");
         fs.unlinkSync(tempFilePath_100);
         functions.logger.log("file col 100% in locale eliminato");
         fs.unlinkSync(tempFilePath);
         functions.logger.log("file originale in locale eliminato");

         fs.rmdirSync(os.tmpdir()+"/"+folder);
         functions.logger.log("Cartella eliminata. Fine");

         //daEliminare
         functions.logger.log("Nomi paths:"+urls[0]+"   "+urls[1]+"   "+urls[2]+"   "+urls[3]+"   "+urls[4]);

      //aggiorno in batch i 4 documenti in users/utente/media
         var batch = admin.firestore().batch();
          
 
         //1) documento originale
         var updateImmagineProfiloOriginale = admin.firestore().collection("users").doc(folder).collection("media").doc("0");
         if(isForProfile==true) batch.update(updateImmagineProfiloOriginale, {profileImageUrl: urls[0]});
         else batch.update(updateImmagineProfiloOriginale, {[`gallery.${fileName}`]: urls[0]});

         //2) documento 25% 
         var updateImmagineProfilo25 = admin.firestore().collection("users").doc(folder).collection("media").doc("25");
         if(isForProfile==true) batch.update(updateImmagineProfilo25, {profileImageUrl: urls[1]});
         else batch.update(updateImmagineProfilo25, {[`gallery.${fileName}`]: urls[1]});

         //3) documento 50% 
         var updateImmagineProfilo50 = admin.firestore().collection("users").doc(folder).collection("media").doc("50");
         if(isForProfile==true) batch.update(updateImmagineProfilo50, {profileImageUrl: urls[2]});
         else batch.update(updateImmagineProfilo50, {[`gallery.${fileName}`]: urls[2]});

         //4) documento 75% 
         var updateImmagineProfilo75 = admin.firestore().collection("users").doc(folder).collection("media").doc("75");
         if(isForProfile==true) batch.update(updateImmagineProfilo75, {profileImageUrl: urls[3]});
         else batch.update(updateImmagineProfilo75, {[`gallery.${fileName}`]: urls[3]});

         //1) documento 100% 
         var updateImmagineProfilo100 = admin.firestore().collection("users").doc(folder).collection("media").doc("100");
         if(isForProfile==true) batch.update(updateImmagineProfilo100, {profileImageUrl: urls[4]});
         else batch.update(updateImmagineProfilo100, {[`gallery.${fileName}`]: urls[4]});

      //commit del batch
         return batch.commit().then((result)=>{
            //i 4 documenti sono stati scritti su firestore con successo
            functions.logger.log("i 4 documenti sono stati scritti su firestore con successo");
            
            //   ritorno la mappa sotto in quanto avrò bisogno del nome se la dovrò eliminare
            
            return {
               name: fileName,
               url_0: urls[0],
               url_25: urls[1],
               url_50: urls[2],
               url_75: urls[3],
               url_100: urls[4]
            }
         }).catch((err)=>{
            throw new functions.https.HttpsError("errore firestore: "+err);
         })   

   })
     .catch((e)=>{ //viene chiamato anche se il return di sopra fallisce
      
         if (fs.existsSync(os.tmpdir()+"/"+folder)){
            fs.unlinkSync(tempFilePath_25);
               functions.logger.log("file col 25% in locale eliminato");
               fs.unlinkSync(tempFilePath_50);
               functions.logger.log("file col 50% in locale eliminato");
               fs.unlinkSync(tempFilePath_75);
               functions.logger.log("file col 75% in locale eliminato");
               fs.unlinkSync(tempFilePath_100);
               functions.logger.log("file col 100% in locale eliminato");
               fs.unlinkSync(tempFilePath);
               functions.logger.log("file originale in locale eliminato");

               fs.rmdirSync(os.tmpdir()+"/"+folder);
               functions.logger.log("Cartella eliminata. Fine");  
         }
            
         throw new functions.https.HttpsError("errore:"+e);
      });
 }catch(e){
   functions.logger.log("Eccezione:"+e);
   if (fs.existsSync(os.tmpdir()+"/"+folder)){
      fs.rmdirSync(os.tmpdir()+"/"+folder);
   }
   throw new functions.https.HttpsError("errore. Eccezione interna");
}
});*/


//Quando l'utente carica la propria immagine si creano diverse versioni di questa
exports.uploadImage = functions.https.onCall(async(data, context) => {

   // Checking that the user is authenticated.
if (!context.auth) {
   // Throwing an HttpsError so that the client gets the error details.
   throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
}
 
try{
var bucket = admin.storage().bucket();
//ottengo l'informazione se l'immagine da caricare è di profilo (true) o meno (false)
const isForProfile = data.isForProfile; 
//genero una folder qualsiasi
var folder = data.idUser;
// Convert the base64 string back to an image to upload into the Google Cloud Storage bucket
var base64EncodedImageString = data.image,
//uuid dell'utente
mimeType = 'image/jpeg',
//se l'immagine è di profilo allora scelgo il nome predefinito altrimenti il timestamp del server
fileName = data.imageName; 

if (!fs.existsSync(os.tmpdir()+"/"+folder)){
   fs.mkdirSync(os.tmpdir()+"/"+folder);
}

functions.logger.log("Listo tutti i file presenti...")
fs.readdirSync(os.tmpdir()+"/"+folder).forEach(file => {
   functions.logger.log(file);
});

const tempFilePath = path.join(os.tmpdir(),folder, fileName+".jpg");

//scrivo il file originale
fs.writeFileSync(tempFilePath,base64EncodedImageString,'base64',function(err){
   functions.logger.log("file scritto in"+tempFilePath);
})
functions.logger.log("file originale scritto in"+tempFilePath);

//converto immagine
   //formula x=((100-p)/p)*100+100 --> dove p è la prima percentuale di scala (scegliamo noi) e x e la seconda che dobbiamo trovare. 
   //scrivo il file modificato del 50%
   const tempFilePath_50 = path.join(os.tmpdir(),folder,fileName+"_50.jpg");
   spawnSync('convert', [tempFilePath, '-scale', '6.8%','-scale','1470.58%>', tempFilePath_50]);

   //scrivo il file modificato del 100%
   const tempFilePath_100 = path.join(os.tmpdir(),folder,  fileName+"_100.jpg");
   spawnSync('convert', [tempFilePath, '-scale', '4%','-scale','2500%>', tempFilePath_100]);

   //genero i 4 token. Mi saranno utili cosi da sapere già l'url di download di ciascuna senza richiedere getDownloadUrl()
   const tokenImmagineOriginale = uuid();
   const tokenImmagine50 = uuid();
   const tokenImmagine100 = uuid();

   return Promise.all([
      bucket.upload(tempFilePath, {
         destination: "users/"+folder+"/"+fileName,
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagineOriginale
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagineOriginale);
     }),
       bucket.upload(tempFilePath_50, {
         destination:  "users/"+folder+"/"+fileName+"_50",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine50
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine50);
     }),
       bucket.upload(tempFilePath_100, {
         destination:  "users/"+folder+"/"+fileName+"_100",
         metadata: { contentType: mimeType,
            metadata: {
               firebaseStorageDownloadTokens: tokenImmagine100
            } 
          },
       }).then((data) => {

         let file = data[0];

         return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + tokenImmagine100);
     })
   ]).then(async(urls)=>{
      //NB: nella promiseAll, se sono qui allora TUTTO è andato bene in quanto tutto va bene o tutta viene rifiutato
         functions.logger.log("File correttamente caricari.");
         functions.logger.log(urls);
         fs.unlinkSync(tempFilePath_50);
         functions.logger.log("file col 50% in locale eliminato");
         fs.unlinkSync(tempFilePath_100);
         functions.logger.log("file col 100% in locale eliminato");
         fs.unlinkSync(tempFilePath);
         functions.logger.log("file originale in locale eliminato");

         fs.rmdirSync(os.tmpdir()+"/"+folder);
         functions.logger.log("Cartella eliminata. Fine");

      //aggiorno in batch i 2 documenti in users/utente/media
         var batch = admin.firestore().batch();
          
 
         //1) documento originale
         var updateImmagineProfiloOriginale = admin.firestore().collection("users").doc(folder).collection("media").doc("0");
         if(isForProfile==true) batch.update(updateImmagineProfiloOriginale, {profileImageUrl: urls[0]});
         else batch.update(updateImmagineProfiloOriginale, {[`gallery.${fileName}`]: urls[0]});

         //3) documento 50% 
         var updateImmagineProfilo50 = admin.firestore().collection("users").doc(folder).collection("media").doc("50");
         if(isForProfile==true) batch.update(updateImmagineProfilo50, {profileImageUrl: urls[1]});
         else batch.update(updateImmagineProfilo50, {[`gallery.${fileName}`]: urls[1]});

         //1) documento 100% 
         var updateImmagineProfilo100 = admin.firestore().collection("users").doc(folder).collection("media").doc("100");
         if(isForProfile==true) batch.update(updateImmagineProfilo100, {profileImageUrl: urls[2]});
         else batch.update(updateImmagineProfilo100, {[`gallery.${fileName}`]: urls[2]});

      //commit del batch
         return batch.commit().then((result)=>{
            //i 4 documenti sono stati scritti su firestore con successo
            functions.logger.log("i 2 documenti sono stati scritti su firestore con successo");
            
            //   ritorno la mappa sotto in quanto avrò bisogno del nome se la dovrò eliminare
            
            return {
               name: fileName,
               url_0: urls[0],
               url_50: urls[1],
               url_100: urls[2]
            }
         }).catch((err)=>{
            throw new functions.https.HttpsError("errore firestore: "+err);
         })   

   })
     .catch((e)=>{ //viene chiamato anche se il return di sopra fallisce
      
         if (fs.existsSync(os.tmpdir()+"/"+folder)){
               fs.unlinkSync(tempFilePath_50);
               functions.logger.log("file col 50% in locale eliminato");
               fs.unlinkSync(tempFilePath_100);
               functions.logger.log("file col 100% in locale eliminato");
               fs.unlinkSync(tempFilePath);
               functions.logger.log("file originale in locale eliminato");

               fs.rmdirSync(os.tmpdir()+"/"+folder);
               functions.logger.log("Cartella eliminata. Fine");  
         }
            
         throw new functions.https.HttpsError("errore:"+e);
      });
 }catch(e){
   functions.logger.log("Eccezione:"+e);
   if (fs.existsSync(os.tmpdir()+"/"+folder)){
      fs.rmdirSync(os.tmpdir()+"/"+folder);
   }
   throw new functions.https.HttpsError("errore. Eccezione interna");
}
});