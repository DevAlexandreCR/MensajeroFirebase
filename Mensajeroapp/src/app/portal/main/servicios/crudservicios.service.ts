import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Pedido } from '../constantes/pedido';
import { Domicilio } from '../constantes/Domicilio';
import { Chat } from '../constantes/Chat';


@Injectable()

export class CrudserviciosService {

  serviciosRef: AngularFireList<any>;
  servicioRef: AngularFireObject<any>;
  PedidosEnCurso: [Pedido];
  pedidos: any;

  constructor(private db: AngularFireDatabase, private functions: AngularFireFunctions) {
   }

   getListaServicios() {
    return this.db.list('gerente/admin/pedido/', ref => ref.limitToLast(100).orderByKey());
  }

  getListaServiciosEspeciales() {
    return this.db.list('gerente/admin/pedido_especial/', ref => ref.limitToLast(100).orderByKey());
  }

  getServicio( id: string) {
    this.servicioRef = this.db.object('gerente/admin/pedido/' + id);
    return this.servicioRef;
  }

  getServicioEspecial( id: string) {
    this.servicioRef = this.db.object('gerente/admin/pedido_especial/' + id);
    return this.servicioRef;
  }

  updateServicio(pedido: Pedido) {
   return this.db.object('gerente/admin/pedido/' + pedido.id_pedido).update(pedido);
  }

  updateServicioEspecial(pedido: Pedido) {
    return this.db.object('gerente/admin/pedido_especial/' + pedido.id_pedido).update(pedido);
   }

  setServicio(pedido: Pedido) {
    pedido.id_pedido = this.db.list('gerente/admin/pedido/').push(pedido).key;
    return this.db.object('gerente/admin/pedido/' + pedido.id_pedido).set(pedido);
  }

  agregarDomicilio(domicilio: Domicilio) {
    domicilio.id_domicilio = this.db.list('gerente/admin/domicilio/').push(domicilio).key;
    return this.db.object('gerente/admin/domicilio/' + domicilio.id_domicilio).set(domicilio);
  }

  updateDomicilio(domicilio: Domicilio) {
    return this.db.object('gerente/admin/domicilio/' + domicilio.id_domicilio).update(domicilio);
  }

  getDomicilios() {
    return this.db.list('gerente/admin/domicilio/', ref => ref.limitToLast(100).orderByKey());
  }

  getHistoricoDomicilios( tipoUsuario: string, id: string) {
    return this.db.list(`gerente/admin/${tipoUsuario}/${id}/domicilio/`, ref => ref.limitToLast(20).orderByKey());
  }

  getDomiciliosFiltroFecha(id: string, desde: number, hasta: number, tipo_usuario: string) {
    return this.db.list(`gerente/admin/${tipo_usuario}/${id}/domicilio`, ref => ref.orderByChild('date').startAt(desde).endAt(hasta))
  }

  getPedidosFiltroFecha(id: string, tipoServicio: string, desde: number, hasta: number, tipo_usuario:string) {
    return this.db.list(`gerente/admin/${tipo_usuario}/${id}/${tipoServicio}`, ref => ref.orderByChild('date').startAt(desde).endAt(hasta))
  }

  setServicioEspecial(pedido: Pedido) {
    pedido.id_pedido = this.db.list('gerente/admin/pedido_especial/').push(pedido).key;
    return this.db.object('gerente/admin/pedido_especial/' + pedido.id_pedido).set(pedido);
  }

  getHistoricoServicios(tipoServicio: string, id: string, tipoUsuario: string ) {
    return this.db.list(`gerente/admin/${tipoUsuario}/${id}/${tipoServicio}`, ref => ref.limitToLast(20));
  }


  enviarMensajeDomicilio(domicilio: Domicilio, mensaje: String){
    let chat = new Chat(mensaje, domicilio.empresa.id_usuario, domicilio.empresa.nombre)
    console.log(domicilio.token)
    this.db.list(`gerente/admin/domicilio/${domicilio.id_domicilio}/chat/`).push(chat)
    let data = {
      clave: 'mensaje_chat',
      text: mensaje,
      token_usuario: domicilio.token,
      id_pedido: domicilio.id_domicilio,
      tipo_servicio: 'domicilio'
    };
    let chatServicio = this.functions.functions.httpsCallable('ChatServicio')
    chatServicio(data).then((result)=>{
      console.log("result function ",result)
    }).catch((err)=>{
      console.log("error function ",err.message)
    })
  }
}
