export class Constantes {
    // categoria de negocios
    static CATEGORIA = 'categoria'
    static RESTAURANTE = 'restaurante'
    static FARMACIA = 'farmacia'
    static FLORISTERIA = 'floristeria'
    static LICORES = 'licores'
    static BARDISCOTECA = 'bar-discoteca'
    static OTRO = 'otro'
    static SUPERMERCADO = 'supermercado'

    static POPAYAN = 'Popayán' // ciudad por defecto
    static CIUDAD = 'Ciudad'
    static NEIVA = 'Neiva'
    static PASTO = 'Pasto'
    
        // Constantes perfil empresa

        static NOMBRE_EMPRESA = 'nombre'
        static ES_EMPRESA = 'es_empresa' // boolean 
        static DIRECCION_EMPRESA = 'direccion_empresa'
        static ID_EMPRESA = 'id_usuario'
        static HORARIOS = 'horarios'
        static ABRE = 'abre'
        static CIERRA = 'cierra'
        static TOKEN_EMPRESA = 'token'
        static LATITUD_EMPRESA = "latitud"
        static LONGITUD_EMPRESA ="longitud"
        static TELEFONO_EMPRESA = 'telefono'
        static EMAIL_EMPRESA = 'email'
        static URL_FOTO_PORTADA = 'url_foto_portada'
        static URL_FOTO_PERFIL = 'url_foto_perfil'
        static URL_FOTO_CARTA = 'url_foto_carta'
        static SALDO_EMPRESA = 'saldo'
        static OFERTAS = 'ofertas' // nodo para agregar ofertas o promociones
        static CALIFICACION_EMPRESA = 'calificacion'
        static DIAS_DE_LA_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado','domingo']
        static HORAS = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
        static MINUTOS = ['00','10','20','30','40','50']
        static CERRADO = 'cerrado'
        static ABIERTO = 'abierto'
        // ofertas 
        static TITULO_OFERTA = 'titulo'
        static DESCRIPCION_OFERTA = 'descripcion'
        static PRECIO = 'precio'
        static URL_FOTO_OFERTA = 'url_foto_oferta'
        static ID_OFERTA = 'id_oferta'
        static FECHA_OFERTA = 'fecha_oferta' 

        // palabras o variables constantes
        static MENSAJEROBIKE = 'mensajero'
        static MENSAJEROGO = 'mensajero_especial'
        static SERVICIO_MOTO = 'servicio_mensajero'
        static SERVICIO_CARRO = 'servicio_mensajero_especial'
        static USUARIO_EMPRESA = 'usuario_empresa'
        static USUARIO = 'usuario'
        static PEDIDO = 'pedido'
        static PEDIDO_ESPECIAL = 'pedido_especial'
        static DOMICILIO = 'domicilio'

        // estados de un domicilio
        static PENDIENTE = 'pendiente' // el servicio está pendiente a que la empresa lo acepte o lo confirme con el cliente
        static CONFIRMADO = 'confirmado' // un pedido confirmado es aquel que ya tiene la aprovacion del usuario y el negocio
        static DESPACHADO = 'despachado' // es el domicilio que ya salió del negocio
        static ENTREGAGO = 'entregado' // el usuario ya recibió su domicilio
        static CANCELADO = 'cancelado'
        static NO_APLICA = 'N/A'

        // keys domicilio
        static FECHA_DOMICILIO = 'fecha_domicilio'

        

    constructor() {

    }
}