import { Domicilio } from './Domicilio';

export class Pedido {
    date: number
    calificacion: number
    codigo_mensajero: string
    comentario: string
    cuantos_mensajeros: number
    dir_inicial: string
    dir_final: string
    estado_pedido: string
    fecha_pedido: string
    forma_de_pago: string
    id_pedido: string
    id_usuario: string
    lat_dir_final: number
    lat_dir_inicial: number
    long_dir_final: number
    long_dir_inicial: number
    nombre: string
    servicio_empresa: boolean
    telefono: string
    // ejemplo servicio tramites, encomiendas
    tipo_pedido: string
    // ejemplo mensajero (motos) o mensajero especial (carros)
    tipo_servicio: string
    token: string
    token_conductor: string
    valor_pedido: number
    condicion: string
    domicilio: Domicilio
    ciudad: string

    constructor () {
    }

}
