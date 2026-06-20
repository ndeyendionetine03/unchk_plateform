import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="auth">
    <!-- Panneau gauche : marque -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="logo-card">
          <img src="assets/logo-unchk-full.png" alt="UNCHK" />
        </div>
        <h1>Plateforme de gestion universitaire</h1>
        <p>Étudiants, formations, formateurs, documents et suivi de l'insertion professionnelle — réunis dans un seul espace.</p>
        <ul class="features">
          <li><mat-icon>school</mat-icon> Gestion des étudiants &amp; formations</li>
          <li><mat-icon>folder</mat-icon> Documents &amp; comptes rendus centralisés</li>
          <li><mat-icon>insights</mat-icon> Suivi de l'insertion professionnelle</li>
        </ul>
      </div>
      <div class="brand-glow g1"></div>
      <div class="brand-glow g2"></div>
    </div>

    <!-- Panneau droit : formulaire -->
    <div class="form-panel">
      <div class="form-wrap">
        <div class="form-logo">
          <img src="assets/logo-unchk-full.png" alt="UNCHK" />
        </div>
        <h2>Connexion</h2>
        <p class="sub">Accédez à votre espace de gestion</p>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Adresse email</mat-label>
          <input matInput type="email" [(ngModel)]="email" placeholder="prenom.nom@unchk.edu.sn"
                 (keyup.enter)="login()">
          <mat-icon matPrefix>mail</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Mot de passe</mat-label>
          <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="motDePasse"
                 (keyup.enter)="login()">
          <mat-icon matPrefix>lock</mat-icon>
          <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>

        <div *ngIf="erreur" class="err">
          <mat-icon>error_outline</mat-icon> {{ erreur }}
        </div>

        <button mat-raised-button color="primary" class="submit" (click)="login()" [disabled]="chargement">
          <mat-spinner *ngIf="chargement" diameter="20" class="spin"></mat-spinner>
          {{ chargement ? 'Connexion…' : 'Se connecter' }}
        </button>

        <div class="tricolor-bar foot-bar"></div>
        <p class="copy">© {{ year }} Université numérique Cheikh Hamidou Kane</p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth { min-height: 100vh; display: grid; grid-template-columns: 1.05fr 1fr; }

    /* Panneau marque */
    .brand-panel {
      position: relative; overflow: hidden;
      background: linear-gradient(150deg, var(--unchk-blue) 0%, var(--unchk-blue-dark) 100%);
      color: #fff; display: flex; align-items: center; padding: 56px;
    }
    .brand-content { position: relative; z-index: 2; max-width: 460px; }
    .logo-card {
      background: #fff; border-radius: 18px; padding: 20px 24px;
      display: inline-flex; box-shadow: 0 12px 30px rgba(0,0,0,.22); margin-bottom: 34px;
    }
    .logo-card img { width: 190px; height: auto; display: block; }
    .brand-content h1 { font-size: 32px; line-height: 1.18; margin: 0 0 16px; font-weight: 700; }
    .brand-content p { font-size: 15.5px; line-height: 1.6; color: rgba(255,255,255,.85); margin: 0 0 28px; }
    .features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
    .features li { display: flex; align-items: center; gap: 12px; font-size: 14.5px; color: rgba(255,255,255,.92); }
    .features mat-icon {
      background: rgba(255,255,255,.16); border-radius: 9px; padding: 6px;
      font-size: 20px; width: 20px; height: 20px;
    }
    .brand-glow { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; }
    .g1 { width: 340px; height: 340px; background: var(--unchk-green); bottom: -120px; right: -80px; }
    .g2 { width: 260px; height: 260px; background: var(--unchk-orange); top: -90px; left: -60px; opacity: .35; }

    /* Panneau formulaire */
    .form-panel { display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: var(--surface); }
    .form-wrap { width: 100%; max-width: 380px; }
    .form-logo { display: none; text-align: center; margin-bottom: 18px; }
    .form-logo img { width: 150px; }
    .form-wrap h2 { font-size: 26px; margin: 0 0 6px; color: var(--text); }
    .sub { color: var(--text-muted); font-size: 14px; margin: 0 0 26px; }
    .w-full { width: 100%; }
    .err {
      display: flex; align-items: center; gap: 7px; color: #C2334D;
      background: #FCE7EC; border-radius: 10px; padding: 10px 12px;
      font-size: 13.5px; margin-bottom: 14px;
    }
    .err mat-icon { font-size: 19px; width: 19px; height: 19px; }
    .submit { width: 100%; height: 50px; font-size: 15px; margin-top: 6px; border-radius: 12px !important; }
    .spin { display: inline-block; margin-right: 8px; }
    .foot-bar { margin: 26px auto 14px; max-width: 120px; }
    .copy { text-align: center; color: var(--text-muted); font-size: 12px; margin: 0; }

    @media (max-width: 920px) {
      .auth { grid-template-columns: 1fr; }
      .brand-panel { display: none; }
      .form-logo { display: block; }
    }
  `]
})
export class LoginComponent {
  email = '';
  motDePasse = '';
  erreur = '';
  chargement = false;
  hidePassword = true;
  year = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.motDePasse) {
      this.erreur = 'Veuillez renseigner votre email et votre mot de passe.';
      return;
    }
    this.chargement = true;
    this.erreur = '';
    this.auth.login(this.email, this.motDePasse).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.erreur = 'Email ou mot de passe incorrect.';
        this.chargement = false;
      }
    });
  }
}
