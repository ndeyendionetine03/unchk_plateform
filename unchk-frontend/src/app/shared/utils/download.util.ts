/** Déclenche le téléchargement d'un Blob dans le navigateur. */
export function telechargerBlob(blob: Blob, nomFichier: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier || 'fichier';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
