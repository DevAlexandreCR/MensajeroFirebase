'use strict'

class servicioMensajeroGo {

    // el saldo del conductor si es ppositivo qquierre decir que debe a la app
    // es decir es posotivo para mensajero, en cambio si es negativo quiere decir
    // que mensajero le debe al conductor. por lo tanto todas las comisiones se deben restar

    constructor(admin){
        this.admin = admin
    }

    verificarReferidos(id_pedido){
        this.admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}/`)
                    .once('value', (datasnapshot)=>{
                        if(datasnapshot.val() != null) {
                            let pedido = datasnapshot.val()
                            return this.admin.database().ref(`gerente/admin/usuario/${pedido.id_usuario}/`)
                                    .once('value', (datasnapsh)=>{
                                        if(datasnapsh.val() != null) {
                                            var usuario = datasnapsh.val()
                                            if(usuario.refiere != undefined) {
                                                return this.admin.database().ref(`gerente/admin/mensajero_especial/${usuario.refiere}/`)
                                                .once('value', (snapsh)=>{
                                                    if(snapsh.val() != null) {
                                                        var mensajero = snapsh.val()
                                                        const saldo_antiguo = mensajero.saldo
                                                        const comision = this.calcularComisionReferido(pedido.valor_pedido)
                                                        const nuevo_saldo = saldo_antiguo - comision
                                                        return this.admin.database().ref(`gerente/admin/mensajero_especial/${mensajero.codigo}/saldo`)
                                                                    .set(nuevo_saldo).then(()=>{
                                                                        console.log(`saldo_antiguo: ${saldo_antiguo} saldo nuevo: ${nuevo_saldo}`)
                                                                        var payload = {
                                                                            notification: {
                                                                                title: 'Socio socio!',
                                                                                icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                                                body: `Acabas de recibir $${comision} porque un usuario tuyo terminó un viaje! sigue recomendando y ganarás mucho más...`,
                                                                                sound: "default"
                                                                            }
                                                                        };
                                                                        this.enviarMensaje(mensajero.token,payload)
                                                                    })
                                                    } else {
                                                        console.log(`no es referido por mensajero`)
                                                    }
                                                
                                                })
                                                }
                                            }
                                    
                                    })
                        }
                    })
    }

    calcularComisionReferido(valor_viaje){
        return valor_viaje * 0.04
    }

    enviarMensaje(token , payloads) {
        this.admin.messaging().sendToDevice(token, payloads).then(function(response) {
            // See the MessagingTopicResponse reference documentation for the
            // contents of response.
            console.log("Successfully sent message:", response);
        }).catch(function(error) {
            console.log("Error sending message:", error);
        });

}

}

module.exports = servicioMensajeroGo