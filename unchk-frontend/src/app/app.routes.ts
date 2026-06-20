import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'etudiants',
        loadComponent: () => import('./pages/etudiants/etudiants.component').then(m => m.EtudiantsComponent)
      },
      {
        path: 'formations',
        loadComponent: () => import('./pages/formations/formations.component').then(m => m.FormationsComponent)
      },
      {
        path: 'formateurs',
        loadComponent: () => import('./pages/formateurs/formateurs.component').then(m => m.FormateursComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/documents/documents.component').then(m => m.DocumentsComponent)
      },
      {
        path: 'comptes-rendus',
        loadComponent: () => import('./pages/comptes-rendus/comptes-rendus.component').then(m => m.ComptesRendusComponent)
      },
      {
        path: 'insertions',
        loadComponent: () => import('./pages/insertions/insertions.component').then(m => m.InsertionsComponent)
      },
      {
        path: 'partenaires',
        loadComponent: () => import('./pages/partenaires/partenaires.component').then(m => m.PartenairesComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/budgets/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'emplois-du-temps',
        loadComponent: () => import('./pages/emplois-du-temps/emplois-du-temps.component').then(m => m.EmploisDuTempsComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
