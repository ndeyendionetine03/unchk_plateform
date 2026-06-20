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
import { InsertionService, EtudiantService } from '../../core/services/api.service';
import { Insertion, StatsInsertion, Etudiant } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-insertions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatSelectModule, MatDialogModule, MatMenuModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Insertion professionnelle</h1>
          <div class="page-subtitle">Suivi de l'insertion des diplômés</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
            <mat-icon>add</mat-icon> Ajouter
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;" *ngIf="stats">
        <mat-card class="stat-card" style="--accent: var(--unchk-blue); padding: 20px;">
          <div style="font-size: 28px; font-weight: 700; color: var(--unchk-blue);">{{ stats.total }}</div>
          <div style="color: #666; font-size: 13px;">Total insertions</div>
        </mat-card>
        <mat-card class="stat-card" style="--accent: var(--unchk-green); padding: 20px;">
          <div style="font-size: 28px; font-weight: 700; color: var(--unchk-green);">{{ stats.autoEmploi }}</div>
          <div style="color: #666; font-size: 13px;">Auto-emploi</div>
        </mat-card>
        <mat-card class="stat-card" style="--accent: var(--unchk-orange); padding: 20px;">
          <div style="font-size: 28px; font-weight: 700; color: var(--unchk-orange);">{{ stats.salarie }}</div>
          <div style="color: #666; font-size: 13px;">Emploi salarié</div>
        </mat-card>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 18px; color: var(--unchk-blue);">{{ insertionEditee ? 'Modifier' : 'Ajouter' }} une insertion</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Étudiant concerné *</mat-label>
            <mat-select [(ngModel)]="form.etudiantId">
              <mat-option *ngFor="let e of etudiants" [value]="e.id">
                {{ e.utilisateur?.prenom }} {{ e.utilisateur?.nom }}
                <span *ngIf="e.ine">— {{ e.ine }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type d'insertion *</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="auto-emploi">Auto-emploi</mat-option>
              <mat-option value="salarie">Emploi salarié</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date d'insertion</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateInsertion">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Employeur</mat-label>
            <input matInput [(ngModel)]="form.employeur">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Poste</mat-label>
            <input matInput [(ngModel)]="form.poste">
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
        <table mat-table [dataSource]="insertions">
          <ng-container matColumnDef="etudiant">
            <th mat-header-cell *matHeaderCellDef>Étudiant</th>
            <td mat-cell *matCellDef="let i">
              <strong>{{ i.etudiant?.utilisateur?.prenom }} {{ i.etudiant?.utilisateur?.nom }}</strong>
            </td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let i">
              <span [class]="i.type === 'salarie' ? 'role-chip role-etudiant' : 'role-chip role-insertion'">
                {{ i.type }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="employeur">
            <th mat-header-cell *matHeaderCellDef>Employeur</th>
            <td mat-cell *matCellDef="let i">{{ i.employeur || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="poste">
            <th mat-header-cell *matHeaderCellDef>Poste</th>
            <td mat-cell *matCellDef="let i">{{ i.poste || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let i">{{ i.dateInsertion | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let i" style="text-align:right;">
              <button mat-icon-button (click)="detail(i)" title="Détail">
                <mat-icon>visibility</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(i)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(i.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow>
            <td [colSpan]="colonnes.length" style="text-align:center; padding:32px; color:#999;">Aucune insertion enregistrée</td>
          </tr>
        </table>
      </mat-card>
    </div>
  `
})
export class InsertionsComponent implements OnInit {
  insertions: Insertion[] = [];
  etudiants: Etudiant[] = [];
  stats: StatsInsertion | null = null;
  colonnes = ['etudiant', 'type', 'employeur', 'poste', 'date', 'actions'];
  afficherFormulaire = false;
  enregistrement = false;
  insertionEditee: Insertion | null = null;
  form: any = {};
  peutEcrire = false;

  constructor(
    private service: InsertionService,
    private etudiantService: EtudiantService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.peutEcrire = this.auth.can('insertions', 'write');
    this.charger();
    this.etudiantService.getAll().subscribe({ next: e => this.etudiants = e, error: () => {} });
  }

  charger() {
    this.service.getAll().subscribe({ next: d => this.insertions = d, error: () => {} });
    this.service.getStats().subscribe({ next: s => this.stats = s, error: () => {} });
  }

  ouvrirFormulaire() { this.form = {}; this.insertionEditee = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.insertionEditee = null; this.form = {}; }

  modifier(i: Insertion) {
    this.insertionEditee = i;
    this.form = {
      etudiantId: i.etudiant?.id,
      type: i.type,
      dateInsertion: i.dateInsertion,
      employeur: i.employeur,
      poste: i.poste
    };
    this.afficherFormulaire = true;
  }

  detail(i: Insertion) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: (i.etudiant?.utilisateur?.prenom || '') + ' ' + (i.etudiant?.utilisateur?.nom || ''),
        sousTitre: 'Insertion professionnelle',
        rows: [
          { label: 'Type', value: i.type },
          { label: 'Employeur', value: i.employeur },
          { label: 'Poste', value: i.poste },
          { label: 'Date d\'insertion', value: i.dateInsertion }
        ]
      }
    });
  }

  sauvegarder() {
    if (!this.form.etudiantId) {
      this.snack.open('Veuillez sélectionner un étudiant.', 'OK', { duration: 3500 });
      return;
    }
    if (!this.form.type) {
      this.snack.open('Veuillez choisir le type d\'insertion.', 'OK', { duration: 3500 });
      return;
    }
    this.enregistrement = true;
    const payload: any = {
      etudiant: { id: this.form.etudiantId },
      type: this.form.type,
      dateInsertion: this.form.dateInsertion || null,
      employeur: this.form.employeur || null,
      poste: this.form.poste || null
    };
    const obs = this.insertionEditee?.id
      ? this.service.update(this.insertionEditee.id, payload as Insertion)
      : this.service.create(payload as Insertion);
    obs.subscribe({
      next: () => {
        this.snack.open(this.insertionEditee ? 'Insertion modifiée.' : 'Insertion ajoutée avec succès.', 'OK', { duration: 3000 });
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
    if (!id || !confirm('Supprimer cette insertion ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.snack.open('Insertion supprimée.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 })
    });
  }

  exportExcel() {
    const cols = ['Étudiant', 'Type', 'Employeur', 'Poste', 'Date'];
    const rows = this.insertions.map(i => [
      (i.etudiant?.utilisateur?.prenom || '') + ' ' + (i.etudiant?.utilisateur?.nom || ''),
      i.type || '', i.employeur || '', i.poste || '', i.dateInsertion || ''
    ]);
    exporterExcel('Insertions UNCHK', cols, rows);
  }
  exportPdf() {
    const cols = ['Étudiant', 'Type', 'Employeur', 'Poste', 'Date'];
    const rows = this.insertions.map(i => [
      (i.etudiant?.utilisateur?.prenom || '') + ' ' + (i.etudiant?.utilisateur?.nom || ''),
      i.type || '', i.employeur || '', i.poste || '', i.dateInsertion || ''
    ]);
    exporterPdf('Statistiques insertion professionnelle', cols, rows);
  }
}
