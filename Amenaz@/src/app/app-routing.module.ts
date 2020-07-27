import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'myaccount',
    loadChildren: () => import('./pages/myaccount/myaccount.module').then((m) => m.MyaccountPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then((m) => m.NotificationsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'credits',
    loadChildren: () => import('./pages/credits/credits.module').then((m) => m.CreditsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'privacy',
    loadChildren: () => import('./pages/privacy/privacy.module').then((m) => m.PrivacyPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications-logs',
    loadChildren: () => import('./pages/notifications-logs/notifications-logs.module').then((m) => m.NotificationsLogsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'city',
    loadChildren: () => import('./pages/city/city.module').then((m) => m.CityPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'recover',
    loadChildren: () => import('./pages/auth/recover/recover.module').then((m) => m.RecoverPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
