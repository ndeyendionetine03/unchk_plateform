import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Exporte un tableau (colonnes + lignes) vers un fichier Excel .xlsx */
export function exporterExcel(titre: string, colonnes: string[], lignes: (string | number)[][]): void {
  const data = [colonnes, ...lignes];
  const ws = XLSX.utils.aoa_to_sheet(data);
  // Largeur de colonnes auto (approx.)
  ws['!cols'] = colonnes.map((c, i) => {
    const maxLen = Math.max(c.length, ...lignes.map(l => String(l[i] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  const wb = XLSX.utils.book_new();
  const nomFeuille = titre.substring(0, 28) || 'Données';
  XLSX.utils.book_append_sheet(wb, ws, nomFeuille);
  XLSX.writeFile(wb, `${nettoyer(titre)}.xlsx`);
}

/** Exporte un tableau (colonnes + lignes) vers un fichier PDF avec en-tête UNCHK */
export function exporterPdf(titre: string, colonnes: string[], lignes: (string | number)[][]): void {
  const doc = new jsPDF({ orientation: colonnes.length > 5 ? 'landscape' : 'portrait' });

  // En-tête
  doc.setFontSize(16);
  doc.setTextColor(0, 106, 180); // bleu UNCHK
  doc.text('UNCHK — Université numérique Cheikh Hamidou Kane', 14, 16);
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(titre, 14, 24);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Édité le ' + new Date().toLocaleDateString('fr'), 14, 30);

  autoTable(doc, {
    head: [colonnes],
    body: lignes.map(l => l.map(v => (v === null || v === undefined) ? '' : String(v))),
    startY: 35,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 106, 180], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 246, 251] }
  });

  doc.save(`${nettoyer(titre)}.pdf`);
}

function nettoyer(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'export';
}
