import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from 'src/app/servicios/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ AngularFireAuth]
})
export class LoginComponent implements OnInit {

  email: string;
  pass: string;
  error: string;

  constructor( public AuthService: AutenticacionService, private router: Router, public mAuth: AngularFireAuth, private toast: ToastrService) {
  }

  ngOnInit() {
    this.AuthService.usuario = this.mAuth.authState;
    this.AuthService.usuario.subscribe(authState => {

    });
  }

  login() {

    if (this.isEmail (this.email)) {
      this.AuthService.login(this.email, this.pass)
      .then((datos) => {
        console.log(datos);
        console.log(this.email, this.pass);
        this.toast.success('Sesion iniciada correctamente', 'OK' );
        this.router.navigate(['/portal/main/dashboard']);
      })
      .catch((error) => {
        console.log(error);
        if (error.code === 'auth/wrong-password') {
          this.toast.warning('Verifique que la contraseña esté bien escrita.', 'Password incorrecto');
          console.log('Verifique que la contraseña esté bien escrita.');
        }
        this.toast.error('Ha ocurrido un error intentalo mas tarde.', 'Error');
      });
    } else {
      this.toast.warning('El correo no es válido', 'Corregir');
    }

  }

  isEmail(search: string): boolean {

        let  serchfind: boolean;

        const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

        serchfind = regexp.test(search);
        return serchfind;
    }

    recuperarConstrasena(email: string) {
      if (this.isEmail(email)) {
        this.AuthService.recuperarConstraseña(email).then( () => {
          this.toast.success('revisa tu correo y sigue las instrucciones');
        }).catch(error => {
          if (error.code === 'auth/user-not-found') {
            this.error = 'El email no tiene ninguna cuenta asociada';
            const x = document.getElementById('snackbar');
            x.className = 'show';
            setTimeout(function() { x.className = x.className.replace('show', ''); }, 3000);
          }
        });
      } else {
        const x = document.getElementById('snackbar');
        x.className = 'show';
        this.error = 'Email no válido';
        setTimeout(function() { x.className = x.className.replace('show', ''); }, 3000);
      }
    }
}
