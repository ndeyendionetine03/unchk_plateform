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
import { CompteRenduService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CompteRendu } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { telechargerBlob } from '../../shared/utils/download.util';

@Component({
  selector: 'app-comptes-rendus',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatSelectModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Comptes rendus</h1>
          <div class="page-subtitle">{{ comptesRendus.length }} compte(s) rendu(s)</div>
        </div>
        <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
          <mat-icon>add</mat-icon> Nouveau compte rendu
        </button>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 16px; color: var(--unchk-blue);">{{ crEdite ? 'Modifier' : 'Ajouter' }} un compte rendu</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>Type de réunion</mat-label>
            <mat-select [(ngModel)]="form.typeReunion">
              <mat-option value="reunion">Réunion</mat-option>
              <mat-option value="rencontre">Rencontre</mat-option>
              <mat-option value="seminaire">Séminaire</mat-option>
              <mat-option value="webinaire">Webinaire</mat-option>
              <mat-option value="conseil">Conseil d'Université</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="form.date">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Lieu</mat-label>
            <input matInput [(ngModel)]="form.lieu">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Participants</mat-label>
            <input matInput [(ngModel)]="form.participants">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Contenu (texte, optionnel)</mat-label>
            <textarea matInput rows="4" [(ngModel)]="form.contenu"></textarea>
          </mat-form-field>
        </div>

        <!-- Pièce jointe -->
        <div class="file-pick">
          <button mat-stroked-button type="button" (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon> Joindre un fichier
          </button>
          <input #fileInput type="file" hidden (change)="onFichier($event)">
          <span class="file-name" *ngIf="fichierSelectionne">{{ fichierSelectionne.name }}</span>
          <span class="file-name existing" *ngIf="!fichierSelectionne && crEdite?.fichierNom">
            <mat-icon>description</mat-icon> {{ crEdite?.fichierNom }} (déjà joint)
          </span>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <button mat-raised-button color="primary" (click)="sauvegarder()" [disabled]="enregistrement">
            <mat-icon>save</mat-icon> {{ enregistrement ? 'Enregistrement…' : 'Sauvegarder' }}
          </button>
          <button mat-button (click)="annuler()">Annuler</button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="comptesRendus">
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let c"><span class="role-chip role-enseignant">{{ c.typeReunion }}</span></td>
          </ng-container>
          <ng-container matColumnDef="lieu">
            <th mat-header-cell *matHeaderCellDef>Lieu</th>
            <td mat-cell *matCellDef="let c">
              {{ c.lieu || '—' }}
              <mat-icon *ngIf="c.fichierNom" style="font-size:16px;width:16px;height:16px;vertical-align:middle;color:var(--unchk-blue);margin-left:6px;" title="Fichier joint">attach_file</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let c">{{ c.date | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let c" style="text-align:right;">
              <button mat-icon-button (click)="detail(c)" title="Détail">
                <mat-icon>visibility</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(c)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(c.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow>
            <td [colSpan]="colonnes.length" style="text-align:center; padding:32px; color:#999;">Aucun compte rendu</td>
          </tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .file-pick { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .file-name { font-size: 13px; color: var(--unchk-blue-dark); font-weight: 600; }
    .file-name.existing { display: inline-flex; align-items: center; gap: 5px; color: var(--text-muted); }
    .file-name mat-icon { font-size: 17px; width: 17px; height: 17px; }
  `]
})
export class ComptesRendusComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  colonnes = ['type', 'lieu', 'date', 'actions'];
  afficherFormulaire = false;
  enregistrement = false;
  crEdite: CompteRendu | null = null;
  fichierSelectionne: File | null = null;
  form: Partial<CompteRendu> = {};

  peutEcrire = false;
  constructor(private service: CompteRenduService, private snack: MatSnackBar, private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() { this.peutEcrire = this.auth.can('comptes-rendus', 'write'); this.charger(); }

  charger() {
    this.service.getAll().subscribe({
      next: c => this.comptesRendus = c,
      error: () => this.snack.open('Impossible de charger les comptes rendus.', 'OK', { duration: 3000 })
    });
  }

  ouvrirFormulaire() {
    this.form = {};
    this.crEdite = null;
    this.fichierSelectionne = null;
    this.afficherFormulaire = true;
  }

  annuler() {
    this.afficherFormulaire = false;
    this.crEdite = null;
    this.fichierSelectionne = null;
    this.form = {};
  }

  onFichier(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fichierSelectionne = input.files && input.files.length ? input.files[0] : null;
  }

  modifier(c: CompteRendu) {
    this.crEdite = c;
    this.fichierSelectionne = null;
    this.form = { typeReunion: c.typeReunion, date: c.date, lieu: c.lieu, participants: c.participants, contenu: c.contenu };
    this.afficherFormulaire = true;
  }

  detail(c: CompteRendu) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: this.libelleType(c.typeReunion),
        sousTitre: c.lieu || 'Compte rendu',
        rows: [
          { label: 'Type', value: c.typeReunion },
          { label: 'Date', value: c.date },
          { label: 'Lieu', value: c.lieu },
          { label: 'Participants', value: c.participants },
          { label: 'Contenu', value: c.contenu }
        ],
        fichierNom: c.fichierNom,
        onDownload: c.fichierNom ? () => this.telecharger(c) : undefined
      }
    });
  }

  libelleType(t?: string): string {
    const map: any = { reunion: 'Réunion', rencontre: 'Rencontre', seminaire: 'Séminaire', webinaire: 'Webinaire', conseil: 'Conseil d\'Université' };
    return (t && map[t]) ? map[t] : 'Compte rendu';
  }

  telecharger(c: CompteRendu) {
    if (!c.id) return;
    this.service.downloadFichier(c.id).subscribe({
      next: blob => telechargerBlob(blob, c.fichierNom || 'fichier'),
      error: () => this.snack.open('Téléchargement impossible.', 'OK', { duration: 3000 })
    });
  }

  sauvegarder() {
    if (!this.form.typeReunion || !this.form.date) {
      this.snack.open('Le type de réunion et la date sont obligatoires.', 'OK', { duration: 3500 });
      return;
    }
    this.enregistrement = true;
    const obs = this.crEdite?.id
      ? this.service.update(this.crEdite.id, this.form as CompteRendu)
      : this.service.create(this.form as CompteRendu);

    obs.subscribe({
      next: (saved) => this.apresSauvegarde(saved),
      error: (err) => {
        this.enregistrement = false;
        this.snack.open(err?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 });
      }
    });
  }

  private apresSauvegarde(saved: CompteRendu) {
    if (this.fichierSelectionne && saved.id) {
      this.service.uploadFichier(saved.id, this.fichierSelectionne).subscribe({
        next: () => this.finaliser(),
        error: () => {
          this.enregistrement = false;
          this.snack.open('Compte rendu enregistré, mais l\'envoi du fichier a échoué.', 'OK', { duration: 4000 });
          this.annuler();
          this.charger();
        }
      });
    } else {
      this.finaliser();
    }
  }

  private finaliser() {
    this.snack.open(this.crEdite ? 'Compte rendu modifié.' : 'Compte rendu ajouté avec succès.', 'OK', { duration: 3000 });
    this.enregistrement = false;
    this.annuler();
    this.charger();
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer ce compte rendu ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.snack.open('Compte rendu supprimé.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 })
    });
  }
}
