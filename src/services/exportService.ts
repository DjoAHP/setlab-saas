import html2canvas from 'html2canvas';
import type { Setlist } from '../types';

function genererId(nom: string): string {
  return nom.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') || 'setlist';
}

function telecharger(blob: Blob, nomFichier: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}

export function exporterTl(setlist: Setlist): void {
  const exportData = {
    bandName: setlist.bandName,
    stageTimeLimit: setlist.stageTimeLimit,
    songs: setlist.songs ?? [],
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  telecharger(blob, `${genererId(setlist.bandName)}.tl`);
}

export function exporterPdf(): void {
  window.print();
}

export async function exporterJpeg(): Promise<void> {
  const element = document.querySelector('.setlist-a4-container') as HTMLElement;
  if (!element) throw new Error('Aperçu non trouvé');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Échec de la génération JPEG'));
        return;
      }
      const nom = (document.querySelector('.sl-print-title')?.textContent || 'setlist').trim();
      telecharger(blob, `${genererId(nom)}.jpg`);
      resolve();
    }, 'image/jpeg', 0.92);
  });
}

export async function exporterPng(): Promise<void> {
  const element = document.querySelector('.setlist-a4-container') as HTMLElement;
  if (!element) throw new Error('Aperçu non trouvé');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Échec de la génération PNG'));
        return;
      }
      const nom = (document.querySelector('.sl-print-title')?.textContent || 'setlist').trim();
      telecharger(blob, `${genererId(nom)}.png`);
      resolve();
    }, 'image/png');
  });
}