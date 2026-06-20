import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { EtudiantService, FormationService } from '../../core/services/api.service';
import { Etudiant, Formation } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { exporterExcel, exporterPdf } from '../../shared/utils/export.util';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule, MatDialogModule, MatMenuModule
  ],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1>Étudiants</h1>
          <div class="page-subtitle">{{ etudiants.length }} étudiant(s) enregistré(s)</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button mat-stroked-button [matMenuTriggerFor]="exp"><mat-icon>download</mat-icon> Exporter</button>
          <mat-menu #exp="matMenu">
            <button mat-menu-item (click)="exportExcel()"><mat-icon>grid_on</mat-icon> Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          </mat-menu>
          <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
            <mat-icon>person_add</mat-icon> Nouvel étudiant
          </button>
        </div>
      </div>

      <!-- Recherche -->
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 8px;">
        <mat-label>Rechercher (nom, INE, promo...)</mat-label>
        <input matInput [(ngModel)]="recherche" (input)="filtrer()">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <!-- Formulaire -->
      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 18px; color: var(--unchk-blue);">
          {{ etudiantEdite ? 'Modifier' : 'Ajouter' }} un étudiant
        </h3>

        <div style="font-size:13px; color:var(--text-muted); margin-bottom:14px; font-weight:600;">
          Identité
        </div>
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
          <mat-form-field appearance="outline" *ngIf="!etudiantEdite" style="grid-column: span 2;">
            <mat-label>Mot de passe (optionnel)</mat-label>
            <input matInput type="text" [(ngModel)]="form.motDePasse" placeholder="Par défaut : unchk123">
            <mat-icon matPrefix>lock</mat-icon>
            <mat-hint>Laisser vide pour le mot de passe par défaut « unchk123 »</mat-hint>
          </mat-form-field>
        </div>

        <div style="font-size:13px; color:var(--text-muted); margin:20px 0 14px; font-weight:600;">
          Scolarité
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>INE</mat-label>
            <input matInput [(ngModel)]="form.ine">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Formation</mat-label>
            <mat-select [(ngModel)]="form.formationId">
              <mat-option [value]="null">— Aucune —</mat-option>
              <mat-option *ngFor="let f of formations" [value]="f.id">{{ f.intitule }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date de naissance</mat-label>
            <input matInput type="date" [(ngModel)]="form.dateNaissance">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Promo</mat-label>
            <input matInput [(ngModel)]="form.promo" placeholder="ex: 2024-2025">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Année de début</mat-label>
            <input matInput type="number" [(ngModel)]="form.anneeDebut">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Année de sortie</mat-label>
            <input matInput type="number" [(ngModel)]="form.anneeSortie">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Diplômes</mat-label>
            <input matInput [(ngModel)]="form.diplomes">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Autres formations</mat-label>
            <input matInput [(ngModel)]="form.autresFormations">
          </mat-form-field>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()" [disabled]="enregistrement">
            <mat-icon>save</mat-icon> {{ enregistrement ? 'Enregistrement…' : 'Sauvegarder' }}
          </button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <!-- Tableau -->
      <mat-card class="table-card">
        <table mat-table [dataSource]="etudiantsFiltres">

          <ng-container matColumnDef="ine">
            <th mat-header-cell *matHeaderCellDef>INE</th>
            <td mat-cell *matCellDef="let e">{{ e.ine || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom complet</th>
            <td mat-cell *matCellDef="let e">
              <strong>{{ e.utilisateur?.prenom }} {{ e.utilisateur?.nom }}</strong>
              <div style="font-size:12px; color:var(--text-muted);">{{ e.utilisateur?.email }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="formation">
            <th mat-header-cell *matHeaderCellDef>Formation</th>
            <td mat-cell *matCellDef="let e">{{ e.formation?.intitule || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="promo">
            <th mat-header-cell *matHeaderCellDef>Promo</th>
            <td mat-cell *matCellDef="let e">{{ e.promo || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let e" style="text-align:right;">
              <button mat-icon-button (click)="detail(e)" title="Détail">
                <mat-icon>visibility</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(e)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(e.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>

          <tr *matNoDataRow>
            <td [colSpan]="colonnes.length" style="text-align: center; padding: 32px; color: #999;">
              Aucun étudiant trouvé. Cliquez sur « Nouvel étudiant » pour commencer.
            </td>
          </tr>
        </table>
      </mat-card>

    </div>
  `
})
export class EtudiantsComponent implements OnInit {
  etudiants: Etudiant[] = [];
  etudiantsFiltres: Etudiant[] = [];
  formations: Formation[] = [];
  colonnes = ['ine', 'nom', 'formation', 'promo', 'actions'];
  recherche = '';
  afficherFormulaire = false;
  enregistrement = false;
  etudiantEdite: Etudiant | null = null;
  form: any = {};
  peutEcrire = false;

  constructor(
    private service: EtudiantService,
    private formationService: FormationService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.peutEcrire = this.auth.can('etudiants', 'write');
    this.charger();
    this.formationService.getAll().subscribe({ next: f => this.formations = f, error: () => {} });
  }

  charger() {
    this.service.getAll().subscribe({
      next: data => { this.etudiants = data; this.filtrer(); },
      error: () => this.snack.open('Impossible de charger les étudiants.', 'OK', { duration: 3000 })
    });
  }

  filtrer() {
    const q = this.recherche.toLowerCase().trim();
    this.etudiantsFiltres = !q ? this.etudiants : this.etudiants.filter(e =>
      e.ine?.toLowerCase().includes(q) ||
      e.utilisateur?.nom?.toLowerCase().includes(q) ||
      e.utilisateur?.prenom?.toLowerCase().includes(q) ||
      e.promo?.toLowerCase().includes(q)
    );
  }

  ouvrirFormulaire() {
    this.form = {};
    this.etudiantEdite = null;
    this.afficherFormulaire = true;
  }

  modifier(e: Etudiant) {
    this.etudiantEdite = e;
    this.form = {
      prenom: e.utilisateur?.prenom,
      nom: e.utilisateur?.nom,
      email: e.utilisateur?.email,
      ine: e.ine,
      dateNaissance: e.dateNaissance,
      promo: e.promo,
      anneeDebut: e.anneeDebut,
      anneeSortie: e.anneeSortie,
      diplomes: e.diplomes,
      autresFormations: e.autresFormations,
      formationId: e.formation?.id ?? null
    };
    this.afficherFormulaire = true;
  }

  annuler() {
    this.afficherFormulaire = false;
    this.etudiantEdite = null;
    this.form = {};
  }

  private construirePayload(): Etudiant {
    const f = this.form;
    const payload: any = {
      utilisateur: {
        nom: f.nom?.trim(),
        prenom: f.prenom?.trim(),
        email: f.email?.trim(),
        role: 'etudiant'
      },
      ine: f.ine || null,
      dateNaissance: f.dateNaissance || null,
      promo: f.promo || null,
      anneeDebut: f.anneeDebut ?? null,
      anneeSortie: f.anneeSortie ?? null,
      diplomes: f.diplomes || null,
      autresFormations: f.autresFormations || null,
      formation: f.formationId ? { id: f.formationId } : null
    };
    if (!this.etudiantEdite && f.motDePasse) payload.utilisateur.motDePasse = f.motDePasse;
    if (this.etudiantEdite?.utilisateur?.id) payload.utilisateur.id = this.etudiantEdite.utilisateur.id;
    return payload as Etudiant;
  }

  sauvegarder() {
    const f = this.form;
    if (!f.prenom?.trim() || !f.nom?.trim() || !f.email?.trim()) {
      this.snack.open('Le prénom, le nom et l\'email sont obligatoires.', 'OK', { duration: 3500 });
      return;
    }

    this.enregistrement = true;
    const payload = this.construirePayload();
    const obs = this.etudiantEdite?.id
      ? this.service.update(this.etudiantEdite.id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.snack.open(this.etudiantEdite ? 'Étudiant modifié.' : 'Étudiant ajouté avec succès.', 'OK', { duration: 3000 });
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

  detail(e: Etudiant) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: (e.utilisateur?.prenom || '') + ' ' + (e.utilisateur?.nom || ''),
        sousTitre: 'Étudiant',
        rows: [
          { label: 'INE', value: e.ine },
          { label: 'Email', value: e.utilisateur?.email },
          { label: 'Formation', value: e.formation?.intitule },
          { label: 'Promo', value: e.promo },
          { label: 'Date de naissance', value: e.dateNaissance },
          { label: 'Année de début', value: e.anneeDebut },
          { label: 'Année de sortie', value: e.anneeSortie },
          { label: 'Diplômes', value: e.diplomes },
          { label: 'Autres formations', value: e.autresFormations }
        ]
      }
    });
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer cet étudiant ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.snack.open('Étudiant supprimé.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 })
    });
  }

  exportExcel() {
    const cols = ['INE', 'Prénom', 'Nom', 'Email', 'Formation', 'Promo', 'Année début', 'Année sortie', 'Diplômes'];
    const rows = this.etudiantsFiltres.map(e => [
      e.ine || '', e.utilisateur?.prenom || '', e.utilisateur?.nom || '', e.utilisateur?.email || '',
      e.formation?.intitule || '', e.promo || '', e.anneeDebut ?? '', e.anneeSortie ?? '', e.diplomes || ''
    ]);
    exporterExcel('Etudiants UNCHK', cols, rows);
  }
  exportPdf() {
    const cols = ['INE', 'Nom complet', 'Email', 'Formation', 'Promo'];
    const rows = this.etudiantsFiltres.map(e => [
      e.ine || '', (e.utilisateur?.prenom || '') + ' ' + (e.utilisateur?.nom || ''),
      e.utilisateur?.email || '', e.formation?.intitule || '', e.promo || ''
    ]);
    exporterPdf('Liste des étudiants', cols, rows);
  }
}
