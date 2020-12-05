import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MessagingService } from './messaging.service';
import { AutenticacionService } from './servicios/autenticacion.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireStorage } from '@angular/fire/storage';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { PruebasComponent} from './componentes/pruebas/pruebas.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessagingService, AngularFireAuth],
  animations: [
    // Each unique animation requires its own trigger. The first argument of the trigger function is the name
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-90deg)' })),
      state('rotated_der', style({ transform: 'rotate(90deg)' })),
      transition('rotated => default', animate('1500ms ease-out')),
      transition('rotated_der => default', animate('1500ms ease-out')),
      transition('default => rotated_der', animate('400ms ease-out')),
      transition('default => rotated', animate('400ms ease-in'))
    ])
  ]
})

export class AppComponent implements OnInit {

  @ViewChild('pruebas')pruebas:PruebasComponent

  // para la animacion de la imagen rotar
  state = 'default';

  title = 'app';
  message;
  usuarios: any;
  my_pedidos: any;
  all_pedidos: any;
  my_pedidos_programado = [];
  my_pedido_offline = [];
  my_mensajero: any;
  agregar_empresa = false;
  editar_empresa = false;
  estadodelpedido = false;
  mensajero_especial_conectado = [];
  mensajero_conectado = [];
  mensajero_especial_nuevo = [];
  // variable para sacar todos los usuarios
  todos_los_usuarios: any = [];

  // variable para ver la imgen
  urlimg: any;
  urlimgPerfil: any;
  foto_seleccionada: any;

  // aqui van las variables usadas para la geestion de la base de datos
  // de los servicios de mensajero especial
  bsRangeValue: any = [new Date(2018, 0, 1), new Date(2018, 0, 7)];
  pedidos_filtrados_por_fecha = [];
  servicios_terminados = 0;
  servicios_cancelados = 0;
  servicios_por_mensajero = { placa: null, servicios: null, saldo: null, convenios: null };
  array_servicios = []
  valor_total;
  servicios_de_convenios;
  total_convenios;
  total_a_pagar;
  detalles_servicios = [];
  servicio_descargar = [];

  // variables para saber cual empresa inicia sesion
  mensajeros_motos = false;
  mensajeros_carros = false;

  // variables para iniciar sesion
  textEmail = '';
  textPass = '';
  // para filtrar la tabla por fecha
  filtrofecha;
  tablafiltrada = [];

  // para ocultar el navbar
  sesioncerrada = true;
  // porcentaje a entregar
  valor_porcentaje;
  // total mensajero
  tarifa_mensajero: number;
  tarifa_completa: number;

  // varialbles
  show_form = false;
  show_form_mensajeros = false;
  editar = false;
  agregar = false;
  closeResult: string;

  // vaiables para los pedidos en carro

  my_pedidos_carro: any = [];
  my_mensajero_especial: any = [];
  my_mensajero_especial_bloqueado = [];
  mensajero_especial_verificar = [];
  mensajero_ver = [];
  
  // variables para los pedidos en moto

  mensajero_moto_ver = [];
  mensajero_verificar = [];
  mensajero_activo = [];
  mensajero_nuevo = [];
  mensajero_bloqueado_moto = [];
  mensajero_verificado_moto = [];

  editar_especial = false;
  agregar_especial = false;
  show_form_mensajeros_especial = false;
  asignar_movil = false;
  my_movil_asignado: any = [];
  mensajero_especial_activo = [];
  todos_mensajero_especial = [];
  // para traer el total de usuarios de la base de datos
  usuario_empresas: any;
  usuario_existe = false;

  // variable para saber si el usuario es de carros o motos
  email_admin = '';
  // variable usuario
  usuario = this.serviceAut.usuario;

  // variables para visualizar el mapa

  lat = 0;
  lng = 0;
  lat_mensajero = 0;
  lng_mensajero = 0;


  // variables para hacer el filtro al buscar un numero si ya esta registrado
  public nombre_escrito = '';
  public filteredList = [];
  public numeros_de_telefono = [];

  // placa para buscar los mensajeros por placa
  placa_escrita: any;
  total_placas = [];
  filtroPorPlaca = [];
  tiene_letras;
  filtro_por_nombre = [];
  placa_seleccionadaa = '';

  F = { placa: null };

  listaMensajerosF = [{ 'F': 'F8', 'placa': 'MCA01e' }, { 'F': 'F9', 'placa': 'XQY64c' }, { 'F': 'F10', 'placa': 'NO_REGISTRADO' },
  { 'F': 'F11', 'placa': 'FRB52e' },
  { 'F': 'F12', 'placa': 'NO_REGISTRADO' }, { 'F': 'F13', 'placa': 'NO_REGISTRADO' }, { 'F': 'F14', 'placa': 'NO_REGISTRADO' },
  { 'F': 'F15', 'placa': 'NO_REGISTRADO' }, { 'F': 'F16', 'placa': 'MBX18e' }, { 'F': 'F17', 'placa': 'THR08e' },
  { 'F': 'F18', 'placa': 'VXS61e' }, { 'F': 'F19', 'placa': 'NO_REGISTRADO' }, { 'F': 'F20', 'placa': 'WHB53a' },
  { 'F': 'F21', 'placa': 'THT71e' }, { 'F': 'F22', 'placa': 'NO_REGISTRADO' },  { 'F': 'F23', 'placa': 'NO_REGISTRADO' },
  { 'F': 'F24', 'placa': 'MBS41e' }, { 'F': 'F25', 'placa': 'GYL57e' }, { 'F': 'F26', 'placa': 'MKF98a' },
  { 'F': 'F27', 'placa': 'FQB33D' }, { 'F': 'F28', 'placa': 'NO_REGISTRADO' }, { 'F': 'F29', 'placa': 'ZUD42D' },
  { 'F': 'F30', 'placa': 'NO_REGISTRADO' }, { 'F': 'F31', 'placa': 'NO_REGISTRADO' }, { 'F': 'F32', 'placa': 'NO_REGISTRADO' },
  { 'F': 'F33', 'placa': 'NO_REGISTRADO' }, { 'F': 'F34', 'placa': 'NO_REGISTRADO' }, { 'F': 'F35', 'placa': 'VXR24e' },
  { 'F': 'F36', 'placa': 'NO_REGISTRADO' }, { 'F': 'F37', 'placa': 'FPQ66d' }];


  // acceso para modificar mensajeros
  tesorera = false;
  mensajero_bloqueado = false;
  alert_sin_placa = true;

  todos: any = [];

  constructor(public db: AngularFireDatabase, public msgService: MessagingService, public storage: AngularFireStorage,
    public serviceAut: AutenticacionService, public afAuth: AngularFireAuth, public modalService: NgbModal, private toastr: ToastrService) {


    setInterval(() => {
      if (navigator.onLine) {
        localStorage.setItem('my_pedidos_carro', JSON.stringify(this.my_pedidos_carro));
        localStorage.setItem('my_pedidos', JSON.stringify(this.my_pedidos));

      } else {
        this.toast('Fail', 'Sin Conexion a internet!!!');
        this.my_pedidos = JSON.parse(localStorage.getItem('my_pedidos'));
        this.my_pedidos_carro = JSON.parse(localStorage.getItem('my_pedidos_carro'));
        this.my_pedidos_programado = JSON.parse(localStorage.getItem('my_pedidos_programado'));
        this.borarPedidosterminados();
        this.borarPedidosEspecialterminados();
      }

      // this.ocultar_mensajeros_inactivos()



    }, 6000);
    // para pedidos especial
    // para pedidos
    this.getPedidos();
    this.getMensajeros().subscribe(
      mensajero => {
        this.my_mensajero = mensajero;
        this.getMensajeroBloqueado();
      });
    this.getMensajerosEspecial().subscribe(
      mensajero => {
        this.my_mensajero_especial = mensajero;
        this.todos_mensajero_especial = mensajero;
        this.getMensajeroEspecialBloqueado();
      });
    this.getUsuarios().subscribe(
      usuario => {
        this.usuarios = usuario;
      });
    this.getEmpresas().subscribe(
      empresa => {
        this.usuario_empresas = empresa;
      });

    this.getF();
  }
  fff: any;
  getF() {
    console.log(this.listaMensajerosF[0].F);
  }


  // aqui selecciono el tipo de mensajero que quiero ver segun su estado
  getMensajeroSegunEstado(estado: String) {
    switch (estado) {
      case 'verificar':
        this.mensajero_ver = this.mensajero_especial_verificar;
        break;
      case 'activo':
        this.mensajero_ver = this.mensajero_especial_activo;
        break;
      case 'bloqueado':
        this.mensajero_ver = this.my_mensajero_especial_bloqueado;
        break;
      case 'nuevo':
        this.mensajero_ver = this.mensajero_especial_nuevo;
        break;
    }
  }
  // aqui selecciono el tipo de mensajero que quiero ver segun su estado
  getMensajeroMotoSegunEstado(estado: String) {
    switch (estado) {
      case 'verificar':
        this.mensajero_moto_ver = this.mensajero_verificar;
        break;
      case 'activo':
        this.mensajero_moto_ver = this.mensajero_activo;
        break;
      case 'bloqueado':
        this.mensajero_moto_ver = this.mensajero_bloqueado_moto;
        break;
      case 'nuevo':
        this.mensajero_moto_ver = this.mensajero_nuevo;
        break;
        case 'verificado':
        this.mensajero_moto_ver = this.mensajero_verificado_moto;
        break;
    }
  }
  // codigo para gestionar la base de datos de los servicios
  filtraServiciosPorFecha() {

    this.pedidos_filtrados_por_fecha = [];
    this.valor_total = 0;
    this.total_convenios = 0;
    this.servicios_de_convenios = 0;

    let i;
    const longitud = this.all_pedidos.length;
    let fecha_del_servicio;
    const fecha_inicial = new Date(this.bsRangeValue[0]);
    const fecha_final = new Date(this.bsRangeValue[1]);
    this.servicios_cancelados = 0;
    this.servicios_terminados = 0;


    for (i = 0; i < longitud; i++) {

      if (this.all_pedidos[i].estado_pedido === 'terminado') {



        const array = Array.from(this.all_pedidos[i].fecha_pedido);
        let dia;
        let mes;
        let año;
        if (array[1] === '-') {
          dia = array[0].toString();
          if (array[3] === '-') {
            mes = array[2].toString();
            año = array[4].toString() + array[5].toString() + array[6].toString() + array[7].toString();
          } else {
            mes = array[3].toString() + array[4].toString();
            año = array[6].toString() + array[7].toString() + array[8].toString() + array[9].toString();
          }
        } else if (array[4] === '-') {
          dia = array[0].toString() + array[1].toString();
          mes = array[3].toString();
          año = array[5].toString() + array[6].toString() + array[7].toString() + array[8].toString();
        } else {
          dia = array[0].toString() + array[1].toString();
          mes = array[3].toString() + array[4].toString();
          año = array[6].toString() + array[7].toString() + array[8].toString() + array[9].toString();
        }

        const fecha = mes.toString() + '-' + dia.toString() + '-' + año.toString();

        fecha_del_servicio = new Date(fecha);
        if (fecha_del_servicio.getTime() >= fecha_inicial.getTime() && fecha_del_servicio.getTime() <= fecha_final.getTime()) {

          this.pedidos_filtrados_por_fecha.push(this.all_pedidos[i]);
          this.servicios_terminados += 1;

        }
      } else if (this.all_pedidos[i].estado_pedido === 'cancelado') {
        // esto es para contar los servicios cancelados en esas fechas
        const array = Array.from(this.all_pedidos[i].fecha_pedido);
        let dia;
        let mes;
        let año;
        if (array[1] === '-') {
          dia = array[0].toString();
          if (array[3] === '-') {
            mes = array[2].toString();
            año = array[4].toString() + array[5].toString() + array[6].toString() + array[7].toString();
          } else {
            mes = array[3].toString() + array[4].toString();
            año = array[6].toString() + array[7].toString() + array[8].toString() + array[9].toString();
          }
        } else if (array[4] === '-') {
          dia = array[0].toString() + array[1].toString();
          mes = array[3].toString();
          año = array[5].toString() + array[6].toString() + array[7].toString() + array[8].toString();
        } else {
          dia = array[0].toString() + array[1].toString();
          mes = array[3].toString() + array[4].toString();
          año = array[6].toString() + array[7].toString() + array[8].toString() + array[9].toString();
        }

        const fecha = mes.toString() + '-' + dia.toString() + '-' + año.toString();

        fecha_del_servicio = new Date(fecha);
        if (fecha_del_servicio.getTime() >= fecha_inicial.getTime() && fecha_del_servicio.getTime() <= fecha_final.getTime()) {
          this.servicios_cancelados += 1;

        }


      }
    }
    // a partir de aqui empezamos el filtro de los servicios hechos por cada codigo

    let y = 0;
    const totalservicios = this.pedidos_filtrados_por_fecha.length;
    let m = 0;
    const totalmensajeros = this.my_mensajero_especial.length;
    let contador = 0;
    let saldo = 0;
    this.array_servicios = [];


    for (m = 0; m < totalmensajeros; m++) {
      contador = 0;
      this.servicios_de_convenios = 0;
      // this.my_mensajero_especial[m];
      for (y = 0; y < totalservicios; y++) {
        if (this.my_mensajero_especial[m].placa === this.pedidos_filtrados_por_fecha[y].placa) {


          if (this.pedidos_filtrados_por_fecha[y].convenio) {
            this.servicios_de_convenios++;
          } else {
            contador++;
          }



        }

      }
      if (contador > 0) {
        saldo = contador * 500;
        this.valor_total = this.valor_total + saldo;
        this.total_convenios += this.servicios_de_convenios;
        this.servicios_por_mensajero.placa = this.my_mensajero_especial[m].placa;
        this.servicios_por_mensajero.servicios = contador;
        this.servicios_por_mensajero.convenios = this.servicios_de_convenios;
        this.servicios_por_mensajero.saldo = saldo;
        this.array_servicios.push(this.servicios_por_mensajero);
        this.servicios_por_mensajero = { placa: null, servicios: null, saldo: null, convenios: null };
      }


    }

  }
  gettodosespeciales() {
    const pedido = 'pedido_especial';
    this.getTodosLosPedidos(pedido).subscribe(
      todos_pedidos => {
        this.all_pedidos = todos_pedidos;
      }
    );
  }

  verAgregarEmpresa(n) {
    if (n != undefined || n != null) {
      this.empresa = n;
      this.editar_empresa = true;
    }
    this.agregar_empresa = true;
  }

  // codigo para la animacion de la imagen
  rotate() {
    this.state = (this.state === 'default' ? 'rotated' : 'default');
  }

  rotateDer() {
    this.state = (this.state === 'default' ? 'rotated_der' : 'default');
  }

  ngOnInit() {
    this.msgService.getPermission();
    this.msgService.receiveMessage();
    this.message = this.msgService.currentMessage;
    this.serviceAut.usuario = this.afAuth.authState;
    this.serviceAut.usuario.subscribe(authState => {
      this.email_admin = authState.email;
      if (this.email_admin === 'soporte_motos@mensajeroapp.com') {
        this.mensajeros_motos = true;
      } else if (this.email_admin === 'soporte_carros@mensajeroapp.com') {
        this.mensajeros_carros = true;
      } else if (this.email_admin === 'carolina.bravo@mensajeroapp.com') {
        this.mensajeros_carros = true;
        this.mensajeros_motos = true;
        this.tesorera = true;
      }
      console.log(authState.email);

    });
    this.all_pedidos = this.getPedidos();

  }
  agregarValor() {
    this.tarifa_completa = 0;
    const porciento = this.tarifa_mensajero * 0.1;
    this.tarifa_completa = this.tarifa_mensajero + porciento;
    this.pedido.valor_pedido = this.tarifa_completa;
    console.log(this.tarifa_completa);
  }
  buscarFecha() {
    this.tablafiltrada = [];
    const longitud = this.all_pedidos.length;
    console.log(longitud);
    let i;
    for (i = 0; i < longitud; i++) {
      if (this.all_pedidos[i].fecha_pedido.indexOf(this.filtrofecha) > -1) {
        // evaluamos si el servicio esta cancelado de borra del arreglo s
        // sino lo agregamos a la tabla.
        if (this.all_pedidos[i].estado_pedido === 'terminado') {
          this.tablafiltrada.unshift(this.all_pedidos[i]);
        } else {
          this.all_pedidos.splice(i, 1);
          i = i - 1;
        }
      }
    }
  }
  verTodos() {
    this.tablafiltrada = this.all_pedidos;
  }


  login() {
    let email: string, pass: string;
    console.log(this.textEmail, this.textPass);
    if (this.textEmail === 'soporte_motos@mensajeroapp.com' || this.textEmail === 'soporte_carros@mensajeroapp.com' ||
      this.textEmail === 'carolina.bravo@mensajeroapp.com') {

      this.serviceAut.login(this.textEmail, this.textPass)
        .then((datos) => {
          console.log(datos);
          console.log(this.textEmail, this.textPass);
          this.toast('Ok', 'Sesion iniciada...');
          this.sesioncerrada = false;
        })
        .catch((error) => {
          console.log(error);
          console.log(email, pass);
          this.toast('Fail', 'ha ocurrido un error intentalo mas tarde...');
        });

    } else {
      this.toast('Fail', 'El email ingresado no está autorizado');
    }
  }

  cerrarSesion() {
    this.serviceAut.logout()
      .then((datos) => {
        this.sesioncerrada = false;
        this.mensajeros_carros = false;
        this.mensajeros_motos = false;
        this.tesorera = false;
      })
      .catch((error) => {
        console.log(error);
        this.toast('Fail', 'ha ocurrido un error intentalo mas tarde...');
      });
  }
  borarPedidosterminados() {
    this.my_pedidos_programado = [];
    let i;
    const longitud = this.my_pedidos.length;


    if (longitud > 0) {

      for (i = 0; i < longitud; i++) {
        if (this.my_pedidos[i] != undefined) {
          if (this.my_pedidos[i].estado_pedido === 'cancelado') {
            this.my_pedidos.splice(i, 1);
            i = i - 1;
          } else if (this.my_pedidos[i].estado_pedido === 'terminado') {
            this.my_pedidos.splice(i, 1);
            i = i - 1;
          } else if (this.my_pedidos[i].estado_pedido === 'programado') {
            this.my_pedidos_programado.unshift(this.my_pedidos[i]);
            this.my_pedidos.splice(i, 1);
            i = i - 1;
          }
        }

      }
    }


  }
  borarPedidosEspecialterminados() {
    let i;
    const longitud = this.my_pedidos_carro.length;


    if (longitud > 0) {

      for (i = 0; i < longitud; i++) {
        if (this.my_pedidos_carro[i] != undefined) {
          if (this.my_pedidos_carro[i].estado_pedido === 'cancelado') {
            this.my_pedidos_carro.splice(i, 1);
            i = i - 1;
          } else if (this.my_pedidos_carro[i].estado_pedido === 'terminado') {
            this.my_pedidos_carro.splice(i, 1);
            i = i - 1;
          }
        }
      }
    }
  }
  // el siguiente codigo es para que los moviles que están inactivos no se muestren para asignar a servicios
  ocultar_mensajeros_inactivos() {
    let i;
    const longitud = this.my_mensajero_especial.length;
    // this.getMensajeroEspecialBloqueado()

    if (longitud > 0) {

      for (i = 0; i < longitud; i++) {
        if (this.my_mensajero_especial[i].estado === 'bloqueado') {
          this.my_mensajero_especial.splice(i, 1);
          i = i - 1;
        }
      }
    }
  }
  getPedidos() {
    return this.db.list('gerente/admin/pedido', ref => ref.limitToLast(20).orderByKey())
      .valueChanges().subscribe(
        pedido => {
          this.my_pedidos = pedido;
        });
  }
  getTodosLosPedidos(pedido) {
    return this.db.list('gerente/admin/' + pedido).valueChanges();
  }
  // para traer los pedidos de

  getPedidosEspecial(max) {
    return this.db.list('gerente/admin/pedido_especial', ref => ref.limitToLast(max).orderByKey())
      .valueChanges().subscribe(
        pedido => {
          this.my_pedidos_carro = pedido;
        });
  }

  getMensajeros() {
    return this.db.list('gerente/admin/mensajero').valueChanges();
  }
  getMensajerosEspecial() {
    return this.db.list<any>('gerente/admin/mensajero_especial/').valueChanges();
  }
  getUsuarios() {
    return this.db.list('gerente/admin/usuario').valueChanges();
  }

  getEmpresas() {
    return this.db.list('gerente/admin/usuario_empresa').valueChanges();
  }
  getMensajerosConectados() {
    return this.db.list<any>('gerente/admin/mensajero_especial_conectado/').valueChanges().subscribe(
      mensajero => {
        this.mensajero_especial_conectado = mensajero;
      });
  }

  getMensajerosMotoConectados() {
    return this.db.list<any>('gerente/admin/mensajero_conectado/').valueChanges().subscribe(
      mensajero => {
        this.mensajero_conectado = mensajero;
      });
  }

  ver_ubicacion_mensajero(mensajero) {
    this.lat_mensajero = mensajero.lat_dir_ini;
    this.lng_mensajero = mensajero.lgn_dir_ini;
    this.lat = mensajero.lat_dir_ini;
    this.lng = mensajero.lgn_dir_ini;
  }

  CargarUsuarios() {
    this.getUsuarios().subscribe(
      usuarios => {
        this.todos_los_usuarios = usuarios;
      });
  }
  getMensajeroEspecialBloqueado() {
    this.my_mensajero_especial_bloqueado = [],
      this.mensajero_especial_activo = [];
    this.mensajero_especial_verificar = [];
    let i;
    const longitud = this.my_mensajero_especial.length;
    if (longitud > 0) {

      for (i = 0; i < longitud; i++) {
        if (this.my_mensajero_especial[i].estado === 'bloqueado') {
          // aqui verificamos que no agregue los que ya estan agregados para no duplicar registros
          let j;
          const longitudbloqueados = this.my_mensajero_especial_bloqueado.length;
          for (j = 0; j < longitudbloqueados; j++) {
            if (this.my_mensajero_especial[i].codigo === this.my_mensajero_especial_bloqueado[j].codigo) {
              this.my_mensajero_especial_bloqueado.splice(j, 1);
              j = j - 1;
            }
          }
          this.my_mensajero_especial_bloqueado.push(this.my_mensajero_especial[i]);
        } else if (this.my_mensajero_especial[i].estado === 'activo') {
          let p;
          const longitudactivos = this.mensajero_especial_activo.length;
          for (p = 0; p < longitudactivos; p++) {
            if (this.my_mensajero_especial[i].codigo === this.mensajero_especial_activo[p].codigo) {
              this.mensajero_especial_activo.splice(p, 1);
              p = p - 1;
            }
          }
          this.mensajero_especial_activo.push(this.my_mensajero_especial[i]);
        } else if (this.my_mensajero_especial[i].estado === 'verificar') {
          let t;
          const longitud_verificar = this.mensajero_especial_verificar.length;
          for (t = 0; t < longitud_verificar; t++) {
            if (this.my_mensajero_especial[i].codigo === this.mensajero_especial_verificar[t].codigo) {
              this.mensajero_especial_verificar.splice(t, 1);
              t = t - 1;
            }
          }
          this.mensajero_especial_verificar.push(this.my_mensajero_especial[i]);
        } else if (this.my_mensajero_especial[i].estado === 'subir_imagenes') {
          let t;
          const longitud_verificar = this.mensajero_especial_nuevo.length;
          for (t = 0; t < longitud_verificar; t++) {
            if (this.my_mensajero_especial[i].codigo === this.mensajero_especial_nuevo[t].codigo) {
              this.mensajero_especial_nuevo.splice(t, 1);
              t = t - 1;
            }
          }
          this.mensajero_especial_nuevo.push(this.my_mensajero_especial[i]);
        }
      }
    }
  }
  getMensajeroBloqueado() {
    let i;
    const longitud = this.my_mensajero.length;
    if (longitud > 0) {

      for (i = 0; i < longitud; i++) {
        if (this.my_mensajero[i].estado === 'bloqueado') {
          // aqui verificamos que no agregue los que ya estan agregados para no duplicar registros
          let j;
          const longitudbloqueados = this.mensajero_bloqueado_moto.length;
          for (j = 0; j < longitudbloqueados; j++) {
            if (this.my_mensajero[i].codigo === this.mensajero_bloqueado_moto[j].codigo) {
              this.mensajero_bloqueado_moto.splice(j, 1);
              j = j - 1;
            }
          }
          this.mensajero_bloqueado_moto.push(this.my_mensajero[i]);
        } else if (this.my_mensajero[i].estado === 'activo') {
          let p;
          const longitudactivos = this.mensajero_activo.length;
          for (p = 0; p < longitudactivos; p++) {
            if (this.my_mensajero[i].codigo === this.mensajero_activo[p].codigo) {
              this.mensajero_activo.splice(p, 1);
              p = p - 1;
            }
          }
          this.mensajero_activo.push(this.my_mensajero[i]);
        } else if (this.my_mensajero[i].estado === 'verificar') {
          let t;
          const longitud_verificar = this.mensajero_verificar.length;
          for (t = 0; t < longitud_verificar; t++) {
            if (this.my_mensajero[i].codigo === this.mensajero_verificar[t].codigo) {
              this.mensajero_verificar.splice(t, 1);
              t = t - 1;
            }
          }
          this.mensajero_verificar.push(this.my_mensajero[i]);
        } else if (this.my_mensajero[i].estado === 'subir_imagenes') {
          let t;
          const longitud_verificar = this.mensajero_nuevo.length;
          for (t = 0; t < longitud_verificar; t++) {
            if (this.my_mensajero[i].codigo === this.mensajero_nuevo[t].codigo) {
              this.mensajero_nuevo.splice(t, 1);
              t = t - 1;
            }
          }
          this.mensajero_nuevo.push(this.my_mensajero[i]);
        } else if (this.my_mensajero[i].estado === 'verificado') {
          let t;
          const longitud_verificado = this.mensajero_verificado_moto.length;
          for (t = 0; t < longitud_verificado; t++) {
            if (this.my_mensajero[i].codigo === this.mensajero_verificado_moto[t].codigo) {
              this.mensajero_verificado_moto.splice(t, 1);
              t = t - 1;
            }
          }
          this.mensajero_verificado_moto.push(this.my_mensajero[i]);
        }
      }
    }
  }
  getCodigoNuevoMensajero() {
    let i;
    const longitud = this.my_mensajero_especial.length;
    let hay_retirados = false;
    for (i = 0; i < longitud; i++) {
      if (this.my_mensajero_especial[i].estado === 'retirado') {
        this.mensajero_especial.codigo = this.my_mensajero_especial[i].codigo;
        hay_retirados = true;
      }
      if (hay_retirados) {
        i = longitud;
      } else {
        const codigo = parseInt(this.my_mensajero_especial[i].codigo, 10) + 1;
        this.mensajero_especial.codigo = codigo.toString();
      }
    }

    this.mensajero_especial.urlFoto = 'movil_' + this.mensajero_especial.codigo + '.jpg';
    this.mensajero_especial.calificacion = 5;

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

  todoMayuscula(e) {
    e.value = e.value.toUpperCase();
  }

  crearEmpresa(empresa) {
    if (empresa.nombre == undefined) {
      this.toast('Fail', 'debe agregar un nombre');
    } else if (empresa.telefono == undefined) {
      this.toast('Fail', 'debe agregar un telefono');
    } else {
      if (this.editar_empresa) {
        this.db.database.ref('gerente/admin/usuario_empresa/' + this.empresa.id_usuario).set(empresa);
        this.agregar_empresa = false;
      } else {
        this.empresa.id_usuario = this.db.database.ref('gerente/admin/usuario_empresa').push(empresa).key;
        this.db.database.ref('gerente/admin/usuario_empresa/' + this.empresa.id_usuario).set(empresa);
        this.toast('Ok', 'Empresa creada !');
      }

      empresa = {
        id_usuario: null, nombre: null, direccion_empresa: null, es_empresa: true, telefono: null, email: null,
        token: null
      };

    }
  }
  // tslint:disable-next-line:member-ordering
  UsuarioNuevo = { id_usuario: null, id_auth: null, nombre: null, telefono: null };
  // tslint:disable-next-line:member-ordering
  pedido_especial = {
    id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
    dir_final: null, estado_pedido: null, valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
    long_dir_inicial: null, convenio: null, canal: null, tipo_servicio: null, placa: null, token: null, calificacion: null
  };
  // tslint:disable-next-line:member-ordering
  empresa = {
    id_usuario: null, nombre: null, direccion_empresa: null, es_empresa: true, telefono: null, email: null,
    token: null
  };
  // tslint:disable-next-line:member-ordering
  pedido = {
    id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
    dir_final: null, tipo_pedido: null, tipo_servicio: null, estado_pedido: null, forma_de_pago: null,
    valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
    long_dir_inicial: null, servicio_empresa: false, cuantos_mensajeros: 1, condicion: null
  };
  // tslint:disable-next-line:member-ordering
  pedidoProgramado = {
    id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, hora_pedido: null, dir_inicial: null,
    tipo_pedido: null, estado_pedido: null, forma_de_pago: null,
    valor_pedido: null, comentario: null, codigo_mensajero: null
  };
  // tslint:disable-next-line:member-ordering
  mensajero = {
    id_mensajero: null, codigo: null, telefono: null, nombre: null, urlFoto: null, placa: null,
    calificacion: null, estado: null, fecha_seguro: null, modelo_vehiculo: null,
    marca: null, color: null, birth_day: null
  };

  // tslint:disable-next-line:member-ordering
  mensajero_especial = {
    id_mensajero: null, codigo: null, telefono: null, nombre: null,
    urlFoto: null, placa: null, calificacion: null, estado: null, fecha_seguro: null,
    modelo_vehiculo: null, marca: null, color: null, birth_day: null
  };

  // tslint:disable-next-line:member-ordering
  allpedidos = {
    id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
    dir_final: null, tipo_pedido: null, estado_pedido: null, forma_de_pago: null,
    valor_pedido: null, comentario: null, codigo_mensajero: null
  };


  cancelar() {
    this.servicios_por_mensajero = { placa: null, servicios: null, saldo: null, convenios: null };
    this.show_form_mensajeros = false;
    this.pedido = {
      id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
      dir_final: null, tipo_pedido: null, tipo_servicio: null, estado_pedido: null, forma_de_pago: null,
      valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
      long_dir_inicial: null, servicio_empresa: false, cuantos_mensajeros: 1, condicion: null
    };
    this.mensajero = {
      id_mensajero: null, codigo: null, telefono: null, nombre: null, urlFoto: null, placa: null,
      calificacion: null, estado: null, fecha_seguro: null, modelo_vehiculo: null,
      marca: null, color: null, birth_day: null
    };
    this.pedidoProgramado = {
      id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, hora_pedido: null, dir_inicial: null,
      tipo_pedido: null, estado_pedido: null, forma_de_pago: null,
      valor_pedido: null, comentario: null, codigo_mensajero: null
    };
    this.mensajero_especial = {
      id_mensajero: null, codigo: null, telefono: null, nombre: null, urlFoto: null,
      placa: null, calificacion: null, estado: null, fecha_seguro: null,
      modelo_vehiculo: null, marca: null, color: null, birth_day: null
    };
    this.pedido_especial = {
      id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
      dir_final: null, estado_pedido: null, valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
      long_dir_inicial: null, convenio: null, canal: null, tipo_servicio: null, placa: null, token: null, calificacion: null
    };
    this.UsuarioNuevo = { id_usuario: null, id_auth: null, nombre: null, telefono: null };
    this.filtroPorPlaca = [];
    this.filteredList = [];
    this.nombre_escrito = '';
    this.empresa = {
      id_usuario: null, nombre: null, direccion_empresa: null, es_empresa: true, telefono: null, email: null,
      token: null
    }
    this.agregar_empresa = false;
    this.nombre_escrito = '';
    this.F_escrito = '';
  }
  editarPedido() {
    // esto se hace para que se cambie el estado y se asigne si se le asignó un mensajero
    if (this.pedido.estado_pedido === 'programado' || this.pedido.estado_pedido === 'sin_movil_asignado') {
      if (this.pedido.codigo_mensajero !== 'asignar movil') {
        if (this.pedido.valor_pedido === 0) {
          this.toast('Fail', 'debes asignar una valor al pedido');
        } else {
          this.pedido.estado_pedido = 'en_curso';
          this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
            this.pedido);
        }

      }
    } else if (this.pedido.estado_pedido === 'cancelado' || this.pedido.estado_pedido === 'terminado') {

      this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
        this.pedido);
      this.my_pedidos.forEach((pedido, i) => {
        if (pedido.id_pedido === this.pedido.id_pedido) {
          this.my_pedidos.splice(i, 1);
        }
      });
    }
    localStorage.setItem('my_pedidos', JSON.stringify(this.my_pedidos));
  }

  editarPedidoProgramado() {
    // esto se hace para que se cambie el estado y se asigne si se le asignó un mensajero
    if (this.pedidoProgramado.estado_pedido === 'pte_reporte') {
      if (this.pedidoProgramado.codigo_mensajero === 'asignar movil') {
        this.toast('Fail', 'debes asignar un mensajero');
      } else {

        this.db.database.ref('gerente/admin/pedido/' + this.pedidoProgramado.id_pedido).set(
          this.pedido);
      }

    } else if (this.pedidoProgramado.estado_pedido === 'cancelado' || this.pedidoProgramado.estado_pedido === 'terminado') {

      this.db.database.ref('gerente/admin/pedido/' + this.pedidoProgramado.id_pedido).set(
        this.pedidoProgramado);
      this.my_pedidos_programado.forEach((pedido, i) => {
        if (pedido.id_pedido === this.pedidoProgramado.id_pedido) {
          this.my_pedidos_programado.splice(i, 1);
        }
      });
    }
    localStorage.setItem('my_pedidos', JSON.stringify(this.my_pedidos));
  }
  crearMensajero() {
    if (this.tesorera === true) {
      if (this.mensajero.codigo !== null) {
        if (this.mensajero.fecha_seguro != undefined) {
          if (this.mensajero.birth_day != undefined) {
            if (this.mensajero.placa != undefined) {

              this.mensajero.fecha_seguro = this.crearFecha(new Date(this.mensajero.fecha_seguro));
              this.mensajero.birth_day = this.crearFecha(new Date(this.mensajero.birth_day));
              const ref = this.db.database.ref('gerente/admin/mensajero/' + this.mensajero.codigo);
              ref.set(this.mensajero).then(() =>
                this.toast('Ok', 'Guardado Correctamente')).catch(error =>
                  console.log('error en registro', error));
              this.my_mensajero = this.getMensajeros();
            } else {
              this.toast('Fail', 'placa vacio');
            }
          } else {
            this.toast('Fail', 'fecha cumpleaños vacio');
          }
        } else {
          this.toast('Fail', 'fecha seguro vacio');
        }

      } else {
        console.log('mensajero null');
        this.toast('Fail', 'seleccione un mensajero');
      }
    } else {
      this.toast('Fail', 'El usuario no está autorizado');
    }

    this.show_form_mensajeros = false;

    this.mensajero = {
      id_mensajero: null, codigo: null, telefono: null, nombre: null, urlFoto: null, placa: null,
      calificacion: null, estado: null, fecha_seguro: null, modelo_vehiculo: null,
      marca: null, color: null, birth_day: null
    };
  }

  crearFecha(fecha: Date) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();

    const nuevafecha: string = año + '/' + (mes + 1) + '/' + dia;
    return nuevafecha;
  }
  crearMensajeroEspecial() {
    if (this.tesorera === true) {
      if (this.mensajero_especial.codigo !== null) {
        if (this.mensajero_especial.fecha_seguro != undefined) {
          if (this.mensajero_especial.birth_day != undefined) {
            if (this.mensajero_especial.placa != undefined) {

              this.mensajero_especial.fecha_seguro = this.crearFecha(new Date(this.mensajero_especial.fecha_seguro));
              this.mensajero_especial.birth_day = this.crearFecha(new Date(this.mensajero_especial.birth_day));
              const ref = this.db.database.ref('gerente/admin/mensajero_especial/' + this.mensajero_especial.codigo);
              ref.set(this.mensajero_especial).then(() =>
                this.toast('Ok', 'Guardado Correctamente')).catch(error =>
                  console.log('error en registro', error));
              this.my_mensajero_especial = this.getMensajerosEspecial();
              this.getMensajeroEspecialBloqueado();
            } else {
              this.toast('Fail', 'placa vacio');
            }
          } else {
            this.toast('Fail', 'fecha cumpleaños vacio');
          }
        } else {
          this.toast('Fail', 'fecha seguro vacio');
        }

      } else {
        console.log('menmsajero null');
        this.toast('Fail', 'seleccione un mensajero');
      }
    } else {
      this.toast('Fail', 'El usuario no está autorizado');
    }

    this.show_form_mensajeros = false;

    this.mensajero_especial = {
      id_mensajero: null, codigo: null, telefono: null, nombre: null, urlFoto: null, placa: null,
      calificacion: null, estado: null, fecha_seguro: null, modelo_vehiculo: null,
      marca: null, color: null, birth_day: null
    };

  }


  private getDismissReason(reason: any): string {

    if (reason === ModalDismissReasons.ESC) {
      this.cancelar()
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  // para la ventana emergente que muestra el detalle de el pedido de carros
  verPedido_carro(my_pedido_carro, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido_especial = my_pedido_carro;
  }
  // ver ventana para agregar servicio nuevo
  verNuevo_Servicio_Moto(modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido = {
      id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
      dir_final: null, tipo_pedido: null, tipo_servicio: null, estado_pedido: null, forma_de_pago: null,
      valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
      long_dir_inicial: null, servicio_empresa: false, cuantos_mensajeros: 1, condicion: null
    };
  }

  toast(result, mensaje) {
    switch (result) {
      case 'Ok':
        this.toastr.success(mensaje, 'OK!')
        break;
      case 'Fail':
        this.toastr.error(mensaje, 'Error!')
        break;
    }

  }
  // metodo para guardar el servicio nuevo agregado desde central
    servicio_empresa = 'Si';
    tipo_pedido = 'Domicilios';
  agregar_servicio_moto(nombre, telefono, direccion) {

    if (this.nombre_escrito.length < 3) {
      this.toast('Fail', 'debe escribir un nombre');
      return;
    } else if (this.pedido.telefono == undefined || this.pedido.telefono.length < 7) {
      this.toast('Fail', 'debe escribir un telefono válido');
    } else if (this.pedido.dir_inicial == undefined || this.pedido.dir_inicial.length < 5) {
      this.toast('Fail', 'debe escribir una direccion');
    } else {
      let contador = 0;
      let tiempo;
      if (this.pedido.cuantos_mensajeros === 1) {
        tiempo = 100;
      } else {
        tiempo = 3000;
      }


      let interval = setInterval(() => {

        if (this.servicio_empresa === 'Si') {
          this.pedido.servicio_empresa = true;
          if (this.pedido.nombre == undefined) {
            this.pedido.nombre = this.nombre_escrito;
          }
          this.pedido.cuantos_mensajeros = +this.pedido.cuantos_mensajeros;
        } else {
          this.pedido.servicio_empresa = false;
          this.pedido.cuantos_mensajeros = 1;
          if (this.pedido.nombre == undefined) {
            this.pedido.nombre = this.nombre_escrito;
          }
        }

        switch (this.tipo_pedido) {
          case 'Domicilios':
            this.pedido.tipo_pedido = 'solicitud_rapida';
            this.pedido.valor_pedido = 2000;
            break;
          case 'Encomiendas':
            this.pedido.tipo_pedido = 'encomiendas';
            this.pedido.valor_pedido = 2000;
            break;
          case 'Pagos de Facturas-Tramites':
            this.pedido.tipo_pedido = 'facturas_tramites';
            this.pedido.valor_pedido = 5000;
            break;
          case 'Compras':
            this.pedido.tipo_pedido = 'compras_domicilios';
            this.pedido.valor_pedido = 3000;
            break;
        }
        const fecha = new Date();
        const ahora = '' + fecha.getDate() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getFullYear() + ' '
          + fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds();
        this.pedido.estado_pedido = 'sin_movil_asignado';
        this.pedido.codigo_mensajero = 'asignar movil';
        this.pedido.tipo_servicio = 'servicio_mensajero';
        this.pedido.fecha_pedido = ahora;
        this.pedido.telefono = this.pedido.telefono;

        const id_pedido = this.db.database.ref('gerente/admin/pedido').push().key;
        // agregamos el id del pedido para poderlo modificar
        this.pedido.id_pedido = id_pedido;
        this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(this.pedido)
        contador++
        if (contador == this.pedido.cuantos_mensajeros) {
          clearInterval(interval)
          this.pedido = {
            id_pedido: null, id_usuario: null, nombre: null, telefono: null, fecha_pedido: null, dir_inicial: null,
            dir_final: null, tipo_pedido: null, tipo_servicio: null, estado_pedido: null, forma_de_pago: null,
            valor_pedido: null, comentario: null, codigo_mensajero: null, lat_dir_inicial: null,
            long_dir_inicial: null, servicio_empresa: false, cuantos_mensajeros: 1, condicion: null
          }
          this.filtroPorPlaca = [];
          this.filteredList = [];
          this.nombre_escrito = '';
          this.toast('Ok', 'Servicio agregado correctamente');

        }
      }, tiempo);
    }
  }


  // metodo para buscar usuario mientras escribe el numero
  buscar_por_nombre() {

    switch (this.servicio_empresa) {
      case 'Si':
        const total_empresas = this.usuario_empresas.length;
        this.pedido.servicio_empresa = true;
        let j;
        let nombre_e;
        this.filteredList = [];
        for (j = 0; j < total_empresas; j++) {
          nombre_e = this.usuario_empresas[j].nombre;
          if (nombre_e != undefined) {
            this.tiene_letras = '';
            if (this.nombre_escrito.length > 2 && nombre_e.toLowerCase().indexOf(this.nombre_escrito.toLowerCase()) > -1) {
              this.pedido.dir_inicial = this.usuario_empresas[j].direccion_empresa;
              this.filteredList.push(this.usuario_empresas[j].nombre);
            }
          }

        }
        break;
      case 'No':
        const total_usuarios = this.usuarios.length;
        console.log(this.usuarios.length);
        let i;
        let nombre_u;
        this.pedido.servicio_empresa = false;
        this.filteredList = [];
        for (i = 0; i < total_usuarios; i++) {
          nombre_u = this.usuarios[i].nombre;
          if (nombre_u != undefined) {
            this.tiene_letras = '';
            if (this.nombre_escrito.length > 2 && nombre_u.toLowerCase().indexOf(this.nombre_escrito) > -1) {
              this.filteredList.push(this.usuarios[i].nombre);
            }
          }
        }
        break;
    }

  }
  // para que no se escriban letras en el telefono
  isDigit(str) {
    return str && !/[^\d]/.test(str);
  }

  buscar_por_placa() {

    this.placa_seleccionadaa = '';
    this.mensajero_bloqueado = false;
    this.alert_sin_placa = true;

    this.filtroPorPlaca = [];
    const total_mensajeros = this.my_mensajero.length;
    let i;
    let numero_placa;

    for (i = 0; i < total_mensajeros; i++) {
      numero_placa = this.my_mensajero[i].placa;
      this.total_placas.push(this.my_mensajero[i].placa);
      if (this.placa_escrita.length > 1 && numero_placa.indexOf(this.placa_escrita.toUpperCase()) > -1) {
        console.log(this.my_mensajero[i].placa);
        if (this.my_mensajero[i].placa !== 'sinplaca') {
          this.filtroPorPlaca.push([this.my_mensajero[i].placa, this.my_mensajero[i].estado]);
        }
      }
    }
  }

  filtro_F = [];
  F_escrito;
  f_seleccionado;
  mensajero_unregistered = false;
  buscar_por_F() {

    this.mensajero_unregistered = false;
    this.f_seleccionado = '';
    this.placa_escrita = '';
    this.filtro_F = [];
    const total_F = this.listaMensajerosF.length;
    let i;
    let numero_F;

    for (i = 0; i < total_F; i++) {
      numero_F = this.listaMensajerosF[i].F;
      if (numero_F.indexOf(this.F_escrito.toUpperCase()) > -1) {
        console.log(this.listaMensajerosF[i].placa);
        this.filtro_F.push([this.listaMensajerosF[i].F, this.listaMensajerosF[i].placa]);
      }
    }
  }

  placa_seleccionada(item) {

    this.filtroPorPlaca = [];
    const total_mensajeros = this.my_mensajero.length;
    let i;
    let numero_placa;

    for (i = 0; i < total_mensajeros; i++) {
      numero_placa = this.my_mensajero[i].placa;
      if (item[0] === numero_placa) {

        if (item[1] === 'activo') {
          this.placa_seleccionadaa = this.my_mensajero[i].placa;
          this.mensajero_bloqueado = this.mensajero_bloqueado = false;
          this.pedido.codigo_mensajero = this.my_mensajero[i].codigo;
          this.placa_escrita = this.my_mensajero[i].placa;
          console.log(this.my_mensajero[i].nombre);
          this.alert_sin_placa = false;
        } else {
          this.mensajero_bloqueado = true;
          this.placa_seleccionadaa = '';
          this.placa_escrita = '';
          this.alert_sin_placa = false;
        }
      }
    }
  }

  F_seleccionado(item) {

    this.filtro_F = [];
    const total_mensajeros = this.my_mensajero.length;
    let i;
    let numero_placa;
    if (item[1] === 'NO_REGISTRADO') {
      this.mensajero_unregistered = true;
      this.F_escrito = '';
    } else {
      this.F_escrito = item[0];
      for (i = 0; i < total_mensajeros; i++) {
        numero_placa = this.my_mensajero[i].placa;
        if (item[1] === numero_placa) {

          if (this.my_mensajero[i].estado === 'activo') {
            this.mensajero_bloqueado = false;
            this.mensajero_bloqueado = false;
            this.placa_seleccionadaa = this.my_mensajero[i].placa;
            this.mensajero_bloqueado = this.mensajero_bloqueado = false;
            this.pedido.codigo_mensajero = this.my_mensajero[i].codigo;
            this.placa_escrita = this.my_mensajero[i].placa;
            console.log(this.my_mensajero[i].nombre);
            this.alert_sin_placa = false;
          } else {
            this.mensajero_bloqueado = true;
            this.placa_seleccionadaa = '';
            this.placa_escrita = '';
            this.alert_sin_placa = false;
          }
        }
      }
    }

  }




  nombre_seleccionado(item) {
    this.filteredList = [];
    let total_usuarios;
    let usuario;
    switch (this.servicio_empresa) {
      case 'Si':
        total_usuarios = this.usuario_empresas.length;
        usuario = this.usuario_empresas;
        break;
      case 'No':
        total_usuarios = this.usuarios.length;
        usuario = this.usuarios;
    }

    let i;
    let nombre_empresa;
    ;
    for (i = 0; i < total_usuarios; i++) {
      nombre_empresa = usuario[i].nombre;
      if (item === nombre_empresa) {
        this.pedido.nombre = usuario[i].nombre;
        this.pedido.id_usuario = usuario[i].id_usuario;
        this.pedido.telefono = usuario[i].telefono;
        this.nombre_escrito = usuario[i].nombre;
        this.usuario_existe = true;
        if (this.servicio_empresa) {
          this.pedido.dir_inicial = usuario[i].direccion_empresa;
        }
        console.log(usuario[i].nombre);
      }
    }
  }
  verServiciosMensajero(my_placa, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    const long = this.pedidos_filtrados_por_fecha.length;
    let i = 0;
    this.detalles_servicios = [];
    this.total_a_pagar = 0;

    for (i = 0; i < long; i++) {

      if (this.pedidos_filtrados_por_fecha[i].placa === my_placa.placa) {
        this.detalles_servicios.push(this.pedidos_filtrados_por_fecha[i]);
      }
    }
    this.servicio_descargar = this.detalles_servicios;

    const m = this.detalles_servicios.length;
    let j;

    for (j = 0; j < m; j++) {
      if (this.detalles_servicios[j].convenio) {

      } else {
        this.total_a_pagar += 500;
      }
    }
  }

  convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
      return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
      ctr = 0;
      keys.forEach(function (key) {
        if (ctr > 0) {
          result += columnDelimiter;
        }

        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  downloadCSV() {
    let data, filename, link;
    let csv = this.convertArrayOfObjectsToCSV({
      data: this.servicio_descargar
    });
    if (csv == null) {
      return;
    }
    filename = 'Servicios.csv';
    console.log(csv);

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }


    link = document.createElement('A');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  ver_pedido_especial(my_pedido_carro, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido_especial = my_pedido_carro;
  }
  // para la ventana emergente que muestra el detalle de el pedido de motos
  verPedido(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    if (my_pedido.estado_pedido === 'sin_movil_asignado') {
      this.estadodelpedido = true;
    } else {
      this.estadodelpedido = false;
    }
    this.pedido = my_pedido;
  }
  verPedidoProgramado(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    if (my_pedido.estado_pedido === 'pte_movil' || my_pedido.estado_pedido === 'programado') {
      this.estadodelpedido = true;
    } else {
      this.estadodelpedido = false;
    }
    this.pedidoProgramado = my_pedido;
  }
  verpedidofiltrado(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.valor_porcentaje = (my_pedido.valor_pedido - (my_pedido.valor_pedido / 1.2));
    this.pedido = my_pedido;
  }
  veragregartarifa(modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.tarifa_mensajero = 0;
    this.tarifa_completa = 0;
  }
  verMensajero(my_mensajero) {
    this.mensajero = my_mensajero;
    this.show_form_mensajeros = true;
    this.editar = true;
    this.agregar = false;
  }
  verMensajeroEspecial(my_mensajero_especial, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.mensajero_especial = my_mensajero_especial;
    this.show_form_mensajeros = true;
    this.editar_especial = true;
    this.agregar_especial = false;
  }
  verMensajeroDelServicio(codigo, modalq) {
    console.log('ver mensajero', codigo);
    let i = 0;
    for (i = 0; i < this.my_mensajero_especial.length; i++) {
      if (this.my_mensajero_especial[i].codigo === codigo) {
        this.mensajero_especial = this.my_mensajero_especial[i];
        this.verMensajeroEspecial(this.mensajero_especial, modalq);
      }
    }
  }
  verMensajeroDelServicioMoto(codigo, modalq) {
    let i = 0;
    for (i = 0; i < this.my_mensajero.length; i++) {
      if (this.my_mensajero[i].codigo === codigo) {
        this.mensajero = this.my_mensajero[i];
        this.verMensajeroEspecial(this.mensajero, modalq);
      }
    }
  }
  verAgregarMensajeroEspecial(modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.show_form_mensajeros = true;
    this.editar_especial = true;
    this.agregar_especial = false;
    this.mensajero_especial = {
      id_mensajero: null, codigo: null, telefono: null, nombre: null,
      urlFoto: null, placa: null, calificacion: null, estado: null, fecha_seguro: null,
      modelo_vehiculo: null, marca: null, color: null, birth_day: null
    };
    this.getCodigoNuevoMensajero();
  }

  VerifivarMensajeroEspecial(mensajero) {
    this.mensajero_especial = mensajero;
    this.urlimgPerfil = this.storage.ref('mensajeros/mensajero_carro/movil_' + this.mensajero_especial.codigo).child('foto_perfil')
      .getDownloadURL();
  }

  VerifivarMensajero(mensajero) {
    this.mensajero = mensajero;
    this.urlimgPerfil = this.storage.ref('mensajeros/mensajero_moto/movil_' + this.mensajero.codigo).child('foto_perfil')
      .getDownloadURL();
  }

  abrirPanelAgregar() {
    this.show_form_mensajeros = true;
    this.agregar_especial = true;
    this.agregar = true;
  }
  cancelar_servicio_especial() {
    console.log('cancelar');
    this.pedido_especial.estado_pedido = 'cancelado';
    this.db.database.ref('gerente/admin/pedido_especial/' + this.pedido_especial.id_pedido).set(
      this.pedido_especial);
  }

  cancelar_servicio_moto() {
    this.pedido.estado_pedido = 'cancelado';
    this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
      this.pedido);
  }
  liberar_servicio_moto() {
    this.pedido.estado_pedido = 'en_curso';
    this.pedido.codigo_mensajero = '7gJSMJsZNjRUDoOzKnO0GefE0ND3';
    this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
      this.pedido);
  }
  syncronizar() {
    this.my_pedido_offline.forEach((record) => {
      this.db.database.ref('gerente/admin/pedido/' + record.pedido.id_pedido).set(
        record.pedido);
      this.my_pedido_offline.shift();
    });
    this.my_pedidos = this.getPedidos();
  }
  ver_asignar_mensajero(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido = my_pedido;
  }

  asignar_mensajero() {

    if (this.placa_seleccionadaa !== '' && this.alert_sin_placa === false) {
      this.pedido.estado_pedido = 'en_curso';
      this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
        this.pedido);
      this.placa_escrita = '';
      this.placa_seleccionadaa = '';
      this.alert_sin_placa = false;
      this.mensajero_bloqueado = false;
      this.mensajero_unregistered = false;
      this.F_escrito = '';
      this.toast('Ok', 'Mensajero asignado');
    } else {
      this.toast('Fail', 'No seleccionó ningún mensajero');
    }

  }

  borrar_servicio_especial() {
    this.db.database.ref('gerente/admin/pedido_especial/' + this.pedido_especial.id_pedido).remove();
    this.toast('Ok', 'servicio borrado');
  }

  ver_borrar_servicio_especial(my_pedido_especial, modal) {
    this.pedido_especial = my_pedido_especial;
    if (this.pedido_especial.estado_pedido === 'cancelado' || this.pedido_especial.estado_pedido === 'sin_movil_asignado') {
      this.modalService.open(modal).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } else {
      this.toast('Fail', 'No se puede borrar un servicio que no sea nulo o cancelado');
    }
  }

  terminar_servicio_moto(my_servicio) {
    this.pedido = my_servicio;
    if (this.pedido.codigo_mensajero === 'asignar movil') {
      this.toast('Fail', 'No hay mensajero asignar para terminar éste servicio');
    } else {
      this.pedido.estado_pedido = 'terminado';
      this.db.database.ref('gerente/admin/pedido/' + this.pedido.id_pedido).set(
        this.pedido);
    }
  }
  ver_cancelar_servicio_especial(my_pedido_especial, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido_especial = my_pedido_especial;
  }
  ver_cancelar_servicio_moto(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido = my_pedido;
  }
  ver_liberar_servicio_moto(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.pedido = my_pedido;
  }
  ver_mapa(my_pedido, modal) {
    this.modalService.open(modal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    if (my_pedido.tipo_servicio === 'servicio_mensajero_especial') {
      this.pedido_especial = my_pedido;
      this.lat = this.pedido_especial.lat_dir_inicial;
      this.lng = this.pedido_especial.long_dir_inicial;
    } else {
      this.pedido = my_pedido;
      this.lat = this.pedido.lat_dir_inicial;
      this.lng = this.pedido.long_dir_inicial;
    }

  }

  // Ésta funcion es para descargar la URL de la foto seleccionada
  public DescargarFoto(foto: string, id_mensajero: string, modal): void {
    this.foto_seleccionada = foto;
    this.urlimg = this.storage.ref('mensajeros/mensajero_carro/movil_' + id_mensajero).child(foto)
      .getDownloadURL();
    console.log('URL IMAGEN', this.urlimg);
    this.modalService.open(modal, { size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  // Ésta funcion es para descargar la URL de la foto seleccionada
  public DescargarFotoMoto(foto: string, id_mensajero: string, modal): void {
    this.foto_seleccionada = foto;
    this.urlimg = this.storage.ref('mensajeros/mensajero_moto/movil_' + id_mensajero).child(foto)
      .getDownloadURL();
    this.modalService.open(modal, { size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  public CambiarFoto(id_mensajero: string) {
    switch (this.foto_seleccionada) {
      case 'foto_licencia1':
        this.foto_seleccionada = 'foto_licencia2';
        break;
      case 'foto_licencia2':
        this.foto_seleccionada = 'foto_licencia1';
        break;
      case 'foto_seguro1':
        this.foto_seleccionada = 'foto_seguro2';
        break;
      case 'foto_seguro2':
        this.foto_seleccionada = 'foto_seguro1';
        break;
    }
    this.urlimg = this.storage.ref('mensajeros/mensajero_carro/movil_' + id_mensajero).child(this.foto_seleccionada)
      .getDownloadURL();
  }
  public CambiarFotoMoto(id_mensajero: string) {
    switch (this.foto_seleccionada) {
      case 'foto_licencia1':
        this.foto_seleccionada = 'foto_licencia2';
        break;
      case 'foto_licencia2':
        this.foto_seleccionada = 'foto_licencia1';
        break;
      case 'foto_seguro1':
        this.foto_seleccionada = 'foto_seguro2';
        break;
      case 'foto_seguro2':
        this.foto_seleccionada = 'foto_seguro1';
        break;
    }
    this.urlimg = this.storage.ref('mensajeros/mensajero_moto/movil_' + id_mensajero).child(this.foto_seleccionada)
      .getDownloadURL();
  }
}




