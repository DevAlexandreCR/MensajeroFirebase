'use strict'

class Pedido {

    date = 0
    calificacion = 5
    codigo_mensajero = ''
    comentario = ''
    cuantos_mensajeros = 1
    dir_inicial = ''
    dir_final = ''
    estado_pedido = ''
    fecha_pedido = ''
    forma_de_pago = ''
    id_pedido = ''
    id_usuario = ''
    lat_dir_final = 0
    lat_dir_inicial = 0
    long_dir_final = 0
    long_dir_inicial = 0
    nombre = ''
    servicio_empresa = 0
    telefono = ''
    // ejemplo servicio tramites, encomiendas
    tipo_pedido = ''
    // ejemplo mensajero (motos) o mensajero especial (carros)
    tipo_servicio = ''
    token = ''
    token_conductor = ''
    valor_pedido = 0
    condicion = ''
    ciudad = ''

    constructor(){}

}

module.exports = Pedido