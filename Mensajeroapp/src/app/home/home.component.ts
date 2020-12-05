import { Component, OnInit, Input } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { slideInAnimation } from '../home/animation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [ slideInAnimation ]
})


export class HomeComponent implements OnInit {
    title = 'Mensajeroapp';
    constructor(private router: Router) {
 }

    ngOnInit() {
    }

    GoToPortal() {
      this.router.navigate(['../app']);
      console.log('click');
    }

    getAnimationData(outlet: RouterOutlet) {
      return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }

}