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
import { EmploiDuTempsService, FormationService, FormateurService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { EmploiDuTemps, Formation, Formateur } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-emplois-du-temps',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Emplois du temps</h1>
          <div class="page-subtitle">{{ emplois.length }} séance(s) programmée(s)</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrir()">
            <mat-icon>add</mat-icon> Nouvelle séance
          </button>
        </div>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom:24px; padding:24px;">
        <h3 style="margin:0 0 16px; color:var(--unchk-blue);">{{ edite ? 'Modifier' : 'Programmer' }} une séance</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <mat-form-field appearance="outline" style="grid-column:span 2;">
            <mat-label>Formation *</mat-label>
            <mat-select [(ngModel)]="form.formationId">
              <mat-option *ngFor="let f of formations" [value]="f.id">{{ f.intitule }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="cours">Cours</mat-option>
              <mat-option value="devoir">Devoir</mat-option>
              <mat-option value="examen">Examen</mat-option>
              <mat-option value="tutorat">Tutorat</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Matière</mat-label>
            <input matInput [(ngModel)]="form.matiere">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Jour *</mat-label>
            <mat-select [(ngModel)]="form.jour">
              <mat-option *ngFor="let j of jours" [value]="j">{{ j }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Salle</mat-label>
            <input matInput [(ngModel)]="form.salle">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Heure de début</mat-label>
            <input matInput type="time" [(ngModel)]="form.heureDebut">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Heure de fin</mat-label>
            <input matInput type="time" [(ngModel)]="form.heureFin">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:span 2;">
            <mat-label>Formateur</mat-label>
            <mat-select [(ngModel)]="form.formateurId">
              <mat-option [value]="null">— Aucun —</mat-option>
              <mat-option *ngFor="let f of formateurs" [value]="f.id">
                {{ f.utilisateur?.prenom }} {{ f.utilisateur?.nom }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div style="display:flex; gap:12px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()"><mat-icon>save</mat-icon> Sauvegarder</button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="emplois">
          <ng-container matColumnDef="jour">
            <th mat-header-cell *matHeaderCellDef>Jour</th>
            <td mat-cell *matCellDef="let e"><strong>{{ e.jour }}</strong>
              <div style="font-size:12px;color:var(--text-muted);">{{ e.heureDebut }} - {{ e.heureFin }}</div></td>
          </ng-container>
          <ng-container matColumnDef="matiere">
            <th mat-header-cell *matHeaderCellDef>Matière</th>
            <td mat-cell *matCellDef="let e">{{ e.matiere || '—' }}
              <span *ngIf="e.type" class="role-chip role-enseignant" style="margin-left:6px;">{{ e.type }}</span></td>
          </ng-container>
          <ng-container matColumnDef="formation">
            <th mat-header-cell *matHeaderCellDef>Formation</th>
            <td mat-cell *matCellDef="let e">{{ e.formation?.intitule || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="formateur">
            <th mat-header-cell *matHeaderCellDef>Formateur</th>
            <td mat-cell *matCellDef="let e">{{ e.formateur ? (e.formateur.utilisateur?.prenom + ' ' + e.formateur.utilisateur?.nom) : '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="salle">
            <th mat-header-cell *matHeaderCellDef>Salle</th>
            <td mat-cell *matCellDef="let e">{{ e.salle || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let e" style="text-align:right;">
              <button mat-icon-button (click)="detail(e)" title="Détail"><mat-icon>visibility</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(e)" title="Modifier"><mat-icon>edit</mat-icon></button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(e.id)" title="Supprimer"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow><td [colSpan]="colonnes.length" style="text-align:center;padding:32px;color:#999;">Aucune séance programmée</td></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class EmploisDuTempsComponent implements OnInit {
  emplois: EmploiDuTemps[] = [];
  formations: Formation[] = [];
  formateurs: Formateur[] = [];
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  colonnes = ['jour', 'matiere', 'formation', 'formateur', 'salle', 'actions'];
  afficherFormulaire = false;
  edite: EmploiDuTemps | null = null;
  form: any = {};
  peutEcrire = false;

  constructor(private service: EmploiDuTempsService, private formationService: FormationService,
              private formateurService: FormateurService, private snack: MatSnackBar,
              private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() {
    this.peutEcrire = this.auth.can('emplois-du-temps', 'write');
    this.charger();
    this.formationService.getAll().subscribe({ next: f => this.formations = f, error: () => {} });
    this.formateurService.getAll().subscribe({ next: f => this.formateurs = f, error: () => {} });
  }

  charger() {
    this.service.getAll().subscribe({ next: d => this.emplois = d, error: () => this.snack.open('Chargement impossible.', 'OK', { duration: 3000 }) });
  }

  ouvrir() { this.form = {}; this.edite = null; this.afficherFormulaire = true; }
  annuler() { this.afficherFormulaire = false; this.edite = null; this.form = {}; }

  modifier(e: EmploiDuTemps) {
    this.edite = e;
    this.form = {
      formationId: e.formation?.id, formateurId: e.formateur?.id ?? null,
      jour: e.jour, type: e.type, matiere: e.matiere, salle: e.salle,
      heureDebut: e.heureDebut, heureFin: e.heureFin
    };
    this.afficherFormulaire = true;
  }

  detail(e: EmploiDuTemps) {
    this.dialog.open(DetailDialogComponent, { data: {
      titre: (e.matiere || 'Séance') + ' — ' + e.jour, sousTitre: e.type,
      rows: [
        { label: 'Formation', value: e.formation?.intitule },
        { label: 'Type', value: e.type },
        { label: 'Jour', value: e.jour },
        { label: 'Horaire', value: (e.heureDebut || '') + ' - ' + (e.heureFin || '') },
        { label: 'Salle', value: e.salle },
        { label: 'Formateur', value: e.formateur ? (e.formateur.utilisateur?.prenom + ' ' + e.formateur.utilisateur?.nom) : null }
      ]
    }});
  }

  sauvegarder() {
    if (!this.form.formationId) { this.snack.open('La formation est obligatoire.', 'OK', { duration: 3500 }); return; }
    if (!this.form.jour) { this.snack.open('Le jour est obligatoire.', 'OK', { duration: 3500 }); return; }
    const payload: any = {
      formation: { id: this.form.formationId },
      formateur: this.form.formateurId ? { id: this.form.formateurId } : null,
      jour: this.form.jour, type: this.form.type || null, matiere: this.form.matiere || null,
      salle: this.form.salle || null, heureDebut: this.form.heureDebut || null, heureFin: this.form.heureFin || null
    };
    const obs = this.edite?.id ? this.service.update(this.edite.id, payload as EmploiDuTemps) : this.service.create(payload as EmploiDuTemps);
    obs.subscribe({
      next: () => { this.snack.open(this.edite ? 'Séance modifiée.' : 'Séance programmée.', 'OK', { duration: 3000 }); this.annuler(); this.charger(); },
      error: (e) => this.snack.open(e?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 })
    });
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer cette séance ?')) return;
    this.service.delete(id).subscribe({ next: () => { this.snack.open('Supprimée.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 }) });
  }

  private donneesExport(): (string | number)[][] {
    return this.emplois.map(e => [
      e.jour, (e.heureDebut || '') + '-' + (e.heureFin || ''), e.matiere || '', e.type || '',
      e.formation?.intitule || '', e.formateur ? (e.formateur.utilisateur?.prenom + ' ' + e.formateur.utilisateur?.nom) : '', e.salle || ''
    ]);
  }
  private colsExport = ['Jour', 'Horaire', 'Matière', 'Type', 'Formation', 'Formateur', 'Salle'];
  exportExcel() { exporterExcel('Emplois du temps UNCHK', this.colsExport, this.donneesExport()); }
  exportPdf() { exporterPdf('Emplois du temps', this.colsExport, this.donneesExport()); }
}
