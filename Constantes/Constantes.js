'use strict'

class Constantes {
    // categoria de negocios
    CATEGORIA = 'categoria'
    RESTAURANTE = 'restaurante'
    FARMACIA = 'farmacia'
    FLORISTERIA = 'floristeria'
    LICORES = 'licores'
    BARDISCOTECA = 'bar-discoteca'
    OTRO = 'otro'
    SUPERMERCADO = 'supermercado'

    POPAYAN = 'Popayán' // ciudad por defecto
    CIUDAD = 'Ciudad'
    NEIVA = 'Neiva'
    PASTO = 'Pasto'
    
        // Constantes perfil empresa

        NOMBRE_EMPRESA = 'nombre'
        ES_EMPRESA = 'es_empresa' // boolean 
        DIRECCION_EMPRESA = 'direccion_empresa'
        ID_EMPRESA = 'id_usuario'
        HORARIOS = 'horarios'
        ABRE = 'abre'
        CIERRA = 'cierra'
        TOKEN_EMPRESA = 'token'
        LATITUD_EMPRESA = "latitud"
        LONGITUD_EMPRESA ="longitud"
        TELEFONO_EMPRESA = 'telefono'
        EMAIL_EMPRESA = 'email'
        URL_FOTO_PORTADA = 'url_foto_portada'
        URL_FOTO_PERFIL = 'url_foto_perfil'
        URL_FOTO_CARTA = 'url_foto_carta'
        SALDO_EMPRESA = 'saldo'
        OFERTAS = 'ofertas' // nodo para agregar ofertas o promociones
        CALIFICACION_EMPRESA = 'calificacion'
        DIAS_DE_LA_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado','domingo']
        HORAS = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
        MINUTOS = ['00','10','20','30','40','50']
        CERRADO = 'cerrado'
        ABIERTO = 'abierto'
        // ofertas 
        TITULO_OFERTA = 'titulo'
        DESCRIPCION_OFERTA = 'descripcion'
        PRECIO = 'precio'
        URL_FOTO_OFERTA = 'url_foto_oferta'
        ID_OFERTA = 'id_oferta'
        FECHA_OFERTA = 'fecha_oferta' 

        // palabras o variables constantes
        MENSAJEROBIKE = 'mensajero'
        MENSAJEROGO = 'mensajero_especial'
        SERVICIO_MOTO = 'servicio_mensajero'
        SERVICIO_CARRO = 'servicio_mensajero_especial'
        USUARIO_EMPRESA = 'usuario_empresa'
        USUARIO = 'usuario'
        PEDIDO = 'pedido'
        PEDIDO_ESPECIAL = 'pedido_especial'
        DOMICILIO = 'domicilio'

        // estados de un domicilio
        PENDIENTE = 'pendiente' // el servicio está pendiente a que la empresa lo acepte o lo confirme con el cliente
        CONFIRMADO = 'confirmado' // un pedido confirmado es aquel que ya tiene la aprovacion del usuario y el negocio
        DESPACHADO = 'despachado' // es el domicilio que ya salió del negocio
        ENTREGAGO = 'entregado' // el usuario ya recibió su domicilio
        CANCELADO = 'cancelado'
        NO_APLICA = 'N/A'

        // keys domicilio
        FECHA_DOMICILIO = 'fecha_domicilio'

        // referencias a la base de datos
        GERENTE = 'gerente'
        ADMIN = 'admin'
        ID_PEDIDO = 'id_pedido'
        ID_PEDIDO_ESPECIAL ='id_pedido'

        

    constructor() {

    }
}

module.exports = Constantes