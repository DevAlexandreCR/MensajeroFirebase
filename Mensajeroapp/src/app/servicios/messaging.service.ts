import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(
    private angularFireDB: AngularFireDatabase,
    private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    );
  }

  /**
   * update token in firebase database
   *
   * @param userId userId as a key
   * @param token token as a value
   */
  updateToken(userId, token) {
    this.getTipoDeUsuario(userId).then(res => {
      this.angularFireDB.object(`gerente/admin/usuario_empresa/${userId}/token/`).set(token);
      console.log('messaging', 'token empresa');
    }).catch(rej => {
      this.angularFireDB.object(`gerente/admin/usuario/${userId}/token/`).set(token);
      console.log('messaging', 'token usuario');
    });
  }

  getTipoDeUsuario(id: string)  {
    return new Promise((res, rej) => {
      this.angularFireDB.object(`gerente/admin/usuario_empresa/${id}`).valueChanges()
      .subscribe(emp => {
        if (emp != null) {
          // es empresa
          res (true);
        } else {
          // es usuario persona
          rej(false);
        }
      });
    });
}

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.updateToken(userId, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        let data: any = payload;
        if (data.data.clave === 'mensaje_chat'){
          this.showNotificacion('mensaje_chat', payload)
        }else if(data.notification != null){
          this.showNotificacion('nuevo_domicilio', payload)
        }
        this.currentMessage.next(payload);
      });
  }

  playAudio(tipo_mensaje: string){
    let audio = new Audio();
    switch(tipo_mensaje){
      case 'mensaje_chat':
          audio.src = "./assets/notificacion_foreground.wav";
      break;
      case 'nuevo_domicilio':
          audio.src = "./assets/notificacion.mp3";
      break;
    }
    
    audio.load();
    audio.play();
  }

  showNotificacion(tipo_mensaje: string, payload: any){
    if(Notification.permission === 'granted'){
      switch(tipo_mensaje){
        case 'mensaje_chat':
          console.log("mensajechat", payload.data)
            new Notification('Nuevo Mensaje',{
              body: payload.data.mensaje,
              icon: './favicon.ico',
              requireInteraction: true,
              vibrate: [100,100,100,100]
            }).addEventListener('close', (ev)=>{
              ev.preventDefault()
            })
        break;
        case 'nuevo_domicilio':
            new Notification('Nuevo Pedido',{
              body: payload.notification.body,
              icon: './favicon.ico',
              requireInteraction: true,
              vibrate: [100,100,100,100]
            })
        break;
      }
      this.playAudio(tipo_mensaje)
    } else {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          this.showNotificacion(tipo_mensaje)
        }
      });
    }
  }

}
