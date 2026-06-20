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
import { MatMenuModule } from '@angular/material/menu';
import { FormationService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatSelectModule, MatDialogModule, MatMenuModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Formations</h1>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
            <mat-icon>add</mat-icon> Nouvelle formation
          </button>
        </div>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 16px; color: var(--unchk-blue);">{{ formationEditee ? 'Modifier' : 'Ajouter' }} une formation</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Intitule de la formation</mat-label>
            <input matInput [(ngModel)]="form.intitule">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="initiale">Initiale</mat-option>
              <mat-option value="continue">Continue</mat-option>
              <mat-option value="certifiante">Certifiante</mat-option>
              <mat-option value="privee">Privee</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <mat-select [(ngModel)]="form.niveau">
              <mat-option value="Licence">Licence</mat-option>
              <mat-option value="Master">Master</mat-option>
              <mat-option value="Doctorat">Doctorat</mat-option>
              <mat-option value="BTS">BTS</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date debut</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateDebut">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date fin</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateFin">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Montant (FCFA)</mat-label>
            <input matInput type="number" [(ngModel)]="form.montant">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Financement</mat-label>
            <input matInput [(ngModel)]="form.financement" placeholder="ex: État, Bailleur...">
          </mat-form-field>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()">
            <mat-icon>save</mat-icon> Sauvegarder
          </button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="formations">
          <ng-container matColumnDef="intitule">
            <th mat-header-cell *matHeaderCellDef>Intitule</th>
            <td mat-cell *matCellDef="let f"><strong>{{ f.intitule }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let f">{{ f.type || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="niveau">
            <th mat-header-cell *matHeaderCellDef>Niveau</th>
            <td mat-cell *matCellDef="let f">{{ f.niveau || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="dateDebut">
            <th mat-header-cell *matHeaderCellDef>Date debut</th>
            <td mat-cell *matCellDef="let f">{{ f.dateDebut | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
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
            <td [colSpan]="colonnes.length" style="text-align:center; padding:32px; color:#999;">
              Aucune formation trouvee
            </td>
          </tr>
        </table>
      </mat-card>
    </div>
  `
})
export class FormationsComponent implements OnInit {
  formations: Formation[] = [];
  colonnes = ['intitule', 'type', 'niveau', 'dateDebut', 'actions'];
  afficherFormulaire = false;
  formationEditee: Formation | null = null;
  form: Partial<Formation> = {};

  peutEcrire = false;
  constructor(private service: FormationService, private snack: MatSnackBar, private dialog: MatDialog, private auth: AuthService) {}

  ouvrirFormulaire() { this.form = {}; this.formationEditee = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.formationEditee = null; this.form = {}; }

  modifier(f: Formation) {
    this.formationEditee = f;
    this.form = { ...f };
    this.afficherFormulaire = true;
  }

  detail(f: Formation) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: f.intitule,
        sousTitre: 'Formation',
        rows: [
          { label: 'Type', value: f.type },
          { label: 'Niveau', value: f.niveau },
          { label: 'Date de début', value: f.dateDebut },
          { label: 'Date de fin', value: f.dateFin },
          { label: 'Montant', value: f.montant ? f.montant + ' FCFA' : null },
          { label: 'Financement', value: f.financement },
          { label: 'Formés (H)', value: f.nbFormesH },
          { label: 'Formés (F)', value: f.nbFormesF }
        ]
      }
    });
  }
  ngOnInit() { this.peutEcrire = this.auth.can('formations', 'write'); this.charger(); }
  charger() { this.service.getAll().subscribe(d => this.formations = d); }
  sauvegarder() {
    if (!this.form.intitule?.trim()) {
      this.snack.open('L\'intitulé de la formation est obligatoire.', 'OK', { duration: 3500 });
      return;
    }
    const obs = this.formationEditee?.id
      ? this.service.update(this.formationEditee.id, this.form as Formation)
      : this.service.create(this.form as Formation);
    obs.subscribe({
      next: () => {
        this.snack.open(this.formationEditee ? 'Formation modifiée.' : 'Formation ajoutée avec succès.', 'OK', { duration: 3000 });
        this.annuler();
        this.charger();
      },
      error: (err) => this.snack.open(err?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 })
    });
  }
  supprimer(id?: number) {
    if (!id || !confirm('Supprimer cette formation ?')) return;
    this.service.delete(id).subscribe(() => {
      this.snack.open('Formation supprimee', 'OK', { duration: 3000 });
      this.charger();
    });
  }

  exportExcel() {
    const cols = ['Intitulé', 'Type', 'Niveau', 'Date début', 'Date fin', 'Montant', 'Financement'];
    const rows = this.formations.map(f => [
      f.intitule || '', f.type || '', f.niveau || '', f.dateDebut || '', f.dateFin || '',
      f.montant ?? '', f.financement || ''
    ]);
    exporterExcel('Formations UNCHK', cols, rows);
  }
  exportPdf() {
    const cols = ['Intitulé', 'Type', 'Niveau', 'Début', 'Fin'];
    const rows = this.formations.map(f => [f.intitule || '', f.type || '', f.niveau || '', f.dateDebut || '', f.dateFin || '']);
    exporterPdf('Catalogue des formations', cols, rows);
  }
}
