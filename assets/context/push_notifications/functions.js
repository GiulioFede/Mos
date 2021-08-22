
export async function sendPushNotification(expoPushToken, title, content){
    const message = {
        to: expoPushToken, //a chi?
        sound: 'default',
        title: title,
        body: content
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
}