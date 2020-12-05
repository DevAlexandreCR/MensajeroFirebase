import { Component, OnInit, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Empresa} from '../../constantes/empresa';
import { AngularFireDatabase } from '@angular/fire/database';
import { CrudUsuarioService} from '../../servicios/crud-usuario.service';
import { Pedido } from '../../constantes/pedido';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudserviciosService} from '../../servicios/crudservicios.service';
import { Mensajero } from '../../constantes/mensajero';
import { CrudmensajeroService } from '../../servicios/crudmensajero.service';
import { AngularFireStorage } from '@angular/fire/storage';
import mapstylesilver from '..//../constantes/mapstylesilver.json';
import mapstylesnoche from '../../constantes/mapstylesnoche.json';
import { Promise, reject } from 'q';
import { Usuario } from '../../constantes/usuario';
import {AutenticacionService } from '../../../../servicios/auth.service';
import { Domicilio } from '../../constantes/Domicilio';
import { Constantes } from '../../constantes/Constantes';
import { Chat } from '../../constantes/Chat';
import { min } from 'rxjs/operators';

@Component({
  selector: 'app-inicio-empresas',
  templateUrl: './inicio-empresas.component.html',
  styleUrls: ['./inicio-empresas.component.css']
})
export class InicioEmpresasComponent implements OnInit {

  @ViewChild('gmap', {static: true}) gmapElement: any;
  @ViewChild('calcular_viaje', {static: true}) display_calcular: any;
  @ViewChild('dist', {static: true}) display_distancia: any;
  @ViewChild('valor', {static: true}) display_valor: any;
  @ViewChild('milocation', {static: true}) mi_location_boton: any;
   map: google.maps.Map;

   usuario: Usuario;
   empresa: Empresa;
   id_usuario: string;
   pedido: Pedido;
   pedidos_en_curso = [];
   pedido_especial: Pedido;
   pedidos_especiales_en_curso = [];
   pedidos: any;
   pedidos_especiales: any;
   tipo_pedido = 'Domicilios';
   interval_enviar: any;
   interval_cancelar: any;
   cancelar_envio = false;
   cancelar_cancelacion = false;
   google: any;
   infoWindow = new google.maps.InfoWindow;

  // para las direcciones de tipo de pedidos
  label_ini_titulo_segun_pedido = 'Comprar en: ';
  label_fin_titulo_segun_pedido = 'Entregar compra en: ';
  label_ini_descrp_segun_pedido = '*Agrega el nombre de la tienda, almacen o restaurante, o agrega la dirección si la tienes';
  label_fin_descrp_segun_pedido = '*Agrega la dirección de entrega del, por defecto aparece tu ubicación actual';

   // ubicacion del usuario
   lat: number;
   lng: number;
   lat_final: number;
   lng_final: number;
   home: any;
   contentString: string;
   style: any;

   // para el pedido seleccionado
   pedido_seleccionado: Pedido;
   mensajero: Mensajero;
   info_moto: string;
   img_perfil: any;
   mensajero_conectado: Mensajero;
   markerMensajero: any;

   // para saber si es empresa
   es_empresa = false;

   // para saber si es servicio de carro o moto
   tipo_servicio = 'servicio_mensajero';

   // para autocomplete del mapa
   input_dir_inicial: any;
   input_dir_final: any;
   results_inicial: any;
   results_final: any;
   input_dir_inicial_moto: any;
   input_dir_final_moto: any;
   results_inicial_moto: any;
   results_final_moto: any;
   progres_moto: any;
   progres_carro: any;
   originPlaceId = null;
   destinationPlaceId = null;
   directionsService = new google.maps.DirectionsService;
   directionsDisplay = new google.maps.DirectionsRenderer;
   servicio_predicciones = new google.maps.places.AutocompleteService();
   placesService: any;
   ruta: boolean;
   div_final: any;
   div_inicial: any;
   div_cuantos: any;
   direccion_inicial = '';
   direccion_final = '';
   id_foco: string;
   divDireccionMapa: any;

   // variables para la gestion de los pedidos de domicilios
   domicilios_en_curso = []
   domicilio: Domicilio
   domicilios: any
   domicilio_seleccionado: Domicilio
   domicilios_despachados = []
   chats: Array<Chat> = new Array<Chat>()
   mensaje_chat: string = ""

    constructor(private db: AngularFireDatabase, private crudU: CrudUsuarioService, private toast: ToastrService,
      private authService: AngularFireAuth, private crudServicios: CrudserviciosService, private  crudMensajero: CrudmensajeroService,
      private storage: AngularFireStorage, private AuthService: AutenticacionService ) { }

    ngOnInit() {

      this.input_dir_inicial = document.getElementById('input_dir_inicial');
      this.input_dir_final = document.getElementById('input_dir_final');
      this.results_inicial = document.getElementById('results_inicial');
      this.results_final = document.getElementById('results_final');
      this.input_dir_inicial_moto = document.getElementById('input_dir_inicial_moto');
      this.results_inicial_moto = document.getElementById('results_inicial_moto');
      this.results_final_moto = document.getElementById('results_final_moto');
      this.input_dir_final_moto = document.getElementById('input_dir_final_moto');
      this.div_final = document.getElementById('dir_final_div');
      this.div_inicial = document.getElementById('dir_inicial_div');
      this.div_cuantos = document.getElementById('div_cuantos');
      this.progres_moto = document.getElementById('progressenviar');
      this.progres_carro = document.getElementById('progressenviarespecial');

    this.initMapa();
    this.cargarDatos();

     // iniciamos el pedido
     this.pedido = new Pedido();
     this.pedido_especial = new Pedido();
     this.pedido.cuantos_mensajeros = 1;
     this.pedido_seleccionado = new Pedido();
     this.mensajero = new Mensajero();
     this.mensajero_conectado = new Mensajero();
     this.domicilio = new Domicilio();
     this.domicilio_seleccionado = new Domicilio();
     this.lat_final = 0;
     this.lng_final = 0;
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
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.AutocompleteDirectionsHandler(this.map);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.display_calcular.nativeElement);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.mi_location_boton.nativeElement);
      this.map.addListener('rightclick', (e) => {
        if (this.divDireccionMapa != null) { this.divDireccionMapa.innerHTML = ''; }
      this.divDireccionMapa = document.createElement('div');
      this.divDireccionMapa.innerHTML = '<div style= "position: relative; z-index: 2; top:' + e.pixel.y + 'px;' +
      ' left:' + e.pixel.x + 'px; width: fit-content;"> <span><img class="pac-icon" src = "../../../../assets/marcador.png" ' +
      'style= "width: 30px;"/></span> <button id= "agregardir" class= "btn btn-link shadow" style= "background-color: white;" ' +
      '">Agregar dirección</button> </div>';
      console.log(this.divDireccionMapa);
      document.getElementById('gmap').appendChild(this.divDireccionMapa);
      document.getElementById('gmap').onclick = (ev) => {
        if (ev.toElement.id === 'agregardir') {
          this.agregarDireccion(e.latLng.lat(), e.latLng.lng());
        }
      };

      });
    }

    agregarDireccion(lat: number, lng: number) {
      this.divDireccionMapa.innerHTML = '';
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
         location: new google.maps.LatLng(lat, lng)
      }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK) {
          return;
        }
        switch (this.id_foco) {
          case 'input_dir_inicial_moto':
          this.input_dir_inicial_moto.value = results[0].formatted_address;
          this.direccion_inicial = results[0].formatted_address;
          this.originPlaceId = results[0].place_id;
          this.lat = lat;
          this.lng = lng;
          if (this.tipo_pedido === 'Compras' ||
          this.tipo_pedido === 'Compras-Pedir Domicilios') {
            this.route();
          }
          break;
          case 'input_dir_final_moto':
          this.input_dir_final_moto.value = results[0].formatted_address;
          this.direccion_final = results[0].formatted_address;
          this.destinationPlaceId = results[0].place_id;
          this.lat_final = lat;
          this.lng_final = lng;
          if (this.originPlaceId != null) {
            this.route();
          }
          break;
          case 'input_dir_inicial':
          this.input_dir_inicial.value = results[0].formatted_address;
          this.direccion_inicial = results[0].formatted_address;
          this.originPlaceId = results[0].place_id;
          this.lat = lat;
          this.lng = lng;
          if (this.destinationPlaceId != null) {
            this.route();
          }
          break;
          case 'input_dir_final':
          this.input_dir_final.value = results[0].formatted_address;
          this.direccion_final = results[0].formatted_address;
          this.destinationPlaceId = results[0].place_id;
          this.lat_final = lat;
          this.lng_final = lng;
          this.route();
          break;
          default:
          this.toast.error('selecciona primero la casilla donde se va a gregar la dirección');
          break;
        }
        if (this.id_foco) {
          this.agregarMarcador(new google.maps.LatLng(lat, lng));
        }

       });
    }


    agregarMarcador(latlng) {
      if (this.home != null) {
        this.home.setMap(null);
      }
      const image = {
        url: '../../../../assets/marcador.png',
        scaledSize: new google.maps.Size(25, 35)
      };
      this.home = new google.maps.Marker({
        map: this.map,
        position: latlng,
        icon: image,
        animation: google.maps.Animation.DROP
      });
      this.map.panTo(latlng);
    }

       // para los servicios de direccion
    AutocompleteDirectionsHandler (mapa: google.maps.Map) {
      this.map = mapa;
      google.maps.event.addDomListener(this.input_dir_inicial, 'input', () => {
        this.input_dir_inicial.style.display = 'block';
        if (this.input_dir_inicial.value !== '') {
          this.getPlacePredictions(this.input_dir_inicial.value);
          this.ruta = false;
          this.id_foco = this.input_dir_inicial.id;
        }
        });
        google.maps.event.addDomListener(this.input_dir_final, 'input', () => {
          if (this.input_dir_final.value !== '') {
            this.input_dir_final.style.display = 'block';
            this.getPlacePredictions(this.input_dir_final.value);
            this.ruta = true;
            this.id_foco = this.input_dir_final.id;
          }
          });
        google.maps.event.addDomListener(this.input_dir_inicial_moto, 'input', () => {
          this.input_dir_inicial_moto.style.display = 'block';
          if (this.input_dir_inicial_moto.value !== '') {
            this.getPlacePredictions(this.input_dir_inicial_moto.value);
            this.ruta = false;
            this.id_foco = this.input_dir_inicial_moto.id;
          }
          });
          google.maps.event.addDomListener(this.input_dir_final_moto, 'input', () => {
            if (this.input_dir_final_moto.value !== '') {
              this.input_dir_final_moto.style.display = 'block';
              this.getPlacePredictions(this.input_dir_final_moto.value);
              this.ruta = true;
              this.id_foco = this.input_dir_final_moto.id;
            }
            });
        google.maps.event.addDomListener(document, 'click', (e) => {
            this.ruta = false;
            e.target.selectionStart = 0;
            this.results_inicial.innerHTML = '';
            this.results_final.innerHTML = '';
            this.results_inicial_moto.innerHTML = '';
            this.results_final_moto.innerHTML = '';
            if (this.divDireccionMapa != null) {
            this.divDireccionMapa.innerHTML = '';
            }
            switch (e.target.id) {
              case 'input_dir_inicial_moto':
              this.id_foco = 'input_dir_inicial_moto';
              break;
              case 'input_dir_final_moto':
              this.id_foco = 'input_dir_final_moto';
              break;
              case 'input_dir_inicial':
              this.id_foco = 'input_dir_inicial';
              break;
              case 'input_dir_final':
              this.id_foco = 'input_dir_final';
              break;
            }
        });
      }

      getPlacePredictions = (input) => {
        this.servicio_predicciones.getPlacePredictions({
          input: input,
          location: new google.maps.LatLng(2.4574702, -76.6349535),
          radius: 20000
        }, this.callback);
      }

       callback = (predictions, status) => {
        // Empty results container
        this.results_inicial.innerHTML = '';
        this.results_final.innerHTML = '';
        this.results_inicial_moto.innerHTML = '';
        this.results_final_moto.innerHTML = '';
        // Place service status error
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          this.results_inicial.innerHTML = '<div class="pac-item pac-item-error">No encontramos ninguna direccion: ' + status + '</div>';
          this.results_final.innerHTML = '<div class="pac-item pac-item-error">No encontramos ninguna direccion: ' + status + '</div>';
          this.results_inicial_moto.innerHTML = '<div class="pac-item pac-item-error">No encontramos ninguna direccion: ' + status + '</div>';
          this.results_final_moto.innerHTML = '<div class="pac-item pac-item-error">No encontramos ninguna direccion: ' + status + '</div>';
          return;
        }
      // Build output for each prediction
        for (let i = 0, prediction; prediction = predictions[i]; i++) {
          // Get place details to inject more details in autocomplete results
          this.placesService.getDetails({
            placeId: prediction.place_id
          }, (place, serviceStatus) => {

            if (serviceStatus === google.maps.places.PlacesServiceStatus.OK) {

              // Create a new result element
              const div = document.createElement('div');

              // Insert inner HTML
              div.innerHTML += '<span class="pac-icon pac-icon-marker"><img class="pac-icon" src = "' + place.icon +
               '" style= "widht: 20px; height:20px;"/></span><strong style= "color: rgba(0, 0, 0, 0.555)">'
               + place.name + '</strong><div class="pac-item-details">' + place.formatted_address + '</div>';

              div.className = 'pac-item';
              // Bind a click event
              div.onclick = () => {
                if (this.ruta) {
                  this.results_inicial.innerHTML = '';
                  this.results_inicial_moto.innerHTML = '';
                  this.destinationPlaceId = place.place_id;
                  this.input_dir_final_moto.value = place.name;
                  this.input_dir_final.value = place.name;
                  this.lat_final = place.geometry.location.lat();
                  this.lng_final = place.geometry.location.lng();
                  this.direccion_final = place.name;
                  this.route();
                } else {
                  this.results_final.innerHTML = '';
                  this.input_dir_inicial.value = place.name;
                  this.direccion_inicial = place.name;
                  this.originPlaceId = place.place_id;
                  this.results_final_moto.innerHTML = '';
                  this.input_dir_inicial_moto.value = place.name;
                  if (this.tipo_pedido === 'Compras' || this.tipo_pedido === 'Compras-Pedir Domicilios') {
                    this.route();
                    this.lat = place.geometry.location.lat();
                    this.lng = place.geometry.location.lng();
                  }
                  this.agregarMarcador(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                  // Append new element to results
                }
              };
              switch (this.id_foco) {
                case 'input_dir_inicial_moto':
                this.results_inicial_moto.appendChild(div);
                break;
                case 'input_dir_final_moto':
                this.results_final_moto.appendChild(div);
                break;
                case 'input_dir_inicial':
                this.results_inicial.appendChild(div);
                break;
                case 'input_dir_final':
                this.results_final.appendChild(div);
                break;
              }
            }
          });
        }
      }

      route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
          console.log('orig ' + this.originPlaceId, ' dest ' + this.destinationPlaceId );
          return;
        }
        this.directionsDisplay.setMap(this.map);
        this.directionsService.route({
              origin: {'placeId': this.originPlaceId},
              destination: {'placeId': this.destinationPlaceId},
              travelMode: google.maps.TravelMode.DRIVING
            }, (response, status ) => {
              if (status === google.maps.DirectionsStatus.OK) {
                this.directionsDisplay.setDirections(response);
                const valor = this.calcularValorViaje(response.routes[0].legs[0].duration.value,
                   response.routes[0].legs[0].distance.value, this.tipo_servicio);
                this.display_valor.nativeElement.innerHTML = '$ ' + valor;
                this.display_distancia.nativeElement.innerHTML = response.routes[0].legs[0].distance.text;
                const image = {
                  scaledSize: new google.maps.Size(25, 35),
                  url: '../../../../assets/marcador.png'
                };
                this.home.setMap(null);

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

    calcularValorViaje(tiempo, distancia, tipo_servicio): number {
      let modificador: number;
      let base: number;
      let base_km: number;
      let base_time: number;
      if (tipo_servicio === 'servicio_mensajero_especial') {
        const hora_del_dia = new Date().getHours();
        modificador = this.modificadorDeTarifaSegunLaHora(hora_del_dia);
        base = 1800;
        base_km = 530;
        base_time = 120;
      } else {
        modificador = 1;
        base = 1500;
        base_km = 350;
        base_time = 60;
      }
      let valor_viaje = (((distancia / 1000) * (base_km * modificador)) + ((tiempo / 60) * (base_time * modificador)) + base * modificador);
      valor_viaje = Math.round(valor_viaje);
      valor_viaje = this.redondear(valor_viaje);
      if (tipo_servicio === 'servicio_mensajero_especial') {
        // si la tarifa del viaje da menos que 3500 entonces se deja en la minima 3500.
      if (valor_viaje <= 3500) {
        valor_viaje = 3500;
      }
      } else {
        switch (this.tipo_pedido) {
          case 'Domicilios':
            this.pedido.tipo_pedido = 'solicitud_rapida';
            this.pedido.valor_pedido = 2000;
            break;
          case 'Encomiendas':
            // si la tarifa del viaje da menos que 2000 entonces se deja en la minima 2000.
            if (valor_viaje <= 2000) {
              valor_viaje = 2000;
            }
            break;
          case 'Pagos de Facturas-Tramites':
            // si la tarifa del viaje da menos que 5000 entonces se deja en la minima 5000.
            if (valor_viaje <= 5000) {
              valor_viaje = 5000;
            }
            break;
          case 'Compras':
            // si la tarifa del viaje da menos que 3000 entonces se deja en la minima 3000.
            if (valor_viaje <= 3000) {
              valor_viaje = 3000;
            }
            break;
            case 'Compras-Pedir Domicilios':
           // si la tarifa del viaje da menos que 5000 entonces se deja en la minima 5000.
           if (valor_viaje <= 3000) {
            valor_viaje = 3000;
          }
            break;
        }

      }
      return valor_viaje;
    }

   modificadorDeTarifaSegunLaHora(horadeldia) {
      let  modificadortarifa;
      if (horadeldia <= 5 && horadeldia >= 3) {
          modificadortarifa = 1.5;
      } else if ( horadeldia >= 21) {
          modificadortarifa = 1.2;
      } else {
          modificadortarifa = 1.1;
      }
      return modificadortarifa;
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

    // en esta funcion inicializamos toda la info del usuario o empresa y cargamos los
    // servicios en curso y demás
    cargarDatos() {
      this.authService.authState.subscribe(authState => {
        this.id_usuario = authState.uid;
        this.es_empresa = true;
        this.cargarUIempresa();
     });
    }

    // agregar mi ubicación en el mapa

    miUbicacion(tipo_servicio: string) {
      this.tipo_servicio = tipo_servicio;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.display_valor.nativeElement.innerHTML = '$ 0';
                this.display_distancia.nativeElement.innerHTML = '0 km';
          this.agregarMarcador(new google.maps.LatLng(position.coords.latitude, position.coords.longitude ));
          this.directionsDisplay.setMap(null);
          this.infoWindow = new google.maps.InfoWindow();
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({
            location: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
          }, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) {
              return;
            }
            if (tipo_servicio === 'servicio_mensajero') {
              this.cargarServiciosMoto(this.id_usuario);
              if (this.tipo_pedido === 'Compras' ||
              this.tipo_pedido === 'Compras-Pedir Domicilios') {
                this.destinationPlaceId = results[0].place_id;
                this.direccion_final = results[0].formatted_address;
                this.input_dir_final_moto.value = results[0].formatted_address;
                this.input_dir_inicial_moto.value = '';
                this.lat_final = position.coords.latitude;
                this.lng_final = position.coords.longitude;
              } else {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.originPlaceId = results[0].place_id;
                if (this.es_empresa) {
                  this.direccion_inicial = this.empresa.direccion_empresa;
                  this.input_dir_inicial_moto.value = this.empresa.direccion_empresa;
                } else {
                  this.direccion_inicial = results[0].formatted_address;
                  this.input_dir_inicial_moto.value = results[0].formatted_address;
                }
              }
            } else {
              this.cargarServiciosEspeciales(this.id_usuario);
              this.lat = position.coords.latitude;
              this.lng = position.coords.longitude;
              this.originPlaceId = results[0].place_id;
              this.input_dir_inicial.value = results[0].formatted_address;
              this.direccion_inicial = results[0].formatted_address;
              this.input_dir_final.value = '';
              this.direccion_final = '';
              this.lat_final = 0;
              this.lng_final = 0;
            }
           });
        }, () => {
          this.handleLocationError(true, this.infoWindow, this.map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        this.handleLocationError(false, this.infoWindow, this.map.getCenter());
      }
    }

    // datos de empresa
    cargarUIempresa() {
      this.crudU.getEmpresa(this.id_usuario).valueChanges().subscribe(emp => {
        this.empresa = emp;
        this.contentString = '<div class= "container" >' +
        '<h6 class="firstHeading"> ' + this.empresa.nombre + '</h6>' +
        '<h9 class="firstHeading"> ' + this.empresa.direccion_empresa + '</h9>';
       this.infoWindow.setContent(this.contentString);
       this.infoWindow.open(this.map, this.home);
       this.tipo_pedido = 'Domicilios';
       this.cargarServiciosMoto(this.empresa.id_usuario);
       this.cargarServiciosEspeciales(this.empresa.id_usuario);
       this.cargarDomicilios(this.empresa.id_usuario);
        (<HTMLInputElement>document.getElementById('enviar')).disabled = false;
        (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = false;
        this.div_final.style.display = 'none';
        this.div_inicial.style.display = 'none';
        this.direccion_inicial = this.empresa.direccion_empresa;
      });
    }

    cargarServiciosMoto(id: string) {
            // traemos los pedidos que estén en curso
            this.crudServicios.getListaServicios().valueChanges().
            subscribe(pedidos => {
             this.pedidos = pedidos;
             this.pedidos_en_curso = [];
             this.cambiartipo(this.tipo_pedido);
             for ( let i = 0; i < this.pedidos.length; i++) {
               if (this.pedidos[i] != null && this.pedidos[i].id_usuario === id) {
                 for (let j = 0; j < this.pedidos_en_curso.length; j++) {
                   if (this.pedidos_en_curso[j].id_pedido === this.pedidos[i].id_pedido) {
                    this.pedidos_en_curso.splice(i);
                   }
                 }
                 this.pedidos_en_curso.push(this.pedidos[i]);
               }
             }
             this.borarPedidosterminados();
             if (this.pedidos_en_curso.length > 0) {
               this.VerServicio(this.pedidos_en_curso[0]);
               if (!this.es_empresa) {
                (<HTMLInputElement>document.getElementById('enviar')).disabled = true;
               }
             } else {
              (<HTMLInputElement>document.getElementById('enviar')).disabled = false;
             }
            });
    }

    cargarServiciosEspeciales(id: string) {
        // traemos los pedidos que estén en curso
      this.crudServicios.getListaServiciosEspeciales().valueChanges().
      subscribe(pedidos => {
      this.pedidos_especiales = pedidos;
      this.pedidos_en_curso = [];
      for ( let i = 0; i < this.pedidos_especiales.length; i++) {
      if (this.pedidos_especiales[i] != null && this.pedidos_especiales[i].id_usuario === id) {
        for (let j = 0; j < this.pedidos_en_curso.length; j++) {
          if (this.pedidos_en_curso[j].id_pedido === this.pedidos_especiales[i].id_pedido) {
            this.pedidos_en_curso.splice(i);
          }
        }
        this.pedidos_en_curso.push(this.pedidos_especiales[i]);
      }
      }
      this.borarPedidosterminados();
      if (this.pedidos_en_curso.length > 0) {
        this.VerServicioEspecial(this.pedidos_en_curso[0]);
        if (!this.es_empresa) {
          (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = true;
         }
       } else {
        (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = false;
       }
  });
  }

  cargarDomicilios(id: string) {
    // traemos los pedidos que estén en curso
  this.crudServicios.getDomicilios().valueChanges().
  subscribe(domis => {
  this.domicilios = domis;
  this.domicilios_en_curso = Array<Domicilio>();
  for ( let i = 0; i < this.domicilios.length; i++) {
  if (this.domicilios[i] != null && this.domicilios[i].empresa.id_usuario === id) {
    for (let j = 0; j < this.domicilios_en_curso.length; j++) {
      if (this.domicilios_en_curso[j].id_domicilio === this.domicilios[i].id_domicilio) {
        this.domicilios_en_curso.splice(i);
      }

    }
    if(this.domicilios[i].chat != undefined){      
    }
    this.domicilios_en_curso.push(this.domicilios[i]);
  }
  }
  this.borarDomiciliosterminados();
  if (this.pedidos_en_curso.length > 0) {
    (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = false;
  }
});
  
}

verDomicilio(domicilio: Domicilio) {
  this.domicilio_seleccionado = domicilio
  this.mensaje_chat = ""
  if(domicilio.chat != null){
    this.chats = domicilio.chat
  }else {
    this.chats = new Array<Chat>()
  }
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

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(this.map);
    }

    SolicitarServicio() {
      switch (this.tipo_pedido) {
        case 'Domicilios':
          this.pedido.tipo_pedido = 'solicitud_rapida';
          this.pedido.valor_pedido = 2000;
          break;
        case 'Encomiendas':
          this.pedido.tipo_pedido = 'encomiendas';
          this.pedido.valor_pedido = 2000;
          this.pedido.lat_dir_final = this.lat_final;
          this.pedido.long_dir_final = this.lng_final;
          break;
        case 'Pagos de Facturas-Tramites':
          this.pedido.tipo_pedido = 'facturas_tramites';
          this.pedido.valor_pedido = 5000;
          if (!this.es_empresa) {
            if (this.direccion_inicial.length < 4) {
              this.toast.info('agrega una dirección inicial');
              return;
            } else if (this.pedido.comentario == null) {
              this.toast.info('Qué debe hacer el mensajero?');
              return;
            }
          }
          break;
        case 'Compras':
          this.pedido.tipo_pedido = 'compras_domicilios';
          this.pedido.valor_pedido = 3000;
          this.pedido.lat_dir_final = this.lat_final;
          this.pedido.long_dir_final = this.lng_final;
          break;
          case 'Compras-Pedir Domicilios':
          this.pedido.tipo_pedido = 'compras_domicilios';
          this.pedido.valor_pedido = 3000;
          this.pedido.lat_dir_final = this.lat_final;
          this.pedido.long_dir_final = this.lng_final;
          if (!this.es_empresa) {
            if (this.direccion_inicial.length < 4) {
              if (this.pedido.comentario == null) {
                this.toast.info('Qué debe hacer el mensajero?');
                return;
              }
              this.toast.info('Direccion de compra vacía, se buscará el mensajero más cercano a tu ubicación');
            } else if (this.direccion_final.length < 4) {
              this.toast.info('debes agregar una direccion de entrega');
              return;
            } else if (this.pedido.comentario == null) {
              this.toast.info('Qué debe hacer el mensajero?');
              return;
            }
          }
          break;
      }
      this.cancelar_envio = true;
      this.pedido.lat_dir_inicial = this.lat;
      this.pedido.long_dir_inicial = this.lng;
      this.pedido.estado_pedido = 'sin_movil_asignado';
      this.pedido.tipo_servicio = this.tipo_servicio;
      this.pedido.codigo_mensajero = 'asignar movil';
        this.pedido.id_usuario = this.empresa.id_usuario;
        this.pedido.nombre = this.empresa.nombre;
        this.pedido.telefono = this.empresa.telefono;
        this.pedido.servicio_empresa = true;
        this.pedido.token = this.empresa.token;
        this.pedido.dir_inicial = this.direccion_inicial;
        this.pedido.dir_final = this.direccion_final;
        this.pedido.date = new Date().getTime();
        (<HTMLInputElement>document.getElementById('enviar')).disabled = true;
        let progres = 0;
        this.interval_enviar = setInterval(() => {
          progres ++;
          document.getElementById('progressenviar').style.width = Math.round(progres * 3.3) + '%';
          if (progres === 35) {
            clearInterval(this.interval_enviar);
            this.cancelar_envio = false;
            document.getElementById('progressenviar').style.width = '0%';
            (<HTMLInputElement>document.getElementById('enviar')).disabled = false;
            let contador = 0;
            let tiempo;
            const cuantos = this.pedido.cuantos_mensajeros;
            if (this.pedido.cuantos_mensajeros === 1) {
              tiempo = 100;
            } else {
              tiempo = 2000;
            }
            // aqui verificamos si se va a pedir un servicio o más
            const interval = setInterval(() => {
              contador ++;
              this.pedido.fecha_pedido = this.getFecha();
              this.crudServicios.setServicio(this.pedido).then(() => {
                this.toast.success('Servicio ' + contador + ' enviado correctamente');
            });
            if (contador == cuantos) {
              clearInterval(interval);
              this.pedido = new Pedido();
              this.pedido.cuantos_mensajeros = 1;
              this.tipo_pedido = 'Domicilios';
            }
            }, tiempo);
          }
        }, 100);
    }

    SolicitarServicioEspecial() {
      this.cancelar_envio = true;
      this.pedido_especial.lat_dir_inicial = this.lat;
      this.pedido_especial.long_dir_inicial = this.lng;
      this.pedido_especial.lat_dir_final = this.lat_final;
      this.pedido_especial.long_dir_final = this.lng_final;
      this.pedido_especial.estado_pedido = 'sin_movil_asignado';
      this.pedido_especial.tipo_servicio = this.tipo_servicio;
      this.pedido_especial.dir_inicial = this.direccion_inicial;
      this.pedido_especial.dir_final = this.direccion_final;
      this.pedido.codigo_mensajero = 'asignar movil';
      this.pedido_especial.id_usuario = this.empresa.id_usuario;
      this.pedido_especial.nombre = this.empresa.nombre;
      this.pedido_especial.telefono = this.empresa.telefono;
      this.pedido_especial.servicio_empresa = true;
      this.pedido_especial.token = this.empresa.token;
      this.pedido_especial.date = new Date().getTime();
      (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = true;
      let progres = 0;
      this.interval_enviar = setInterval(() => {
        progres ++;
        document.getElementById('progressenviarespecial').style.width = Math.round(progres * 3.3) + '%';
        if (progres === 35) {
          clearInterval(this.interval_enviar);
          this.cancelar_envio = false;
          document.getElementById('progressenviarespecial').style.width = '0%';
          (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = false;
            this.pedido_especial.fecha_pedido = this.getFecha();
            this.crudServicios.setServicioEspecial(this.pedido_especial).then(() => {
            this.toast.success('Servicio enviado correctamente');
            this.pedido_especial = new Pedido();
          });
        }
      }, 100);
    }

    SeleccionarServicio(pedido: Pedido) {
      if (this.tipo_servicio === 'servicio_mensajero_especial') {
        this.VerServicioEspecial(pedido);
      } else {
        this.VerServicio(pedido);
      }
    }

    VerServicio(pedido: Pedido) {
      if (this.markerMensajero != undefined) {
        this.markerMensajero.setMap(null);
      }
      this.crudMensajero.getMensajero(pedido.codigo_mensajero).valueChanges()
      .subscribe(mensajero => {
        this.mensajero = mensajero;
        this.pedido_seleccionado = pedido;
        switch (pedido.tipo_pedido) {
          case 'solicitud_rapida':
            this.pedido_seleccionado.tipo_pedido = 'Domicilios';
            break;
          case 'encomiendas':
            this.pedido_seleccionado.tipo_pedido = 'Encomiendas';
            break;
          case 'facturas_tramites':
            this.pedido_seleccionado.tipo_pedido = 'Pagos de facturas- tramites';
            break;
          case 'compras_domicilios':
            this.pedido_seleccionado.tipo_pedido = 'Compras';
            break;
        }
        if ( this.pedido_seleccionado.codigo_mensajero === '7gJSMJsZNjRUDoOzKnO0GefE0ND3') {
          this.info_moto = ' En un momento será asignado un Mensajero ';
          const path = 'movil_' + this.mensajero.codigo;
          const url = this.storage.storage.ref('mensajeros/mensajero_moto')
          .child(path).child('foto_perfil.png');
          this.map.setCenter({lat: this.lat, lng: this.lng});
          this.img_perfil = url.getDownloadURL();
        } else {
          const path = 'movil_' + this.mensajero.codigo;
          const url = this.storage.storage.ref('mensajeros/mensajero_moto')
          .child(path).child('foto_perfil');
          this.img_perfil = url.getDownloadURL();
          this.info_moto = this.mensajero.marca + ' ' + this.mensajero.modelo_vehiculo + ' color ' +
           this.mensajero.color + ' placas ' + this.mensajero.placa;
           const sub = this.crudMensajero.getMensajeroConectado(pedido.codigo_mensajero).valueChanges()
           .subscribe(_mensajero => {
             this.mensajero_conectado = _mensajero;
             const lat = this.mensajero_conectado.lat_dir_ini;
             const lng = this.mensajero_conectado.lgn_dir_ini;
             const pos = {
               lat: lat,
               lng: lng
             };
             this.map.setCenter(pos);
             if (this.markerMensajero != null) {
              this.markerMensajero.setMap(null);
             }
             const image = {
              url: '../../../../assets/moto.png',
              scaledSize: new google.maps.Size(35, 30)
            };
             this.markerMensajero = new google.maps.Marker({
              position: pos,
              map: this.map,
              icon: image,
              animation: google.maps.Animation.DROP,
            });
            const contentString = '<div class= "container" >' +
            '<h6 class="firstHeading"> ' + this.mensajero.nombre + '</h6>' +
            '<h9 class="firstHeading"> ' + this.mensajero.telefono + '</h9>';
            const info = new google.maps.InfoWindow({
              content: contentString
            });
            this.markerMensajero.addListener('click', () => {
              info.open(this.map, this.markerMensajero);
            });
            sub.unsubscribe();
           });
        }
      });
    }

    CancelarEnvioServicio(progress_id: string) {
      clearInterval(this.interval_enviar);
      document.getElementById(progress_id).style.width = '0%';
      (<HTMLInputElement>document.getElementById('enviar')).disabled = false;
      (<HTMLInputElement>document.getElementById('enviarespecial')).disabled = false;
      this.cancelar_envio = false;
    }

    VerServicioEspecial(pedido_especial: Pedido) {
      if (this.markerMensajero != undefined) {
        this.markerMensajero.setMap(null);
      }
      this.crudMensajero.getMensajeroEspecial(pedido_especial.codigo_mensajero).valueChanges()
      .subscribe(mensajero => {
        this.mensajero = mensajero;
        this.pedido_seleccionado = pedido_especial;
          const path = 'movil_' + this.mensajero.codigo;
          const url = this.storage.storage.ref('mensajeros/mensajero_carro')
          .child(path).child('foto_perfil');
          this.img_perfil = url.getDownloadURL();
          this.info_moto = this.mensajero.marca + ' ' + this.mensajero.modelo_vehiculo + ' color ' +
           this.mensajero.color + ' placas ' + this.mensajero.placa;
           const sub = this.crudMensajero.getMensajeroEspecialConectado(pedido_especial.codigo_mensajero).valueChanges()
           .subscribe(_mensajero => {
             if (_mensajero != null) {
              this.mensajero_conectado = _mensajero;
              const lat = this.mensajero_conectado.lat_dir_ini;
              const lng = this.mensajero_conectado.lgn_dir_ini;
              const pos = {
                lat: lat,
                lng: lng
              };
              this.map.setCenter(pos);
              const image = {
               url: '../../../../assets/carro.png',
               scaledSize: new google.maps.Size(35, 35)
             };
              this.markerMensajero = new google.maps.Marker({
               position: pos,
               map: this.map,
               icon: image,
               animation: google.maps.Animation.DROP,
             });
             const contentString = '<div class= "container" >' +
             '<h6 class="firstHeading"> ' + this.mensajero.nombre + '</h6>' +
             '<h9 class="firstHeading"> ' + this.mensajero.telefono + '</h9>';
             const info = new google.maps.InfoWindow({
               content: contentString
             });
             this.markerMensajero.addListener('click', () => {
               info.open(this.map, this.markerMensajero);
             });
             }
            sub.unsubscribe();
           });
      });
    }
    CancelarCancelacionServicio() {
      clearInterval(this.interval_cancelar);
      document.getElementById('progresscancelar').style.width = '0%';
      this.cancelar_cancelacion = false;
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

   borarDomiciliosterminados() {
    let i;
    const longitud = this.domicilios_en_curso.length;
    this.domicilios_despachados = []
    if (longitud > 0) {
      for (i = 0; i < longitud; i++) {
        if (this.domicilios_en_curso[i] != undefined) {
          if(this.domicilios_en_curso[i].chat != undefined){
            let chats = this.domicilios_en_curso[i].chat
            this.domicilios_en_curso[i].chat = Object.values(chats)
          }
          if(this.domicilio_seleccionado != null && this.domicilio_seleccionado.id_domicilio === this.domicilios_en_curso[i].id_domicilio){
            this.verDomicilio(this.domicilios_en_curso[i])
          }
          if (this.domicilios_en_curso[i].estado === Constantes.CANCELADO || this.domicilios_en_curso[i].estado === Constantes.ENTREGAGO) {
            this.domicilios_en_curso.splice(i, 1);
            i = i - 1;
          } else if(this.domicilios_en_curso[i].estado === Constantes.DESPACHADO){
            this.domicilios_despachados.push(this.domicilios_en_curso[i])
            this.domicilios_en_curso.splice(i, 1);
            i = i - 1;
          }
        }
      }
    }
  }

   borarPedidosterminados() {
    let i;
    const longitud = this.pedidos_en_curso.length;

    if (longitud > 0) {
      for (i = 0; i < longitud; i++) {
        if (this.pedidos_en_curso[i] != undefined) {
          if (this.pedidos_en_curso[i].estado_pedido === 'cancelado' || this.pedidos_en_curso[i].estado_pedido === 'terminado') {
            this.pedidos_en_curso.splice(i, 1);
            i = i - 1;
          }
        }
      }
    }
  }
  // para cancelar servicios
  CancelarServicio(pedido: Pedido) {
    let progres = 0;
    this.cancelar_cancelacion = true;
    this.interval_cancelar = setInterval(() => {
      progres ++;
      document.getElementById('progresscancelar').style.width = Math.round(progres * 3.3) + '%';
      if (progres === 35) {
        clearInterval(this.interval_cancelar);
        this.cancelar_cancelacion = false;
        document.getElementById('progresscancelar').style.width = '0%';
        // aqui cancelamos el servicio
        pedido.estado_pedido = 'cancelado';
        if (this.tipo_servicio === 'servicio_mensajero_especial') {
          this.crudServicios.updateServicioEspecial(pedido);
        } else {
          this.crudServicios.updateServicio(pedido);
        }
      }
    }, 100);
  }
  cambiartipo(tipo: string) {
    this.miUbicacion(this.tipo_servicio);
    switch (tipo) {
      case 'Compras-Pedir Domicilios':
      this.label_ini_titulo_segun_pedido = 'Comprar en: ';
      this.label_ini_descrp_segun_pedido = '*Agrega el nombre de la tienda, almacen o restaurante, o agrega la dirección si la tienes';
      this.label_fin_descrp_segun_pedido = '*Agrega la dirección de entrega del, por defecto aparece tu ubicación actual';
      this.label_fin_titulo_segun_pedido = 'Entregar compra en';
      this.div_final.style.display = 'block';
      this.div_inicial.style.display = 'block';
      this.div_cuantos.style.display = 'none';
      this.input_dir_inicial_moto.value = '';
      this.lat_final = this.lat;
      this.lng_final = this.lng;
      break;
      case 'Compras':
      this.label_ini_titulo_segun_pedido = 'Comprar en: ';
      this.label_ini_descrp_segun_pedido = '*Agrega el nombre de la tienda, almacen o restaurante, o agrega la dirección si la tienes';
      this.label_fin_descrp_segun_pedido = '*Agrega la dirección de entrega del, por defecto aparece tu ubicación actual';
      this.label_fin_titulo_segun_pedido = 'Entregar compra en';
      this.div_final.style.display = 'block';
      this.div_inicial.style.display = 'block';
      this.div_cuantos.style.display = 'none';
      this.input_dir_inicial_moto.value = '';
      this.lat_final = this.lat;
      this.lng_final = this.lng;
      break;
      case 'Encomiendas':
      this.label_ini_titulo_segun_pedido = 'Recoger en: ';
      this.label_ini_descrp_segun_pedido = '*la dirección donde se recogerá la encomienda, por defecto aparece tu ubicación actual';
      this.label_fin_descrp_segun_pedido = '*Agrega la dirección de entrega de la encomiendas';
      this.label_fin_titulo_segun_pedido = 'Entregar encomienda en';
      this.div_final.style.display = 'block';
      this.div_inicial.style.display = 'block';
      this.div_cuantos.style.display = 'none';
      this.input_dir_final_moto.value = '';
      break;
      case 'Pagos de Facturas-Trámites':
      this.label_ini_titulo_segun_pedido = 'Recoger factura en: ';
      this.label_ini_descrp_segun_pedido = '*la dirección donde se recogerá la factura y el dinero, por defecto aparece tu ubicación actual';
      this.div_final.style.display = 'none';
      this.div_inicial.style.display = 'block';
      this.div_cuantos.style.display = 'none';
      break;
      case 'Domicilios':
      this.div_final.style.display = 'none';
      this.div_inicial.style.display = 'none';
      this.div_cuantos.style.display = 'block';
      break;
    }
  }

  // funciones para gestion de Domicilios *******************************************

  cambiarEstadoDomicilio(estado_nuevo: string, domicilio: Domicilio) {

    switch (estado_nuevo) {
      case Constantes.CONFIRMADO:
        // si se quiere confirmar el omicilio debe primero agregar el precio
        if (domicilio.valor_pedido == undefined) {
          this.toast.error("para confirmar primero debe agregar el valor del pedido")
          return
        }
        domicilio.estado = estado_nuevo
        this.crudServicios.updateDomicilio(domicilio).then(()=>{
          this.toast.success('Pedido confirmado exitosamente, se notificará al cliente')
        })
      break
      case Constantes.CANCELADO:
          domicilio.estado = estado_nuevo
          this.crudServicios.updateDomicilio(domicilio).then(()=>{
            this.toast.success('Pedido cancelado exitosamente, se notificará al cliente')
            this.domicilio_seleccionado = new Domicilio()
          })
      break
      case Constantes.DESPACHADO:
          domicilio.estado = estado_nuevo
          domicilio.codigo_mensajero = Constantes.NO_APLICA
          this.crudServicios.updateDomicilio(domicilio).then(()=>{
            this.toast.success('Pedido despachado exitosamente, se notificará al cliente')
          })
      break
      case Constantes.ENTREGAGO:
        domicilio.estado = estado_nuevo
        this.crudServicios.updateDomicilio(domicilio).then(()=>{
          this.toast.success('Pedido entregado exitosamente, se notificará al cliente')
        })
      break
    }

  }

  pedirMensajeroParaDomicilio(domicilio: Domicilio){
    this.tipo_pedido = 'Domicilios'
    this.pedido.domicilio = domicilio
    this.SolicitarServicio()
  }

  despacharDomicilio(domicilio: Domicilio) {
    this.domicilio_seleccionado = domicilio
  }

  entregarTodosLosDomicilios() {
    let conf = confirm("¿desea terminar todos los domicilios?... ésta acción sólo terminará lo que no se han despachado con un mensajero de la aplicación")
    if (conf) {
      for (let n of this.domicilios_despachados) {
        if (n.codigo_mensajero === Constantes.NO_APLICA) {
          this.cambiarEstadoDomicilio(Constantes.ENTREGAGO, n)
        }
      }
    }
  }

  getHoras(time: number): string{
    let fecha = new Date(time)
    let horas = ""
    let minutos = ""
    if (fecha.getHours() < 10){
      horas = `0${fecha.getHours()}`
    } else {
      horas = fecha.getHours().toString()
    }
    if (fecha.getMinutes() < 10){
      minutos = `0${fecha.getMinutes()}`
    } else {
      minutos = fecha.getMinutes().toString()
    }

    return `${horas}:${minutos}`  
  }

  enviarMensaje(domi: Domicilio, mensaje: string){
    console.log(mensaje)
    this.crudServicios.enviarMensajeDomicilio(domi,mensaje)
    this.mensaje_chat = ""
  }
}
