import { HarvestRecord, PackLot, PlantBatch, ProductionZone, Shipment, InputItem, InputMovement } from '../types';

// === CSV Generation ===

export function generateCSV(headers: string[], rows: (string | number)[][], separator = ','): string {
  const escape = (val: string | number): string => {
    const s = String(val);
    if (s.includes(separator) || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.map(escape).join(separator);
  const dataLines = rows.map(row => row.map(escape).join(separator));
  return [headerLine, ...dataLines].join('\n');
}

export function downloadCSV(filename: string, csvContent: string): void {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// === Production Report ===

export interface ProductionReportRow {
  zone: string;
  cultivar: string;
  harvestCode: string;
  date: string;
  netWeightKg: number;
  qualityGrade: string;
  brixDegree: number | null;
  cullsKg: number;
  yieldPerPlant: number;
}

export function generateProductionReport(
  harvests: HarvestRecord[],
  batches: PlantBatch[],
  zones: ProductionZone[]
): ProductionReportRow[] {
  return harvests.map(h => {
    const batch = batches.find(b => b.id === h.batchId);
    const zone = zones.find(z => z.id === batch?.zoneId);
    const activePlants = batch?.currentActiveQuantity || 1;
    return {
      zone: zone?.name || '—',
      cultivar: batch?.cultivar || '—',
      harvestCode: h.harvestCode,
      date: new Date(h.harvestedAt).toLocaleDateString('es-PY'),
      netWeightKg: h.netWeightKg,
      qualityGrade: h.qualityGrade,
      brixDegree: h.brixDegree || null,
      cullsKg: h.cullsKg,
      yieldPerPlant: Number((h.netWeightKg / activePlants).toFixed(3))
    };
  });
}

// === Quality Report ===

export interface QualityReportRow {
  grade: string;
  totalKg: number;
  percentage: number;
  avgBrix: number | null;
}

export function generateQualityReport(harvests: HarvestRecord[]): QualityReportRow[] {
  const totalNet = harvests.reduce((sum, h) => sum + h.netWeightKg, 0);
  const grades = ['extra', 'primeira', 'segunda', 'industria', 'descarte'] as const;

  return grades.map(grade => {
    const gradeHarvests = harvests.filter(h => h.qualityGrade === grade);
    const gradeKg = gradeHarvests.reduce((sum, h) => sum + h.netWeightKg, 0);
    const brixValues = gradeHarvests.filter(h => h.brixDegree).map(h => h.brixDegree!);
    return {
      grade,
      totalKg: gradeKg,
      percentage: totalNet > 0 ? Number(((gradeKg / totalNet) * 100).toFixed(1)) : 0,
      avgBrix: brixValues.length > 0 ? Number((brixValues.reduce((a, b) => a + b, 0) / brixValues.length).toFixed(1)) : null
    };
  }).filter(r => r.totalKg > 0);
}

// === Inventory Summary ===

export interface InventorySummary {
  totalBoxesInStock: number;
  totalKgInStock: number;
  totalBoxesShipped: number;
  totalKgShipped: number;
  totalBoxesRecalled: number;
}

export function generateInventorySummary(packLots: PackLot[], shipments: Shipment[]): InventorySummary {
  const inStock = packLots.filter(p => p.status === 'in_stock');
  const shipped = shipments.flatMap(s => s.lines);
  const recalled = packLots.filter(p => p.status === 'recalled');

  return {
    totalBoxesInStock: inStock.reduce((sum, p) => sum + p.unitsPacked, 0),
    totalKgInStock: inStock.reduce((sum, p) => sum + p.totalWeightKg, 0),
    totalBoxesShipped: shipped.reduce((sum, l) => sum + l.quantityBoxes, 0),
    totalKgShipped: shipped.reduce((sum, l) => sum + l.totalKg, 0),
    totalBoxesRecalled: recalled.reduce((sum, p) => sum + p.unitsPacked, 0)
  };
}

// === Inputs Report ===

export interface InputsReportRow {
  name: string;
  tradeName: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  stockStatus: 'ok' | 'low' | 'critical';
  totalEntries: number;
  totalExits: number;
  estimatedCostGs: number;
}

export function generateInputsReport(items: InputItem[], movements: InputMovement[]): InputsReportRow[] {
  return items.map(item => {
    const itemMovements = movements.filter(m => m.inputItemId === item.id);
    const entries = itemMovements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
    const exits = itemMovements.filter(m => m.type === 'saida' || m.type === 'perda').reduce((sum, m) => sum + m.quantity, 0);
    const stockRatio = item.minStockQty > 0 ? item.currentStockQty / item.minStockQty : 10;

    return {
      name: item.name,
      tradeName: item.tradeName,
      category: item.category,
      currentStock: item.currentStockQty,
      unit: item.unit,
      minStock: item.minStockQty,
      stockStatus: stockRatio <= 1 ? 'critical' : stockRatio <= 2 ? 'low' : 'ok',
      totalEntries: entries,
      totalExits: exits,
      estimatedCostGs: item.currentStockQty * item.costPerUnit
    };
  });
}

// === Print-friendly HTML ===

export function openPrintableReport(title: string, htmlContent: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es-PY">
    <head>
      <meta charset="UTF-8" />
      <title>${title} — Coop Agronorte</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; font-size: 11px; color: #1a1a1a; padding: 24px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { font-size: 16px; color: #16a34a; }
        .header .meta { text-align: right; font-size: 10px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #f0fdf4; color: #166534; font-weight: 600; text-align: left; padding: 8px 6px; border-bottom: 2px solid #16a34a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .summary-card { display: inline-block; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin: 4px; min-width: 140px; }
        .summary-card .label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-card .value { font-size: 18px; font-weight: 700; color: #16a34a; margin-top: 4px; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #999; text-align: center; }
        @media print {
          body { padding: 12px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="meta">
          <div><strong>Cooperativa Agronorte Ltda.</strong></div>
          <div>Generado: ${new Date().toLocaleString('es-PY')}</div>
          <div>Sistema de Gestão v1.2.0</div>
        </div>
      </div>
      ${htmlContent}
      <div class="footer">
        Documento gerado automaticamente pelo Sistema Coop Agronorte — Dados de demonstração (DEMO)
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
