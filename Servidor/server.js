'use strict'
const Constantes = require('./clases/Constantes')
const ServicioMEnsajeroGo = require('./servicios/servicioMensajeroGo')
var admin = require("firebase-admin"),
    serviceAccount = require("./mensajero-7802b-firebase-adminsdk-z93bh-132adfcfce.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mensajero-7802b.firebaseio.com"
})
var database = admin.database()
var servicioGo = new ServicioMEnsajeroGo(admin)

let http = require('http').createServer(),
    port = (process.env.PORT || 3000),
    io = require('socket.io')(http)


function webServer(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`servidor online, puerto ${port}`)
}

http.on('request', webServer)
    .listen(port, () => {
      console.log('servidor corriendo en puerto: %d', port)
    })


io.on('connection', (socket) => {

  // evento que temporiza cada alerta nueva
  socket.on('new alert', (id_alert) => {
    console.log('new alert: ', id_alert)
    let refAlertas = database.ref(`gerente/admin/alertas_mapa/${id_alert}`)
    refAlertas.once('value', alertas).then((err) => {
      if (!err.exists()){
        console.log('aleta no encontrada')
      } else {
        console.log('trabajando en la alerta')
      }
      socket.disconnect(true)
    })
  })

  // evento para enviar los servicios a los conductortes de carros
  socket.on(Constantes.getEVENT_NEW_LIST_GO(), (id_lista) => {
    let mensajeros = [],
        refLista = database.ref(`gerente/admin/mensajeros_especial_env_mensaje/${id_lista}/`)
        refLista.once('value', (snapshot) => 
        {
          snapshot.forEach((childSnapshot) => {
            // key will be "ada" the first time and "alan" the second time
            var key = childSnapshot.key;
            // childData will be the actual contents of the child
            var childData = childSnapshot.val();
            mensajeros.push(childData);
          })
          servicioGo.reenviarServicio(mensajeros, id_lista)
          socket.disconnect(true)
          })
  })

  // evento para terminar viaje mensajero Go
  socket.on(Constantes.getEVENT_TERMINAR_VIAJE_GO(), (data) => {
    console.log(Constantes.EVENT_TERMINAR_VIAJE_GO(), data)
    servicioGo.TerminarViajeGo(data)
  })

  socket.on('disconnect', (reason) => {
    console.log('desconectado: ', reason)
  })
})






