import { Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacionService } from 'src/app/servicios/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { Empresa} from '../constantes/empresa';
import { AngularFireDatabase } from '@angular/fire/database';
import { CrudUsuarioService} from '../servicios/crud-usuario.service';
import { Usuario } from '../constantes/usuario';
import { Constantes } from '../constantes/Constantes';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})

export class RegistroComponent implements OnInit {

  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  pass: string;
  pass2: string;
  horarios: Horarios
  categorias = [Constantes.RESTAURANTE, Constantes.FARMACIA, Constantes.FLORISTERIA, Constantes.SUPERMERCADO, Constantes.LICORES,
    Constantes.OTRO]
  categoria: string
  ciudad = Constantes.CIUDAD
  ciudades = [Constantes.POPAYAN, Constantes.NEIVA, Constantes.PASTO]
  servicio_predicciones = new google.maps.places.AutocompleteService();
  placesService: any;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  input_direccion: any
  results_direccion:any
  map: google.maps.Map;
  registrar_empresa: boolean = false // para saber si está registrando o login para ocultar el mapa
  divDireccionMapa: any; // para agregar la direccion con click derecho
  mi_ubicacion: google.maps.Marker
  ubicacion_empresa: google.maps.LatLng
  placeID: string

  @ViewChild('gmap', {static: true}) gmapElement: any;

  constructor(public AuthService: AutenticacionService, private router: Router, public mAuth: AngularFireAuth,
    public bd: AngularFireDatabase, public toast: ToastrService, private crud: CrudUsuarioService) {
  }

  ngOnInit() {
    this.horarios = {
      lunes: {abre:'00:00', cierra:'00:00'},
      martes: {abre:'00:00', cierra:'00:00'},
      miercoles: {abre:'00:00', cierra:'00:00'},
      jueves: {abre:'00:00', cierra:'00:00'},
      viernes: {abre:'00:00', cierra:'00:00'},
      sabado: {abre:'00:00', cierra:'00:00'},
      domingo: {abre:'00:00', cierra:'00:00'}
    }
    this.input_direccion = document.getElementById('inputDir')
    this.results_direccion = document.getElementById('results_direccion')
    this.miUbicacion()
    this.initMap()
  }

  initMap() {
    const mapProp = {
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
      };
      // inicializamos le mapa
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.AutocompleteDirectionsHandler(this.map);
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
          this.ubicacion_empresa = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng())
          this.agregarMarcador(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()))
          this.divDireccionMapa.innerHTML = ''
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({
            location: new google.maps.LatLng(e.latLng.lat(), e.latLng.lng())
          }, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) {
              return;
            }
            console.log(results)
            this.direccion = results[0].formatted_address
            this.placeID = results[0].place_id
           });
        }
      };
  
  
      });
  }

  miUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.agregarMarcador(new google.maps.LatLng(position.coords.latitude, position.coords.longitude ));
        this.directionsDisplay.setMap(null);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({
          location: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        }, (results, status) => {
          if (status !== google.maps.GeocoderStatus.OK) {
            return;
          }
          this.ciudad = results[0].address_components[1].short_name
         });
      }, () => {

      });
    } else {
      // Browser doesn't support Geolocation

    }
  }

  isEmail(search: string): boolean {

    let  serchfind: boolean;

    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    serchfind = regexp.test(search);
    return serchfind;
}

todoMayuscula(e) {
  e.value = e.value.toUpperCase();
}

// convertir en mayuscula la primera letra de cada palabra
primeraMayuscula(e) {
  e.value = e.value.replace('  ', ' ');
  const char = e.value.split(' ');
  let nuevoChar = '';
  let primeraletra;
  for (let i = 0; i < char.length; i++) {
    if (char[i][0] != undefined) {
      primeraletra = char[i][0].toUpperCase();
    } else {
      primeraletra = '';
    }
    const str = primeraletra + char[i].slice(1);
    if (i > 0) {
      nuevoChar = nuevoChar + ' ' + str;
    } else {
      nuevoChar = str;
    }
  }
  e.value = nuevoChar;
}

// verificar que las contraseñas estén iguales
verifPassRep(e) {
if ( e.value === '') {
  e.style.outline = '0px solid red';
} else if (e.value !== this.pass) {
  e.style.outline = '2px solid red';
} else {
  e.style.outline = '0px solid red';
}
}

varifpass(pass: string, pass2: string): boolean {
  if (pass !== '' && pass === pass2) {
    return true;
  } else {
    return false;
  }
}

// funcion para registrar la empresa nueva
registrarEmpresa(email: string, pass: string, pass2: string, numero: string, direccion: string, nombre: string, categoria: string) {

  if ( nombre == null || nombre.length < 3) {
    this.toast.error('Nombre muy corto');
  } else if (!this.isEmail(email)) {
    this.toast.error('Email no valido');
  } else if (pass == null || !this.varifpass(pass, pass2)) {
    this.toast.error('Las contraseñas deben ser iguales');
  } else if ( numero == null || numero.length < 7) {
    this.toast.error('Número de telefono no válido');
  } else if ( direccion == null || direccion.length < 5) {
    this.toast.error('Dirección muy corta');
  } else if ( categoria == null) {
    this.toast.error('Seleccione una categoría');
  } else if ( this.ubicacion_empresa == null) {
    this.toast.error('No se ha agregado la ubicacion de su empresa');
  } else {
    return this.AuthService.registrar( email, pass).then( authState => {
      authState.subscribe(uid => {
        const empresa: Empresa = new Empresa();
        empresa.nombre = nombre;
        empresa.es_empresa = true;
        empresa.direccion_empresa = direccion;
        empresa.email = email;
        empresa.telefono = numero;
        empresa.saldo = 0;
        empresa.id_usuario = uid.uid;
        empresa.horarios = this.horarios
        empresa.placeID = this.placeID
        empresa.categoria = this.categoria
        empresa.latitud = this.ubicacion_empresa.lat()
        empresa.longitud = this.ubicacion_empresa.lng()
        empresa.ciudad = this.ciudad
        console.log(categoria)
        this.crud.agregarEmpresa( empresa );
        this.router.navigate(['/portal/main/dashboard']);
      });
    }).catch(error => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorCode === 'auth/email-already-in-use') {
      this.toast.error('El email ya pertenece a una cuenta');
    } else if (errorCode === 'auth/weak-password') {
      this.toast.error('La contraseña debe tener mínimo 6 caracteres');
    } else {
      console.log(errorCode, errorMessage);
      this.toast.error('Ha ocurrido un error intente nuevamente', 'Upss');
    }
    });
  }
}

// funcion para registrar la empresa nueva
registrarPersona(email: string, pass: string, pass2: string, numero: string, nombre: string) {

  if ( nombre == null || nombre.length < 3) {
    this.toast.error('Nombre muy corto');
  } else if (!this.isEmail(email)) {
    this.toast.error('Email no valido');
  } else if (pass == null || !this.varifpass(pass, pass2)) {
    this.toast.error('Las contraseñas deben ser iguales');
  } else if ( numero == null || numero.length < 7) {
    this.toast.error('Número de telefono no válido');
  } else {
    return this.AuthService.registrar( email, pass).then( authState => {
      authState.subscribe(uid => {
        const usuario: Usuario = new Usuario();
        usuario.nombre = nombre;
        usuario.email = email;
        usuario.telefono = numero;
        usuario.saldo = 0;
        usuario.id_usuario = uid.uid;
        this.crud.agregarUsuario( usuario );
      });
    }).catch(error => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorCode === 'auth/email-already-in-use') {
      this.toast.error('El email ya pertenece a una cuenta');
    } else if (errorCode === 'auth/weak-password') {
      this.toast.error('La contraseña debe tener mínimo 6 caracteres');
    } else {
      console.log(errorCode, errorMessage);
      this.toast.error('Ha ocurrido un error intente nuevamente', 'Upss');
    }
    });
  }
}

handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
                        infoWindow.open(this.map)
}

// para los servicios de direccion
AutocompleteDirectionsHandler (mapa: google.maps.Map) {
this.map = mapa;

    google.maps.event.addDomListener(this.input_direccion, 'input', () => {
      if (this.input_direccion.value !== '') {
        this.input_direccion.style.display = 'block';
        this.getPlacePredictions(this.input_direccion.value);
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
  this.results_direccion.innerHTML = '';
  // Place service status error
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    this.results_direccion.innerHTML = '<div class="pac-item pac-item-error">No encontramos ninguna direccion: ' + status + '</div>';
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
            this.results_direccion.innerHTML = '';
            this.direccion = place.formatted_address
            this.agregarMarcador(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
            this.ubicacion_empresa = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng())  
            this.placeID = place.place_id      
            console.log(this.placeID)   
            // Append new element to results
        };
          this.results_direccion.appendChild(div);
      }
    });
  }
}
agregarMarcador(latlng) {
  if(this.mi_ubicacion != null)this.mi_ubicacion.setMap(null)
  const image = {
    url: '../../../../assets/marcador.png',
    scaledSize: new google.maps.Size(45, 55)
  };
  this.mi_ubicacion = new google.maps.Marker({
    map: this.map,
    position: latlng,
    icon: image,
    animation: google.maps.Animation.DROP
  });
  this.map.panTo(latlng);
}

}
