const functions = require("firebase-functions");
const path = require('path');
const admin = require('firebase-admin');
admin.initializeApp();
const {spawn,spawnSync} = require('child_process');

const os = require('os');
const fs = require('fs');
const { v4: uuid } = require("uuid");



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
   fileName = (isForProfile==false) ? new Date().toLocaleString().replace(/ /g,"").replace(/[/]/g,"-") : data.imageName; 

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

      return Promise.all([
         bucket.upload(tempFilePath, {
            destination: "users/"+folder+"/"+fileName,
            metadata: { contentType: mimeType,
               metadata: {
                  firebaseStorageDownloadTokens: uuid()
               } 
             },
          }),
         bucket.upload(tempFilePath_25, {
            destination:  "users/"+folder+"/"+fileName+"_25",
            metadata: { contentType: mimeType,
               metadata: {
                  firebaseStorageDownloadTokens: uuid()
               } 
             },
          }),
          bucket.upload(tempFilePath_50, {
            destination:  "users/"+folder+"/"+fileName+"_50",
            metadata: { contentType: mimeType,
               metadata: {
                  firebaseStorageDownloadTokens: uuid()
               } 
             },
          }),
          bucket.upload(tempFilePath_75, {
            destination:  "users/"+folder+"/"+fileName+"_75",
            metadata: { contentType: mimeType,
               metadata: {
                  firebaseStorageDownloadTokens: uuid()
               } 
             },
          }),
          bucket.upload(tempFilePath_100, {
            destination:  "users/"+folder+"/"+fileName+"_100",
            metadata: { contentType: mimeType,
               metadata: {
                  firebaseStorageDownloadTokens: uuid()
               } 
             },
          })
      ]).then((ris)=>{
            functions.logger.log("File correttamente caricari.");
            functions.logger.log(ris);
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

            //se l'immagine da caricare è di profilo...
            if(isForProfile==true){
               return admin.firestore()
                              .collection("users")
                                 .doc(folder)
                                    .update({
                                       profileImageName: fileName
                                    }).then((ris)=>{
                                       return fileName;
                                    }).catch((e)=>{
                                       throw new functions.https.HttpsError("errore firestore:"+e);
                                    });
                                 }
            else {
            //indico su firestore il nome dell'immagine
            return admin.firestore()
                           .collection("users")
                              .doc(folder)
                                 .update({
                                    gallery: admin.firestore.FieldValue.arrayUnion(fileName)
                                 }).then((ris)=>{
                                    return fileName;
                                 }).catch((e)=>{
                                    throw new functions.https.HttpsError("errore firestore:"+e);
                                 });
                              }

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
});
