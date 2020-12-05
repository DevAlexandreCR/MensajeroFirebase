import { Component, OnInit, Input } from '@angular/core'
import { Pedido } from '../../constantes/pedido'
import { CrudserviciosService} from '../../servicios/crudservicios.service'
import { Mensajero } from '../../constantes/mensajero'
import { AngularFireDatabase } from '@angular/fire/database'
import { CrudmensajeroService } from '../../servicios/crudmensajero.service'
import { Constantes } from '../../constantes/Constantes'
import { CrudUsuarioService} from '../../servicios/crud-usuario.service'
import { AngularFireAuth } from '@angular/fire/auth';
import { Domicilio } from '../../constantes/Domicilio';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {

  tipo_usuario: string // aqui se carga si es empresa o si es usuario normal
  es_empresa: boolean
  id_usuario: string
  all_pedidos=  []
  all_pedidos_especial = []
  all_domicilios = []
  domicilio : Domicilio
  domicilios: any 
  pedido_especial: Pedido
  pedido: Pedido
  pedidos_especials: any
  pedidos: any
  mensajero: Mensajero
  url_foto_mensajero: any

  // para el filtro de fecha
  desde: string
  hasta: string


  constructor(private db: AngularFireDatabase, private crudServicios: CrudserviciosService, private crudU: CrudUsuarioService,
     private authService: AngularFireAuth, private crudMensajero: CrudmensajeroService, private storage: AngularFireStorage) { }

  ngOnInit() {
    console.log(this.es_empresa, this.id_usuario)
    this.cargarDatos()
  }

    // en esta funcion inicializamos toda la info del usuario o empresa y cargamos los
  // servicios en curso y demás
  cargarDatos() {
    this.authService.authState.subscribe(authState => {
      this.id_usuario = authState.uid;
      this.getTipoDeUsuario(this.id_usuario).then( res => {
        this.es_empresa = true
        this.tipo_usuario = Constantes.USUARIO_EMPRESA
        this.cargarServiciosCarro(this.id_usuario,this.tipo_usuario)
        this.cargarServiciosMoto(this.id_usuario,this.tipo_usuario)
        this.cargarDomicilios(this.id_usuario,this.tipo_usuario)
      }).catch(err => {
        this.es_empresa = false
        this.tipo_usuario = Constantes.USUARIO
        this.cargarServiciosCarro(this.id_usuario,this.tipo_usuario)
        this.cargarServiciosMoto(this.id_usuario,this.tipo_usuario)
        this.cargarDomicilios(this.id_usuario,this.tipo_usuario)
        console.log(this.es_empresa, this.id_usuario)
      });
   });
  }

  

  cargarServiciosMoto(id: string, tipo_usuario: string) {
    // traemos los pedidos que estén en curso
    const obs = this.crudServicios.getHistoricoServicios(Constantes.PEDIDO, id, tipo_usuario).valueChanges().
    forEach(pedidos => {
     this.pedidos = pedidos;
     this.all_pedidos = []
     for ( let i = 0; i < this.pedidos.length; i++) {
         for (let j = 0; j < this.all_pedidos.length; j++) {
           if (this.all_pedidos[j].id_pedido === this.pedidos[i].id_pedido) {
            this.all_pedidos.splice(i);
           }
       }
       this.all_pedidos.unshift(this.pedidos[i]);
     }
    });
}

cargarFiltroFecha(id: string, desde: any, hasta: any, tipo_servicio: string) {
  const inicio = `${desde.year}-${this.arreglarFecha(desde.month.toString())}-${this.arreglarFecha(desde.day.toString())} 00:00:00`
  const fin = `${hasta.year}-${this.arreglarFecha(hasta.month.toString())}-${this.arreglarFecha(hasta.day.toString())} 23:59:59`
  const i = new Date(Date.parse(inicio)).getTime()
  const f = new Date(Date.parse(fin)).getTime()
  var tipo_usuario: string
  if(this.es_empresa) {
    tipo_usuario = Constantes.USUARIO_EMPRESA
  } else {
    tipo_usuario = Constantes.USUARIO
  }

  switch(tipo_servicio){
    case Constantes.PEDIDO:
      this.all_pedidos = []
      this.crudServicios.getPedidosFiltroFecha(id, Constantes.PEDIDO, i, f, tipo_usuario).valueChanges()
        .forEach(pedidos => {
          this.pedidos = pedidos
          for(let pd of this.pedidos){
            this.all_pedidos.push(pd)
          }
        })
        break
    case Constantes.PEDIDO_ESPECIAL:
      this.all_pedidos_especial = []
      this.crudServicios.getPedidosFiltroFecha(id, Constantes.PEDIDO_ESPECIAL, i, f, tipo_usuario).valueChanges()
      .forEach(pedidos => {
        this.pedidos_especials = pedidos
        for(let pd of this.pedidos_especials){
          this.all_pedidos_especial.push(pd)
        }
      })
      break
    case Constantes.DOMICILIO:
      this.all_domicilios = []
      this.crudServicios.getDomiciliosFiltroFecha( id, i, f, tipo_usuario).valueChanges().forEach(snapshot =>{
        this.domicilios = snapshot
        console.log(snapshot)
        for (let dom of this.domicilios) {
          this.all_domicilios.push(dom)
        }
      })
  }  
}

cargarDomicilios(id: string, tipo_usuario: string) {
  this.all_domicilios = []
  this.crudServicios.getHistoricoDomicilios(tipo_usuario,id).valueChanges().forEach(domicilios =>{
    this.domicilios = domicilios
    console.log(domicilios)
    for(let dom of this.domicilios) {
      this.all_domicilios.unshift(dom)
    }
  })

}

arreglarFecha(date: string): string {
  if (date.length < 2) {
    return '0'+ date
  } else {
    return date
  }
}

cargarServiciosCarro(id: string, tipo_usuario: string) {
  // traemos los pedidos que estén en curso
  this.crudServicios.getHistoricoServicios(Constantes.PEDIDO_ESPECIAL, id, tipo_usuario).valueChanges().
  forEach(pedidos => {
   this.pedidos_especials = pedidos;
   this.all_pedidos_especial = []
   for ( let i = 0; i < this.pedidos_especials.length; i++) {
       for (let j = 0; j < this.all_pedidos_especial.length; j++) {
         if (this.all_pedidos_especial[j].id_pedido === this.pedidos_especials[i].id_pedido) {
          this.all_pedidos_especial.splice(i);
         }
       }
       this.all_pedidos_especial.unshift(this.pedidos_especials[i]);
   }
  });
}

  // para verificar si es empresa o suario
getTipoDeUsuario(id: string) {
  return new Promise((res, rej) => {
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

verMensajero(codigo: string, tipo_servicio: string) {
  switch(tipo_servicio) {
    case Constantes.MENSAJEROBIKE:
        this.crudMensajero.getMensajero(codigo).valueChanges().forEach(mensajero =>{
          this.mensajero = mensajero
          const path = 'movil_' + this.mensajero.codigo;
          const url = this.storage.storage.ref('mensajeros/mensajero_moto')
          .child(path).child('foto_perfil');
          this.url_foto_mensajero = url.getDownloadURL();
        })
    break
    case Constantes.MENSAJEROGO:
        this.crudMensajero.getMensajeroEspecial(codigo).valueChanges().forEach(mensajero =>{
          this.mensajero = mensajero
          const path = 'movil_' + this.mensajero.codigo;
          const url = this.storage.storage.ref('mensajeros/mensajero_carro')
          .child(path).child('foto_perfil');
          this.url_foto_mensajero = url.getDownloadURL();
        })
    break
  }

}

/*
agregarDateaTodo(){
  this.crudServicios.agregarDateaTodo().valueChanges().subscribe(pedidos => {
    this.domicilios = pedidos
    this.domicilios.forEach((pd)=>{
      if (pd != null && pd.fecha_domicilio != null) {
        var fecha = this.ordenarStringFecha(pd.fecha_domicilio)
        const ms = Date.parse(fecha)
        const nuevafecha = new Date(ms).getTime() + 18000000
        this.domicilio = pd
        this.domicilio.date = nuevafecha
        console.log(fecha)
        this.crudServicios.updateDomicilio(this.domicilio)
      }
    })
  })
}

ordenarStringFecha(fecha: any){
  var fecha_ordenada;
  var fecha_mes;
  var fecha_horas;
  fecha = fecha.split(" ");
  fecha_mes = fecha[0];
  fecha_horas = fecha[1];
  const time = fecha_horas.split(':')
  if(time[0].length < 2) time[0] = '0'+ time[0]
  if(time[1].length < 2) time[1] = '0'+ time[1]
  if(time[2].length < 2) time[2] = '0'+ time[2]
  fecha_horas = time[0]+':'+time[1]+':'+time[2]+"Z";
  fecha_mes = fecha_mes.split("-");
  fecha_mes = fecha_mes[2]+'-'+fecha_mes[1]+'-'+fecha_mes[0]+"T";
  fecha_ordenada = fecha_mes+fecha_horas;
  return fecha_ordenada;
}*/

}
