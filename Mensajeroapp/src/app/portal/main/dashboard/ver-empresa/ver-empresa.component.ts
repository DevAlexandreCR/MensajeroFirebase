import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CrudUsuarioService } from '../../servicios/crud-usuario.service';
import { Empresa } from '../../constantes/empresa';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Pedido } from '../../constantes/pedido';
import { Domicilio } from '../../constantes/Domicilio';
import { Usuario } from '../../constantes/usuario';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudserviciosService } from '../../servicios/crudservicios.service';
import mapstylesilver from '../../constantes/mapstylesilver.json';
import mapstylesnoche from '../../constantes/mapstylesnoche.json';
import { Constantes } from '../../constantes/Constantes';
import { Oferta } from '../../constantes/oferta';
declare var $ : any;

@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrls: ['./ver-empresa.component.css']
})
export class VerEmpresaComponent implements OnInit {
// This lets me use jquery

  empresa: Empresa
  div_portada: any //para cambiar el background de la portada
  ofertas: any
  all_ofertas = new Array<Oferta>()
  horario: string
  pedido:Pedido
  domicilio: Domicilio
  lat: number
  long: number
  direccion_usuario: string
  valor_domicilio: number = 0
  valor_pedido: number = 0
  cancelar_envio: boolean = false
  interval_enviar: any
  usuario: Usuario
  enviar_ok: boolean = false
  descripcion_domicilio: string = ''
  carrito: string = ""
  ofertasSeleccionadas: Array<Oferta> = new Array<Oferta>()
  enviando: boolean = false

  // estas variables son para el mapa y el calculo de la ruta y el valor del domicilio
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  servicio_predicciones = new google.maps.places.AutocompleteService();
  map: google.maps.Map
  style: any;
  placeIdUsuario: string
  @ViewChild('gmap', {static: true}) gmapElement: any;

  constructor(private toast: ToastrService, private crudUser: CrudUsuarioService, private curdServicios: CrudserviciosService,
     private rutaActiva: ActivatedRoute, private auth: AngularFireAuth, private router: Router) { }

  ngOnInit() {
    this.initMapa()
    this.miUbicacion()
    this.div_portada = document.getElementById('portada')
    this.rutaActiva.params.subscribe(
      (params: Params) => {
        this.getEmpresa(params.id)
        this.placeIdUsuario = params.placeID
      }
    )
    this.auth.authState.subscribe(authState => {
      if(authState != null){
        this.crudUser.getUsuario(authState.uid).valueChanges().subscribe(us =>{
          this.usuario = us
        })
      }
    })
    this.pedido = new Pedido()
  }

  getEmpresa(id: string) {
    this.crudUser.getEmpresa(id).valueChanges().subscribe(emp => {
      this.empresa = emp
      this.getOfertas(this.empresa.id_usuario)
      this.div_portada.style.backgroundImage = "url(" + this.empresa.url_foto_portada + ")"
      this.horario = this.gethorario(this.empresa.horarios)
    })
  }

  gethorario(horarios: Horarios): string {
    let fecha_actual = new Date()
    let hoy: number = fecha_actual.getDay()
    let horario: string
    switch (hoy) {
      case 0:
        horario = `${horarios.domingo.abre}-${horarios.domingo.cierra}`  
      break
      case 1:
          horario = `${horarios.lunes.abre}-${horarios.lunes.cierra}`
      break
      case 2:
          horario = `${horarios.martes.abre}-${horarios.martes.cierra}`
      break
      case 3:
          horario = `${horarios.miercoles.abre}-${horarios.miercoles.cierra}`
      break
      case 4:
          horario = `${horarios.jueves.abre}-${horarios.jueves.cierra}`
      break
      case 5:
          horario = `${horarios.viernes.abre}-${horarios.viernes.cierra}`
      break
      case 6:
          horario = `${horarios.sabado.abre}-${horarios.sabado.cierra}`
      break
    }
    return horario
  }

  getOfertas(id_empresa: string) {
    this.all_ofertas = new Array<Oferta>()
    this.crudUser.getOfertas(id_empresa).valueChanges().subscribe(ofertaList =>{
      this.ofertas = ofertaList
      for ( let i = 0; i < this.ofertas.length; i++) {
        if (this.ofertas[i] != null) {
          for (let j = 0; j < this.all_ofertas.length; j++) {
            if (this.all_ofertas[j].id_oferta === this.ofertas[i].id_oferta) {
             this.all_ofertas.splice(i);
            }
          }
          let of: Oferta = this.ofertas[i]
          of.cantidad = 1
          this.all_ofertas.push(of);
        }
      }
    })
  }

  pedirDomicilio(emp: Empresa, user: Usuario) {
    $('#conf-pedido-modal').modal('hide')
    this.enviando = true
    emp.domicilio = new Array<Domicilio>()
    this.domicilio = new Domicilio()
    this.domicilio.estado = Constantes.PENDIENTE
    this.domicilio.nombre = user.nombre
    this.domicilio.fecha_domicilio = this.getFecha()
    this.domicilio.id_usuario = user.id_usuario
    this.domicilio.empresa = emp
    this.domicilio.telefono = user.telefono
    this.domicilio.telefono = user.telefono
    this.domicilio.token = user.token
    this.domicilio.token_empresa = emp.token
    this.domicilio.valor_domicilio = this.valor_domicilio
    this.domicilio.dir_entrega = this.direccion_usuario
    this.domicilio.lat_dir_entrega = this.lat
    this.domicilio.long_dir_entrega = this.long
    this.domicilio.lat_dir_compra = emp.latitud
    this.domicilio.long_dir_compra = emp.longitud
    this.domicilio.dir_compra = emp.direccion_empresa
    this.domicilio.descripcion = this.carrito;
    this.domicilio.valor_pedido = this.valor_pedido;
    this.domicilio.date = new Date().getTime()
    this.cancelar_envio = true
    let progres = 0;
    this.interval_enviar = setInterval(() => {
      progres ++;
      document.getElementById('progressenviarservicio').style.width = Math.round(progres * 3.3) + '%';
      if (progres === 35) {
        clearInterval(this.interval_enviar);
        this.cancelar_envio = false;
        document.getElementById('progressenviarservicio').style.width = '0%';
        (<HTMLInputElement>document.getElementById('enviar')).disabled = false;

        this.curdServicios.agregarDomicilio(this.domicilio).then(()=>{
          this.toast.success('Servicio enviado correctamente');
          this.router.navigate(['/portal/main/dashboard/inicio'])
          this.enviando = false
        }).catch(error =>{
          this.toast.error('Algo salió mal intenta nuevamente!');
          this.enviando = false
          console.log(error)
        })
      }
    }, 100);
  }

  getFecha(): string {
    const fecha = new Date();
    let dias: any = fecha.getDate();
    if (dias < 10) {
      dias = '0' + dias;
    }
    let mes: any = fecha.getMonth() + 1;
    if (mes < 10) {
      mes = '0' + mes;
    }
    const año = fecha.getFullYear();
    const hora = fecha.getHours();
    const min = fecha.getMinutes();
    let seg: any = fecha.getSeconds();
    if (seg < 10) {
      seg = '0' + seg;
    }
    const ahora = dias + '-' + mes + '-' + año + ' ' + hora + ':' + min + ':' + seg;
  
    return ahora;
   }

   miUbicacion() {
      navigator.geolocation.getCurrentPosition(position => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({
          location: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        }, (results, status) => {
          if (status !== google.maps.GeocoderStatus.OK) {
            alert('No fue posible ver tu ubicación, intenta nuevamente')
            return;
          }
          this.direccion_usuario = results[0].formatted_address
          const placeIdusuario = results[0].place_id
          this.route(this.empresa.placeID, placeIdusuario)
          console.log(results)
              this.lat = position.coords.latitude;
              this.long = position.coords.longitude;
         });
      }, () => {
        alert('es necesario saber tu ubicación para poder enviarte el domicilio')
      });

  }

  CancelarEnvioServicio(progress_id: string) {
    clearInterval(this.interval_enviar);
    document.getElementById(progress_id).style.width = '0%';
    this.cancelar_envio = false;
  }

  // esta funcion verifica si el usuario ya agregó un contenido.
  // Si la cadena escrita supera los 10 caracteres podra pedir su domicilio
  verificarPedido(descripcion) {
    if(this.enviar_ok)return
    if (descripcion.length > 9) {
      this.enviar_ok = true
    } else {
      this.enviar_ok = false
    }
  }

  route(originPlaceId, destinationPlaceId ) {
    if (!originPlaceId || !destinationPlaceId) {
      console.log('orig ' + originPlaceId, ' dest ' + destinationPlaceId );
      return;
    }
    this.directionsDisplay.setMap(this.map);
    this.directionsService.route({
          origin: {'placeId': originPlaceId},
          destination: {'placeId': destinationPlaceId},
          travelMode: google.maps.TravelMode.DRIVING
        }, (response, status ) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.directionsDisplay.setDirections(response);
            const valor = this.calcularValorViaje(response.routes[0].legs[0].duration.value,
               response.routes[0].legs[0].distance.value);
            this.valor_domicilio = valor;
            const image = {
              scaledSize: new google.maps.Size(25, 35),
              url: '../../../../assets/marcador.png'
            };

            this.directionsDisplay.setOptions({
              markerOptions: {
                icon: image,
                position: new google.maps.LatLng(Number(response.routes[0].legs[0].start_location.lat),
                   Number(response.routes[0].legs[0].start_location.lng))
              }
            });
          } else {
            alert('Error en la ruta code: ' + status);
          }
        });
  }

  calcularValorViaje(tiempo, distancia): number {
    let modificador: number;
    let base: number;
    let base_km: number;
    let base_time: number;
      modificador = 1;
      base = 1500;
      base_km = 350;
      base_time = 60;

    let valor_viaje = (((distancia / 1000) * (base_km * modificador)) + ((tiempo / 60) * (base_time * modificador)) + base * modificador);
    valor_viaje = Math.round(valor_viaje);
    valor_viaje = this.redondear(valor_viaje);   

    // si la tarifa del viaje da menos que 2000 entonces se deja en la minima 2000.
    if (valor_viaje <= 2000) {
      valor_viaje = 2000;
    }
    return valor_viaje;
  }

  redondear(value: number) {
    const resto = value % 100;
    if (resto < 50) {
        value = value - resto;
    } else {
        value = value + ( 100 - resto);
    }
    return value;
}

initMapa = () => {
  // ponemos estilo al mapa
  this.styloMapa();
  const mapProp = {
  zoom: 16,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  disableDefaultUI: true,
  styles: this.style
  };
  // inicializamos le mapa
  this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
}

styloMapa = () => {
  const fecha = new Date();
  const horas = fecha.getHours();
  if (horas > 5 && horas < 18) {
    this.style = mapstylesilver;
  } else {
    this.style = mapstylesnoche;
  }
  this.style = mapstylesilver;
}

// esta funcioón va agregando al carrito cada oferta que clickea el cliente
agregarAlCarrito(oferta: Oferta, existe?: boolean) {
    $('#canasta').animate({width: 'auto', height: 140, easing: 'swing'},80 )
    $('#canasta').animate({width: 'auto', height: 160, easing: 'swing'},80 )
    $('#canasta').animate({width: 'auto', height: 140, easing: 'swing'},80 )
    $('#canasta').animate({width: 'auto', height: 160, easing: 'swing'},80 )
    $('#canasta').animate({width: 'auto', height: 150, easing: 'swing'},80 )

  this.carrito = ""
  this.valor_pedido = 0
  var ind = this.ofertasSeleccionadas.indexOf(oferta)
  if(existe){
    this.ofertasSeleccionadas[ind].cantidad = oferta.cantidad
  } else {
    if(ind > -1){
      this.ofertasSeleccionadas.splice(ind,1)
    } else {
      this.ofertasSeleccionadas.push(oferta)
    }
  }
  if(this.ofertasSeleccionadas.length > 0)this.enviar_ok = true
  this.ofertasSeleccionadas.forEach(ofert => {
    this.carrito = `${this.carrito} \n ${ofert.cantidad} ${ofert.titulo}` 
    this.valor_pedido = this.valor_pedido + ofert.precio
  });
}

agregarUno(oferta: Oferta) {
  oferta.cantidad += 1
  let nuevo_precio = (oferta.precio / (oferta.cantidad-1)) * oferta.cantidad 
    oferta.precio = nuevo_precio
    var ind = this.ofertasSeleccionadas.indexOf(oferta)
    if(ind > -1)this.agregarAlCarrito(oferta, true)
}
quitarUno(oferta: Oferta) {
  if(oferta.cantidad > 1) {
    oferta.cantidad -= 1
    let nuevo_precio = oferta.precio- (oferta.precio / (oferta.cantidad + 1 ))
    oferta.precio = nuevo_precio
    var ind = this.ofertasSeleccionadas.indexOf(oferta)
    if(ind > -1)this.agregarAlCarrito(oferta, true)
  }
}

}
