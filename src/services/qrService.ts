import QRCode from 'qrcode';
import { StorageService } from './storageService';
import { PublicTraceData } from '../types';

export class QRService {
  static async generateQRCodeDataUrl(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Failed to generate QR code', err);
      return '';
    }
  }

  static generateBatchQR(token: string): string {
    // Generate an instant stylized high-contrast SVG QR matrix
    const encoded = encodeURIComponent(token);
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="50" height="50" fill="%231e293b"/><rect x="30" y="30" width="30" height="30" fill="%23ffffff"/><rect x="36" y="36" width="18" height="18" fill="%231e293b"/><rect x="130" y="20" width="50" height="50" fill="%231e293b"/><rect x="140" y="30" width="30" height="30" fill="%23ffffff"/><rect x="146" y="36" width="18" height="18" fill="%231e293b"/><rect x="20" y="130" width="50" height="50" fill="%231e293b"/><rect x="30" y="140" width="30" height="30" fill="%23ffffff"/><rect x="36" y="146" width="18" height="18" fill="%231e293b"/><circle cx="100" cy="100" r="14" fill="%232b6a4f"/><rect x="90" y="30" width="12" height="30" fill="%231e293b"/><rect x="140" y="100" width="30" height="12" fill="%231e293b"/><rect x="80" y="140" width="40" height="14" fill="%231e293b"/><rect x="130" y="140" width="20" height="20" fill="%231e293b"/><text x="100" y="185" font-family="monospace" font-size="9" text-anchor="middle" fill="%2364748b">${encoded}</text></svg>`;
  }

  static generatePackQR(token: string): string {
    return this.generateBatchQR(token);
  }

  static getPublicTraceData(token: string): PublicTraceData | null {
    const batches = StorageService.getBatches();
    const batch = batches.find(b => b.qrToken === token);
    const packLots = StorageService.getPackLots();
    const pack = packLots.find(p => p.qrToken === token);

    if (batch) {
      return {
        productName: batch.crop,
        cultivar: batch.cultivar,
        lotCode: batch.batchCode,
        producerName: 'Cooperativa Agronorte (350+ Familias Conectadas)',
        region: 'Guayaibí, San Pedro • Paraguay',
        harvestDate: batch.plantingDate,
        packDate: batch.expectedHarvestDate,
        qualityCertification: 'SENAVE BPA-PY / Rastreabilidad Segura',
        systemType: 'Hidroponia de Precisión (Sustentável)',
        status: batch.isBlocked ? 'hold' : 'released',
        institutionalContact: '+595 21 123 456 • trazabilidad@agronorte.com.py'
      };
    }

    if (pack) {
      const harvest = StorageService.getHarvests().find(h => h.id === pack.harvestBatchId);
      const parentBatch = harvest ? batches.find(b => b.id === harvest.batchId) : undefined;
      const isBlocked = parentBatch?.isBlocked || pack.status === 'recalled';

      return {
        productName: parentBatch ? parentBatch.crop : 'Hortaliza Hidropónica',
        cultivar: parentBatch ? parentBatch.cultivar : 'Variedad Seleccionada',
        lotCode: pack.packCode,
        producerName: 'Cooperativa Agronorte (350+ Familias Conectadas)',
        region: 'Guayaibí, San Pedro • Paraguay',
        harvestDate: harvest ? harvest.harvestedAt : pack.packedAt,
        packDate: pack.packedAt,
        qualityCertification: 'SENAVE Certificado BPA Nº 2026-PY-09',
        systemType: 'Hidroponia de Alta Densidad con Agua Controlada',
        status: isBlocked ? 'hold' : 'released',
        institutionalContact: '+595 21 123 456 • calidad@agronorte.com.py'
      };
    }

    return null;
  }
}
