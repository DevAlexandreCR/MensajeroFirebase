import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from 'firebase';


@Injectable()

export class AutenticacionService {

usuario: Observable<User>;

constructor(public afAuth: AngularFireAuth) {
this.usuario = afAuth.authState;
this.usuario.subscribe(authState => {
});
}

login(textemail, textpass) {


console.log(textemail, textpass);
return this.afAuth.auth.signInWithEmailAndPassword(textemail, textpass);
}

logout() {
return this.afAuth.auth.signOut();
}
}

