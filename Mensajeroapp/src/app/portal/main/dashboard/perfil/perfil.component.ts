import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudUsuarioService } from '../../servicios/crud-usuario.service';
import { Usuario } from '../../constantes/usuario';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario: Usuario
  url_img_usuario = '../../../../assets/usericon.png'
  editar = false

  constructor(private auth: AngularFireAuth, private crudU: CrudUsuarioService) { }

  ngOnInit() {
    this.auth.authState.subscribe(auth =>{
      if (auth != null){
        this.getDatos(auth.uid)
      }
    })
  }

  getDatos(id_usuario) {
    this.crudU.getUsuario(id_usuario).valueChanges().subscribe(usuario => {
      this.usuario = usuario
      console.log(this.usuario)
    })
  }
}
