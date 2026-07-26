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
  const savedOverflow: { el: HTMLElement; val: string }[] = [];

  const apply = (el: HTMLElement) => {
    if (getComputedStyle(el).overflow === 'hidden') {
      savedOverflow.push({ el, val: el.style.overflow });
      el.style.overflow = 'visible';
    }
  };

  apply(element);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);
  let n = walker.firstChild();
  while (n) { apply(n as HTMLElement); n = walker.nextNode(); }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  savedOverflow.reverse().forEach(({ el, val }) => { el.style.overflow = val; });

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
  if (window.innerWidth < 768) {
    const element = document.querySelector('.setlist-a4-container') as HTMLElement;
    if (!element) throw new Error('Aperçu non trouvé');
    const canvas = await capturerElement(element);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const m = 10;
    const r = Math.min((pw - m * 2) / canvas.width, (ph - m * 2) / canvas.height);
    pdf.addImage(imgData, 'JPEG', (pw - canvas.width * r) / 2, m, canvas.width * r, canvas.height * r);
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
      if (!blob) { reject(new Error('Échec JPEG')); return; }
      telecharger(blob, `${genererId((document.querySelector('.sl-print-title')?.textContent || 'setlist').trim())}.jpg`);
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
      if (!blob) { reject(new Error('Échec PNG')); return; }
      telecharger(blob, `${genererId((document.querySelector('.sl-print-title')?.textContent || 'setlist').trim())}.png`);
      resolve();
    }, 'image/png');
  });
}