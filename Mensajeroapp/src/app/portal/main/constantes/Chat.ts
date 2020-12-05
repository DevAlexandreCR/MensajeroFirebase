export class Chat {

    private mensaje: String
    private mensajeSender: String // id de la empresa o usuario que envia
    private nombreSender: String // nombre de la empresa o usuario que envia
    private mensajeTiempo: number
    public static CLAVE_CHAT = 'clave'
    public static TEXT_MENSAJE = 'text'
    public static TOKEN_DESTINATARIO = 'token_usuario'

    constructor(mensaje: String, mensajeSender: String, nombreSender: String){
        this.mensaje = mensaje
        this.mensajeSender = mensajeSender
        this.nombreSender = nombreSender
        this.mensajeTiempo = new Date().getTime()
    }

}