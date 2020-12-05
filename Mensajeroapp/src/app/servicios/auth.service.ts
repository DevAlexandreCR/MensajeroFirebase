import { Injectable, EventEmitter, Output, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from 'firebase';
import { MessagingService } from './messaging.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AutenticacionService {


usuario: Observable<User>;
provider: any;
redirectUrl: string;

@Output() public cambiologin: EventEmitter<boolean> = new EventEmitter();

constructor(public afAuth: AngularFireAuth, private router: Router, private messaing: MessagingService) {
    this.usuario = afAuth.authState;
    this.usuario.subscribe(authState => {
    if (authState != null) {
    this.cambiologin.emit(true);
    messaing.receiveMessage();
    messaing.requestPermission(authState.uid);
  } else {
    this.usuario = null;
    this.cambiologin.emit(false);
  }
    });


}

login(textemail: string, textpass: string) {
return this.afAuth.auth.signInWithEmailAndPassword(textemail, textpass).then ( error => {
  if ( !error ) {
    this.cambiologin.emit(true);
    this.router.navigate(['/portal/main/dashboard']);
  }
});
}

logout() {
return this.afAuth.auth.signOut().then (error => {
  this.cambiologin.emit(false);
}).catch(error => {
  this.cambiologin.emit(true);
});
}

registrar(textemail: string, textpass: string) {
  return this.afAuth.auth.createUserWithEmailAndPassword(textemail , textpass).then(error => {
    this.cambiologin.emit(true);
    return this.afAuth.authState;
  });
}

recuperarConstraseña(email: string) {
  return this.afAuth.auth.sendPasswordResetEmail(email);
}
}
