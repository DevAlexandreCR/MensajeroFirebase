import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionService } from './auth.service';
import { CrudUsuarioService } from '../portal/main/servicios/crud-usuario.service';


@Injectable({
  providedIn: 'root'
})
export class MainGuards implements CanActivate {

  constructor(private authService: AutenticacionService, private router: Router, private crudUser: CrudUsuarioService) {

  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    if ( url === '/portal/main/registro') {
      return this.checkLoginPortal(url);
    } else if ( url === '/portal') {
      this.router.navigate(['/portal/main/login']);
    } else if ( url === '/home') {
      this.router.navigate(['/home']);
    } else  {
      return this.checkLoginPortal(url);
    }
  }

  checkLogin(url: string): boolean {
    if (this.authService.usuario != null ) {
      this.authService.usuario.subscribe(authState => {
        if (authState != null) {
          console.log("guard", authState.uid)
          this.authService.cambiologin.emit(true)
          this.router.navigate(['/portal/main/dashboard']);
          return true;
      } else {
        this.router.navigate(['/home']);
        this.authService.cambiologin.emit(false)
        console.log("guard checklogin", url)
        return true
      }
        });
    } else {
      return true
    }
  }

  checkLoginPortal(url: string): boolean {
    console.log('checklogin portal', url)
    if (this.authService.usuario != null) {
      this.authService.usuario.subscribe(islogin => {
        if (islogin != null) {
          this.authService.cambiologin.emit(true)
          if (url === '/portal/main/dashboard') {
            this.router.navigate(['/portal/main/dashboard']);
          } else if (url === '/portal/main/dashboard/inicio') {
            this.router.navigate(['/portal/main/dashboard/inicio']);
          } else if (url === '/portal/main/dashboard/inicio-empresas') {
            this.router.navigate(['/portal/main/dashboard/inicio-empresas']);
          } else if (url === '/portal/main/dashboard/ver-empresa/') {
            this.router.navigate(['/portal/main/dashboard/ver-empresa/']);
          } else if (url === '/portal/main/dashboard/perfil') {
            this.router.navigate(['/portal/main/dashboard/perfil']);
          }else if (url === '/portal/main/dashboard/perfil-empresa') {
            this.router.navigate(['/portal/main/dashboard/perfil-empresa']);
          } else if (url === '/portal/main/dashboard/historial') {
            this.router.navigate(['/portal/main/dashboard/historial']);
          } else if (url === '/portal/main/login') {
            this.router.navigate(['/portal/main/login']);
          }
            return true;
        } else {
          this.authService.cambiologin.emit(false)
    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;
    // Navigate to the login page with extras
    this.router.navigate(['/portal/main/login']);
    return true;
        }
      });
    }

    return true;
}
}

