import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  isAndroid: boolean = false
  isiOS: boolean = false
  isPC : boolean = false

  constructor() { }

  ngOnInit() {

    var isMobile = {
      Android: function() {
          return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
          return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
          return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
          return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
          return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
  }

  if(isMobile.Android()) {
    console.log('Esto es un dispositivo Android');
    this.isAndroid = true
  } else if(isMobile.iOS()) {
    console.log('Esto es un dispositivo iOS');
    this.isiOS = true
  } else {
    console.log('es un pc')
    this.isPC = true
  }

}

}
