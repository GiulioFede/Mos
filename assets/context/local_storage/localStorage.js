import forge from 'node-forge';
import * as React from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

function convertStringToByteArray(str){
    String.prototype.encodeHex = function () {
    var bytes = [];
    for (var i = 0; i < this.length; ++i) {
     bytes.push(this.charCodeAt(i));
    }
    return bytes;
    };
   
    var byteArray = str.encodeHex();
    return byteArray
    }


const privateRsaKey= "MIIEpgIBAAKCAQEAu26jI+mc/gQluhVjpjQGpDVB2sTQz3AVLHJp24qza5089L5vBCrucMd3ptkubZ9FEBmsbhhpV3Sl0YVa3CQPfBFZrhIb+DTsBth/6eWSwacgvjq5thqhjI3hIbWcVw2yXqW+CBr9+WfCnlmxQ74Tk/YcHFvd6RB0rhzgaVxaMjyKpwNKkFbSdTUzafgOIOLU8Yfb6zN4ZVlTIEMRN8jtrfNE8tnTxcGnNlWSt+DXwXUSadzrxlwWeS7vi7PK67NhBQpL83BCw2uudZPFzBo/bgu8OgRjTB7D4Uy36Omjxd8WO5JZtGJm/ca6I/feyx3fDl+4BoWECb+RqHdqdCw9xQIDAQABAoIBAQCPn6DdRQcq0qzCId/BHP6116WF6OkE+6MN8wJQ28DOxqdN95sEO42I2CBEtwlPsQrv4mxx1Lzr6hOiMKjGJc/Dx1vL+k56bLssJ7wk0+kYAWQiwMdL1q5SEOohtZN+VZ2Hz0OF3IEfGzZTtvERstY3vBAgXvj1vclbHf+MXNs0wEXdUZxNAFOkbE9ZgxbyMSldEypLc2vFyZtRINMz9C/v3knFuhIpooiNyXJYA/FfyPpSufCOjs3rOB1X5SReYkK6r30bMdj1ah77a7A18a9Rk6/GOK8LAuWEAi9cG4vcKXPldeB2EvTTvXJYBaV66eNIr9KcVUej2xo1/OIc7rmFAoGBANvhkvcO0TF0iH54L5arhv+B0XUlS+M2Akm9yLZADZeUsVYsSJkYJQTWoIOkVd1y5aIdQSrujdQrh0KNdEFD6rdfSWMyawdmdLAlE3/UHlRQBt3iPimrwLFr7CaP0MTzvWqXh+0q++XpkW8ajTSVH/WH7nD/Tpv9mYrarjg41c6/AoGBANo4hXp23qgPIHSp6fIgnAAaScILMt/Nt7amm4y43DY2Ym6lRSWi8Fo1psZIyV8MZ/D8hH29Y0GlR1jm42AkcwVubBxIajNg/ImkKm4uVgIcjQU9E1IpwALQcY0kFkFlYE4mYRB9AX6NUocgMW+UaLe2f2lqkZQwp3813Vd58Bh7AoGBAMU6TBohh1FGBxzx7zXF+9x59IiQgMZ4bor4me2n/Mknjf4O0LvKJYJ2hhousPpnEkVc2lSJEFztAnGW8l2MbyA2b1x0H/7OTwKk7x2tBdt4wQAL7Nhx//DlLjjUrV3Mh+3xp/H7qWFsJZC0D07IKJeTazSePUO8sRoU10sE5/t/AoGBALSodliccFjRrRzoTjWVqZCsMsPiYYvG04DzDXPC1wxKmdLgIA64hiMop5kgSRXXP3XSmB1A3RtLqXWAMF03z8F/WSFREhrXADszHa15ztqQqG7d0VEEH2I1Dsy6Q3KAaupH+7OaydHrTZdwn3ywcMEm5PRwtXTpksFN5qC04oBhAoGBAIwrinb2G3TyJsCWmTUX6UXGcb8DoBxi5UUPmqTqWRY2PzmzNYEuNJMeih15kS81/Q9md6kfLFaeDST/gkr8V+NjGE4G5RFbQ3zeD2ZAXTCScgNcF69rwqcFTK2BFiv4wYZkNgaEHUp4JotjtTYCuw6NLDU4N1OxuObs///mPOJU";
const publicRsaKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu26jI+mc/gQluhVjpjQGpDVB2sTQz3AVLHJp24qza5089L5vBCrucMd3ptkubZ9FEBmsbhhpV3Sl0YVa3CQPfBFZrhIb+DTsBth/6eWSwacgvjq5thqhjI3hIbWcVw2yXqW+CBr9+WfCnlmxQ74Tk/YcHFvd6RB0rhzgaVxaMjyKpwNKkFbSdTUzafgOIOLU8Yfb6zN4ZVlTIEMRN8jtrfNE8tnTxcGnNlWSt+DXwXUSadzrxlwWeS7vi7PK67NhBQpL83BCw2uudZPFzBo/bgu8OgRjTB7D4Uy36Omjxd8WO5JZtGJm/ca6I/feyx3fDl+4BoWECb+RqHdqdCw9xQIDAQAB";

const pub= "-----BEGIN PUBLIC KEY-----\
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu26jI+mc/gQluhVjpjQG\
pDVB2sTQz3AVLHJp24qza5089L5vBCrucMd3ptkubZ9FEBmsbhhpV3Sl0YVa3CQP\
fBFZrhIb+DTsBth/6eWSwacgvjq5thqhjI3hIbWcVw2yXqW+CBr9+WfCnlmxQ74T\
k/YcHFvd6RB0rhzgaVxaMjyKpwNKkFbSdTUzafgOIOLU8Yfb6zN4ZVlTIEMRN8jt\
rfNE8tnTxcGnNlWSt+DXwXUSadzrxlwWeS7vi7PK67NhBQpL83BCw2uudZPFzBo/\
bgu8OgRjTB7D4Uy36Omjxd8WO5JZtGJm/ca6I/feyx3fDl+4BoWECb+RqHdqdCw9\
xQIDAQAB\
-----END PUBLIC KEY-----";

const priv = "-----BEGIN RSA PRIVATE KEY-----\
MIIEpgIBAAKCAQEAu26jI+mc/gQluhVjpjQGpDVB2sTQz3AVLHJp24qza5089L5v\
BCrucMd3ptkubZ9FEBmsbhhpV3Sl0YVa3CQPfBFZrhIb+DTsBth/6eWSwacgvjq5\
thqhjI3hIbWcVw2yXqW+CBr9+WfCnlmxQ74Tk/YcHFvd6RB0rhzgaVxaMjyKpwNK\
kFbSdTUzafgOIOLU8Yfb6zN4ZVlTIEMRN8jtrfNE8tnTxcGnNlWSt+DXwXUSadzr\
xlwWeS7vi7PK67NhBQpL83BCw2uudZPFzBo/bgu8OgRjTB7D4Uy36Omjxd8WO5JZ\
tGJm/ca6I/feyx3fDl+4BoWECb+RqHdqdCw9xQIDAQABAoIBAQCPn6DdRQcq0qzC\
Id/BHP6116WF6OkE+6MN8wJQ28DOxqdN95sEO42I2CBEtwlPsQrv4mxx1Lzr6hOi\
MKjGJc/Dx1vL+k56bLssJ7wk0+kYAWQiwMdL1q5SEOohtZN+VZ2Hz0OF3IEfGzZT\
tvERstY3vBAgXvj1vclbHf+MXNs0wEXdUZxNAFOkbE9ZgxbyMSldEypLc2vFyZtR\
INMz9C/v3knFuhIpooiNyXJYA/FfyPpSufCOjs3rOB1X5SReYkK6r30bMdj1ah77\
a7A18a9Rk6/GOK8LAuWEAi9cG4vcKXPldeB2EvTTvXJYBaV66eNIr9KcVUej2xo1\
/OIc7rmFAoGBANvhkvcO0TF0iH54L5arhv+B0XUlS+M2Akm9yLZADZeUsVYsSJkY\
JQTWoIOkVd1y5aIdQSrujdQrh0KNdEFD6rdfSWMyawdmdLAlE3/UHlRQBt3iPimr\
wLFr7CaP0MTzvWqXh+0q++XpkW8ajTSVH/WH7nD/Tpv9mYrarjg41c6/AoGBANo4\
hXp23qgPIHSp6fIgnAAaScILMt/Nt7amm4y43DY2Ym6lRSWi8Fo1psZIyV8MZ/D8\
hH29Y0GlR1jm42AkcwVubBxIajNg/ImkKm4uVgIcjQU9E1IpwALQcY0kFkFlYE4m\
YRB9AX6NUocgMW+UaLe2f2lqkZQwp3813Vd58Bh7AoGBAMU6TBohh1FGBxzx7zXF\
+9x59IiQgMZ4bor4me2n/Mknjf4O0LvKJYJ2hhousPpnEkVc2lSJEFztAnGW8l2M\
byA2b1x0H/7OTwKk7x2tBdt4wQAL7Nhx//DlLjjUrV3Mh+3xp/H7qWFsJZC0D07I\
KJeTazSePUO8sRoU10sE5/t/AoGBALSodliccFjRrRzoTjWVqZCsMsPiYYvG04Dz\
DXPC1wxKmdLgIA64hiMop5kgSRXXP3XSmB1A3RtLqXWAMF03z8F/WSFREhrXADsz\
Ha15ztqQqG7d0VEEH2I1Dsy6Q3KAaupH+7OaydHrTZdwn3ywcMEm5PRwtXTpksFN\
5qC04oBhAoGBAIwrinb2G3TyJsCWmTUX6UXGcb8DoBxi5UUPmqTqWRY2PzmzNYEu\
NJMeih15kS81/Q9md6kfLFaeDST/gkr8V+NjGE4G5RFbQ3zeD2ZAXTCScgNcF69r\
wqcFTK2BFiv4wYZkNgaEHUp4JotjtTYCuw6NLDU4N1OxuObs///mPOJU\
-----END RSA PRIVATE KEY-----";




export function generateRSA(mex){
    console.log("GENERO RSA:"+mex);
 

    const forge = require('node-forge');
    var rsa = forge.pki.rsa;
    var pki = forge.pki;
    forge.options.usePureJavaScript = true;
   
    //genero coppie
    //var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
   // rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {

    //trasformo chiave pubblica in stringa
    //var chiavePubblica = pki.publicKeyToPem(keypair.publicKey);
    //trasformo chiave privata in stringa
    /* 
    var chiavePrivata = pki.privateKeyToPem(keypair.privateKey);
    console.log("chiave pubblica:")
    console.log(chiavePubblica);
    console.log("chiave privata:")
    console.log(chiavePrivata);

    //trasformo le chiavi per poterle utilizzare
    var kpublica = pki.publicKeyFromPem(chiavePubblica);
    var kprivata = pki.privateKeyFromPem(chiavePrivata);
    */
    

    //queste due valgono solo quando ho le stringhe direttamente
    var kpublica = pki.publicKeyFromPem(pub);
    var kprivata = pki.privateKeyFromPem(priv);


    console.log("cripto");
    //trasformo il testo (con emoticons include) in bytes
    var plaintextBytes = forge.util.encodeUtf8(mex);

    //cripto il testo con la chiave pubblica
    const stringa_criptata = kpublica.encrypt(plaintextBytes);
    console.log(stringa_criptata);

    //decripto la stringa criptata utilizzando la chiave privata
    console.log("decripto");
    const stringa_decriptata = forge.util.decodeUtf8(kprivata.decrypt(stringa_criptata));
    console.log(stringa_decriptata);
    
   // })

}

export function testAudio(){
    
    //stringa originale
    const str = "ciao sono giulio";
    //converti in base64
    


}
