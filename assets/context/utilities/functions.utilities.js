import { round } from "react-native-reanimated";

export function computeDistance(lat1, lon1, lat2, lon2) {
	var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return Math.round(d);
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }


export function getAgeFromTimestamp(timestamp) {
  var today = new Date();
  var birthDate = new Date(timestamp.seconds*1000);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}

export function getAgeFromDate(date) {
  var today = new Date();
  var birthDate = new Date(date);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}


//dato un min e max ritorna un array composto da [min, min+1, min+2,..., max-1, max]
export function range(min, max) { 
  var len = max - min + 1;
  var arr = new Array(len);
  for (var i=0; i<len; i++) {
    arr[i] = min + i;
  }
  return arr;
}

export function fromDateToGGMMYYYYHHMM(seconds){

  const date = new Date(seconds);
    
  return ( date.getFullYear().toString() + "/"+pad2(date.getMonth() + 1) +"/"+ pad2( date.getDate()) +"  "+ pad2( date.getHours() ) +":"+ pad2( date.getMinutes() ) );
}

function pad2(n) { return n < 10 ? '0' + n : n }

export function fromDateToHHMM(milliseconds){

  //data di oggi
  const today = new Date();
  const date = new Date(milliseconds);

  //se le due date sono dello stesso giorno, ritorno solo l'ora e il minuto
  if(datesAreOnSameDay(today,date))
    return ( pad2( date.getHours() ) +":"+ pad2( date.getMinutes() ) );
  
  //altrimenti ritorna data intera  
  return ( date.getFullYear().toString() + "/"+pad2(date.getMonth() + 1) +"/"+ pad2( date.getDate()) +"  "+ pad2( date.getHours() ) +":"+ pad2( date.getMinutes() ) );
}

const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
