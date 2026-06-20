import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; resource?: string; }
interface NavGroup { titre: string; items: NavItem[]; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatTooltipModule
  ],
  template: `
  <div class="shell">

    <!-- Backdrop mobile -->
    <div class="backdrop" [class.show]="sidebarOpen()" (click)="sidebarOpen.set(false)"></div>

    <!-- ============ SIDEBAR ============ -->
    <aside class="sidebar" [class.open]="sidebarOpen()">
      <div class="logo-badge">
        <img src="assets/logo-unchk-full.png" alt="UNCHK" />
      </div>

      <nav class="nav">
        <ng-container *ngFor="let group of menuVisible">
          <div class="nav-group-title">{{ group.titre }}</div>
          <a *ngFor="let item of group.items"
             class="nav-item"
             [routerLink]="item.route"
             routerLinkActive="active"
             (click)="sidebarOpen.set(false)">
            <span class="indicator"></span>
            <mat-icon>{{ item.icon }}</mat-icon>
            <span class="label">{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>

      <div class="sidebar-footer">
        <a class="profile-mini" routerLink="/profil" (click)="sidebarOpen.set(false)">
          <div class="avatar">{{ initials }}</div>
          <div class="who">
            <strong>{{ user?.prenom }} {{ user?.nom }}</strong>
            <span class="role-chip" [ngClass]="roleClass">{{ user?.role }}</span>
          </div>
        </a>
      </div>
    </aside>

    <!-- ============ ZONE PRINCIPALE ============ -->
    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <button mat-icon-button class="burger" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Menu">
            <mat-icon>menu</mat-icon>
          </button>
          <div>
            <h2 class="topbar-title">{{ pageTitle() }}</h2>
            <div class="topbar-crumb">Plateforme de gestion universitaire</div>
          </div>
        </div>

        <div class="topbar-right">
          <button mat-icon-button matTooltip="Notifications" class="icon-btn">
            <mat-icon>notifications_none</mat-icon>
          </button>

          <button class="profile-trigger" [matMenuTriggerFor]="profileMenu">
            <div class="avatar sm">{{ initials }}</div>
            <div class="who hide-mobile">
              <strong>{{ user?.prenom }} {{ user?.nom }}</strong>
              <span>{{ user?.role }}</span>
            </div>
            <mat-icon class="chev hide-mobile">expand_more</mat-icon>
          </button>

          <mat-menu #profileMenu="matMenu" xPosition="before" class="profile-dropdown">
            <div class="menu-head">
              <div class="avatar">{{ initials }}</div>
              <div>
                <strong>{{ user?.prenom }} {{ user?.nom }}</strong>
                <div class="menu-mail">{{ user?.email }}</div>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/profil">
              <mat-icon>account_circle</mat-icon> Mon profil
            </button>
            <button mat-menu-item routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon> Tableau de bord
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item class="logout-item" (click)="logout()">
              <mat-icon>logout</mat-icon> Déconnexion
            </button>
          </mat-menu>
        </div>
      </header>
      <div class="tricolor-bar"></div>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }

    /* ---------- Sidebar ---------- */
    .sidebar {
      width: var(--sidebar-w);
      flex-shrink: 0;
      background: linear-gradient(180deg, var(--unchk-blue) 0%, var(--unchk-blue-dark) 100%);
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 30;
      box-shadow: var(--shadow-md);
    }
    .logo-badge {
      margin: 18px 18px 8px;
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,.18);
    }
    .logo-badge img { width: 100%; max-width: 160px; height: auto; display: block; }

    .nav { flex: 1; overflow-y: auto; padding: 10px 12px 18px; }
    .nav::-webkit-scrollbar { width: 6px; }
    .nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border: none; }

    .nav-group-title {
      color: rgba(255,255,255,.55);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .08em;
      padding: 16px 14px 6px;
    }
    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 11px 14px;
      margin: 2px 0;
      border-radius: 11px;
      color: rgba(255,255,255,.82);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background .18s ease, color .18s ease, transform .18s ease;
    }
    .nav-item mat-icon { font-size: 21px; width: 21px; height: 21px; }
    .nav-item .indicator {
      position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
      width: 4px; height: 0; border-radius: 0 4px 4px 0;
      background: var(--unchk-orange); transition: height .2s ease;
    }
    .nav-item:hover { background: rgba(255,255,255,.12); color: #fff; }
    .nav-item.active {
      background: rgba(255,255,255,.18);
      color: #fff;
    }
    .nav-item.active .indicator { height: 26px; }

    .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,.14); }
    .profile-mini {
      display: flex; align-items: center; gap: 11px;
      padding: 9px; border-radius: 12px; text-decoration: none;
      transition: background .18s ease;
    }
    .profile-mini:hover { background: rgba(255,255,255,.12); }
    .profile-mini .who { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .profile-mini .who strong { color: #fff; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ---------- Avatar ---------- */
    .avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: var(--tricolor);
      color: #fff; font-weight: 700; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,.2);
    }
    .avatar.sm { width: 38px; height: 38px; font-size: 14px; }

    /* ---------- Zone principale ---------- */
    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg); }

    .topbar {
      height: var(--topbar-h);
      background: var(--surface);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 22px;
      border-bottom: 1px solid var(--border);
      z-index: 20;
    }
    .topbar-left { display: flex; align-items: center; gap: 10px; }
    .burger { display: none; color: var(--unchk-blue); }
    .topbar-title { margin: 0; font-size: 18px; font-weight: 600; color: var(--text); line-height: 1.1; }
    .topbar-crumb { font-size: 12px; color: var(--text-muted); }

    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .icon-btn { color: var(--text-muted); }

    .profile-trigger {
      display: flex; align-items: center; gap: 10px;
      background: transparent; border: none; cursor: pointer;
      padding: 6px 8px 6px 6px; border-radius: 999px;
      transition: background .18s ease;
    }
    .profile-trigger:hover { background: var(--unchk-blue-light); }
    .profile-trigger .who { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
    .profile-trigger .who strong { font-size: 13.5px; color: var(--text); }
    .profile-trigger .who span { font-size: 11.5px; color: var(--text-muted); text-transform: capitalize; }
    .profile-trigger .chev { color: var(--text-muted); }

    .content { flex: 1; overflow-y: auto; }

    /* ---------- Menu profil ---------- */
    ::ng-deep .profile-dropdown .mat-mdc-menu-content { padding: 0; min-width: 240px; }
    ::ng-deep .profile-dropdown .menu-head {
      display: flex; align-items: center; gap: 12px; padding: 16px;
    }
    ::ng-deep .profile-dropdown .menu-head strong { font-size: 14px; color: var(--text); }
    ::ng-deep .profile-dropdown .menu-mail { font-size: 12px; color: var(--text-muted); }
    ::ng-deep .profile-dropdown .logout-item { color: #C2334D; }
    ::ng-deep .profile-dropdown .logout-item mat-icon { color: #C2334D; }

    /* ---------- Backdrop mobile ---------- */
    .backdrop {
      display: none; position: fixed; inset: 0; background: rgba(15,32,53,.45);
      z-index: 25; opacity: 0; transition: opacity .25s ease;
    }

    /* ---------- Responsive ---------- */
    @media (max-width: 900px) {
      .sidebar {
        position: fixed; top: 0; bottom: 0; left: 0;
        transform: translateX(-100%); transition: transform .28s cubic-bezier(.21,.61,.35,1);
      }
      .sidebar.open { transform: translateX(0); }
      .burger { display: inline-flex; }
      .backdrop { display: block; pointer-events: none; }
      .backdrop.show { opacity: 1; pointer-events: auto; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  user = this.auth.getCurrentUser();
  sidebarOpen = signal(false);
  pageTitle = signal('Tableau de bord');

  menu: NavGroup[] = [
    { titre: 'Principal', items: [
      { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    ]},
    { titre: 'Gestion académique', items: [
      { label: 'Étudiants', icon: 'school', route: '/etudiants', resource: 'etudiants' },
      { label: 'Formations', icon: 'menu_book', route: '/formations', resource: 'formations' },
      { label: 'Formateurs', icon: 'co_present', route: '/formateurs', resource: 'formateurs' },
      { label: 'Emplois du temps', icon: 'calendar_month', route: '/emplois-du-temps', resource: 'emplois-du-temps' },
    ]},
    { titre: 'Communication', items: [
      { label: 'Documents', icon: 'folder', route: '/documents', resource: 'documents' },
      { label: 'Comptes rendus', icon: 'description', route: '/comptes-rendus', resource: 'comptes-rendus' },
    ]},
    { titre: 'Administration', items: [
      { label: 'Budget', icon: 'account_balance', route: '/budgets', resource: 'budgets' },
    ]},
    { titre: 'Appui à l\'insertion', items: [
      { label: 'Insertion pro.', icon: 'work', route: '/insertions', resource: 'insertions' },
      { label: 'Partenaires', icon: 'handshake', route: '/partenaires', resource: 'partenaires' },
    ]},
  ];

  /** Menu filtré selon les droits de lecture du rôle courant. */
  menuVisible: NavGroup[] = [];

  private titles: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/etudiants': 'Étudiants',
    '/formations': 'Formations',
    '/formateurs': 'Formateurs',
    '/emplois-du-temps': 'Emplois du temps',
    '/documents': 'Documents',
    '/comptes-rendus': 'Comptes rendus',
    '/budgets': 'Gestion budgétaire',
    '/insertions': 'Insertion professionnelle',
    '/partenaires': 'Partenaires',
    '/profil': 'Mon profil',
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.construireMenu();
    this.setTitle(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.setTitle(e.urlAfterRedirects));
  }

  private construireMenu() {
    this.menuVisible = this.menu
      .map(g => ({ titre: g.titre, items: g.items.filter(i => !i.resource || this.auth.can(i.resource, 'read')) }))
      .filter(g => g.items.length > 0);
  }

  private setTitle(url: string) {
    const key = Object.keys(this.titles).find(k => url.startsWith(k));
    this.pageTitle.set(key ? this.titles[key] : 'UNCHK');
  }

  get initials(): string {
    const p = this.user?.prenom?.[0] ?? '';
    const n = this.user?.nom?.[0] ?? '';
    return (p + n).toUpperCase() || 'U';
  }

  get roleClass(): string {
    const r = (this.user?.role || '').toLowerCase();
    if (r.includes('admin')) return 'role-admin';
    if (r.includes('etud') || r.includes('étud')) return 'role-etudiant';
    if (r.includes('ens') || r.includes('format')) return 'role-enseignant';
    return 'role-insertion';
  }

  logout() { this.auth.logout(); }
}
