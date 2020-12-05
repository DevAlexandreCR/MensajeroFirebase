importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '161864388438'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    // Customize notification here

    var notificationTitle = ""
    var notificationOptions

    let data = payload.data
    if(data.clave === 'mensaje_chat'){
      console.log("messaging ", payload.data)
         notificationTitle = 'Nuevo Mensaje';
         let mensaje = data.mensaje
         notificationOptions = {
          body: mensaje,
          icon: './favicon.ico',
          requireInteraction: true,
          sound: './assets/notificacion.mp3'
        };
      } else {
        notificationTitle = 'MensajeroApp';
        let mensaje = data.mensaje
         notificationOptions = {
          body: mensaje,
          icon: './favicon.ico',
          requireInteraction: true,
          sound: './assets/notificacion.mp3'
      }
    }

    return self.registration.showNotification(notificationTitle,
        notificationOptions).then( () => {
          self.addEventListener('notificationclick', function(event) {  
            console.log('On notification click: ', event.notification.tag);  
            event.notification.close();
            event.waitUntil(
              clients.matchAll({  
                type: "window"  
              })
              .then(function(clientList) {  
                for (var i = 0; i < clientList.length; i++) {  
                  var client = clientList[i];  
                  if (client.url == '/' && 'focus' in client)  
                    return client.focus();  
                }  
                if (clients.openWindow) {
                  return clients.openWindow('https://www.mensajeroapp.co/portal/main/dashboard/');  
                }
              })
            );
          });
  });
  });