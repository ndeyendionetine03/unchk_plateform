import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormateurService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Formateur } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';

@Component({
  selector: 'app-formateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatSelectModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Formateurs</h1>
          <div class="page-subtitle">{{ formateurs.length }} formateur(s)</div>
        </div>
        <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
          <mat-icon>person_add</mat-icon> Nouveau formateur
        </button>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 18px; color: var(--unchk-blue);">{{ formateurEdite ? 'Modifier' : 'Ajouter' }} un formateur</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>Prénom *</mat-label>
            <input matInput [(ngModel)]="form.prenom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nom *</mat-label>
            <input matInput [(ngModel)]="form.nom">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Adresse email *</mat-label>
            <input matInput type="email" [(ngModel)]="form.email">
            <mat-icon matPrefix>mail</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="form.statut">
              <mat-option value="enseignant">Enseignant</mat-option>
              <mat-option value="associe">Associé</mat-option>
              <mat-option value="tuteur">Tuteur</mat-option>
              <mat-option value="responsable">Responsable</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Spécialité</mat-label>
            <input matInput [(ngModel)]="form.specialite">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date de prise de fonction</mat-label>
            <input matInput type="date" [(ngModel)]="form.datePriseFonction">
          </mat-form-field>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()" [disabled]="enregistrement">
            <mat-icon>save</mat-icon> {{ enregistrement ? 'Enregistrement…' : 'Sauvegarder' }}
          </button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="formateurs">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom complet</th>
            <td mat-cell *matCellDef="let f">
              <strong>{{ f.utilisateur?.prenom }} {{ f.utilisateur?.nom }}</strong>
              <div style="font-size:12px; color:var(--text-muted);">{{ f.utilisateur?.email }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let f">
              <span class="role-chip role-enseignant">{{ f.statut }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="specialite">
            <th mat-header-cell *matHeaderCellDef>Spécialité</th>
            <td mat-cell *matCellDef="let f">{{ f.specialite || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let f" style="text-align:right;">
              <button mat-icon-button (click)="detail(f)" title="Détail">
                <mat-icon>visibility</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(f)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(f.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow>
            <td [colSpan]="colonnes.length" style="text-align:center; padding:32px; color:#999;">Aucun formateur</td>
          </tr>
        </table>
      </mat-card>
    </div>
  `
})
export class FormateursComponent implements OnInit {
  formateurs: Formateur[] = [];
  colonnes = ['nom', 'statut', 'specialite', 'actions'];
  afficherFormulaire = false;
  enregistrement = false;
  formateurEdite: Formateur | null = null;
  form: any = { statut: 'enseignant' };

  peutEcrire = false;
  constructor(private service: FormateurService, private snack: MatSnackBar, private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() { this.peutEcrire = this.auth.can('formateurs', 'write'); this.charger(); }

  charger() {
    this.service.getAll().subscribe({
      next: d => this.formateurs = d,
      error: () => this.snack.open('Impossible de charger les formateurs.', 'OK', { duration: 3000 })
    });
  }

  ouvrirFormulaire() { this.form = { statut: 'enseignant' }; this.formateurEdite = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.formateurEdite = null; this.form = { statut: 'enseignant' }; }

  modifier(f: Formateur) {
    this.formateurEdite = f;
    this.form = {
      prenom: f.utilisateur?.prenom, nom: f.utilisateur?.nom, email: f.utilisateur?.email,
      statut: f.statut, specialite: f.specialite, datePriseFonction: f.datePriseFonction
    };
    this.afficherFormulaire = true;
  }

  detail(f: Formateur) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: (f.utilisateur?.prenom || '') + ' ' + (f.utilisateur?.nom || ''),
        sousTitre: 'Formateur',
        rows: [
          { label: 'Email', value: f.utilisateur?.email },
          { label: 'Statut', value: f.statut },
          { label: 'Spécialité', value: f.specialite },
          { label: 'Date de prise de fonction', value: f.datePriseFonction }
        ]
      }
    });
  }

  sauvegarder() {
    const f = this.form;
    if (!f.prenom?.trim() || !f.nom?.trim() || !f.email?.trim()) {
      this.snack.open('Le prénom, le nom et l\'email sont obligatoires.', 'OK', { duration: 3500 });
      return;
    }
    this.enregistrement = true;
    const payload: any = {
      utilisateur: { nom: f.nom.trim(), prenom: f.prenom.trim(), email: f.email.trim(), role: 'enseignant' },
      statut: f.statut || 'enseignant',
      specialite: f.specialite || null,
      datePriseFonction: f.datePriseFonction || null
    };
    if (this.formateurEdite?.utilisateur?.id) payload.utilisateur.id = this.formateurEdite.utilisateur.id;
    const obs = this.formateurEdite?.id
      ? this.service.update(this.formateurEdite.id, payload as Formateur)
      : this.service.create(payload as Formateur);
    obs.subscribe({
      next: () => {
        this.snack.open(this.formateurEdite ? 'Formateur modifié.' : 'Formateur ajouté avec succès.', 'OK', { duration: 3000 });
        this.enregistrement = false;
        this.annuler();
        this.charger();
      },
      error: (err) => {
        this.enregistrement = false;
        this.snack.open(err?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 });
      }
    });
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer ce formateur ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.snack.open('Formateur supprimé.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 })
    });
  }
}
