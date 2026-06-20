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
import { DocumentService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Document } from '../../shared/models/models';
import { DetailDialogComponent } from '../../shared/components/detail-dialog.component';
import { telechargerBlob } from '../../shared/utils/download.util';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatSelectModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Documents</h1>
          <div class="page-subtitle">{{ documents.length }} document(s)</div>
        </div>
        <button *ngIf="peutEcrire" mat-raised-button color="primary" (click)="ouvrirFormulaire()">
          <mat-icon>add</mat-icon> Nouveau document
        </button>
      </div>

      <mat-card *ngIf="afficherFormulaire" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin: 0 0 16px; color: var(--unchk-blue);">{{ documentEdite ? 'Modifier' : 'Ajouter' }} un document</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="courrier_arrive">Courrier arrivé</mat-option>
              <mat-option value="courrier_depart">Courrier départ</mat-option>
              <mat-option value="note_service">Note de service</mat-option>
              <mat-option value="note_admin">Note administrative</mat-option>
              <mat-option value="circulaire">Circulaire</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Visibilité</mat-label>
            <mat-select [(ngModel)]="form.visibiliteRole">
              <mat-option value="tous">Tous</mat-option>
              <mat-option value="admin">Admin uniquement</mat-option>
              <mat-option value="administratif">Administratif</mat-option>
              <mat-option value="enseignant">Enseignants</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: span 2;">
            <mat-label>Titre</mat-label>
            <input matInput [(ngModel)]="form.titre">
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
          <span class="file-name existing" *ngIf="!fichierSelectionne && documentEdite?.fichierNom">
            <mat-icon>description</mat-icon> {{ documentEdite?.fichierNom }} (déjà joint)
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
        <table mat-table [dataSource]="documents">
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let d"><span class="role-chip role-admin">{{ d.type }}</span></td>
          </ng-container>
          <ng-container matColumnDef="titre">
            <th mat-header-cell *matHeaderCellDef>Titre</th>
            <td mat-cell *matCellDef="let d">
              <strong>{{ d.titre }}</strong>
              <mat-icon *ngIf="d.fichierNom" style="font-size:16px;width:16px;height:16px;vertical-align:middle;color:var(--unchk-blue);margin-left:6px;" title="Fichier joint">attach_file</mat-icon>
            </td>
          </ng-container>
          <ng-container matColumnDef="visibilite">
            <th mat-header-cell *matHeaderCellDef>Visibilité</th>
            <td mat-cell *matCellDef="let d">{{ d.visibiliteRole }}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let d">{{ d.dateCreation | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:right;">Actions</th>
            <td mat-cell *matCellDef="let d" style="text-align:right;">
              <button mat-icon-button (click)="detail(d)" title="Détail">
                <mat-icon>visibility</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="primary" (click)="modifier(d)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="peutEcrire" mat-icon-button color="warn" (click)="supprimer(d.id)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colonnes"></tr>
          <tr mat-row *matRowDef="let row; columns: colonnes;"></tr>
          <tr *matNoDataRow>
            <td [colSpan]="colonnes.length" style="text-align:center; padding:32px; color:#999;">Aucun document</td>
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
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  colonnes = ['type', 'titre', 'visibilite', 'date', 'actions'];
  afficherFormulaire = false;
  enregistrement = false;
  documentEdite: Document | null = null;
  fichierSelectionne: File | null = null;
  form: Partial<Document> = { visibiliteRole: 'tous' };

  peutEcrire = false;
  constructor(private service: DocumentService, private snack: MatSnackBar, private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit() { this.peutEcrire = this.auth.can('documents', 'write'); this.charger(); }

  charger() {
    this.service.getAll().subscribe({
      next: d => this.documents = d,
      error: () => this.snack.open('Impossible de charger les documents.', 'OK', { duration: 3000 })
    });
  }

  ouvrirFormulaire() {
    this.form = { visibiliteRole: 'tous' };
    this.documentEdite = null;
    this.fichierSelectionne = null;
    this.afficherFormulaire = true;
  }

  annuler() {
    this.afficherFormulaire = false;
    this.documentEdite = null;
    this.fichierSelectionne = null;
    this.form = { visibiliteRole: 'tous' };
  }

  onFichier(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fichierSelectionne = input.files && input.files.length ? input.files[0] : null;
  }

  modifier(d: Document) {
    this.documentEdite = d;
    this.fichierSelectionne = null;
    this.form = { type: d.type, titre: d.titre, contenu: d.contenu, visibiliteRole: d.visibiliteRole };
    this.afficherFormulaire = true;
  }

  detail(d: Document) {
    this.dialog.open(DetailDialogComponent, {
      data: {
        titre: d.titre,
        sousTitre: d.type,
        rows: [
          { label: 'Type', value: d.type },
          { label: 'Visibilité', value: d.visibiliteRole },
          { label: 'Contenu', value: d.contenu },
          { label: 'Date de création', value: d.dateCreation ? new Date(d.dateCreation).toLocaleDateString('fr') : null }
        ],
        fichierNom: d.fichierNom,
        onDownload: d.fichierNom ? () => this.telecharger(d) : undefined
      }
    });
  }

  telecharger(d: Document) {
    if (!d.id) return;
    this.service.downloadFichier(d.id).subscribe({
      next: blob => telechargerBlob(blob, d.fichierNom || 'fichier'),
      error: () => this.snack.open('Téléchargement impossible.', 'OK', { duration: 3000 })
    });
  }

  sauvegarder() {
    if (!this.form.type || !this.form.titre?.trim()) {
      this.snack.open('Le type et le titre sont obligatoires.', 'OK', { duration: 3500 });
      return;
    }
    this.enregistrement = true;
    const obs = this.documentEdite?.id
      ? this.service.update(this.documentEdite.id, this.form as Document)
      : this.service.create(this.form as Document);

    obs.subscribe({
      next: (saved) => this.apresSauvegarde(saved),
      error: (err) => {
        this.enregistrement = false;
        this.snack.open(err?.error?.message || 'Erreur lors de l\'enregistrement.', 'OK', { duration: 4000 });
      }
    });
  }

  private apresSauvegarde(saved: Document) {
    if (this.fichierSelectionne && saved.id) {
      this.service.uploadFichier(saved.id, this.fichierSelectionne).subscribe({
        next: () => this.finaliser(),
        error: () => {
          this.enregistrement = false;
          this.snack.open('Document enregistré, mais l\'envoi du fichier a échoué.', 'OK', { duration: 4000 });
          this.annuler();
          this.charger();
        }
      });
    } else {
      this.finaliser();
    }
  }

  private finaliser() {
    this.snack.open(this.documentEdite ? 'Document modifié.' : 'Document ajouté avec succès.', 'OK', { duration: 3000 });
    this.enregistrement = false;
    this.annuler();
    this.charger();
  }

  supprimer(id?: number) {
    if (!id || !confirm('Supprimer ce document ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.snack.open('Document supprimé.', 'OK', { duration: 3000 }); this.charger(); },
      error: () => this.snack.open('Suppression impossible.', 'OK', { duration: 3000 })
    });
  }
}
