import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DetailRow {
  label: string;
  value: any;
}

export interface DetailData {
  titre: string;
  sousTitre?: string;
  rows: DetailRow[];
  /** Nom du fichier joint, si présent */
  fichierNom?: string;
  /** Callback déclenché au clic sur « Télécharger » */
  onDownload?: () => void;
}

@Component({
  selector: 'app-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dlg-head">
      <div class="tricolor-bar"></div>
      <h2>{{ data.titre }}</h2>
      <p *ngIf="data.sousTitre">{{ data.sousTitre }}</p>
    </div>

    <div mat-dialog-content class="dlg-body">
      <div class="row" *ngFor="let r of data.rows">
        <span class="lbl">{{ r.label }}</span>
        <span class="val">{{ r.value !== null && r.value !== undefined && r.value !== '' ? r.value : '—' }}</span>
      </div>

      <div class="fichier" *ngIf="data.fichierNom">
        <mat-icon>attach_file</mat-icon>
        <span class="fname">{{ data.fichierNom }}</span>
        <button mat-stroked-button color="primary" (click)="data.onDownload && data.onDownload()">
          <mat-icon>download</mat-icon> Télécharger
        </button>
      </div>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </div>
  `,
  styles: [`
    .dlg-head { padding: 4px 4px 0; }
    .dlg-head .tricolor-bar { max-width: 70px; margin-bottom: 14px; }
    .dlg-head h2 { margin: 0; font-size: 21px; color: var(--text); }
    .dlg-head p { margin: 4px 0 0; color: var(--text-muted); font-size: 13.5px; text-transform: capitalize; }
    .dlg-body { min-width: 360px; max-width: 520px; padding-top: 14px !important; }
    .row { display: flex; justify-content: space-between; gap: 24px; padding: 11px 0; border-bottom: 1px solid var(--border); }
    .row:last-of-type { border-bottom: none; }
    .row .lbl { color: var(--text-muted); font-size: 13px; flex-shrink: 0; }
    .row .val { color: var(--text); font-weight: 600; font-size: 14px; text-align: right; word-break: break-word; }
    .fichier { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding: 12px 14px;
               background: var(--unchk-blue-light); border-radius: 12px; }
    .fichier .fname { flex: 1; font-size: 13.5px; font-weight: 600; color: var(--unchk-blue-dark); word-break: break-all; }
    .fichier mat-icon { color: var(--unchk-blue); }
  `]
})
export class DetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DetailData) {}
}
