import { Empresa } from './empresa';
import { Chat } from './Chat';

export class Domicilio {
    date: number
    comentario: string
    dir_entrega: string
    dir_compra: string
    estado: string // va a tener estados de pendiente , aceptado, despachado
    fecha_domicilio: string
    forma_de_pago: string //  por ahora efectivo luego ya se aplcará pago con tarjeta
    id_domicilio: string
    id_usuario: string
    lat_dir_entrega: number
    lat_dir_compra: number
    long_dir_entrega: number
    long_dir_compra: number
    nombre: string
    telefono: string
    token: string
    token_empresa: string
    valor_pedido: number // el valor de la compra 
    valor_domicilio: number // el valor de el viaje de dentrega
    empresa: Empresa
    descripcion: string
    ciudad: string
    codigo_mensajero: string
    chat = new Array<Chat>()
    constructor () {
    }

}