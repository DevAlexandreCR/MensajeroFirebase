'use strict'

import { Oferta } from './oferta';
import { Domicilio } from './Domicilio';

export class Empresa {
    $key: string
    nombre: string
    es_empresa: boolean
    email: string
    telefono: string
    saldo: number
    token: string
    direccion_empresa: string
    id_usuario: string
    categoria: string
    url_foto_perfil: string
    url_foto_carta: string
    url_foto_portada: string
    latitud: number
    longitud: number
    ofertas: Array<Oferta>
    horarios: Horarios  
    descripcion: string
    ciudad: string
    placeID: string
    domicilio: Array<Domicilio>

    constructor() { }


}
