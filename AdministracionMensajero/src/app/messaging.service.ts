import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs'


@Injectable()

export class MessagingService {

  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth) {

  }




  updateToken(token) {
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        return;
      } else {
      if (user.uid === 'De1i3NljCmRVA4iOyB9WW6AxXNL2') {
          this.db.database.ref('gerente/admin/administradores/admin_motos/token').set(
            token);
        } else {
          this.db.database.ref('gerente/admin/administradores/admin_carros/token').set(
            token);
        }
      }

    });
  }

  getPermission() {

    this.messaging.requestPermission()
      .then(() => {
            return this.messaging.getToken();
        })
        .then((token) => {
          console.log(token);
          this.updateToken(token);
            }).catch(function(err) {
              return 'null';
            })
        .catch((err) => {
          return 'null';
        });
  }


  receiveMessage() {
    this.messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
      this.currentMessage.next(payload);
      this.sonidoNuevoPedido('./assets/notificacion_foreground.wav');
    });
  }
  sonidoNuevoPedido(e) {
    const reproducir = new Audio();
    reproducir.src = e;
    reproducir.play();
  }
}
