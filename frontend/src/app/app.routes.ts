import { Routes } from '@angular/router';

import { LoginComponent } from './login.component';
import { HomeComponent } from './home.component';
import { ShellComponent } from './shell.component';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'app',
    component: ShellComponent
  },

  {
    path: '**',
    redirectTo: ''
  }

];