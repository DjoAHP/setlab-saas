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

async function basculerEtAttendre() {
  return new Promise<void>((resolve) => {
    const onReady = () => {
      window.removeEventListener('setlab-preview-ready', onReady);
      resolve();
    };
    window.addEventListener('setlab-preview-ready', onReady);
    window.dispatchEvent(new CustomEvent('setlab-show-preview'));
  });
}

function retirerOverflowHidden(element: HTMLElement) {
  const restore: (() => void)[] = [];
  const handler = (el: HTMLElement) => {
    if (getComputedStyle(el).overflow === 'hidden') {
      const old = el.style.overflow;
      el.style.overflow = 'visible';
      restore.push(() => { el.style.overflow = old; });
    }
  };
  handler(element);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);
  let n = walker.firstChild();
  while (n) { handler(n as HTMLElement); n = walker.nextNode(); }
  return restore;
}

async function capturer() {
  const el = document.querySelector('.setlist-a4-container') as HTMLElement;
  if (!el) throw new Error('Aperçu non trouvé');

  const restore = retirerOverflowHidden(el);
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: el.scrollWidth,
    height: el.scrollHeight,
  });
  restore.forEach((fn) => fn());
  return canvas;
}

export function exporterTl(setlist: Setlist): void {
  const exportData = {
    bandName: setlist.bandName,
    stageTimeLimit: setlist.stageTimeLimit,
    songs: setlist.songs ?? [],
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  telecharger(blob, `${genererId(setlist.bandName)}.tl`);
}

export async function exporterPdf(): Promise<void> {
  if (window.innerWidth < 768) {
    await basculerEtAttendre();
    const canvas = await capturer();
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const m = 10;
    const r = Math.min((pw - m * 2) / canvas.width, (ph - m * 2) / canvas.height);
    pdf.addImage(imgData, 'JPEG', (pw - canvas.width * r) / 2, m, canvas.width * r, canvas.height * r);
    pdf.save(`${genererId((document.querySelector('.sl-print-title')?.textContent || 'setlist').trim())}.pdf`);
  } else {
    window.print();
  }
}

export async function exporterJpeg(): Promise<void> {
  if (window.innerWidth < 768) {
    await basculerEtAttendre();
  }
  const canvas = await capturer();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Échec JPEG')); return; }
      telecharger(blob, `${genererId((document.querySelector('.sl-print-title')?.textContent || 'setlist').trim())}.jpg`);
      resolve();
    }, 'image/jpeg', 0.92);
  });
}

export async function exporterPng(): Promise<void> {
  if (window.innerWidth < 768) {
    await basculerEtAttendre();
  }
  const canvas = await capturer();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Échec PNG')); return; }
      telecharger(blob, `${genererId((document.querySelector('.sl-print-title')?.textContent || 'setlist').trim())}.png`);
      resolve();
    }, 'image/png');
  });
}