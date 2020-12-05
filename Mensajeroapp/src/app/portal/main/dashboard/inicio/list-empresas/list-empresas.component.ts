import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Empresa } from '../../../constantes/empresa';

@Component({
  selector: 'app-list-empresas',
  templateUrl: './list-empresas.component.html',
  styleUrls: ['./list-empresas.component.css']
})
export class ListEmpresasComponent implements OnInit {

  @Input() categorias: [string]
  @Input() restaurantes: [Empresa]
  @Input() farmacias: [Empresa]
  @Input() licores: [Empresa]
  @Input() floristerias: [Empresa]
  @Input() supermercados: [Empresa]
  @Output() empresa_seleccionada: EventEmitter<Empresa> = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

}
