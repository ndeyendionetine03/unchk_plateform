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
import { BudgetService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Budget } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestion budgétaire</h1>
          <div class="page-subtitle">{{ budgets.length }} ligne(s) budgétaire(s)</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrir()">
            <mat-icon>add</mat-icon> Nouvelle ligne
          </button>
        </div>
      </div>

      <!-- Synthèse -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px;">
        <mat-card class="stat-card" style="--accent:var(--unchk-blue); padding:20px;">
          <div style="font-size:13px;color:#666;">Total prévu</div>
          <div style="font-size:24px;font-weight:700;color:var(--unchk-blue);">{{ totalPrevu | number:'1.0-0' }} <small>FCFA</small></div>
        </mat-card>
        <mat-card class="stat-card" style="--accent:var(--unchk-green); padding:20px;">
          <div style="font-size:13px;color:#666;">Total réalisé</div>
          <div style="font-size:24px;font-weight:700;color:var(--unchk-green);">{{ totalRealise | number:'1.0-0' }} <small>FCFA</small></div>
        </mat-card>
        <mat-card class="stat-card" style="--accent:var(--unchk-orange); padding:20px;">
          <div style="font-size:13px;color:#666;">Taux d'exécution</div>
          <div style="font-size:24px;font-weight:700;color:var(--unchk-orange);">{{ tauxExecution }}%</div>
        </mat-card>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom:24px; padding:24px;">
        <h3 style="margin:0 0 16px; color:var(--unchk-blue);">{{ edite ? 'Modifier' : 'Ajouter' }} une ligne budgétaire</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <mat-form-field appearance="outline" style="grid-column:span 2;">
            <mat-label>Libellé *</mat-label>
            <input matInput [(ngModel)]="form.libelle">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="projet">Projet de budget</mat-option>
              <mat-option value="realise">Budget réalisé</mat-option>
              <mat-option value="note_orientation">Note d'orientation</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Année</mat-label>
            <input matInput type="number" [(ngModel)]="form.annee">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Montant prévu (FCFA)</mat-label>
            <input matInput type="number" [(ngModel)]="form.montantPrevu">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Montant réalisé (FCFA)</mat-label>
            <input matInput type="number" [(ngModel)]="form.montantRealise">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:span 2;">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" [(ngModel)]="form.description"></textarea>
          </mat-form-field>
        </div>
        <div style="display:flex; gap:12px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()"><mat-icon>save</mat-icon> Sauvegarder</button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="budgets">
          <ng-container matColumnDef="libelle">
            <th mat-header-cell *matHeaderCellDef>Libellé</th>
            <td mat-cell *matCellDef="let b"><strong>{{ b.libelle }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let b"><span class="role-chip role-admin">{{ libelleType(b.type) }}</span></td>
          </ng-container>
          <ng-container matColumnDef="annee">
            <th mat-header-cell *matHeaderCellDef>Année</th>
            <td mat-cell *matCellDef="let b">{{ b.annee || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="prevu">
            <th mat-header-cell *matHeaderCellDef>Prévu</th>
            <td mat-cell *matCellDef="let b">{{ b.montantPrevu ? (b.montantPrevu | number:'1.0-0') : '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="realise">
            <th mat-header-cell *matHeaderCellDef>Réalisé</th>
            <td mat-cell *matCellDef="let b">{{ b.montantRealise ? (b.montantRealise | number:'1.0-0') : '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let b" style="text-align:right;">
              <button mat-icon-button (click)="detail(b)" title="Détail"><mat-icon>visibility</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(b)" title="Modifier"><mat-icon>edit</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(b.id)" title="Supprimer"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow><td [colSpan]="colonnes.length" style="text-align:center;padding:32px;color:#999;">Aucune ligne budgétaire</td></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  colonnes = ['libelle', 'type', 'annee', 'prevu', 'realise', 'actions'];
  afficherFormulaire = false;
  edite: Budget | null = null;
  form: Partial<Budget> = {};
  peutEcrire = false;

  constructor(private service: BudgetService, private snack: MatSnackBar,
              private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() {
    this.peutEcrire = this.auth.can('budgets', 'write');
    this.charger();
  }

  get totalPrevu() { return this.budgets.reduce((s, b) => s + (Number(b.montantPrevu) || 0), 0); }
  get totalRealise() { return this.budgets.reduce((s, b) => s + (Number(b.montantRealise) || 0), 0); }
  get tauxExecution() { return this.totalPrevu ? Math.round(this.totalRealise / this.totalPrevu * 100) : 0; }

  libelleType(t?: string) {
    const m: any = { projet: 'Projet de budget', realise: 'Budget réalisé', note_orientation: "Note d'orientation" };
    return (t && m[t]) ? m[t] : t;
  }

  charger() {
    this.service.getAll().subscribe({ next: d => this.budgets = d, error: () => this.snack.open('Chargement impossible.', 'OK', { duration: 3000 }) });
  }

  ouvrir() { this.form = {}; this.edite = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.edite = null; this.form = {}; }
  modifier(b: Budget) { this.edite = b; this.form = { ...b }; this.afficherFormulaire = true; }

  detail(b: Budget) {
    this.dialog.open(DetailDialogComponent, { data: {
      titre: b.libelle, sousTitre: this.libelleType(b.type),
      rows: [
        { label: 'Type', value: this.libelleType(b.type) },
        { label: 'Année', value: b.annee },
        { label: 'Montant prévu', value: b.montantPrevu ? b.montantPrevu + ' FCFA' : null },
        { label: 'Montant réalisé', value: b.montantRealise ? b.montantRealise + ' FCFA' : null },
        { label: 'Description', value: b.description }
      ]
    }});
  }

  sauvegarder() {
    if (!this.form.libelle?.trim() || !this.form.type) {
      this.snack.open('Le libellé et le type sont obligatoires.', 'OK', { duration: 3500 }); return;
    }
    const obs = this.edite?.id ? this.service.update(this.edite.id, this.form as Budget) : this.service.create(this.form as Budget);
    obs.subscribe({
      next: () => { this.snack.open(this.edite ? 'Ligne modifiée.' : 'Ligne ajoutée.', 'OK', { duration: 3000 }); this.annuler(); this.charger(); },
      error: (e) => this.snack.open(e?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 })
    });
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer cette ligne budgétaire ?')) return;
    this.service.delete(id).subscribe({ next: () => { this.snack.open('Supprimée.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 }) });
  }

  private donneesExport(): (string | number)[][] {
    return this.budgets.map(b => [
      b.libelle, this.libelleType(b.type) || '', b.annee ?? '',
      b.montantPrevu ?? '', b.montantRealise ?? ''
    ]);
  }
  private colsExport = ['Libellé', 'Type', 'Année', 'Montant prévu', 'Montant réalisé'];
  exportExcel() { exporterExcel('Budget UNCHK', this.colsExport, this.donneesExport()); }
  exportPdf() { exporterPdf('Gestion budgétaire', this.colsExport, this.donneesExport()); }
}
