import { Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Empresa} from '../constantes/empresa';
import { AngularFireDatabase } from '@angular/fire/database';
import { CrudUsuarioService} from '../servicios/crud-usuario.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudserviciosService} from '../servicios/crudservicios.service';
import { CrudmensajeroService } from '../servicios/crudmensajero.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Promise, reject } from 'q';
import { Usuario } from '../constantes/usuario';
import { AutenticacionService } from '../../../servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

@ViewChild('gmap', {static: true}) gmapElement: any;
@ViewChild('calcular_viaje', {static: true}) display_calcular: any;
@ViewChild('dist', {static: true}) display_distancia: any;
@ViewChild('valor', {static: true}) display_valor: any;
@ViewChild('milocation', {static: true}) mi_location_boton: any;
 map: google.maps.Map;

 usuario: Usuario;
 empresa: Empresa;
 id_usuario: string;

 // para saber si es empresa
 es_empresa = false;

  constructor(private db: AngularFireDatabase, private router: Router, private crudU: CrudUsuarioService, private toast: ToastrService,
    private authService: AngularFireAuth, private crudServicios: CrudserviciosService, private  crudMensajero: CrudmensajeroService,
    private storage: AngularFireStorage, private AuthService: AutenticacionService ) { }

  ngOnInit() {


  this.cargarDatos();

  }

  // en esta funcion inicializamos toda la info del usuario o empresa y cargamos los
  // servicios en curso y demás
  cargarDatos() {
    this.authService.authState.subscribe(authState => {
      if (authState == null) return
      this.id_usuario = authState.uid;
      this.getTipoDeUsuario(this.id_usuario).then( res => {
        this.es_empresa = true;
        this.cargarUIempresa();
      }).catch(err => {
        this.es_empresa = false;
        this.cargarUIusuario();
      });
   });
  }

  // datos de empresa
  cargarUIempresa() {
    this.crudU.getEmpresa(this.id_usuario).valueChanges().subscribe(emp => {
      this.empresa = emp;
      this.crudU.empresa_seleccionada = this.empresa
      this.router.navigate(['/portal/main/dashboard/inicio-empresas']);
    });
  }

  // cargamos la UI de usuario con sus respectivos datos
  cargarUIusuario() {
    this.crudU.getUsuario(this.id_usuario).valueChanges().subscribe(us => {
      this.usuario = us;
      this.router.navigate(['/portal/main/dashboard/inicio']);
    });
  }

  // para verificar si es empresa o suario
  getTipoDeUsuario(id: string) {
      return Promise((res, rej) => {
        this.crudU.getEmpresa(id).valueChanges().subscribe(emp => {
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

cerrarSesion() {

  var conf = confirm('¿desea cerrar sesión?')
  if(conf){
    this.AuthService.logout()
    .then((datos) => {
      this.AuthService.cambiologin.emit(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  }

}

