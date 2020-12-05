'use strict'

var admin = require("firebase-admin"),
    Constantes = require('./Constantes'),
    Mensajero = require('./Mensajero'),
    Pedido = require('./Pedido'),
    serviceAccount = require("./mensajero-7802b-firebase-adminsdk-z93bh-132adfcfce.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mensajero-7802b.firebaseio.com"
})

var database = admin.database()

    //funcion para calcular la distancia entre dos puntos geograficos
    function getDistancia(lat1,lon1,lat2,lon2){
    rad = function(x) {return x*Math.PI/180;}
    var R = 6378.137; //Radio de la tierra en km
    var dLat = rad( lat2 - lat1 );
    var dLong = rad( lon2 - lon1 );
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    console.log('var d',d);
    return d.toFixed(3); //Retorna tres decimales
}

//funcion para enviar el servicio a un mensajero--------------------------------------------------------

function enviarServicioMoto(mensajeroMoto, id_lista){
    const token = mensajeroMoto.token;
    const posicion_en_la_lista = mensajeroMoto.posicion_en_la_lista.toString()
    const id_pedido = mensajeroMoto.id_pedido;
    console.log(mensajeroMoto.nombre);      

    var  payload = {
    data: {
        id_pedido: id_pedido,
        posicion_en_la_lista:posicion_en_la_lista,
        id_lista : id_lista.toString()
    }
        };
    var options = {
      priority: "high",
      timeToLive: 5,
      restrictedPackageName: 'mensajero.mensajerobike'
    };

  admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                    // See the MessagingTopicResponse reference documentation for the
                    // contents of response.
                    console.log("servicio asignado ok:", response);
                    var espera = 0;
                    var inId = setInterval(function(){
                       database.ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista+`/`+posicion_en_la_lista)
                       .once('value', function(snapshot){
                           if(snapshot.exists()){
                               console.log()
                               espera ++;
                           }else{
                               clearInterval(inId)
                           }
                           console.log(espera)
                           if(espera == 15){
                            admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
                            clearInterval(inId)
                           }
                           
                       })
                    }, 1000)
            }).catch(function(error) {
                console.log("Error sending message:", error);
                admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
            });
}

function enviarServicioEspecial(mensajeroCarro, id_lista){
    const token = mensajeroCarro.token;
    const posicion_en_la_lista = mensajeroCarro.posicion_en_la_lista.toString()
    const id_pedido = mensajeroCarro.id_pedido;
    console.log(mensajeroCarro.nombre);      

    var  payload = {
    data: {
        id_pedido: id_pedido,
        posicion_en_la_lista: posicion_en_la_lista,
        id_lista : id_lista.toString()
    }
        };
    var options = {
      priority: "high",
      timeToLive: 5,
      restrictedPackageName: 'mensajero.mensajerogo'
    };

  admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                    // See the MessagingTopicResponse reference documentation for the
                    // contents of response.
                    console.log("servicio enviado ok:", response);
                    var espera = 0;
                    var inId = setInterval(function(){
                        espera ++
                        console.log(espera)
                        if(espera == 15){ // si cuenta hasta 15 y no han tomado el servicio entonces lo quita de la lista y lo vuelve a lanzar
                        admin.database().ref(`gerente/admin/mensajeros_especial_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
                        clearInterval(inId)
                        }      
                    }, 1000)
            }).catch(function(error) {
                console.log("Error sending message:", error);
                admin.database().ref(`gerente/admin/mensajeros_especial_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
            });
}

//------------------- Alertas -------------------------------------------------------------------------
  var alertas = (snapshot) =>{
    let alerta = snapshot.val()
    let duracion = alerta.tiempo_de_vida;
    let ahora = new Date().getTime()
    let tiempo_duracion = ahora - alerta.hora_de_inicio
    let dif = duracion - tiempo_duracion
    if(dif > 0){
    var idInAlerta = setInterval(function(){
    var ahora1 = new Date().getTime()
    var tiempo_duracion = ahora1 - alerta.hora_de_inicio
    var dif = duracion - tiempo_duracion
    console.log(dif)
    if(dif <= 0){
      database.ref(`gerente/admin/alertas_mapa/`+ alerta.id_alerta).remove()
      clearInterval(idInAlerta)
    }
    console.log('quedan ' +Math.floor(dif/1000)+ ' segundos')
      },1000)
    }else{
      database.ref(`gerente/admin/alertas_mapa/${alerta.id_alerta}`).remove()
    }
    console.log('Termina en '+dif/1000/60 + ' minutos')
  }
    var refAlertas = database.ref(`gerente/admin/alertas_mapa/`)
    refAlertas.on('child_added', alertas)

    //-------------------- fin Alertas -----------------------------------------------------------------




    //--------------------- Enviar Servicios -----------------------------------------------------------

    var refListados = database.ref(`gerente/admin/mensajeros_env_mensaje/`).limitToLast(1)
    refListados.on('child_added', function(tokensSnapshot) {
    var mensajeros = [];
    var id_lista = tokensSnapshot.key;
    console.log(id_lista);
    tokensSnapshot.forEach(function(childSnapshot) {
                            // key will be "ada" the first time and "alan" the second time
                            var key = childSnapshot.key;
                            // childData will be the actual contents of the child
                            var childData = childSnapshot.val();
                            console.log('mensajeros ', childData)
                            mensajeros.push(childData);
                        });

    if(mensajeros.length>1){

        var mensajeroMoto = mensajeros[0]
        enviarServicioMoto(mensajeroMoto, id_lista)
        var refidListaRemoved = database.ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista)

        refidListaRemoved.on('child_removed', function(snapshot){
            mensajeros.shift()
            if(mensajeros.length> 1)enviarServicioMoto(mensajeros[0],id_lista)
        })


    }else{
        const id_pedido = mensajeros[0].id_pedido;
        return admin.database().ref(`gerente/admin/pedido/${id_pedido}/codigo_mensajero`)
            .set(mensajeros[0].codigo, function(error) {
                if(!error){
                    return admin.database().ref(`gerente/admin/pedido/${id_pedido}/estado_pedido`)
                    .set("en_curso", function(error) {
                        if(!error){
                            return admin.database().ref(`gerente/admin/pedido/${id_pedido}/token_conductor`)
                            .set(mensajeros[0].token, function(error) {
                                if(!error){
                                    console.log("servicio asignado a central correctamente");
                                    return admin.database().ref(`gerente/admin/mensajeros_env_mensaje/${id_lista}`).remove()
                                }
                        })
                    }
                })
                
        }
    })

    }


    
    })

        //--------------------- Observer Enviar Servicio Especial -----------------------------------------------------------

        var refListados = database.ref(`gerente/admin/mensajeros_especial_env_mensaje/`)
        refListados.on('child_added', function(tokensSnapshot) {
        var mensajeros = [];
        var id_lista = tokensSnapshot.key;
        console.log(id_lista);
        tokensSnapshot.forEach(function(childSnapshot) {
                                // key will be "ada" the first time and "alan" the second time
                                var key = childSnapshot.key;
                                // childData will be the actual contents of the child
                                var childData = childSnapshot.val();
                                var mensajero = new Mensajero()
                                mensajero = childData
                                console.log('mensajeros ', mensajero)
                                mensajeros.push(mensajero);
                            });
    
        if(mensajeros.length>0){
    
            var mensajeroMoto = mensajeros[0]
            enviarServicioEspecial(mensajeroMoto, id_lista)
            console.log('primer envio')
            var refidListaRemoved = database.ref(`gerente/admin/mensajeros_especial_env_mensaje/`+id_lista)
    
            refidListaRemoved.on('child_removed', function(snapshot){
                mensajeros.shift()
                if(mensajeros.length > 0)enviarServicioEspecial(mensajeros[0],id_lista)
                else {
                    console.log('no hay mas mensajeros desde child-removed')
                }
            })
    
    
        }else{
            console.log('no hay mas mensajeros')
        }
    
    
        
        })


    //  pruebas---------------------------------------------------------------------------------------------

    var refPEdidosCarro = database.ref(`gerente/admin/pedido_especial`).limitToLast(1)
    refPEdidosCarro.on('child_added', (snapshot) => {
        let pedido = new Pedido()
            pedido = snapshot.val()
        let refMensajerosConectados =  database.ref(`gerente/admin/mensajero_especial_conectado/`)
        refMensajerosConectados.once('value', (mens) => {
            if(mens.numChildren() > 0) {
                mens.forEach((m) => {
                    var mensajero = new Mensajero()
                    mensajero = m
                })
            } else {
                var tokenusuario = pedido.token;
                var id_pedido_borrar = pedido.id_pedido;
                var  payload = {
                    notification: {
                        mensajeroCerca: "SIN_MENSAJERO_CERCA",
                        id_pedido_borrar: id_pedido_borrar
                    }
                        };
                    var options = {
                      priority: "high",
                      timeToLive: 30
                    };
                
                    return  admin.messaging().sendToDevice(tokenusuario, payload,options).then(function(response) {
                                    // See the MessagingTopicResponse reference documentation for the
                                    // contents of response.
                                    console.log("mensaje enviado sin mensajero ok:", response);
                            }).catch(function(error) {
                                console.log("Error sending message:", error);
                            });
                
            }
        }) 
    })



    
    
    
    

    


