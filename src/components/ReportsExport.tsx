import React, { useState, useMemo } from 'react';
import { Language, HarvestRecord, PackLot, PlantBatch, ProductionZone, Shipment, InputItem, InputMovement, UserProfile } from '../types';
import {
  FileBarChart, Download, Printer, TrendingUp, Award, Package, Filter,
  BarChart3, PieChart, ArrowDown, FileSpreadsheet, FileText
} from 'lucide-react';
import {
  generateProductionReport, generateQualityReport, generateInventorySummary,
  generateInputsReport, generateCSV, downloadCSV, openPrintableReport,
  ProductionReportRow, QualityReportRow, InputsReportRow
} from '../services/reportService';

interface ReportsExportProps {
  lang: Language;
  harvests: HarvestRecord[];
  packLots: PackLot[];
  batches: PlantBatch[];
  zones: ProductionZone[];
  shipments: Shipment[];
  inputItems: InputItem[];
  inputMovements: InputMovement[];
  currentUser: UserProfile;
}

type ReportType = 'production' | 'quality' | 'inputs';

export const ReportsExport: React.FC<ReportsExportProps> = ({
  lang, harvests, packLots, batches, zones, shipments, inputItems, inputMovements
}) => {
  const isEs = lang === 'es-PY';
  const [activeReport, setActiveReport] = useState<ReportType>('production');

  const productionData = useMemo(() => generateProductionReport(harvests, batches, zones), [harvests, batches, zones]);
  const qualityData = useMemo(() => generateQualityReport(harvests), [harvests]);
  const inventoryData = useMemo(() => generateInventorySummary(packLots, shipments), [packLots, shipments]);
  const inputsData = useMemo(() => generateInputsReport(inputItems, inputMovements), [inputItems, inputMovements]);

  const totalHarvestKg = harvests.reduce((sum, h) => sum + h.netWeightKg, 0);
  const totalCullsKg = harvests.reduce((sum, h) => sum + h.cullsKg, 0);
  const avgBrix = harvests.filter(h => h.brixDegree).reduce((sum, h) => sum + (h.brixDegree || 0), 0) / Math.max(1, harvests.filter(h => h.brixDegree).length);

  const reportTabs = [
    { id: 'production' as ReportType, label: isEs ? 'Producción' : 'Produção', icon: TrendingUp },
    { id: 'quality' as ReportType, label: isEs ? 'Calidad' : 'Qualidade', icon: Award },
    { id: 'inputs' as ReportType, label: isEs ? 'Insumos' : 'Insumos', icon: Package }
  ];

  // === Export Functions ===

  const handleExportCSV = () => {
    if (activeReport === 'production') {
      const headers = [isEs ? 'Invernadero' : 'Estufa', isEs ? 'Variedad' : 'Cultivar', isEs ? 'Código Cosecha' : 'Código Colheita', isEs ? 'Fecha' : 'Data', 'Peso Neto (kg)', isEs ? 'Calidad' : 'Qualidade', '°Brix', isEs ? 'Merma (kg)' : 'Perda (kg)', 'kg/planta'];
      const rows = productionData.map(r => [r.zone, r.cultivar, r.harvestCode, r.date, r.netWeightKg, r.qualityGrade, r.brixDegree || '—', r.cullsKg, r.yieldPerPlant]);
      downloadCSV(`relatorio_producao_${new Date().toISOString().slice(0, 10)}.csv`, generateCSV(headers, rows));
    } else if (activeReport === 'quality') {
      const headers = [isEs ? 'Grado' : 'Grau', 'Total (kg)', '%', '°Brix Promedio'];
      const rows = qualityData.map(r => [r.grade, r.totalKg, r.percentage, r.avgBrix || '—']);
      downloadCSV(`relatorio_qualidade_${new Date().toISOString().slice(0, 10)}.csv`, generateCSV(headers, rows));
    } else {
      const headers = [isEs ? 'Insumo' : 'Insumo', isEs ? 'Marca' : 'Marca', isEs ? 'Categoría' : 'Categoria', 'Stock', isEs ? 'Unidad' : 'Unidade', 'Mín', 'Status', isEs ? 'Entradas' : 'Entradas', isEs ? 'Salidas' : 'Saídas', isEs ? 'Valor (₲)' : 'Valor (₲)'];
      const rows = inputsData.map(r => [r.name, r.tradeName, r.category, r.currentStock, r.unit, r.minStock, r.stockStatus, r.totalEntries, r.totalExits, r.estimatedCostGs]);
      downloadCSV(`relatorio_insumos_${new Date().toISOString().slice(0, 10)}.csv`, generateCSV(headers, rows));
    }
  };

  const handlePrintPDF = () => {
    let html = '';
    const title = activeReport === 'production'
      ? (isEs ? 'Informe de Producción' : 'Relatório de Produção')
      : activeReport === 'quality'
        ? (isEs ? 'Informe de Calidad' : 'Relatório de Qualidade')
        : (isEs ? 'Informe de Insumos' : 'Relatório de Insumos');

    if (activeReport === 'production') {
      html = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          <div class="summary-card"><div class="label">${isEs ? 'Total Cosechado' : 'Total Colhido'}</div><div class="value">${totalHarvestKg.toFixed(0)} kg</div></div>
          <div class="summary-card"><div class="label">${isEs ? 'Cosechas' : 'Colheitas'}</div><div class="value">${harvests.length}</div></div>
          <div class="summary-card"><div class="label">${isEs ? 'Mermas' : 'Perdas'}</div><div class="value">${totalCullsKg.toFixed(1)} kg</div></div>
          <div class="summary-card"><div class="label">°Brix ${isEs ? 'Promedio' : 'Médio'}</div><div class="value">${avgBrix.toFixed(1)}</div></div>
        </div>
        <table>
          <thead><tr>
            <th>${isEs ? 'Invernadero' : 'Estufa'}</th><th>${isEs ? 'Código' : 'Código'}</th><th>${isEs ? 'Fecha' : 'Data'}</th>
            <th>Peso Neto</th><th>${isEs ? 'Calidad' : 'Qualidade'}</th><th>°Brix</th><th>${isEs ? 'Merma' : 'Perda'}</th>
          </tr></thead>
          <tbody>${productionData.map(r => `<tr><td>${r.zone}</td><td>${r.harvestCode}</td><td>${r.date}</td><td>${r.netWeightKg} kg</td><td>${r.qualityGrade}</td><td>${r.brixDegree || '—'}</td><td>${r.cullsKg} kg</td></tr>`).join('')}</tbody>
        </table>`;
    } else if (activeReport === 'quality') {
      html = `
        <table>
          <thead><tr>
            <th>${isEs ? 'Grado de Calidad' : 'Grau de Qualidade'}</th><th>Total (kg)</th><th>%</th><th>°Brix ${isEs ? 'Promedio' : 'Médio'}</th>
          </tr></thead>
          <tbody>${qualityData.map(r => `<tr><td style="text-transform:capitalize;font-weight:600">${r.grade}</td><td>${r.totalKg} kg</td><td>${r.percentage}%</td><td>${r.avgBrix || '—'}</td></tr>`).join('')}</tbody>
        </table>`;
    } else {
      html = `
        <table>
          <thead><tr>
            <th>${isEs ? 'Insumo' : 'Insumo'}</th><th>${isEs ? 'Categoría' : 'Categoria'}</th>
            <th>Stock</th><th>Mín</th><th>Status</th><th>${isEs ? 'Valor Estimado' : 'Valor Estimado'}</th>
          </tr></thead>
          <tbody>${inputsData.map(r => `<tr><td><strong>${r.name}</strong><br/><small>${r.tradeName}</small></td><td>${r.category}</td><td>${r.currentStock} ${r.unit}</td><td>${r.minStock}</td><td>${r.stockStatus === 'ok' ? '✅' : r.stockStatus === 'low' ? '⚠️' : '🔴'} ${r.stockStatus}</td><td>₲ ${r.estimatedCostGs.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>`;
    }

    openPrintableReport(title, html);
  };

  const gradeColors: Record<string, string> = {
    extra: 'bg-emerald-500',
    primeira: 'bg-green-400',
    segunda: 'bg-amber-400',
    industria: 'bg-orange-400',
    descarte: 'bg-red-400'
  };

  const gradeLabels: Record<string, { es: string; pt: string }> = {
    extra: { es: 'Extra', pt: 'Extra' },
    primeira: { es: 'Primera', pt: 'Primeira' },
    segunda: { es: 'Segunda', pt: 'Segunda' },
    industria: { es: 'Industria', pt: 'Indústria' },
    descarte: { es: 'Descarte', pt: 'Descarte' }
  };

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-primary" />
            {isEs ? 'Informes & Exportación' : 'Relatórios & Exportação'}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isEs
              ? 'Generación de informes gerenciales con exportación CSV, Excel y PDF'
              : 'Geração de relatórios gerenciais com exportação CSV, Excel e PDF'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 border border-outline-variant/30">
        {reportTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === PRODUCTION REPORT === */}
      {activeReport === 'production' && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: isEs ? 'Total Cosechado' : 'Total Colhido', value: `${totalHarvestKg.toFixed(0)} kg`, icon: TrendingUp, color: 'text-emerald-600' },
              { label: isEs ? 'Cosechas Registradas' : 'Colheitas Registradas', value: `${harvests.length}`, icon: BarChart3, color: 'text-sky-600' },
              { label: isEs ? 'Mermas Totales' : 'Perdas Totais', value: `${totalCullsKg.toFixed(1)} kg`, icon: ArrowDown, color: 'text-red-500' },
              { label: isEs ? '°Brix Promedio' : '°Brix Médio', value: avgBrix.toFixed(1), icon: Award, color: 'text-amber-600' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-1.5 mb-2">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{kpi.label}</span>
                </div>
                <p className="text-2xl font-black text-on-surface">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container">
                    {[isEs ? 'Invernadero' : 'Estufa', isEs ? 'Variedad' : 'Cultivar', isEs ? 'Código' : 'Código', isEs ? 'Fecha' : 'Data', 'Neto (kg)', isEs ? 'Calidad' : 'Qualidade', '°Brix', isEs ? 'Merma' : 'Perda', 'kg/pl'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productionData.map((row, idx) => (
                    <tr key={idx} className="border-t border-outline-variant/15 hover:bg-surface-container/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-on-surface max-w-[200px] truncate">{row.zone}</td>
                      <td className="px-4 py-2.5 text-xs text-on-surface-variant">{row.cultivar}</td>
                      <td className="px-4 py-2.5 text-xs font-mono font-bold text-on-surface">{row.harvestCode}</td>
                      <td className="px-4 py-2.5 text-xs text-on-surface-variant">{row.date}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-on-surface">{row.netWeightKg}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${gradeColors[row.qualityGrade] || 'bg-gray-400'}`}>
                          {isEs ? gradeLabels[row.qualityGrade]?.es : gradeLabels[row.qualityGrade]?.pt || row.qualityGrade}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-on-surface">{row.brixDegree || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-red-500 font-medium">{row.cullsKg}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-on-surface-variant">{row.yieldPerPlant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === QUALITY REPORT === */}
      {activeReport === 'quality' && (
        <div className="space-y-4">
          {/* Quality Distribution */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              {isEs ? 'Distribución por Grado de Calidad' : 'Distribuição por Grau de Qualidade'}
            </h3>

            {/* Visual Bar */}
            <div className="h-8 rounded-xl overflow-hidden flex mb-4">
              {qualityData.map(q => (
                <div
                  key={q.grade}
                  className={`${gradeColors[q.grade] || 'bg-gray-400'} transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${q.percentage}%` }}
                  title={`${q.grade}: ${q.percentage}%`}
                >
                  {q.percentage > 8 && (
                    <span className="text-white text-[10px] font-bold">{q.percentage}%</span>
                  )}
                </div>
              ))}
            </div>

            {/* Grade Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {qualityData.map(q => (
                <div key={q.grade} className="bg-surface-container rounded-xl p-3 text-center">
                  <div className={`w-3 h-3 rounded-full ${gradeColors[q.grade]} mx-auto mb-1.5`} />
                  <p className="text-xs font-bold text-on-surface capitalize">
                    {isEs ? gradeLabels[q.grade]?.es : gradeLabels[q.grade]?.pt || q.grade}
                  </p>
                  <p className="text-lg font-black text-on-surface">{q.totalKg} <span className="text-[10px] font-normal">kg</span></p>
                  <p className="text-[10px] text-on-surface-variant">{q.percentage}%</p>
                  {q.avgBrix && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">°Brix {q.avgBrix}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              {isEs ? 'Resumen de Inventario y Despachos' : 'Resumo de Estoque e Expedições'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: isEs ? 'Cajas en Stock' : 'Caixas em Estoque', value: inventoryData.totalBoxesInStock, sub: `${inventoryData.totalKgInStock} kg` },
                { label: isEs ? 'Despachado' : 'Expedido', value: inventoryData.totalBoxesShipped, sub: `${inventoryData.totalKgShipped} kg` },
                { label: isEs ? 'Retirado/Recall' : 'Recolhido/Recall', value: inventoryData.totalBoxesRecalled, sub: isEs ? 'cajas' : 'caixas' },
                { label: isEs ? 'Tasa de Merma' : 'Taxa de Perda', value: `${totalHarvestKg > 0 ? ((totalCullsKg / totalHarvestKg) * 100).toFixed(1) : 0}%`, sub: `${totalCullsKg.toFixed(1)} kg` }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{item.label}</p>
                  <p className="text-xl font-black text-on-surface mt-1">{item.value}</p>
                  <p className="text-[10px] text-on-surface-variant">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === INPUTS REPORT === */}
      {activeReport === 'inputs' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: isEs ? 'Insumos Activos' : 'Insumos Ativos', value: inputsData.length, color: 'text-emerald-600' },
              { label: isEs ? 'Stock Bajo' : 'Estoque Baixo', value: inputsData.filter(i => i.stockStatus === 'low').length, color: 'text-amber-600' },
              { label: isEs ? 'Stock Crítico' : 'Estoque Crítico', value: inputsData.filter(i => i.stockStatus === 'critical').length, color: 'text-red-600' },
              { label: isEs ? 'Valor Total Stock' : 'Valor Total Estoque', value: `₲ ${(inputsData.reduce((sum, i) => sum + i.estimatedCostGs, 0) / 1000000).toFixed(1)}M`, color: 'text-sky-600' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Inputs Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container">
                    {[isEs ? 'Insumo' : 'Insumo', isEs ? 'Categoría' : 'Categoria', 'Stock', 'Mín', 'Status', isEs ? 'Entradas' : 'Entradas', isEs ? 'Salidas' : 'Saídas', isEs ? 'Valor (₲)' : 'Valor (₲)'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inputsData.map((row, idx) => (
                    <tr key={idx} className="border-t border-outline-variant/15 hover:bg-surface-container/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-bold text-on-surface">{row.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{row.tradeName}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-semibold capitalize text-on-surface-variant">{row.category}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-on-surface">{row.currentStock} <span className="text-[10px] font-normal text-on-surface-variant">{row.unit}</span></td>
                      <td className="px-4 py-2.5 text-xs text-on-surface-variant">{row.minStock}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          row.stockStatus === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                          row.stockStatus === 'low' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {row.stockStatus === 'ok' ? '✓ OK' : row.stockStatus === 'low' ? '⚠ Bajo' : '⛔ Crítico'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-emerald-600 font-medium">+{row.totalEntries}</td>
                      <td className="px-4 py-2.5 text-xs text-sky-600 font-medium">-{row.totalExits}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-on-surface">₲ {row.estimatedCostGs.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
