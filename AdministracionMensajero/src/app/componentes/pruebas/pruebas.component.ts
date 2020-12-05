import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit {

  constructor(private db:AngularFireDatabase) { }

  ngOnInit() {
  }

  getRandomInt(min, max) {
   this.db.database.ref(`gerente/admin/usuario/`).once('value', (datasnapshot)=>{
     datasnapshot.forEach(snap => {
       let usuario = snap.val()
       if(usuario.nombre != undefined){
        let s: string= usuario.nombre
        let arrays = s.split(' ')
        let name = arrays[0]
        let lastname = ""
        if(arrays[1] != null)lastname = arrays[1].substring(0,3).toUpperCase()
        name = name.toUpperCase()
        usuario.codigo_referido = name + lastname +Math.floor(Math.random() * (999 - 0)) + 0
        console.log(usuario.codigo_referido)
        //this.db.database.ref(`gerente/admin/usuario/${usuario.id_usuario}/codigo_referido`).set(usuario.codigo_referido)
       }
     });
   })
    
  }

}
