import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  template: `
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Mon profil</h1>
        <div class="page-subtitle">Gérez vos informations personnelles et votre compte</div>
      </div>
    </div>

    <!-- Bannière profil -->
    <mat-card class="hero">
      <div class="tricolor-bar hero-stripe"></div>
      <div class="hero-body">
        <div class="avatar-xl">{{ initials }}</div>
        <div class="hero-info">
          <h2>{{ user?.prenom }} {{ user?.nom }}</h2>
          <div class="hero-mail"><mat-icon>mail</mat-icon> {{ user?.email }}</div>
          <span class="role-chip" [ngClass]="roleClass">{{ user?.role }}</span>
        </div>
      </div>
    </mat-card>

    <div class="grid">
      <!-- Informations personnelles -->
      <mat-card class="info-card">
        <div class="card-title">
          <mat-icon>badge</mat-icon> Informations personnelles
          <button *ngIf="!edition" mat-button color="primary" class="edit-btn" (click)="activerEdition()">
            <mat-icon>edit</mat-icon> Modifier
          </button>
        </div>

        <ng-container *ngIf="!edition">
          <div class="field-row"><span class="lbl">Prénom</span><span class="val">{{ user?.prenom || '—' }}</span></div>
          <div class="field-row"><span class="lbl">Nom</span><span class="val">{{ user?.nom || '—' }}</span></div>
          <div class="field-row"><span class="lbl">Adresse email</span><span class="val">{{ user?.email || '—' }}</span></div>
          <div class="field-row"><span class="lbl">Rôle</span><span class="val" style="text-transform:capitalize;">{{ user?.role || '—' }}</span></div>
        </ng-container>

        <ng-container *ngIf="edition">
          <div class="edit-grid">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput [(ngModel)]="form.prenom">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput [(ngModel)]="form.nom">
            </mat-form-field>
            <mat-form-field appearance="outline" style="grid-column: span 2;">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" [(ngModel)]="form.email">
            </mat-form-field>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="enregistrer()">
              <mat-icon>save</mat-icon> Enregistrer
            </button>
            <button mat-button (click)="annuler()">Annuler</button>
          </div>
        </ng-container>
      </mat-card>

      <!-- Compte & sécurité -->
      <mat-card class="info-card">
        <div class="card-title"><mat-icon>shield</mat-icon> Compte &amp; sécurité</div>
        <div class="field-row"><span class="lbl">Statut du compte</span>
          <span class="role-chip role-etudiant">Actif</span></div>
        <div class="field-row"><span class="lbl">Type d'accès</span>
          <span class="val" style="text-transform:capitalize;">{{ user?.role || '—' }}</span></div>
        <div class="field-row"><span class="lbl">Session</span><span class="val">Authentifié (JWT)</span></div>

        <div class="sec-actions">
          <button mat-stroked-button (click)="info()">
            <mat-icon>lock_reset</mat-icon> Changer le mot de passe
          </button>
          <button mat-stroked-button color="warn" (click)="logout()">
            <mat-icon>logout</mat-icon> Se déconnecter
          </button>
        </div>
      </mat-card>
    </div>
  </div>
  `,
  styles: [`
    .hero { padding: 0 !important; overflow: hidden; margin-bottom: 22px; }
    .hero-stripe { border-radius: 0 !important; }
    .hero-body { display: flex; align-items: center; gap: 22px; padding: 26px 28px; }
    .avatar-xl {
      width: 88px; height: 88px; border-radius: 24px;
      background: var(--tricolor); color: #fff;
      font-weight: 700; font-size: 30px; font-family: 'Poppins', sans-serif;
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--shadow-md); flex-shrink: 0;
    }
    .hero-info h2 { margin: 0 0 6px; font-size: 24px; color: var(--text); }
    .hero-mail { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 14px; margin-bottom: 10px; }
    .hero-mail mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }

    .info-card { padding: 22px 24px !important; }
    .card-title {
      display: flex; align-items: center; gap: 9px;
      font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 16px;
      color: var(--unchk-blue); margin-bottom: 16px;
    }
    .card-title mat-icon { color: var(--unchk-blue); }
    .edit-btn { margin-left: auto; }

    .field-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 13px 0; border-bottom: 1px solid var(--border);
    }
    .field-row:last-child { border-bottom: none; }
    .field-row .lbl { color: var(--text-muted); font-size: 13.5px; }
    .field-row .val { color: var(--text); font-weight: 600; font-size: 14px; }

    .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .edit-grid mat-form-field { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 6px; }

    .sec-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
    .sec-actions button { justify-content: flex-start; border-radius: 10px; }
  `]
})
export class ProfilComponent {
  user = this.auth.getCurrentUser();
  edition = false;
  form: any = {};

  constructor(private auth: AuthService, private snack: MatSnackBar) {}

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

  activerEdition() {
    this.form = { prenom: this.user?.prenom, nom: this.user?.nom, email: this.user?.email };
    this.edition = true;
  }

  annuler() { this.edition = false; }

  enregistrer() {
    this.auth.updateProfile(this.form);
    this.user = this.auth.getCurrentUser();
    this.edition = false;
    this.snack.open('Profil mis à jour avec succès', 'OK', { duration: 3000 });
  }

  info() {
    this.snack.open('Le changement de mot de passe sera disponible prochainement.', 'OK', { duration: 4000 });
  }

  logout() { this.auth.logout(); }
}
