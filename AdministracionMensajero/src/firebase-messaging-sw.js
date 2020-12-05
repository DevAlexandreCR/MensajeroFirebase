importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.0/firebase-messaging.js');


firebase.initializeApp({
  'messagingSenderId': '161864388438'
});
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Servicio Nuevo';
  const notificationOptions = {
    body: 'Se ha agregado un nuevo servicio',
    icon: './favicon.ico',
    requireInteraction: true,
    sound: './assets/notificacion.mp3'
  };
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
                return clients.openWindow('https://www.gestionyventas.com');  
              }
            })
          );
        });
});

});
