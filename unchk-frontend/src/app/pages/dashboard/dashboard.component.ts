import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EtudiantService, FormationService, FormateurService, InsertionService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
  <div class="page-container">

    <!-- Bannière de bienvenue -->
    <mat-card class="welcome">
      <div class="welcome-text">
        <h1>Bonjour, {{ user?.prenom }} 👋</h1>
        <p>{{ today | date:'EEEE d MMMM yyyy':'':'fr' }} — voici un aperçu de votre plateforme.</p>
      </div>
      <div class="welcome-glow"></div>
    </mat-card>

    <!-- Cartes statistiques -->
    <div class="stats">
      <mat-card class="stat-card" style="--accent: var(--unchk-blue)" routerLink="/etudiants">
        <div class="stat-body">
          <div class="stat-ico" style="background: var(--unchk-blue-light); color: var(--unchk-blue);">
            <mat-icon>school</mat-icon>
          </div>
          <div>
            <div class="stat-num">{{ nbEtudiants }}</div>
            <div class="stat-lbl">Étudiants</div>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card" style="--accent: var(--unchk-green)" routerLink="/formations">
        <div class="stat-body">
          <div class="stat-ico" style="background: var(--unchk-green-light); color: var(--unchk-green);">
            <mat-icon>menu_book</mat-icon>
          </div>
          <div>
            <div class="stat-num">{{ nbFormations }}</div>
            <div class="stat-lbl">Formations</div>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card" style="--accent: var(--unchk-orange)" routerLink="/formateurs">
        <div class="stat-body">
          <div class="stat-ico" style="background: var(--unchk-orange-light); color: #C2730A;">
            <mat-icon>co_present</mat-icon>
          </div>
          <div>
            <div class="stat-num">{{ nbFormateurs }}</div>
            <div class="stat-lbl">Formateurs</div>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card" style="--accent: #C2334D" routerLink="/insertions">
        <div class="stat-body">
          <div class="stat-ico" style="background: #FCE7EC; color: #C2334D;">
            <mat-icon>work</mat-icon>
          </div>
          <div>
            <div class="stat-num">{{ statsInsertion?.total || 0 }}</div>
            <div class="stat-lbl">Insertions pro.</div>
          </div>
        </div>
      </mat-card>
    </div>

    <!-- Accès rapides -->
    <h2 class="section-title">Accès rapides</h2>
    <div class="quick">
      <a routerLink="/etudiants" class="quick-item">
        <mat-icon style="color: var(--unchk-blue);">school</mat-icon><span>Étudiants</span>
      </a>
      <a routerLink="/formations" class="quick-item">
        <mat-icon style="color: var(--unchk-green);">menu_book</mat-icon><span>Formations</span>
      </a>
      <a routerLink="/formateurs" class="quick-item">
        <mat-icon style="color: #C2730A;">co_present</mat-icon><span>Formateurs</span>
      </a>
      <a routerLink="/documents" class="quick-item">
        <mat-icon style="color: var(--unchk-blue);">folder</mat-icon><span>Documents</span>
      </a>
      <a routerLink="/comptes-rendus" class="quick-item">
        <mat-icon style="color: var(--unchk-green);">description</mat-icon><span>Comptes rendus</span>
      </a>
      <a routerLink="/insertions" class="quick-item">
        <mat-icon style="color: #C2334D;">work</mat-icon><span>Insertion pro.</span>
      </a>
    </div>
  </div>
  `,
  styles: [`
    .welcome {
      position: relative; overflow: hidden; padding: 28px 30px !important;
      background: linear-gradient(135deg, var(--unchk-blue) 0%, var(--unchk-blue-dark) 100%);
      color: #fff; border: none !important; margin-bottom: 26px;
    }
    .welcome-text { position: relative; z-index: 2; }
    .welcome h1 { margin: 0 0 6px; font-size: 27px; color: #fff; }
    .welcome p { margin: 0; color: rgba(255,255,255,.85); font-size: 14.5px; text-transform: capitalize; }
    .welcome-glow {
      position: absolute; width: 280px; height: 280px; border-radius: 50%;
      background: var(--unchk-green); filter: blur(80px); opacity: .4;
      right: -60px; top: -90px;
    }

    .stats {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 18px; margin-bottom: 34px;
    }
    .stat-card { padding: 0 !important; cursor: pointer; }
    .stat-body { display: flex; align-items: center; gap: 16px; padding: 22px 20px; }
    .stat-ico {
      width: 54px; height: 54px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .stat-ico mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-num { font-size: 30px; font-weight: 700; color: var(--text); font-family: 'Poppins', sans-serif; line-height: 1; }
    .stat-lbl { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    .section-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 0 0 16px; }
    .quick { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
    .quick-item {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 22px 16px; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); text-decoration: none; color: var(--text);
      font-size: 14px; font-weight: 500;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    }
    .quick-item mat-icon { font-size: 30px; width: 30px; height: 30px; }
    .quick-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: transparent; }
  `]
})
export class DashboardComponent implements OnInit {
  user = this.auth.getCurrentUser();
  today = new Date();
  nbEtudiants = 0;
  nbFormations = 0;
  nbFormateurs = 0;
  statsInsertion: any = null;

  constructor(
    private auth: AuthService,
    private etudiantService: EtudiantService,
    private formationService: FormationService,
    private formateurService: FormateurService,
    private insertionService: InsertionService
  ) {}

  ngOnInit() {
    this.etudiantService.getAll().subscribe({ next: d => this.nbEtudiants = d.length, error: () => {} });
    this.formationService.getAll().subscribe({ next: d => this.nbFormations = d.length, error: () => {} });
    this.formateurService.getAll().subscribe({ next: d => this.nbFormateurs = d.length, error: () => {} });
    this.insertionService.getStats().subscribe({ next: s => this.statsInsertion = s, error: () => {} });
  }
}
