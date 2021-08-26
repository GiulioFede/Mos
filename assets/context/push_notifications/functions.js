
export async function sendPushNotification(expoPushToken, title, content, chatId){
  
  try{
    console.log("send push notification a "+expoPushToken);
      const message = {
          to: expoPushToken, //a chi?
          sound: 'default',
          title: title,
          body: content,
          data: {chatId: chatId}
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        console.log("push notification inviata");
    }catch(e){
      console.log("push notification NON inviata:"+e);
    }
}