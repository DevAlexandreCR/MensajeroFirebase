const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const ref = admin.database().ref()
// const httpBuildQuery = require('http-build-query')
const request = require('request')
const servicioMensajeroGo = require('./servicios/servicioMensajeroGo')
var serviceGo = new servicioMensajeroGo(admin)

//función bienvenida usuarios 
// Se envía mensaje de bienvenida y además se genera y agrega el codigo de referido a la base de datos
exports.BienvenidaUsuarios = functions.database.ref(`gerente/admin/usuario/{Uid}`).onCreate((data, context) => {
const Uid = context.params.Uid;
return admin.database().ref(`gerente/admin/usuario/${Uid}`).once('value').then(function(usuarios) {
    const usuario = usuarios.val();
    let s = usuario.nombre
    let arrays = s.split(' ')
    let name = arrays[0]
    let lastname = ""
    if(arrays[1] != null)lastname = arrays[1].substring(0,3).toUpperCase()
    name = name.toUpperCase()
    usuario.codigo_referido = name + lastname +Math.floor(Math.random() * (999 - 0)) + 0

    this.admin.database().ref(`gerente/admin/usuario/${Uid}/codigo_referido`).set(usuario.codigo_referido)
                                .then(()=>{
                                    let url = 'https://api.hablame.co/sms/envio/';
                                    const numero = '57'+usuario.telefono;
                                    const mensaje = 'Hola ' + usuario.nombre + ', Bienvenido! ya eres parte de la familia Mensajero, la aplicación de la Ciudad Blanca. Recuerda un MensajeroBike (moto) para mandados o domicilios y un MensajeroGo para que te lleve en un carro limpio y seguro a donde quieras';
                                
                                    request.post(
                                        url,
                                        {
                                            form:{
                                              cliente : 10012200, //Numero de cliente
                                              api : 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                                              numero : numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                                              sms : mensaje, //Mensaje de texto a enviar
                                              fecha : '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                                              referencia : 'usuario nuevo mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                                            }
                                        }, function(err,httpResponse,body){ 
                                            console.log(' response '+httpResponse)
                                          console.log('body '+body)
                                       }
                                    );
                                })
});

});

exports.BienvenidaMensajeroGo = functions.database.ref(`gerente/admin/mensajero_especial/{codigo_mensajero}`).onCreate((data, context) => {
    const codigo_mensajero = context.params.Uid;
    return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`).once('value').then(function(mensajeros) {
        const mensajero = mensajeros.val();
        let s = mensajero.nombre
        let arrays = s.split(' ')
        let name = arrays[0]
        name = name.toUpperCase()
        mensajero.codigo_referido = 'GO_' + name +Math.floor(Math.random() * (999 - 0)) + 0
    
     return this.admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}/codigo_referido`).set(mensajero.codigo_referido)
                        .then(()=>{
                            console.log("codigo creado correctamente")
                        })
    });
    
    });

//funcion para notificaciones de carros
exports.NotificacionServicioEspecial = functions.database.ref(`gerente/admin/pedido_especial/{pid}/estado_pedido`).onWrite((data, context) => {
    const pid = context.params.pid;
    console.log('pid', pid);
    var payload;
    var estado;

    return admin.database().ref(`gerente/admin/pedido_especial/${pid}/token`).once('value').then(function(tokensSnapshot) {
    
         tokens = tokensSnapshot.val()
        
        console.log('tokens', tokens);
        return admin.database().ref(`gerente/admin/pedido_especial/${pid}/estado_pedido`).once('value').then(function(snapshot) {
            estado = snapshot.val()
            console.log('estado ', estado);
   
            if (estado === "sin_movil_asignado") {
                console.log('estado', estado);
                
            } else if (estado === "en_curso") {
                       
                 return admin.database().ref(`gerente/admin/pedido_especial/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                                var codigo_mensajero = snapshot.val();
                                if(codigo_mensajero!="asignar movil"){
                                    return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        if(data.val()!=null && data.hasChildren()){
                                            const mensajeroasignado = data.val();
                                            return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}/ocupado`)
                                            .set(true, function(error){   
                                                console.log('mensajero ocupado: ', true);   
                                                const mensaje = mensajeroasignado.nombre + " pasará por ti en unos minutos...";

                                                payload = {
                                                    notification: {
                                                        title: 'Tu Mensajero esta en camino!',
                                                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                        body: mensaje,
                                                        sound: "default"
                                                    }
                                                };                         
                                                enviarMensaje(tokens,payload);  
                                            });
                                        }
                                    });
                                }
                            });
                
            } else if (estado === "terminado") {
                payload = {
                    notification: {
                        title: 'Mensajero',
                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                        body: "Tu solicitud ha sido realizada con éxito",
                        sound: "default"
                    }
                };

                //aqui vamos a agregarle el servicio al conductor

                return admin.database().ref(`gerente/admin/pedido_especial/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                    var codigo_mensajero = snapshot.val();
                    if(codigo_mensajero!="asignar movil"){
                        return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        if(data.val()!=null && data.hasChildren()){
                                            return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}/ocupado`)
                                            .set(false, function(error){   
                                                console.log('mensajero ocupado: ', false);                            
                                                enviarMensaje(tokens,payload);  
                                                serviceGo.verificarReferidos(pid)
                                            });
                                        }
                                    });
                    }
                });
            } else if (estado === "cancelado") {
                payload = {
                    notification: {
                        title: 'Mensajero',
                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                        body: "Tu solicitud ha sido cancelada",
                        sound: "default"
                    }
                };
                return admin.database().ref(`gerente/admin/pedido_especial/${pid}/valor_pedido`)
                    .set(0.0, function(error) {
                        return admin.database().ref(`gerente/admin/pedido_especial/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                            var codigo_mensajero = snapshot.val();
                            if (codigo_mensajero != undefined){
                                if(codigo_mensajero!="asignar movil"){
                                    return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        if(data.val()!=null && data.hasChildren()){
                                            return  admin.database().ref(`gerente/admin/mensajero_especial_conectado/${codigo_mensajero}/ocupado`)
                                            .set(false, function(error){   
                                                console.log('mensajero ocupado: ', false);                            
                                                enviarMensaje(tokens,payload);  
                                            });
                                        }
                                    });
                                    
                                }
                            }else{
                                console.log("cancelado ander de asignar mensajero");
                            }
                        });
                    });
            }

            function enviarMensaje(token , payloads) {
                admin.messaging().sendToDevice(token, payloads).then(function(response) {
                    // See the MessagingTopicResponse reference documentation for the
                    // contents of response.
                    console.log("Successfully sent message:", response);
                }).catch(function(error) {
                    console.log("Error sending message:", error);
                });
            }
        });
});

});

//funcion para notificaciones de motos
exports.NotificacionServicioMoto = functions.database.ref(`gerente/admin/pedido/{pid}/estado_pedido`).onWrite((data, context) => {
    const pid = context.params.pid;
    console.log('pid', pid);
    var payload;
    var estado;
    var tokens;
    var pedido;

    return admin.database().ref(`gerente/admin/pedido/${pid}/`).once('value').then(function(tokensSnapshot) {
    
        pedido = tokensSnapshot.val();
        tokens = pedido.token;
        console.log('tokens', tokens);
        estado = pedido.estado_pedido;

            if (estado === "sin_movil_asignado") {
                return admin.database().ref(`gerente/admin/administradores/admin_motos/token`)
                .once('value').then(function(snapshotToken){ 
                    tokens = snapshotToken.val()
                    console.log('token admin motos', tokens);
                payload = {
                    data: {
                        notification: 'notidicacion'
                    }

                }
                return admin.database().ref(`gerente/admin/administradores/admin_carros/token`)
                .once('value').then(function(snapshotToken){ 
                    let token_carro = snapshotToken.val();
                    console.log('token admin gerencia', token_carro);
                    let token_moto = tokens;
                    let token = [];
                    token.push(token_carro);
                    token.push(token_moto);
                    enviarMensaje(token,payload)
                });
                
            })
                
            } else if (estado === "en_curso" && tokens != null) {
                       
                 return admin.database().ref(`gerente/admin/pedido/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                                var codigo_mensajero = snapshot.val();
                                if(codigo_mensajero!="asignar movil"){
                                    return  admin.database().ref(`gerente/admin/mensajero_conectado/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        if(data.val()!=null && data.hasChildren()){
                                            const mensajeroasignado = data.val();
                                            if(mensajeroasignado.codigo == "7gJSMJsZNjRUDoOzKnO0GefE0ND3"){
                                                payload = {
                                                    notification: {
                                                        title: 'Mensajero',
                                                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                        body: "Tu solicitud se está procesando, en unos instantes te enviaremos los datos de tu mensajero",
                                                        sound: "default"
                                                    }
                                                };
                                                enviarMensaje(tokens,payload);  
                                            }else{
                                                return  admin.database().ref(`gerente/admin/mensajero_conectado/${codigo_mensajero}/ocupado`)
                                                .set(true, function(error){   
                                                    console.log('mensajero ocupado: ', true);   
                                                    const mensaje = mensajeroasignado.nombre + " es tu Mensajero asignado...";

                                                    payload = {
                                                        notification: {
                                                            title: 'Tu Mensajero esta en camino!',
                                                            icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                            body: mensaje,
                                                            sound: "default"
                                                        }
                                                    };                         
                                                    enviarMensaje(tokens,payload);  
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                
            } else if (estado === 'terminado' && tokens == null) {

                //aqui vamos a agregarle el servicio al conductor
                //el servicio es generico por eso no hay id_usuario

                return admin.database().ref(`gerente/admin/pedido/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                    var codigo_mensajero = snapshot.val();
                    if(codigo_mensajero!="asignar movil" && codigo_mensajero != '7gJSMJsZNjRUDoOzKnO0GefE0ND3'){
                        return  admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        let mensajero = data.val();
                                        if(mensajero != null){
                                            return  admin.database().ref(`gerente/admin/mensajero_conectado/${codigo_mensajero}/ocupado`)
                                            .set(false, function(error){   
                                                console.log('mensajero ocupado: ', false);       
                                                return  admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}/pedido/${pid}`)
                                            .set(pedido, function(error){

                                                if(pedido.telefono.length == 10){
                                                    let url = 'https://api.hablame.co/sms/envio/';
                                                    const numero = '57' + pedido.telefono;
                                                    const mensaje = 'Hola ' + pedido.nombre + ', Tu servicio con ' + mensajero.nombre + ' tuvo un valor de ' +
                                                        pedido.valor_pedido + ' Si tienes solicitudes, quejas o felicitaciones escribenos al 3202973621  Att: Equipo Soporte Mensajero'+
                                                        'visita http://www.mensajeroapp.co y descarga nuestra app';
    
                                                    request.post(
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
                                                        }
                                                    );
                                                }
                                            });
                                            });
                                        }
                                    });
                    }
                });
            }else if(estado === 'terminado' && tokens != null){
                payload = {
                    notification: {
                        title: 'Mensajero',
                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                        body: "Tu solicitud ha sido realizada con éxito",
                        sound: "default"
                    }
                };
                enviarMensaje(tokens,payload);  
            } else if (estado === "cancelado" && tokens != null) {
                payload = {
                    notification: {
                        title: 'Mensajero',
                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                        body: "Tu solicitud ha sido cancelada",
                        sound: "default"
                    }
                };
                return admin.database().ref(`gerente/admin/pedido/${pid}/valor_pedido`)
                    .set(0.0, function(error) {
                        return admin.database().ref(`gerente/admin/pedido/${pid}/codigo_mensajero`).once('value').then(function(snapshot) {
                            var codigo_mensajero = snapshot.val();
                            if (codigo_mensajero != undefined){
                                if(codigo_mensajero!="asignar movil"){
                                    return  admin.database().ref(`gerente/admin/mensajero_conectado/${codigo_mensajero}`)
                                    .once('value').then(function(data){
                                        if(data.val()!=null && data.hasChildren()){
                                            return  admin.database().ref(`gerente/admin/mensajero_conectado/${codigo_mensajero}/ocupado`)
                                            .set(false, function(error){   
                                                console.log('mensajero ocupado: ', false);                            
                                                enviarMensaje(tokens,payload); 
                                                // aqui empezamos a escribir el servicio en las estadisticas del conductor
                                                //ya que el usuario no existe en base de datos
                                                 
                                            });
                                        }
                                    });
                                    
                                }
                            }else{
                                console.log("cancelado ander de asignar mensajero");
                            }
                        });
                    });
            }

            function enviarMensaje(token , payloads) {
                return admin.messaging().sendToDevice(token, payloads).then(function(response) {
                    // See the MessagingTopicResponse reference documentation for the
                    // contents of response.
                    console.log("Successfully sent message:", response);
                }).catch(function(error) {
                    console.log("Error sending message:", error);
                });
            }
});

});


//funcion para resepcoionar servicios y agregar la lista de los mensajeros carro mas cercanos
exports.ListarMensajerosCercanos = functions.database.ref(`gerente/admin/pedido_especial/{pid}`).onCreate((data, context)=>{
    const pid = context.params.pid;
    var pedido = []; 
    var lat_servicio;
    var long_servicio;
    var mensajeros = [];
    var mensajeroCerca=[];
    var id_servicio;


     return admin.database().ref(`gerente/admin/pedido_especial/${pid}`).once('value').then(function(tokensSnapshot) {
        pedido = tokensSnapshot.val();
        lat_servicio = pedido.lat_dir_inicial;
        long_servicio = pedido.long_dir_inicial;
        id_servicio = pedido.id_pedido;

         return admin.database().ref(`gerente/admin/mensajero_especial_conectado`).once('value').then(function(tokensSnapshot) {
            tokensSnapshot.forEach(function(childSnapshot) {
                          // key will be "ada" the first time and "alan" the second time
                          var key = childSnapshot.key;
                          // childData will be the actual contents of the child
                          var childData = childSnapshot.val();
                          if(!childData.ocupado){
                          mensajeros.push(childData);
                          }else{
                              console.log("mensajero ocupado". childData)
                          }
                      });

            var distancia;
            //calculamos la distancia de cada mensajero que está conectado para agregarlos a la lista 
            for(x=0;x<mensajeros.length;x++){
            distancia = getDistancia(lat_servicio,long_servicio,mensajeros[x].lat_dir_ini,mensajeros[x].lgn_dir_ini)
            console.log('distancia',distancia);
            //comparar distancias para agregra la lista de los mensajeros a enviar a los que esten a menos de 3km de distancia
            if(distancia<=5){
                mensajeros[x].distancia = parseFloat(distancia);
                mensajeroCerca.push(mensajeros[x]);
            }
            }
            //ordenar de menor distancia a mayor           
            function compare(a, b) {
              const genreA = a.distancia;
              const genreB = b.distancia;

              let comparison = 0;
              if (genreA > genreB) {
                comparison = 1;
              } else if (genreA < genreB) {
                comparison = -1;
              }
              return comparison;
            }

            mensajeroCerca.sort(compare);
            for(i=0;i<mensajeroCerca.length;i++){
                mensajeroCerca[i].posicion_en_la_lista = i;
                mensajeroCerca[i].id_pedido = id_servicio;
            }
            mensajeroCerca.push(pedido.id_pedido)

            console.log('mensajeroscerca', mensajeroCerca);

            

            if(mensajeroCerca.length > 1){
                //escribimos en la base de datos la lista de mensajeros a los cuales se les enviará el mensaje
                return admin.database().ref(`gerente/admin/mensajeros_especial_env_mensaje/`).push(mensajeroCerca)
                .then(function(snapshot) {
                    console.log("snapshot id_lista", snapshot.key); 
                    var socket = require('socket.io-client')('https://mensajero-7802b.appspot.com',
                    {reconnection: false})

                    // conectamos al servidor y enviamos el id dela lista para que envíe los servicios
                    socket.on('connect', ()=> {
                        console.log('conectado: ', snapshot.key)
                    })
                    socket.emit('new-list-mensajero-especial', snapshot.key)

                    });
            }else{ // si no hay mensajeros entonces se informa al usuario para cancelar
                var tokenusuario = pedido.token;
                var id_pedido_borrar = pedido.id_pedido;
                var  payload = {
                    data: {
                        mensajeroCerca: "SIN_MENSAJERO_CERCA",
                        id_pedido_borrar: id_pedido_borrar
                    }
                        };
                    var options = {
                      priority: "high",
                      timeToLive: 30,
                      restrictedPackageName: 'com.mensajero.equipo.mensajero'
                    };
                
                    return  admin.messaging().sendToDevice(tokenusuario, payload,options).then(function(response) {
                                    // See the MessagingTopicResponse reference documentation for the
                                    // contents of response.
                                    console.log("mensaje enviado sin mensajero ok:", response);
                            }).catch(function(error) {
                                console.log("Error sending message:", error);
                            });
                
            }


             //funcion para calcular la distancia entre dos puntos geograficos
            function getDistancia(lat1,lon1,lat2,lon2){
                 rad = function(x) {return x*Math.PI/180;}
                 var R = 6378.137; //Radio de la tierra en km
                 var dLat = rad( lat2 - lat1 );
                 var dLong = rad( lon2 - lon1 );
                 var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
                 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                 var d = R * c;
                return d.toFixed(3); //Retorna tres decimales
            }
        });         
    });
});

//funcion para resepcoionar servicios y agregar la lista de los mensajeros moto mas cercanos
exports.ListarMensajerosMotoCercanos = functions.database.ref(`gerente/admin/pedido/{pid}`).onCreate((data, context)=>{
    const pid = context.params.pid;
    var pedido = []; 
    var lat_servicio;
    var long_servicio;
    var mensajeros = [];
    var mensajeroCerca=[];
    var id_servicio;


     return admin.database().ref(`gerente/admin/pedido/${pid}`).once('value').then(function(tokensSnapshot) {
        pedido = tokensSnapshot.val();
        lat_servicio = pedido.lat_dir_inicial;
        long_servicio = pedido.long_dir_inicial;
        id_servicio = pedido.id_pedido;
        var tomo_servicio = false;


         return admin.database().ref(`gerente/admin/mensajero_conectado`).once('value').then(function(tokensSnapshot) {
            tokensSnapshot.forEach(function(childSnapshot) {
                          // key will be "ada" the first time and "alan" the second time
                          var key = childSnapshot.key;
                          // childData will be the actual contents of the child
                          var childData = childSnapshot.val();
                          if(!childData.ocupado){
                          mensajeros.push(childData);
                          }else{
                              console.log("mensajero ocupado". childData)
                          }
                      });

            var distancia;
            const codigo_central = "7gJSMJsZNjRUDoOzKnO0GefE0ND3";
            var central_mensajero;
            //calculamos la distancia de cada mensajero que está conectado para agregarlos a la lista 
            for(x=0;x<mensajeros.length;x++){
                if(mensajeros[x].codigo==codigo_central){
                    central_mensajero = mensajeros[x];
                }else{
                    if(lat_servicio != undefined){
                        distancia = getDistancia(lat_servicio,long_servicio,mensajeros[x].lat_dir_ini,mensajeros[x].lgn_dir_ini)
                    }else{
                        distancia = 10
                    }
                    
                    console.log('distancia',distancia);
                    //comparar distancias para agregra la lista de los mensajeros a enviar a los que esten a menos de 3km de distancia
                    if(distancia<=1){
                        mensajeros[x].distancia = parseFloat(distancia);
                        mensajeroCerca.push(mensajeros[x]);
                    }
                 }
            }
            //ordenar de menor distancia a mayor           
            function compare(a, b) {
              const genreA = a.distancia;
              const genreB = b.distancia;

              let comparison = 0;
              if (genreA > genreB) {
                comparison = 1;
              } else if (genreA < genreB) {
                comparison = -1;
              }
              return comparison;
            }

            mensajeroCerca.sort(compare);
            for(i=0;i<mensajeroCerca.length;i++){
                mensajeroCerca[i].posicion_en_la_lista = i;
                mensajeroCerca[i].id_pedido = id_servicio;
            }
            central_mensajero.id_pedido = id_servicio;
            mensajeroCerca.push(central_mensajero)
        
                //escribimos en la base de datos la lista de mensajeros a los cuales se les enviará el mensaje
                return admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`).push(mensajeroCerca)
                .then(function(snapshot) {
                console.log("lista agregada ok ", snapshot.key)                 
            });
             //funcion para calcular la distancia entre dos puntos geograficos
            function getDistancia(lat1,lon1,lat2,lon2){
                 rad = function(x) {return x*Math.PI/180;}
                 var R = 6378.137; //Radio de la tierra en km
                 var dLat = rad( lat2 - lat1 );
                 var dLong = rad( lon2 - lon1 );
                 var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
                 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                 var d = R * c;
                return d.toFixed(3); //Retorna tres decimales
            }
        });       
    });
});

//funciion para enviar mensaje a cada mensajero moto de la lista hasta que alguno tome el servicio
exports.EnviarServicioMoto = functions.database.ref(`gerente/admin/mensajeros_env_mensaje/{listaid}`).onWrite((data, context)=>{

    //funcion para enviar el servicio a un mensajero

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
                       admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista+`/`+posicion_en_la_lista)
                       .once('value', function(snapshot){
                           if(snapshot.exists()){
                               espera ++;
                           }else{
                               clearInterval(inId)
                           }
                           if(espera == 15){
                            return admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
                            clearInterval(inId)
                           }
                           
                       })
                    }, 1000)
            }).catch(function(error) {
                console.log("Error sending message:", error);
                admin.database().ref(`gerente/admin/mensajeros_env_mensaje/`+id_lista + '/' + posicion_en_la_lista).remove()
            });
}

    const listaid = context.params.listaid
    console.log(listaid);
    var mensajeros = [];

    return admin.database().ref(`gerente/admin/mensajeros_env_mensaje/${listaid}`).once('value').then(function(tokensSnapshot) {
if(tokensSnapshot.exists()){
    const id_lista = tokensSnapshot.key;
    tokensSnapshot.forEach(function(childSnapshot) {
                          // key will be "ada" the first time and "alan" the second time
                          var key = childSnapshot.key;
                          // childData will be the actual contents of the child
                          var childData = childSnapshot.val();
                          mensajeros.push(childData);
                      });

    if(mensajeros.length>1){
        var mensajeroMoto = mensajeros[0]
        enviarServicioMoto(mensajeroMoto, id_lista)             
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
                                    return admin.database().ref(`gerente/admin/mensajeros_env_mensaje/${id_lista}`).remove();
                                }
                        });
                    }
                });
               
        }
    });

    }


}
    });


});

//notificar el estado de los mensajeros carro
exports.NotificacionEstadoMensajeroEspecial = functions.database.ref(`gerente/admin/mensajero_especial/{codigo_mensajero}/estado`).onWrite((data, context) => {

    const codigo_mensajero = context.params.codigo_mensajero;
    console.log('CODIGO MENSAJERO', codigo_mensajero);
    return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`).once('value').then(function(tokensSnapshot) {
        var token = '';
        var estado = '';
        if (tokensSnapshot.val()!= null){
            const mensajero = tokensSnapshot.val();
            token = mensajero.token;
            estado = mensajero.estado;
            const mensaje = 'Hola '+ mensajero.nombre+ ' Bienvenido!, ya puedes conectarte y empezar a '+
            'conducir. Aprende a usar la aplicación aquí https://www.youtube.com/watch?v=emRK15qHHD8 Te invitamos a unirte a nuestro grupo de WhatsApp en el siguiente enlace https://chat.whatsapp.com/ASm5ZzA6J4IJjSKc2lDPM3 .'+
            'Si tienes solcitudes, quejas o felicitaciones escribenos al 3202973621.'
            console.log('ESTADO MENSAJERO', estado);
            const numero = '57'+mensajero.telefono;
            enviarMensaje(estado,token, mensaje, numero);
           }
        
    });

    function enviarMensaje(estado,token, mensaje, numero) {

        var payload = null;

        switch(estado){
            case "subir_imagenes":
            payload = {
                notification: {
                    title: 'Bienvenido a Mensajero Go',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Falta poco para comenzar, envía tus documentos para completar el registro",
                    sound: "default"
                }
                }
            break;
            case 'verificar':
            payload = {
                notification: {
                    title: 'Falta poco !!!',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Vamos a revisar tus documentos y te avisaremos cuando ya todo esté listo",
                    sound: "default"
                }
                }
            break;
            case 'activo':
            payload = {
                notification: {
                    title: 'A conducir !!!',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Ya puedes empezar a conducir con Mensajero Go",
                    sound: "default"
                }
                }
            break;
            case 'bloqueado':
            payload = {
                notification: {
                    title: 'Algo anda mal :(',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Tu cuenta debe ser revisada, aún no puedes iniciar sesión",
                    sound: "default"
                }
                }
            break;
            default :
            payload = {
                notification: {
                    title: 'Mensajero Go',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Conduce y gana a la vez, el mundo te espera!!!",
                    sound: "default"
                }
                }
            break;
        }

    return admin.messaging().sendToDevice(token, payload).then(function(response) {
        if(estado === 'activo'){
            const url = 'https://api.hablame.co/sms/envio/';
            request.post(
                url,
                {
                    form:{
                      cliente : 10012200, //Numero de cliente
                      api : 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                      numero : numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                      sms : mensaje, //Mensaje de texto a enviar
                      fecha : '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                      referencia : 'usuario nuevo mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                    }
                }, function(err,httpResponse,body){ 
                    console.log(' response '+httpResponse)
                  console.log('body '+body)
               }
            );
        }
        console.log("Successfully sent message:", response.results);
    }).catch(function(error) {
        console.log("Error sending message:", error);
    });
}

});

//notificar el estado de los mensajeros moto
exports.NotificacionEstadoMensajero = functions.database.ref(`gerente/admin/mensajero/{codigo_mensajero}/estado`).onWrite((data, context) => {

    const codigo_mensajero = context.params.codigo_mensajero;
    console.log('CODIGO MENSAJERO', codigo_mensajero);
    return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}`).once('value').then(function(tokensSnapshot) {
        var token = '';
        var estado = '';
        if (tokensSnapshot.val()!= null){
            const mensajero = tokensSnapshot.val();
            token = mensajero.token;
            estado = mensajero.estado;
            const mensaje = 'Hola '+ mensajero.nombre+ ' Bienvenido!, ya puedes conectarte y empezar a '+
            'conducir. Te invitamos a unirte a nuestro grupo de WhatsApp en el siguiente enlace https://chat.whatsapp.com/JSBx0ulSAZq1KGFL9nzjyb .'+
            'Si tienes solcitudes, quejas o felicitaciones escribenos al 3202973621.'
            console.log('ESTADO MENSAJERO', estado);
            const numero = '57'+mensajero.telefono;
            enviarMensaje(estado,token, mensaje, numero);
           }
        
    });

    function enviarMensaje(estado,token, mensaje, numero) {

        var payload = null;

        switch(estado){
            case "subir_imagenes":
            payload = {
                notification: {
                    title: 'Bienvenido a Mensajero Go Moto',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Falta poco para comenzar, envía tus documentos para completar el registro",
                    sound: "default"
                }
                }
            break;
            case 'verificar':
            payload = {
                notification: {
                    title: 'Falta poco !!!',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Vamos a revisar tus documentos y te avisaremos cuando ya todo esté listo",
                    sound: "default"
                }
                }
            break;
            case 'verificado':
            payload = {
                notification: {
                    title: 'Ultimo paso !!!',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Tu moto ya está verificada, sólo faltas tú",
                    sound: "default"
                }
                }
                const url = 'https://api.hablame.co/sms/envio/';
                request.post(
                    url,
                    {
                        form:{
                          cliente : 10012200, //Numero de cliente
                          api : 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                          numero : numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                          sms : 'Tus documentos ya están verificados, sólo debes enviar un hoja de vida con '+
                          + 'dos referencias personales, tu dirección y datos personales a gerencia@mensajeroapp.co '+
                          ' Ésto con el fin de poder asignarte servicios de encomiendas de valor considerable. ', //Mensaje de texto a enviar
                          fecha : '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                          referencia : 'usuario verificado mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                        }
                    }, function(err,httpResponse,body){ 
                        console.log(' response '+httpResponse)
                      console.log('body '+body)
                   }
                );
            break;
            case 'activo':
            payload = {
                notification: {
                    title: 'A conducir !!!',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Ya puedes empezar a conducir con Mensajero Bike",
                    sound: './assets/notificacion.mp3'
                }
                }
            break;
            case 'bloqueado':
            payload = {
                notification: {
                    title: 'Algo anda mal :(',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Tu cuenta debe ser revisada, aún no puedes iniciar sesión",
                    sound: './assets/notificacion.mp3'
                }
                }
            break;
            default :
            payload = {
                notification: {
                    title: 'Mensajero Go Motos',
                    icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                    body: "Conduce y gana a la vez, el mundo te espera!!!",
                    sound: "default"
                }
                }
            break;
        }

    return admin.messaging().sendToDevice(token, payload).then(function(response) {
        if(estado === 'activo'){
            const url = 'https://api.hablame.co/sms/envio/';
            request.post(
                url,
                {
                    form:{
                      cliente : 10012200, //Numero de cliente
                      api : 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                      numero : numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                      sms : mensaje, //Mensaje de texto a enviar
                      fecha : '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                      referencia : 'usuario nuevo mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                    }
                }, function(err,httpResponse,body){ 
                    console.log(' response '+httpResponse)
                  console.log('body '+body)
               }
            );
        }
        console.log("Successfully sent message:", response.results);
    }).catch(function(error) {
        console.log("Error sending message:", error);
    });
}

});

exports.ChatServicio = functions.https.onCall((data,context)=>{

    var tipo_servicio = ""
    var id_pedido = ""    
    const mensaje = data.text.toString();
    const token = data.token_usuario.toString();
    const clave = data.clave.toString();
    if (clave === 'mensaje_chat'){
    tipo_servicio = data.tipo_servicio.toString()
    id_pedido = data.id_pedido.toString()
    }
    console.log(data)
        var  payload = {
            data: {
                mensaje: mensaje,
                clave: clave,
                tipo_servicio: tipo_servicio,
                id_pedido: id_pedido
            }
                };
            var options = {
              priority: "high",
              timeToLive: 30,
            };
        
            return  admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                            // See the MessagingTopicResponse reference documentation for the
                            // contents of response.
                            console.log("mensaje chat enviada ok:", response);
                    }).catch(function(error) {
                        console.log("Error sending chat:", error);
                    });

});

exports.CanjearBonos = functions.database.ref(`gerente/admin/bonos_usuarios/{id_usuario}/{tipo_bono}`).onWrite((data,context) => {

    //traemos el id del usuario que está redimiendo un bono y el tipo_bono es para saber si es un referido que acaba de terminar su primer viaje 
    // o está redimiendo un bono de bienvenida
    const id_usuario = context.params.id_usuario;
    const tipo_bono = context.params.tipo_bono;
    const bono_referido = 3000;
    const bono_bienvenida = 4000;

    return admin.database().ref(`gerente/admin/bonos_usuarios/${id_usuario}/${tipo_bono}`).once('value').then(function(dataSnapshot){

        if(dataSnapshot.hasChildren()){
            //si el snapshot tiene nodos hijos quiere decir que es un referido que acaba de terminar su primer viaje
        dataSnapshot.forEach(function(childSnapshot) {
                          var id_referido = childSnapshot.key;
                          var estado_bono = childSnapshot.val();
                          //verificar cual esta en estado canjear y agregar saldo
                          console.log("referidos", id_referido+", "+ estado_bono);
                          if(estado_bono==='canjear'){
                            return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`).once('value')
                            .then(function(snapshot){
                                //aqui miramos si el usuario tiene un saldo anterior y le agremamos en bono a su saldo;
                                var saldo_anterior = 0;
                                var saldo_nuevo = 0;
                                if(snapshot.val()!=null){
                                     saldo_anterior = snapshot.val();   
                                }
                                saldo_nuevo = saldo_anterior + bono_referido;
                                return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`)
                                .set(saldo_nuevo, function(error) {
                                    if (error) {
                                        console.log("Data could not be saved." + error);
                                    } else {
                                        console.log("Data saved successfully.");
                                      return admin.database().ref(`gerente/admin/bonos_usuarios/${id_usuario}/referidos/${id_referido}`)
                                                .set("redimido", function(error) {
                                                if (error) {
                                                console.log("Data could not be saved." + error);
                                                } else {
                                                    console.log("bono redimido successfully.");
                                                    return admin.database().ref(`gerente/admin/usuario/${id_usuario}/token`)
                                                .once('value').then( function(snapshot) {

                                                    const token = snapshot.val();
                                                        payload = {
                                                            notification: {
                                                                title: 'Felicitaciones !!!',
                                                                icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                                body: "Tu referido acaba de terminar su primer viaje, ya se agregó el bono a tu saldo...",
                                                                sound: "default"
                                                            }
                                                        }
                                                        return admin.messaging().sendToDevice(token, payload).then(function(response) {
                                                            // See the MessagingTopicResponse reference documentation for the
                                                            // contents of response.
                                                            console.log("Successfully sent confirmacoion referido ya termino carrera:", response.results);
                                                        }).catch(function(error) {
                                                            console.log("Error sending message:", error);
                                                        });
                                                    
                                                   });
                                                }//cerramos if de redimir succesfully
                                                });
                                            }
                                  });

                            });                            
                          }

                      });
        }else{
            //si no tiene hijos entonces es un bono normal y traemos el valor la clave del bono para agregar el saldo y pasarlo a redimido.
            console.log(tipo_bono , dataSnapshot.val());
            const estado_bono = dataSnapshot.val();
            if(estado_bono === 'pendiente'){
                return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`).once('value')
                .then(function(snapshot){
                    //aqui miramos si el usuario tiene un saldo anterior y le agremamos en bono a su saldo;
                    var saldo_anterior = 0;
                    var saldo_nuevo = 0;
                    if(snapshot.val()!=null){
                         saldo_anterior = snapshot.val();   
                    }
                    saldo_nuevo = saldo_anterior + bono_bienvenida;
                    return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`)
                    .set(saldo_nuevo, function(error) {
                        if (error) {
                            console.log("Data could not be saved." + error);
                        } else {
                            console.log("Data saved successfully.");
                          return admin.database().ref(`gerente/admin/bonos_usuarios/${id_usuario}/${tipo_bono}`)
                                    .set("redimido", function(error) {
                                    if (error) {
                                    console.log("Data could not be saved." + error);
                                    } else {
                                        console.log("Data redimido successfully.");
                                        return admin.database().ref(`gerente/admin/usuario/${id_usuario}/token`)
                                        .once('value').then( function(snapshot) {

                                            const token = snapshot.val();
                                                payload = {
                                                    notification: {
                                                        title: 'Felicitaciones !!!',
                                                        icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
                                                        body: "Tu bono ha sido redimido, ya se agregó el bono a tu saldo...",
                                                        sound: "default"
                                                    }
                                                }
                                                return admin.messaging().sendToDevice(token, payload).then(function(response) {
                                                    // See the MessagingTopicResponse reference documentation for the
                                                    // contents of response.
                                                    console.log("Successfully sent confirmacoion bono redimido:", response.results);
                                                }).catch(function(error) {
                                                    console.log("Error sending message:", error);
                                                });
                                            
                                           });

                                     }
                                    });
                                }
                      });

                });  
            }
        }
    });

});

    
//funcion para terminar servicio, debe recibir los datos de tiempo y distancia para verificar valor del viaje,
//adicionalmente verifica e en el ususario si éste tiene saldos a favor o encontro para hacer la respectiva deduccion del
//valor del viaje y posteriormente envía los datos al conductor al mismo tiempo escribe los valores en el
//usuario y en el conductor para que cada uno tenga su propio registro y verificar su historial
exports.TerminarViaje = functions.https.onCall((data,context)=>{
    //datos enviados por el conductor
    const tiempo = data.tiempo;
    const distancia = data.distancia;
    const id_usuario = data.id_usuario;
    const codigo_mensajero = data.codigo_mensajero;
    const token = data.token;
    const id_pedido = data.id_pedido;
    const hora_del_dia = data.hora_del_dia;
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
    return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`).once('value').then(function(tokensSnapshot) {
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

        CalcularViaje(tiempo,distancia);

        return admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}/valor_pedido`)
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
                
                    return  admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                                    // See the MessagingTopicResponse reference documentation for the
                                    // contents of response.
                                    console.log("mensaje chat enviada ok:", response);
                            return admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}/estado_pedido`)
                                    .set(pedido_terminado, function(error) {
                                        
                                            console.log("servicio terminado OK");
                                            return admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}`).once('value').then(function(dataSnapshot){
                                                pedido = dataSnapshot.val();
                                                pedido.saldo_pendiente_usuario = saldo_pendiente_usuario;
                                                pedido.descuentos_usuario = descuentos_usuario;
                                                console.log("pedido",pedido);
                                                 return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}/pedido_especial/${id_pedido}`)
                                                        .set(pedido, function(error) {
                                                            if(!error){
                                                                console.log("pedido escrito en mensajero OK");
                                                               return admin.database().ref(`gerente/admin/usuario/${id_usuario}/pedido_especial/${id_pedido}`)
                                                                    .set(pedido, function(error) {
                                                                        if (!error) {
                                                                            return admin.database().ref(`gerente/admin/pedido_especial/${id_pedido}`)
                                                                                .set(pedido, function (error) {
                                                                                    if (!error) {
                                                                                        console.log("pedido escrito en usuario OK")
                                                                                        return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`)
                                                                                            .set(nuevo_descuento_usuario, function (error) {
                                                                                                if (!error) {
                                                                                                    return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`)
                                                                                                        .once('value').then(function (mensajeros) {
                                                                                                            const mensajero = mensajeros.val();
                                                                                                            console.log("nuevo saldo escrito en usuario OK");
                                                                                                            let url = 'https://api.hablame.co/sms/envio/';
                                                                                                            const numero = '57' + pedido.telefono;
                                                                                                            const mensaje = 'Hola ' + pedido.nombre + ', Tu viaje con ' + mensajero.nombre + ' tuvo un valor de ' +
                                                                                                                pedido.valor_pedido + ' Si tienes solicitudes, quejas o felicitaciones escribenos al 3202973621  Att: Equipo Soporte Mensajero';

                                                                                                            request.post(
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

    function CalcularViaje(tiempo,distancia){

        console.log("calcularviaje",tiempo + "dist "+distancia);
        var modificador = modificadorDeTarifaSegunLaHora(hora_del_dia);

        valor_viaje = (((distancia/1000)* (530 * modificador)) + (tiempo * (120 * modificador))+ 1800*modificador);
        valor_viaje = Math.round(valor_viaje);
        valor_viaje = redondear(valor_viaje);

        //si la tarifa del viaje da menos que 3500 entonces se deja en la minima 3500.
        if(valor_viaje <= 3500){
            valor_viaje = 3500;
        }
        //restamos los descuentos que tenga el usuario al valor del viaje, si el descuento es mayor al valor del viaje
        //entonces el valor del viaje queda en $0 y se resta el valor del viaje al descuento para obtener el nuevo saldo del cliente
        //si el desceunto es menor entonces de deja el nuevo saldo del cliente el $0 y el valor a pagar en el valor del viaje menos el descuento
        valor_cobrar = valor_viaje - descuentos_usuario;
        valor_cobrar = valor_cobrar - saldo_pendiente_usuario;
        valor_cobrar = redondear(valor_cobrar);
         if(valor_cobrar < 0){
             valor_cobrar = 0;
             nuevo_descuento_usuario = descuentos_usuario -valor_viaje;
         }

    }

    function modificadorDeTarifaSegunLaHora(horadeldia){
        
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

    function redondear(value) {
        var resto = value%100;
        if(resto<50){
            value = value-resto;
        }else{
            value = value +(100-resto);
        }
        return value;
    }
});

exports.TerminarViajeMoto = functions.https.onCall((data,context)=>{

       //datos enviados por el conductor
       const tiempo = data.tiempo;
       const distancia = data.distancia;
       const id_usuario = data.id_usuario;
       const codigo_mensajero = data.codigo_mensajero;
       const token = data.token;
       const id_pedido = data.id_pedido;
       const tipo_pedido = data.tipo_pedido;
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
   
       return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`).once('value').then(function(tokensSnapshot) {
           if(tokensSnapshot.val()!=null){
               descuentos_usuario = tokensSnapshot.val();
               descuentos_usuario = Math.round(descuentos_usuario);
           }
           //aqui verificamos si el usuario tiene saldo negativo y lo pasamos a saldos pendientes, sino entonces se toma como 
           //saldo a favor o descuentos usuario
           if(descuentos_usuario < 0){
               saldo_pendiente_usuario = descuentos_usuario;
               descuentos_usuario = 0;
           }else /*if(descuentos_usuario == null)*/{//aqui anulé ésta parte porque no puede tomar bonos que se dan pára viajes
               descuentos_usuario = 0;// por eso el saldo se pasa a 0
           }
   
           CalcularViaje(tiempo,distancia,tipo_pedido);
   
           return admin.database().ref(`gerente/admin/pedido/${id_pedido}/valor_pedido`)
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
                         restrictedPackageName: 'mensajero.mensajerobike'
                       };
                   
                       return  admin.messaging().sendToDevice(token, payload,options).then(function(response) {
                                       // See the MessagingTopicResponse reference documentation for the
                                       // contents of response.
                                       console.log("mensaje chat enviada ok:", response);
                               return admin.database().ref(`gerente/admin/pedido/${id_pedido}/estado_pedido`)
                                       .set(pedido_terminado, function(error) {
                                           
                                               console.log("servicio terminado OK");
                                               return admin.database().ref(`gerente/admin/pedido/${id_pedido}`).once('value').then(function(dataSnapshot){
                                                   pedido = dataSnapshot.val();
                                                   pedido.saldo_pendiente_usuario = saldo_pendiente_usuario;
                                                   pedido.descuentos_usuario = descuentos_usuario;
                                                   console.log("pedido",pedido);
                                                    return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}/pedido/${id_pedido}`)
                                                           .set(pedido, function(error) {
                                                               if(!error){
                                                                   console.log("pedido escrito en mensajero OK");
                                                                  return admin.database().ref(`gerente/admin/usuario/${id_usuario}/pedido/${id_pedido}`)
                                                                       .set(pedido, function(error) {
                                                                           if (!error) {
                                                                               return admin.database().ref(`gerente/admin/pedido/${id_pedido}`)
                                                                                   .set(pedido, function (error) {
                                                                                       if (!error) {
                                                                                           console.log("pedido escrito en usuario OK")
                                                                                           return admin.database().ref(`gerente/admin/usuario/${id_usuario}/saldo`)
                                                                                               .set(nuevo_descuento_usuario, function (error) {
                                                                                                   if (!error) {
                                                                                                       return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}`)
                                                                                                           .once('value').then(function (mensajeros) {
                                                                                                               const mensajero = mensajeros.val();
                                                                                                               console.log("nuevo saldo escrito en usuario OK");
                                                                                                               let url = 'https://api.hablame.co/sms/envio/';
                                                                                                               const numero = '57' + pedido.telefono;
                                                                                                               const mensaje = 'Hola ' + pedido.nombre + ', Tu viaje con ' + mensajero.nombre + ' tuvo un valor de ' +
                                                                                                                   pedido.valor_pedido + ' Si tienes solicitudes, quejas o felicitaciones escribenos al 3202973621  Att: Equipo Soporte Mensajero';
   
                                                                                                               request.post(
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
   
       function CalcularViaje(tiempo,distancia,tipo_pedido){
   
           console.log("calcularviaje  ",tiempo + "dist "+distancia);
           var tarifa_minima = modificadorDeTarifaSegunLaHora(tipo_pedido);
   
           valor_viaje = (((distancia/1000)* (350)) + (tiempo * (90))+ 1500);
           valor_viaje = Math.round(valor_viaje);
           valor_viaje = redondear(valor_viaje);
   
           //si la tarifa del viaje da menos que 3500 entonces se deja en la minima 3500.
           if(valor_viaje <= tarifa_minima){
               valor_viaje = tarifa_minima;
           }
           valor_cobrar = valor_viaje;
           //restamos los descuentos que tenga el usuario al valor del viaje, si el descuento es mayor al valor del viaje
           //entonces el valor del viaje queda en $0 y se resta el valor del viaje al descuento para obtener el nuevo saldo del cliente
           //si el desceunto es menor entonces de deja el nuevo saldo del cliente el $0 y el valor a pagar en el valor del viaje menos el descuento
           /*valor_cobrar = valor_viaje - descuentos_usuario;
           valor_cobrar = valor_cobrar - saldo_pendiente_usuario;
           valor_cobrar = redondear(valor_cobrar);
            if(valor_cobrar < 0){
                valor_cobrar = 0;
                nuevo_descuento_usuario = descuentos_usuario -valor_viaje;
            }*/
   
       }
   
       function modificadorDeTarifaSegunLaHora(tipo_pedido){
           
           var tarifa_minima;

           switch(tipo_pedido){
               case "compras_domicilios":
                    tarifa_minima = 3000;
               break;
               case "facturas_tramites":
                    tarifa_minima = 5000;
               break;
               case "encomiendas":
                    tarifa_minima = 2000;
               break;
               default:
                    tarifa_minima = 2000;
                    break
           }

           
           console.log("tipo pedido  ",tipo_pedido + "  minima "+tarifa_minima);
           return tarifa_minima;
       }
   
       function redondear(value) {
           var resto = value%100;
           if(resto<50){
               value = value-resto;
           }else{
               value = value +(100-resto);
           }
           return value;
       }

});

//esta funcion está a la escucha del servicio que se agrega al conductor para sacarle el 15% de la comision
//y verificar si el cliente le pagó con bonos o si tenia saldo en contra
exports.SaldoMensajeroEspecial = functions.database.ref(`gerente/admin/mensajero_especial/{codigo_mensajero}/pedido_especial/{id_pedido}`)
                                    .onCreate((data, context)=>{
                                        
        const codigo_mensajero = context.params.codigo_mensajero;
        const id_pedido = context.params.id_pedido;
        var saldo_pendiente_usuario = 0;
        var descuentos_usuario = 0;
        var saldo_mensajero = 0;
        var nuevo_saldo_mensajero;
        return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}/pedido_especial/${id_pedido}`)
            .once('value').then(function(tokensSnapshot) {
                const pedido = tokensSnapshot.val();
                descuentos_usuario = pedido.descuentos_usuario;
                saldo_pendiente_usuario = pedido.saldo_pendiente_usuario;
                return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`)
                    .once('value').then(function(Snapshot) {
                        var mensajero = Snapshot.val();
                        saldo_mensajero = mensajero.saldo;
                        if(saldo_mensajero === undefined || saldo_mensajero === NaN){
                            saldo_mensajero = 0;
                        }
                        var comision = pedido.valor_pedido * 0.08;
                        var ingreso_anterior = mensajero.ingreso;
                        if(ingreso_anterior === undefined || ingreso_anterior === NaN){
                            ingreso_anterior = 0;
                        }      
                        var valor_pedido = pedido.valor_pedido;
                        var ingreso = valor_pedido - comision;
                        if(valor_pedido <= descuentos_usuario){
                            descuentos_usuario = valor_pedido;
                        }                        
                        nuevo_saldo_mensajero = (saldo_mensajero + comision + saldo_pendiente_usuario)-descuentos_usuario;
                        mensajero.ingreso = ingreso_anterior + ingreso;
                        mensajero.saldo = nuevo_saldo_mensajero;
                        console.log("nuevo saldo", mensajero.saldo + " ingreso "+mensajero.ingreso);

                        return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}`)
                            .set(mensajero, function(error) {
                                console.log("mensajero actualizado ok")
                            });

                    });

            });

});

//esta funcion está a la escucha del servicio que se agrega al conductor para sacarle el 15% de la comision
//y verificar si el cliente le pagó con bonos o si tenia saldo en contra
exports.SaldoMensajeroMoto = functions.database.ref(`gerente/admin/mensajero/{codigo_mensajero}/pedido/{id_pedido}`)
                                    .onCreate((data, context)=>{
                                        
        const codigo_mensajero = context.params.codigo_mensajero;
        const id_pedido = context.params.id_pedido;
        var saldo_pendiente_usuario = 0;
        var saldo_mensajero = 0;
        var nuevo_saldo_mensajero;
        return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}/pedido/${id_pedido}`)
            .once('value').then(function(tokensSnapshot) {
                var pedido = tokensSnapshot.val();
                if(pedido.saldo_pendiente_usuario != null){
                    saldo_pendiente_usuario = pedido.saldo_pendiente_usuario;
                }
                return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}`)
                    .once('value').then(function(Snapshot) {
                        var mensajero = Snapshot.val();
                        console.log("mensajero", mensajero)
                        saldo_mensajero = mensajero.saldo;
                        if(saldo_mensajero == undefined || saldo_mensajero == NaN){
                            saldo_mensajero = 0;
                        }
                        var comision = pedido.valor_pedido * 0.15;
                        var ingreso_anterior = mensajero.ingreso;
                        if(ingreso_anterior == undefined || ingreso_anterior == NaN){
                            ingreso_anterior = 0;
                        }      
                        var valor_pedido = pedido.valor_pedido;
                        var ingreso = valor_pedido - comision;                       
                        nuevo_saldo_mensajero = (saldo_mensajero + comision + saldo_pendiente_usuario);
                        mensajero.ingreso = ingreso_anterior + ingreso;
                        mensajero.saldo = nuevo_saldo_mensajero;
                        console.log("nuevo saldo", mensajero.saldo + " ingreso "+mensajero.ingreso);

                        return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}`)
                            .set(mensajero, function(error) {
                                console.log("mensajero actualizado ok")
                            });

                    });

            });

});


exports.GestionMensajerosUltimaConexion = functions.database.ref(`gerente/admin/mensajero_especial_conectado/{codigo}`)
.onDelete((data, context) => {
    const codigo_mensajero = context.params.codigo;
    var date = new Date(Date.now()-18000000);   

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var fecha = date.toString();
    console.log(fecha);
    
    return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero}/ultima_conexion`)
         .set(fecha, function(error){
             if(!error){
                console.log("fecha ultima conexion escrita correctamente");
             }
         });
});

exports.GestionMensajeroMotosUltimaConexion = functions.database.ref(`gerente/admin/mensajero_conectado/{codigo}`)
.onDelete((data, context) => {
    const codigo_mensajero = context.params.codigo;
    var date = new Date(Date.now()-18000000);   

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var fecha = date.toString();
    console.log(fecha);
    
    return admin.database().ref(`gerente/admin/mensajero/${codigo_mensajero}/ultima_conexion`)
         .set(fecha, function(error){
             if(!error){
                console.log("fecha ultima conexion escrita correctamente");
             }
         });
});

exports.VerificarprimerViaje = functions.database.ref(`gerente/admin/usuario/{id_usuario}/{id_pedido_especial}`)
    .onCreate((data, context) => {
        const id_usuario = context.params.id_usuario;
        const id_pedido_especial = context.params.id_pedido_especial;
        var usuario;

        return admin.database().ref(`gerente/admin/usuario/${id_usuario}/${id_pedido_especial}`)
            .once('value').then(function(tokensSnapshot) {
                const pedido_especial = tokensSnapshot.val();

                if (pedido_especial.length == 1) {
                    return admin.database().ref(`gerente/admin/usuario/${id_usuario}/`)
                        .once('value').then(function (usuarios) {
                            usuario = usuarios.val();
                            const refiere = usuario.refiere;
                            if (refiere !== undefined) {
                                return admin.database().ref(`gerente/admin/bonos_usuarios/${refiere}/referidos/${id_usuario}`)
                                    .set("canjear", function (error) {
                                        if (error) {
                                            console.log('ocurrio un error al setear al bono del usuario');
                                        } else {
                                            console.log('bono canjeado correctamente, se debe activar la otra funcion');
                                        }
                                    });
                            }
                        });
                } else {
                    console.log('No es el primer viaje');
                }

                
            });

    });


exports.DesconectarMensajerosInactivos = functions.database.ref(`gerente/admin/mensajero_especial_conectado/{codigo_mensajero}`)
    .onCreate((data, context)=>{
        var lista_mensajeros = [];
        var mensajero_nuevo;
        var codigo_mensajero = context.params.codigo_mensajero;
        console.log(codigo_mensajero);
        var fecha_ahora;
        var fecha_ultima_conexion;
        return admin.database().ref(`gerente/admin/mensajero_especial_conectado/`)
            .once('value').then(function(tokensSnapshot) {

                tokensSnapshot.forEach(function(childSnapshot) {
                    // key will be "ada" the first time and "alan" the second time
                    var key = childSnapshot.key;
                    // childData will be the actual contents of the child
                    var childData = childSnapshot.val();
                    lista_mensajeros.push(childData);
                });
                console.log(lista_mensajeros[1]);
                for(i = 0; i < lista_mensajeros.length; i++){
                    if(lista_mensajeros[i].codigo == codigo_mensajero){
                        mensajero_nuevo = lista_mensajeros[i];
                        var fecha = OrdenarStringFecha(mensajero_nuevo.hora_conexion);
                        fecha_ahora = new Date(fecha);
                        console.log("fecha ahora",fecha);
                        console.log("fecha ahora",fecha_ahora);
                    }
                }
                for(i = 0; i < lista_mensajeros.length; i++){
                    var fecha = OrdenarStringFecha(lista_mensajeros[i].ultimo_cambio_location);
                    fecha_ultima_conexion = new Date(fecha);
                    if(fecha_ahora.getTime() - fecha_ultima_conexion.getTime() > 3600000){
                        return admin.database().ref(`gerente/admin/mensajero_especial_conectado/${lista_mensajeros[i].codigo}`).remove();
                    }
                }

            });

            function OrdenarStringFecha(fecha){
                var fecha_ordenada;
                var fecha_mes;
                var fecha_horas;
                fecha = fecha.split(" ");
                fecha_mes = fecha[0];
                fecha_horas = fecha[1];
                fecha_horas = fecha_horas+"Z";
                fecha_mes = fecha_mes.split("-");
                fecha_mes = fecha_mes[2]+'-'+fecha_mes[1]+'-'+fecha_mes[0]+"T";
                fecha_ordenada = fecha_mes+fecha_horas;
                return fecha_ordenada;
            }
    });

    //función bienvenida usuarios
exports.MensajeAlertaServicio = functions.database.ref(`gerente/admin/alertas_mapa/{Aid}/codigo_mensajero_servicio/`).onCreate((data, context) => {
    const Aid = context.params.Aid

    return admin.database().ref(`gerente/admin/alertas_mapa/${Aid}`).once('value').then(function(alertas) {
        const alerta = alertas.val();
        const codigo_mensajero_servicio = alerta.codigo_mensajero_servicio
        return admin.database().ref(`gerente/admin/mensajero_especial/${codigo_mensajero_servicio}`).once('value').then(function(mensajeros) {
            const mensajero = mensajeros.val()
            
            let url = 'https://api.hablame.co/sms/envio/';
            const numero = '57'+ alerta.numero_usuario;
            const mensaje = 'Hola, Bienvenido a Mensajero, en un momento ' + mensajero.nombre+ ' telefono '+mensajero.telefono+
                ' pasará por tí en un '+ mensajero.marca+' '+mensajero.modelo_vehiculo+' color '+mensajero.color+' placas '+mensajero.placa+
                ' Descarga Mensajero, la app de la Ciudad Blanca http://cort.as/-7d6j';
        
            request.post(
                url,
                {
                    form:{
                      cliente : 10012200, //Numero de cliente
                      api : 'f4kl4wSN7KE8UxjoSHztoRKXDZ9I6y', //Clave API suministrada
                      numero : numero, //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
                      sms : mensaje, //Mensaje de texto a enviar
                      fecha : '', //(campo opcional) Fecha de envio, si se envia vacio se envia inmediatamente (Ejemplo: 2017-12-31 23:59:59)
                      referencia : 'usuario nuevo mensajero', //(campo opcional) Numero de referencio ó nombre de campaña
                    }
                }, function(err,httpResponse,body){ 
                    console.log(' response '+httpResponse)
                  console.log('body '+body)
               }
            );
        });
    
    });    
    });

exports.DesconectarMensajerosMotoInactivos = functions.database.ref(`gerente/admin/mensajero_conectado/{codigo_mensajero}`)
    .onCreate((data, context)=>{
        var lista_mensajeros = [];
        let mensajero_nuevo;
        var codigo_mensajero = context.params.codigo_mensajero;
        console.log(codigo_mensajero);
        var fecha_ahora;
        var fecha_ultima_conexion;
        return admin.database().ref(`gerente/admin/mensajero_conectado/`)
            .once('value').then(function(tokensSnapshot) {

                tokensSnapshot.forEach(function(childSnapshot) {
                    // key will be "ada" the first time and "alan" the second time
                    var key = childSnapshot.key;
                    // childData will be the actual contents of the child
                    var childData = childSnapshot.val();
                    lista_mensajeros.push(childData);
                });
                for(let i = 0; i < lista_mensajeros.length; i++){
                    if(lista_mensajeros[i].codigo == codigo_mensajero){
                        mensajero_nuevo = lista_mensajeros[i];
                        let fecha = OrdenarStringFecha(mensajero_nuevo.hora_conexion);
                        fecha_ahora = new Date(fecha);
                    }
                }
                const codigo_central = "7gJSMJsZNjRUDoOzKnO0GefE0ND3";
                for(let i = 0; i < lista_mensajeros.length; i++){
                    let fecha = OrdenarStringFecha(lista_mensajeros[i].ultimo_cambio_location);
                    fecha_ultima_conexion = new Date(fecha);
                    if(fecha_ahora.getTime() - fecha_ultima_conexion.getTime() > 7200000){
                        if(lista_mensajeros[i].codigo != codigo_central){
                            console.log("mensajero desconectado " ,lista_mensajeros[i].nombre)
                        return admin.database().ref(`gerente/admin/mensajero_conectado/${lista_mensajeros[i].codigo}`).remove();
                        }
            
                }
            }

            });

            function OrdenarStringFecha(fecha){
                var fecha_ordenada;
                var fecha_mes;
                var fecha_horas;
                fecha = fecha.split(" ");
                fecha_mes = fecha[0];
                fecha_horas = fecha[1];
                fecha_horas = fecha_horas+"Z";
                fecha_mes = fecha_mes.split("-");
                fecha_mes = fecha_mes[2]+'-'+fecha_mes[1]+'-'+fecha_mes[0]+"T";
                fecha_ordenada = fecha_mes+fecha_horas;
                return fecha_ordenada;
            }
    });
    // FUNCIONES PARA DOMICILIOS ********************************************

exports.ObserveEstadoDomicilio = functions.database.ref(`gerente/admin/domicilio/{id_domicilio}/estado/`).onUpdate((data, context)=>{
    id_domicilio = context.params.id_domicilio
    estado_domicilio = data.after._data
    if(estado_domicilio === 'cancelado' || estado_domicilio === 'entregado'){
        return admin.database().ref(`gerente/admin/domicilio/${id_domicilio}/`).once('value').then(function(dom) {
            const domicilio = dom.val()
            const id_empresa = domicilio.empresa.id_usuario
            const id_usuario = domicilio.id_usuario
            console.log('domi= ', domicilio)
            admin.database().ref(`gerente/admin/usuario_empresa/${id_empresa}/domicilio/${domicilio.id_domicilio}`).set(domicilio)
            admin.database().ref(`gerente/admin/usuario/${id_usuario}/domicilio/${domicilio.id_domicilio}`).set(domicilio)
        })
    }
});

exports.NuevoDomicilio = functions.database.ref(`gerente/admin/domicilio/{id_domicilio}/`).onCreate((data, context)=>{
    const id_domicilio = context.params.id_domicilio
    const domicilio = data._data
    console.log(domicilio)
    var mensaje = `${domicilio.nombre} ha pedido un nuevo domicilio, haz click aqui para atenderlo!`
    var payload = {
        notification: {
            title: 'Tienes un nuevo pedido!',
            icon: "https://firebasestorage.googleapis.com/v0/b/mensajero-7802b.appspot.com/o/carro.png?alt=media&token=0b2df562-83c0-4530-96b1-70865553ab28",
            body: mensaje,
            sound: './assets/notificacion.mp3'
        }
    }
    console.log(payload)
    enviarMensaje(domicilio.token_empresa, payload)
})

// funcion para enviar notificacion ********************************************
function enviarMensaje(token , payloads) {
    return admin.messaging().sendToDevice(token, payloads).then(function(response) {
        // See the MessagingTopicResponse reference documentation for the
        // contents of response.
        console.log("Successfully sent message:", response);
    }).catch(function(error) {
        console.log("Error sending message:", error);
    });
}

// --------------- Gestion de Alertas -------------------------------------------------------------------------------------------

exports.NewAlertGo = functions.database.ref(`gerente/admin/alertas_mapa/{id_alerta}`).onCreate((data, context) => {
    var alert = data._data
    var id_alert = context.params.id_alerta
    var socket = require('socket.io-client')('https://mensajero-7802b.appspot.com',
                {reconnection: false})

        socket.on('connect', ()=> {
            console.log('conectado: ', socket.connected)
        })
        socket.emit('new alert', id_alert)
})
