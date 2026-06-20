import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PartenaireService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Partenaire } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-partenaires',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Partenaires</h1>
          <div class="page-subtitle">{{ partenaires.length }} partenaire(s)</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrir()">
            <mat-icon>add</mat-icon> Nouveau partenaire
          </button>
        </div>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom:24px; padding:24px;">
        <h3 style="margin:0 0 16px; color:var(--unchk-blue);">{{ edite ? 'Modifier' : 'Ajouter' }} un partenaire</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <mat-form-field appearance="outline" style="grid-column:span 2;">
            <mat-label>Nom *</mat-label>
            <input matInput [(ngModel)]="form.nom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="entreprise">Entreprise</mat-option>
              <mat-option value="institution">Institution</mat-option>
              <mat-option value="ong">ONG</mat-option>
              <mat-option value="universite">Université</mat-option>
              <mat-option value="autre">Autre</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Domaine</mat-label>
            <input matInput [(ngModel)]="form.domaine">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Personne de contact</mat-label>
            <input matInput [(ngModel)]="form.contact">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="form.statut">
              <mat-option value="actif">Actif</mat-option>
              <mat-option value="inactif">Inactif</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="form.email">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput [(ngModel)]="form.telephone">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Début partenariat</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateDebut">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fin partenariat</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateFin">
          </mat-form-field>
        </div>
        <div style="display:flex; gap:12px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()"><mat-icon>save</mat-icon> Sauvegarder</button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="partenaires">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let p"><strong>{{ p.nom }}</strong><div style="font-size:12px;color:var(--text-muted);">{{ p.domaine }}</div></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let p">{{ p.type || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact</th>
            <td mat-cell *matCellDef="let p">{{ p.contact || '—' }}<div style="font-size:12px;color:var(--text-muted);">{{ p.email }}</div></td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <span [class]="p.statut === 'inactif' ? 'role-chip role-insertion' : 'role-chip role-etudiant'">{{ p.statut || 'actif' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let p" style="text-align:right;">
              <button mat-icon-button (click)="detail(p)" title="Détail"><mat-icon>visibility</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(p)" title="Modifier"><mat-icon>edit</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(p.id)" title="Supprimer"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow><td [colSpan]="colonnes.length" style="text-align:center;padding:32px;color:#999;">Aucun partenaire</td></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class PartenairesComponent implements OnInit {
  partenaires: Partenaire[] = [];
  colonnes = ['nom', 'type', 'contact', 'statut', 'actions'];
  afficherFormulaire = false;
  edite: Partenaire | null = null;
  form: Partial<Partenaire> = { statut: 'actif' };
  peutEcrire = false;

  constructor(private service: PartenaireService, private snack: MatSnackBar,
              private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() { this.peutEcrire = this.auth.can('partenaires', 'write'); this.charger(); }

  charger() {
    this.service.getAll().subscribe({ next: d => this.partenaires = d, error: () => this.snack.open('Chargement impossible.', 'OK', { duration: 3000 }) });
  }

  ouvrir() { this.form = { statut: 'actif' }; this.edite = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.edite = null; this.form = { statut: 'actif' }; }
  modifier(p: Partenaire) { this.edite = p; this.form = { ...p }; this.afficherFormulaire = true; }

  detail(p: Partenaire) {
    this.dialog.open(DetailDialogComponent, { data: {
      titre: p.nom, sousTitre: p.type,
      rows: [
        { label: 'Type', value: p.type },
        { label: 'Domaine', value: p.domaine },
        { label: 'Contact', value: p.contact },
        { label: 'Email', value: p.email },
        { label: 'Téléphone', value: p.telephone },
        { label: 'Début', value: p.dateDebut },
        { label: 'Fin', value: p.dateFin },
        { label: 'Statut', value: p.statut }
      ]
    }});
  }

  sauvegarder() {
    if (!this.form.nom?.trim()) { this.snack.open('Le nom est obligatoire.', 'OK', { duration: 3500 }); return; }
    const obs = this.edite?.id ? this.service.update(this.edite.id, this.form as Partenaire) : this.service.create(this.form as Partenaire);
    obs.subscribe({
      next: () => { this.snack.open(this.edite ? 'Partenaire modifié.' : 'Partenaire ajouté.', 'OK', { duration: 3000 }); this.annuler(); this.charger(); },
      error: (e) => this.snack.open(e?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 })
    });
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer ce partenaire ?')) return;
    this.service.delete(id).subscribe({ next: () => { this.snack.open('Supprimé.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 }) });
  }

  private donneesExport(): (string | number)[][] {
    return this.partenaires.map(p => [p.nom, p.type || '', p.domaine || '', p.contact || '', p.email || '', p.telephone || '', p.statut || '']);
  }
  private colsExport = ['Nom', 'Type', 'Domaine', 'Contact', 'Email', 'Téléphone', 'Statut'];
  exportExcel() { exporterExcel('Partenaires UNCHK', this.colsExport, this.donneesExport()); }
  exportPdf() { exporterPdf('Base de données partenariats', this.colsExport, this.donneesExport()); }
}
