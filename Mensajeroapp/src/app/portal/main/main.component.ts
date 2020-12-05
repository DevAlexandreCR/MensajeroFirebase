import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [AutenticacionService]
})
export class MainComponent implements OnInit {

  islogin;

  constructor(private AuthService: AutenticacionService) {
  }

  ngOnInit() {

    this.AuthService.cambiologin.subscribe( islogin => {
      this.islogin = islogin;
    });

  }
  cerrarSesion() {
  this.AuthService.logout()
      .then((datos) => {
        this.AuthService.cambiologin.emit(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

}
