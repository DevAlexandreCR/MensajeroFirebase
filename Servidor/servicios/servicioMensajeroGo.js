
'use strict'
class servicioMensajeroGo {



constructor(admin){
    this.admin = admin
    this.database = admin.database()
    this.request = require('request')
}



// esta funcion envía el servicio al conductor y espera 12 segundos para
// validar si ya fue tomado, si no fue tomado entonces lo reenvia
enviarServicio(mensajeroCarro, id_lista){
    const posicion_en_la_lista = mensajeroCarro.posicion_en_la_lista.toString()
    const id_pedido = mensajeroCarro.id_pedido;
    const token = mensajeroCarro.token;
    var  payload = {
        data: {
            id_pedido: id_pedido,
            posicion_en_la_lista:posicion_en_la_lista,
            id_lista : id_lista.toString()
        }
            };
        var options = {
          priority: "high",
          timeToLive: 10,
          restrictedPackageName: 'mensajero.mensajerogo'
        };
    console.log(`dev enviando servicio a: ${mensajeroCarro.nombre}`);      
  
    return new Promise((res, rej) => {
      this.admin.messaging().sendToDevice(token, payload,options).then(function(response) {
        // See the MessagingTopicResponse reference documentation for the
        // contents of response.
        console.log('empieza tiempo de espera...')
        setTimeout(() => {
          console.log('fin del tiempo de espara')
          res(true)
        },12000)
        console.log("servicio enviado ok:", response);
  }).catch(function(error) {
    rej(error)
    console.log("Error sending message:", error);
  });
    })
  }
  
  // aquí valido si el la lista aun hay mensajeros para enviar
  reenviarServicio(lista, id_lista){
    if(lista.length > 1) {
      if(lista[0].distancia < 1) {
        this.enviarServicio(lista[0], id_lista).then((res) => {
          if(res) {
            this.database.ref(`gerente/admin/pedido_especial/${lista[0].id_pedido}/estado_pedido`).once('value', (snap) => {
              let estado = snap.val()
              if (estado === 'sin_movil_asignado') {
                console.log('no ha cambiado de estado.. volver a enviar al sieguiente')
                lista.shift()
                this.reenviarServicio(lista, id_lista)
              } else {
                console.log('el servicio ya fue tomado')
                this.database.ref(`gerente/admin/mensajeros_especial_env_mensaje/${id_lista}/`).remove().then(()=>{
                  console.log('lista removida por servicio tomado')
                })
              }
            })
          }
        }).catch(err =>{
          console.log(err)
          lista.shift()
          this.reenviarServicio(lista, id_lista)
        })
      } else {
        console.log('mensajero a más de 1 km... liberando servicio '+ lista[0].id_pedido)
        this.database.ref(`gerente/admin/pedido_especial/${lista[0].id_pedido}/liberado`)
                    .set(true) // al liberar el servicio queda visible para todos los mensajeros
                    this.database.ref(`gerente/admin/mensajeros_especial_env_mensaje/${id_lista}/`).remove().then(()=>{
          console.log('lista removida')
        })
      }
    } else {
      console.log('ya no hay más mensajeros... liberando servicio '+lista[0])
      this.database.ref(`gerente/admin/pedido_especial/${lista[0]}/liberado`)
                 .set(true) // al liberar el servicio queda visible para todos los mensajeros
                 this.database.ref(`gerente/admin/mensajeros_especial_env_mensaje/${id_lista}/`).remove().then(()=>{
      console.log('lista removida')
      })
    }
  }
  
  // *************************** Alertas **************************************************
  alertas(snapshot){
    if (snapshot.exists()){
      let alerta = snapshot.val()
      let dif = alerta.tiempo_de_vida;
      if(dif > 0){
      var idInAlerta = setInterval(function(){
          dif -= 1000 
      if(dif <= 0){
        this.database.ref(`gerente/admin/alertas_mapa/`+ alerta.id_alerta).remove().then(() => {
          clearInterval(idInAlerta)
          console.log('alerta borrada')
      })
      }
        },1000)
      }else{
        this.database.ref(`gerente/admin/alertas_mapa/${alerta.id_alerta}`).remove().then(() => {
            console.log('alerta borrada antigua')
        })
      }
    } else {
      return new Error('alerta no encontrada')
    }
  }
  // *************************** Fin Alertas **************************************************


//funcion para terminar servicio, debe recibir los datos de tiempo y distancia para verificar valor del viaje,
//adicionalmente verifica e en el ususario si éste tiene saldos a favor o encontro para hacer la respectiva deduccion del
//valor del viaje y posteriormente envía los datos al conductor al mismo tiempo escribe los valores en el
//usuario y en el conductor para que cada uno tenga su propio registro y verificar su historial
TerminarViajeGo(data){

    const id_usuario = data.id_usuario;
    const codigo_mensajero = data.codigo_mensajero;
    const token = data.token;
    const id_pedido = data.id_pedido;
    const pedido_terminado = "terminado";
  
    //datos que debemos buscar en la base de datos
  
    //si el usuario debe algun viaje puede ser por cancelacion u otro
    var  saldo_pendiente_usuario = 0;
    //si el usuario tiene bonos o saldo a favor
    var descuentos_usuario = 0;
    // el valor que queda despues de terminado el viaje
    var nuevo_descuento_usuario = 0;
    //valor del viaje sin descuentos
    var valor_viaje = 0;
    //valor del viaje después de descuentos
    var valor_cobrar = 0;
  
    return this.admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`).once('value').then(function(tokensSnapshot) {
        if(tokensSnapshot.val()!=null){
            descuentos_usuario = tokensSnapshot.val();
            descuentos_usuario = Math.round(descuentos_usuario);
        }
        //aqui verificamos si el usuario tiene saldo negativo y lo pasamos a saldos pendientes, sino entonces se toma como 
        //saldo a favor o descuentos usuario
        if(descuentos_usuario < 0){
            saldo_pendiente_usuario = descuentos_usuario;
            descuentos_usuario = 0;
        }
  
        this.CalcularViaje(tiempo,distancia);
  
        return this.admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}/valor_pedido`)
        .set(valor_viaje, function(error) {
  
            var pedido;
            if(!error){
                console.log("valor del pedido escrito OK")
                       var descuentos= descuentos_usuario.toString();
                       var viaje=valor_viaje.toString();
                        var cobrar=valor_cobrar.toString();
                        var saldo_usuario= saldo_pendiente_usuario.toString();
                var  payload = {
                    data: {
                        confirmar_valor_viaje:"confirmar_valor_viaje",
                        descuentos_usuario: descuentos,
                        valor_viaje: viaje,
                        valor_cobrar: cobrar,
                        saldo_pendiente_usuario:saldo_usuario 
                    }
                        };
                    var options = {
                      priority: "high",
                      restrictedPackageName: 'mensajero.mensajerogo'
                    };
                
                    return  this.admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                                    // See the MessagingTopicResponse reference documentation for the
                                    // contents of response.
                                    console.log("mensaje chat enviada ok:", response);
                            return this.admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}/estado_pedido`)
                                    .set(pedido_terminado, function(error) {
                                        
                                            console.log("servicio terminado OK");
                                            return this.admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}`).once('value').then(function(dataSnapshot){
                                                pedido = dataSnapshot.val();
                                                pedido.saldo_pendiente_usuario = saldo_pendiente_usuario;
                                                pedido.descuentos_usuario = descuentos_usuario;
                                                console.log("pedido",pedido);
                                                 return this.admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}/pedido_especial/${id_pedido}`)
                                                        .set(pedido, function(error) {
                                                            if(!error){
                                                                console.log("pedido escrito en mensajero OK");
                                                               return this.admin.database().ref(`gerente/admin/usuario/${id_usuario}/pedido_especial/${id_pedido}`)
                                                                    .set(pedido, function(error) {
                                                                        if (!error) {
                                                                            return this.admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}`)
                                                                                .set(pedido, function (error) {
                                                                                    if (!error) {
                                                                                        console.log("pedido escrito en usuario OK")
                                                                                        return this.admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`)
                                                                                            .set(nuevo_descuento_usuario, function (error) {
                                                                                                if (!error) {
                                                                                                    return this.admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`)
                                                                                                        .once('value').then(function (mensajeros) {
                                                                                                            const mensajero = mensajeros.val();
                                                                                                            console.log("nuevo saldo escrito en usuario OK");
                                                                                                            let url = 'https://api.hablame.co/sms/envio/';
                                                                                                            const numero = '57' + pedido.telefono;
                                                                                                            const mensaje = 'Hola ' + pedido.nombre + ', Tu viaje con ' + mensajero.nombre + ' tuvo un valor de ' +
                                                                                                                pedido.valor_pedido + ' Si tienes solicitudes, quejas o felicitaciones escribenos al 3202973621  Att: Equipo Soporte Mensajero';
  
                                                                                                                this.request.post(
                                                                                                                url,
                                                                                                                {
                                                                                                                    form: {
                                                                                                                        cliente: 10012200, //Numero de cliente
                                                                                                                        api: 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                                                                                                                        numero: numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                                                                                                                        sms: mensaje, //Mensaje de texto a enviar
                                                                                                                        fecha: '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                                                                                                                        referencia: 'usuario nuevo mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                                                                                                                    }
                                                                                                                }, function (err, httpResponse, body) {
                                                                                                                   // console.log(" response " + httpResponse)
                                                                                                                    console.log("body "+ body)
                                                                                                                }
                                                                                                            );
  
                                                                                                        });
  
                                                                                                }
                                                                                            });
                                                                                    }
                                                                                });       
                                                                        }
                                                                    });
    
                                                            }
                                                        });
                                            });
                                
                                    });
                                   
                            }).catch(function(error) {
                                console.log("Error sending chat: " + error);
                            });
                
            }else{
                console.log(" error " + error);
            }
        });
    }); 
  
    //valor = (((dist / 1000) * (530 * modificadortarifa)) + (tiempo * (120 * modificadortarifa)) + 1800);
    //if (valor <= 3300) valor = 3300;
  }

CalcularViaje(tiempo,distancia){
  
        console.log("calcularviaje",tiempo + "dist "+distancia);
        var modificador = this.modificadorDeTarifaSegunLaHora(hora_del_dia);
  
        valor_viaje = (((distancia/1000)* (530 * modificador)) + (tiempo * (120 * modificador))+ 1800*modificador);
        valor_viaje = Math.round(valor_viaje);
        valor_viaje = this.redondear(valor_viaje);
  
        //si la tarifa del viaje da menos que 3500 entonces se deja en la minima 3500.
        if(valor_viaje <= 3500){
            valor_viaje = 3500;
        }
        //restamos los descuentos que tenga el usuario al valor del viaje, si el descuento es mayor al valor del viaje
        //entonces el valor del viaje queda en $0 y se resta el valor del viaje al descuento para obtener el nuevo saldo del cliente
        //si el desceunto es menor entonces de deja el nuevo saldo del cliente el $0 y el valor a pagar en el valor del viaje menos el descuento
        valor_cobrar = valor_viaje - descuentos_usuario;
        valor_cobrar = valor_cobrar - saldo_pendiente_usuario;
        valor_cobrar = this.redondear(valor_cobrar);
         if(valor_cobrar < 0){
             valor_cobrar = 0;
             nuevo_descuento_usuario = descuentos_usuario -valor_viaje;
         }
  
    }
  
modificadorDeTarifaSegunLaHora(horadeldia){
        
        var modificadortarifa;
  
        if (horadeldia <= 5 && horadeldia >= 3) {
            modificadortarifa = 1.5;
        } else if( horadeldia >= 21){
            modificadortarifa = 1.2;
        }else{
            modificadortarifa = 1.1;
        }
        console.log("hora del dia",horadeldia + "modificador "+modificadortarifa);
        return modificadortarifa;
    }
  
redondear(value) {
        var resto = value%100;
        if(resto<50){
            value = value-resto;
        }else{
            value = value +(100-resto);
        }
        return value;
    }
}

module.exports = servicioMensajeroGo