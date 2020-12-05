import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Empresa } from '../constantes/empresa';
import { Usuario } from '../constantes/usuario';
import { Oferta } from '../constantes/oferta';


@Injectable()

export class CrudUsuarioService {

  empresasRef: AngularFireList<any>;
  empresaRef: AngularFireObject<any>;
  usuariosRef: AngularFireList<any>;
  usuarioRef: AngularFireObject<any>;
  empresa_seleccionada: Empresa

  constructor(private db: AngularFireDatabase) { }

  agregarEmpresa( empresa: Empresa) {
    return this.db.object('gerente/admin/usuario_empresa/' + empresa.id_usuario).set(empresa);
  }

  agregarUsuario( usuario: Usuario) {
    return this.db.object('gerente/admin/usuario/' + usuario.id_usuario).set(usuario);
  }

  getListaEmpresas() {
    this.empresasRef = this.db.list('gerente/admin/usuario_empresa/');
    return this.empresasRef;
  }

  getListaUsuarios() {
    this.usuariosRef = this.db.list('gerente/admin/usuario/');
    return this.usuariosRef;
  }

  getEmpresa( id: string) {
    this.empresaRef = this.db.object('gerente/admin/usuario_empresa/' + id);
    return this.empresaRef;
  }

  getUsuario( id: string) {
    this.usuarioRef = this.db.object('gerente/admin/usuario/' + id);
    return this.usuarioRef;
  }

  updateEmpresa(empresa: Empresa) {
   return this.db.object('gerente/admin/usuario_empresa/' + empresa.id_usuario).update(empresa);
  }

  updateUsuario(usuario: Usuario) {
    return this.db.object('gerente/admin/usuario/' + usuario.id_usuario).update(usuario);
  }

  getListaServiciosDeEmpresa() {
    return this.db.list('gerente/admin/usuario_empresa/pedido/');
  }

  getListaServiciosEspecialesDeEmpresa() {
    return this.db.list('gerente/admin/usuario_empresa/pedido_especial/');
  }

  getServicioDeEmpresa (id_pedido: string) {
    return this.db.object('gerente/admin/usuario_empresa/pedido/' + id_pedido);
  }

  getServicioEspecialDeEmpresa(id_pedido: string) {
    return this.db.object('gerente/admin/usuario_empresa/pedido_especial/' + id_pedido);
  }

  getListaServiciosDeUsuario() {
    return this.db.list('gerente/admin/usuario/pedido/');
  }

  getListaServiciosEspecialesDeUsuario() {
    return this.db.list('gerente/admin/usuario/pedido_especial/');
  }

  getServicioDeUsuario (id_pedido: string) {
    return this.db.object('gerente/admin/usuario/pedido/' + id_pedido);
  }

  getServicioEspecialDeUsuario(id_pedido: string) {
    return this.db.object('gerente/admin/usuario_empresa/pedido/' + id_pedido);
  }

  agregarOferta(id_empresa: string, oferta: Oferta) {
    oferta.id_oferta = this.db.list(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/`).push(oferta).key;
   return this.db.object(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/${oferta.id_oferta}`).set(oferta).then(() => {
      return oferta.id_oferta
    })
  }

  getOfertas(id_empresa: string) {
    return this.db.list(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/`)
  }

  deleteOferta(id_empresa: string, oferta: Oferta) {
    return this.db.list(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/${oferta.id_oferta}`).remove()
  }

  updateOferta(id_empresa: string, oferta: Oferta) {
   return this.db.object(`gerente/admin/usuario_empresa/${id_empresa}/ofertas/${oferta.id_oferta}`).update(oferta)
  }
}
