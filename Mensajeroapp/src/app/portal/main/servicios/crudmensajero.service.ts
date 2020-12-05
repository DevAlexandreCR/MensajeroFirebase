import { Injectable } from '@angular/core';
import { Mensajero } from '../constantes/mensajero';
import { AngularFireList, AngularFireObject, AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class CrudmensajeroService {

  constructor( private db: AngularFireDatabase) { }



  mensajerosRef: AngularFireList<any>;
  mensajeroRef: AngularFireObject<any>;
  mensajeroConectadoRef: AngularFireObject<any>;
  mensajero: Mensajero;

  getListaMensajeros() {
    return this.db.list('gerente/admin/mensajero/');
  }

  getMensajero( codigo: string) {
    this.mensajeroRef = this.db.object('gerente/admin/mensajero/' + codigo);
    return this.mensajeroRef;
  }

  getMensajeroConectado( codigo: string) {
    this.mensajeroConectadoRef = this.db.object('gerente/admin/mensajero_conectado/' + codigo);
    return this.mensajeroConectadoRef;
  }

  updateMensajero(mensajero: Mensajero) {
   return this.db.object('gerente/admin/mensajero/' + mensajero.codigo).update(mensajero);
  }

  getListaMensajerosEspeciales() {
    return this.db.list('gerente/admin/mensajero_especial/');
  }

  getMensajeroEspecial( codigo: string) {
    this.mensajeroRef = this.db.object('gerente/admin/mensajero_especial/' + codigo);
    return this.mensajeroRef;
  }

  getMensajeroEspecialConectado( codigo: string) {
    this.mensajeroConectadoRef = this.db.object('gerente/admin/mensajero_especial_conectado/' + codigo);
    return this.mensajeroConectadoRef;
  }

  updateMensajeroEspecial(mensajero: Mensajero) {
   return this.db.object('gerente/admin/mensajero_especial/' + mensajero.codigo).update(mensajero);
  }

}
