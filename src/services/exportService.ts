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

async function capturerElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Supprime temporairement overflow:hidden pour capturer tout le contenu
  const elementsWithOverflow: { el: HTMLElement; overflow: string }[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);
  let node = walker.firstChild();
  while (node) {
    const el = node as HTMLElement;
    const ov = el.style.overflow;
    if (ov === 'hidden' || getComputedStyle(el).overflow === 'hidden') {
      elementsWithOverflow.push({ el, overflow: el.style.overflow });
      el.style.overflow = 'visible';
    }
    node = walker.nextNode();
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  // Restaure les overflow
  for (const { el, overflow } of elementsWithOverflow) {
    el.style.overflow = overflow;
  }

  return canvas;
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

    const canvas = await capturerElement(element);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const m = 10;
    const ratio = Math.min((pdfW - m * 2) / canvas.width, (pdfH - m * 2) / canvas.height);
    const iw = canvas.width * ratio;
    const ih = canvas.height * ratio;
    pdf.addImage(imgData, 'JPEG', (pdfW - iw) / 2, m, iw, ih);
    pdf.save(`${genererId(document.querySelector('.sl-print-title')?.textContent || 'setlist')}.pdf`);
  } else {
    window.print();
  }
}

export async function exporterJpeg(): Promise<void> {
  const element = document.querySelector('.setlist-a4-container') as HTMLElement;
  if (!element) throw new Error('Aperçu non trouvé');

  const canvas = await capturerElement(element);

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

  const canvas = await capturerElement(element);

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