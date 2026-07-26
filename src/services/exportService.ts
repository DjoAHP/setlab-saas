import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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

export async function exporterPdf(): Promise<void> {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    const element = document.querySelector('.setlist-a4-container') as HTMLElement;
    if (!element) throw new Error('Aperçu non trouvé');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;
    const ratio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = margin;
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(`${genererId(document.querySelector('.sl-print-title')?.textContent || 'setlist')}.pdf`);
  } else {
    window.print();
  }
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