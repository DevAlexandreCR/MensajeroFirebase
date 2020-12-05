import { Component, OnInit, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './home/animation';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ slideInAnimation ],
  providers: []
})
export class AppComponent implements OnInit {
  title = 'Mensajeroapp';


  constructor() {

  }


  ngOnInit() {
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

}
