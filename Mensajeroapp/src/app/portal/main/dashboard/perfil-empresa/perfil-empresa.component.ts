import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudUsuarioService } from '../../servicios/crud-usuario.service'
import { finalize, flatMap } from 'rxjs/operators'
import { Observable } from 'rxjs/internal/observable'
import { Empresa } from '../../constantes/empresa';
import { Constantes } from '../../constantes/Constantes';
import { AngularFireDatabase } from '@angular/fire/database'
import { ToastrService } from 'ngx-toastr';
import { AmazingTimePickerService } from 'amazing-time-picker'
import { Oferta } from '../../constantes/oferta';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent implements OnInit {

  // esta es una copia original sin editar por si el usuario edita y luego cancela
  // volver a guardar los combios iniciales
  empresaSinEditar: Empresa
  div_portada: any //para cambiar el background de la portada
  editando: boolean = false // en true aparece el boton de guardar cambios
  foto_perfil: boolean 
  foto_portada: boolean
  src_foto_perfil: any = '../../../../../assets/logo-web.jpg'
  src_foto_portada: any = '../../../../../assets/portada-web.jpg'
  img_carta: any = '../../../../../assets/carta_web.JPG'
  src_imagen_seleccionada = ''
  id_empresa: string
  IMG_PERFIL = 'foto_perfil' // para saber la imagen a editar
  IMG_PORTADA = 'foto_portada' // igual
  IMG_CARTA = 'foto_carta'
  file: File // donde se guarda el archivo de imagen seleccionado
  subiendoImagen: boolean // cuando está en true la barra de progreso aparace y vicebersa
  empresa: Empresa = new Empresa()
  categorias = [Constantes.RESTAURANTE, Constantes.FARMACIA, Constantes.FLORISTERIA, Constantes.SUPERMERCADO, Constantes.LICORES,
    Constantes.OTRO]
  horario: Horarios 
  dias = Constantes.DIAS_DE_LA_SEMANA
  // propiedades para la subida de la imagen
  porcentajeSubida: Observable<Number>
  urlImagen: Observable<string>
  imagenSeleccionada: boolean // para saber si ya se seleccionó una imagen para guardar
  all_ofertas = []
  ofertas: any
  oferta: Oferta = new Oferta()
  modal : NgbModalRef; // para manipular el modal
  editarOferta: boolean = false

  constructor(private router: Router, private modalService: NgbModal, private atp: AmazingTimePickerService, private storage: AngularFireStorage, private toast: ToastrService, private db: AngularFireDatabase, private crudUser: CrudUsuarioService, private authService: AngularFireAuth) { }

  ngOnInit() {
    this.authService.authState.subscribe(authState => {
      this.id_empresa = authState.uid
      this.cargarDatos(authState.uid)
      this.getOfertas(authState.uid)
   });
   this.div_portada = document.getElementById('portada')
  }

  // aqui se previsualiza la imagen a cargar
  imgSeleccionada(e) {
    console.log(e)
    var imageType = /image.*/
    this.file = e.target.files[0]
    if (!this.file.type.match(imageType)) return
    var reader = new FileReader()
    reader.onload = (e: any) =>{
      this.src_imagen_seleccionada = e.target.result
      this.imagenSeleccionada = true // pasamos a true para que se hablilite el boton de guardar
      console.log(this.src_imagen_seleccionada)
    }
    reader.readAsDataURL(this.file)
    
  }

  // abrir el modal para cambiar imagen 
 abrirModalImagen(tipoimagen: string) {
   this.src_imagen_seleccionada = tipoimagen
   this.imagenSeleccionada = false
}

// cancelar el cambio de imagen
cancelarImagenes () {
  this.file = null
  this.urlImagen = null
  this.imagenSeleccionada = false
}

// subir imagen al firebase storage de la empresa
subirImagen (tipoimagen: string, id_empresa, file: File) {
if (file == null || id_empresa == null) {
  this.imagenSeleccionada = false // si no hay una imagen cargada entonces cancela
  console.log(' no se puede subir ')
} else {
  console.log(' subiendo ... ')
  this.subiendoImagen = true
  var pathImagen = `empresas/${id_empresa}/${tipoimagen}`
  const ref = this.storage.ref(pathImagen)
  const taskUpload = this.storage.upload(pathImagen, file )
  this.porcentajeSubida = taskUpload.percentageChanges()
  return taskUpload.snapshotChanges().pipe(finalize(() =>  {
    ref.getDownloadURL().subscribe(urlimg =>{
      this.subiendoImagen = false
      console.log(this.porcentajeSubida)
      this.toast.info('imagen actualizada correctamente');
      if ( tipoimagen === this.IMG_PERFIL ) {
        this.src_foto_perfil = urlimg
        this.router.navigate(['/portal/main/dashboard/perfil-empresa'])
        this.db.object('gerente/admin/usuario_empresa/' + id_empresa + '/url_foto_perfil').set(urlimg)
      } else if (tipoimagen === this.IMG_PORTADA) {
        this.src_foto_portada = urlimg
        this.div_portada.style.backgroundImage = "url(" + this.src_foto_portada + ")"
        this.db.object('gerente/admin/usuario_empresa/' + id_empresa + '/url_foto_portada').set(urlimg)
      } else {
        this.img_carta = urlimg
        this.db.object('gerente/admin/usuario_empresa/' + id_empresa + '/url_foto_carta').set(urlimg)
      }
    })
  })).subscribe()
  this.imagenSeleccionada = false
}
}

// llenar el ui con los datos de la empresa
cargarDatos(id: string) {
  this.crudUser.getEmpresa(id).valueChanges().subscribe(emp => {
    this.empresa = emp
    this.actualizarUI(this.empresa)
  });
}

actualizarUI(empresa: Empresa) {
  if (empresa.horarios != undefined) {
    this.horario = {
      lunes: {abre: empresa.horarios.lunes.abre, cierra: empresa.horarios.lunes.cierra},
      martes: {abre: empresa.horarios.martes.abre, cierra: empresa.horarios.martes.cierra},
      miercoles:{abre: empresa.horarios.miercoles.abre, cierra: empresa.horarios.miercoles.cierra},
      jueves: {abre: empresa.horarios.jueves.abre, cierra: empresa.horarios.jueves.cierra},
      viernes:{abre: empresa.horarios.viernes.abre, cierra: empresa.horarios.viernes.cierra},
      sabado: {abre: empresa.horarios.sabado.abre, cierra: empresa.horarios.sabado.cierra},
      domingo: {abre: empresa.horarios.domingo.abre, cierra: empresa.horarios.domingo.cierra}
    }
  } else {
    this.horario = {
      lunes: {abre:'00:00', cierra:'00:00'},
      martes: {abre:'00:00', cierra:'00:00'},
      miercoles: {abre:'00:00', cierra:'00:00'},
      jueves: {abre:'00:00', cierra:'00:00'},
      viernes: {abre:'00:00', cierra:'00:00'},
      sabado: {abre:'00:00', cierra:'00:00'},
      domingo: {abre:'00:00', cierra:'00:00'}
    }
    empresa.horarios = this.horario
  } 
  this.empresaSinEditar = empresa   
  if (empresa.url_foto_perfil != undefined) {
    this.src_foto_perfil = empresa.url_foto_perfil
    this.foto_perfil = true
  } else {
    this.foto_perfil = false
  }
  if (empresa.url_foto_portada != undefined) {
    this.src_foto_portada = empresa.url_foto_portada
    this.div_portada.style.backgroundImage = "url(" + this.src_foto_portada + ")"
  } else {
    this.foto_portada = false
  }
  if (empresa.url_foto_carta != undefined) {
    this.img_carta = empresa.url_foto_carta
  }
}

// esta funcion abre el time picker y le asigna el horario al día asignado
openTimePicker(dia: string, abre: boolean) {
  const amazingTimePicker = this.atp.open();
  amazingTimePicker.afterClose().subscribe(time => {
    console.log(time, dia, abre);
    switch (dia) {
      case 'lunes':
        if (abre) {
          this.horario.lunes.abre = time
        }else {
          this.horario.lunes.cierra = time
        }
        break
      case 'martes':
        if (abre) {
          this.horario.martes.abre = time
        }else {
          this.horario.martes.cierra = time
        }
        break
      case 'miercoles':
          if (abre) {
            this.horario.miercoles.abre = time
          }else {
            this.horario.miercoles.cierra = time
          }
          break
      case 'jueves':
          if (abre) {
            this.horario.jueves.abre = time
          }else {
            this.horario.jueves.cierra = time
          }
          break
      case 'viernes':
        if (abre) {
          this.horario.viernes.abre = time
        }else {
          this.horario.viernes.cierra = time
        }
        break
      case 'sabado':
        if (abre) {
          this.horario.sabado.abre = time
        }else {
          this.horario.sabado.cierra = time
        }
        break
      case 'domingo':
        if (abre) {
          this.horario.domingo.abre = time
        }else {
          this.horario.domingo.cierra = time
        }
        break
    }
    this.editar()
  });
}

editar() {
  this.editando = true
}

cancelarEdicion() {
  this.editando = false
  this.cargarDatos(this.empresa.id_usuario)
}

// guardar los cambios realizados en el perfil de la empresa
guardarCambios(emp: Empresa) {
  this.editando = false
  this.empresa = emp
  this.empresa.horarios = this.horario
  this.crudUser.updateEmpresa(this.empresa).then(()=>{
   // this.toast.info('datos guardados correctamente')
  })
}

getOfertas(id_empresa: string) {
  this.all_ofertas = []
  this.crudUser.getOfertas(id_empresa).valueChanges().subscribe(ofertaList =>{
    this.ofertas = ofertaList
    for ( let i = 0; i < this.ofertas.length; i++) {
      if (this.ofertas[i] != null) {
        for (let j = 0; j < this.all_ofertas.length; j++) {
          if (this.all_ofertas[j].id_oferta === this.ofertas[i].id_oferta) {
           this.all_ofertas.splice(i);
          }
        }
        this.all_ofertas.push(this.ofertas[i]);
      }
    }
  })
}

guardarOferta(id_empresa: string, file: File, oferta: Oferta) {
  oferta.fecha_oferta = this.getFecha()
  if (this.editarOferta) {
    this.crudUser.updateOferta(id_empresa, oferta)
    if (this.src_imagen_seleccionada !== oferta.url_foto_oferta) {
      var pathImagen = `empresas/${id_empresa}/ofertas/${oferta.id_oferta}`
      const ref = this.storage.ref(pathImagen)
      const taskUpload = this.storage.upload(pathImagen, file )
      this.porcentajeSubida = taskUpload.percentageChanges()
      this.porcentajeSubida = taskUpload.percentageChanges()
      taskUpload.snapshotChanges().pipe(finalize(() =>  {
        ref.getDownloadURL().subscribe(urlimg =>{
          this.subiendoImagen = false
          oferta.url_foto_oferta = urlimg
          console.log(this.porcentajeSubida)
          this.oferta = oferta
          this.toast.info('imagen actualizada correctamente');
          return this.db.object(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/${oferta.id_oferta}/url_foto_oferta`).set(urlimg)
          .then(()=>{
            this.getOfertas(id_empresa)
          })
    
        })
      })).subscribe()
    }
  } else {
    this.crudUser.agregarOferta(id_empresa, oferta).then(id =>{
      console.log(id)
      oferta.id_oferta = id
      var pathImagen = `empresas/${id_empresa}/ofertas/${oferta.id_oferta}`
      this.subiendoImagen = true
      const ref = this.storage.ref(pathImagen)
      const taskUpload = this.storage.upload(pathImagen, file )
      this.porcentajeSubida = taskUpload.percentageChanges()
      this.porcentajeSubida = taskUpload.percentageChanges()
      taskUpload.snapshotChanges().pipe(finalize(() =>  {
        ref.getDownloadURL().subscribe(urlimg =>{
          this.subiendoImagen = false
          oferta.url_foto_oferta = urlimg
          console.log(this.porcentajeSubida)
          this.oferta = oferta
          this.toast.info('imagen actualizada correctamente');
          return this.db.object(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/${id}/url_foto_oferta`).set(urlimg)
          .then(()=>{
            this.getOfertas(id_empresa)
          })
    
        })
      })).subscribe()
    })
  }
  

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
veroferta() {
  console.log(this.oferta)
}

borrarOferta(oferta: Oferta) {
 let borrar =  confirm("¿Desea borrar la oferta?")
 if (borrar) {
   this.crudUser.deleteOferta(this.empresa.id_usuario, oferta).then(()=>{
    this.toast.success("se ha borrado con éxito")
   }).catch((error) =>{
     console.log(error)
     this.toast.error("No se pudo borrar corractamente, error "+ error)
   })
 } else {
   this.toast.info("cancelado")
 }
}

abrirEditarOferta(oferta: Oferta) {
  this.editarOferta = true
  this.oferta = oferta
  this.src_imagen_seleccionada = oferta.url_foto_oferta
}
}