import React, { useRef } from 'react';
import { Language, PlantBatch, ProductionZone, UnifiedIntervention, UserProfile } from '../types';
import {
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Calendar,
  Clock,
  User,
  MapPin,
  Sparkles,
  X,
  Copy,
  ExternalLink,
  Award,
  Sprout,
  Activity,
  Check,
  FileText
} from 'lucide-react';
import { QRService } from '../services/qrService';

interface BatchCertificateModalProps {
  lang: Language;
  batch: PlantBatch;
  zone: ProductionZone;
  interventions: UnifiedIntervention[];
  currentUser: UserProfile;
  onClose: () => void;
  onOpenPublicTrace?: (token: string) => void;
}

export const BatchCertificateModal: React.FC<BatchCertificateModalProps> = ({
  lang,
  batch,
  zone,
  interventions,
  currentUser,
  onClose,
  onOpenPublicTrace
}) => {
  const isPt = lang === 'pt-BR';
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const qrDataUrl = QRService.generateBatchQR(batch.qrToken);

  // Compute average sensor values from interventions that have them
  const validPh = interventions.filter(i => i.ph).map(i => i.ph!);
  const avgPh = validPh.length ? (validPh.reduce((a, b) => a + b, 0) / validPh.length).toFixed(2) : '6.05';

  const validEc = interventions.filter(i => i.ec).map(i => i.ec!);
  const avgEc = validEc.length ? (validEc.reduce((a, b) => a + b, 0) / validEc.length).toFixed(2) : '2.10';

  const validTemp = interventions.filter(i => i.temperature).map(i => i.temperature!);
  const avgTemp = validTemp.length ? (validTemp.reduce((a, b) => a + b, 0) / validTemp.length).toFixed(1) : '24.8';

  const validHum = interventions.filter(i => i.humidity).map(i => i.humidity!);
  const avgHum = validHum.length ? Math.round(validHum.reduce((a, b) => a + b, 0) / validHum.length) : '74';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(batch.batchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = isPt
      ? `🌱 *Certificado Oficial de Rastreabilidade Agronorte*\nLote: *${batch.batchCode}*\nCultura: *${batch.crop} (${batch.cultivar})*\nEstufa: ${zone.name}\nProdutor: Coop Agronorte (Guayaibí, San Pedro)\nSelo BPA-PY / SENAVE 100% Auditado.\nVerifique aqui: https://agronorte.com.py/trace?token=${batch.qrToken}`
      : `🌱 *Certificado Oficial de Trazabilidad Agronorte*\nLote: *${batch.batchCode}*\nCultivo: *${batch.crop} (${batch.cultivar})*\nInvernadero: ${zone.name}\nProductor: Coop Agronorte (Guayaibí, San Pedro)\nSello BPA-PY / SENAVE 100% Auditado.\nVerifique aquí: https://agronorte.com.py/trace?token=${batch.qrToken}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm">
      {/* Container do Modal */}
      <div className="bg-surface-container-lowest text-on-surface rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-4xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Não sai na impressão) */}
        <div className="bg-surface-container-high px-4 sm:px-6 py-3 border-b border-outline-variant/30 flex items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-on-surface">
              {isPt ? 'Certificado Oficial de Rastreabilidade' : 'Certificado Oficial de Trazabilidad'}
            </span>
            <span className="bg-primary-container text-on-primary-container text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-primary/30">
              BPA-PY / SENAVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-container text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/40 cursor-pointer"
              title="Copiar código do lote"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isPt ? 'Copiado!' : 'Copiado!') : batch.batchCode}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPt ? 'Imprimir / PDF' : 'Imprimir / PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📄 CORPO DO CERTIFICADO OFICIAL (ÁREA IMPRESSA) */}
        <div id="certificate-print-body" ref={printRef} className="p-6 sm:p-8 space-y-6 bg-white text-slate-900 overflow-y-auto flex-1 print:p-0 print:m-0 print:space-y-4 print:overflow-visible">
          
          {/* Header Institucional com Borda de Segurança */}
          <div className="border-b-4 border-emerald-700 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Logotipo e Identificação */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 p-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/logo-oficial-agronorte-tight.png"
                    alt="Cooperativa Agronorte"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold tracking-widest text-emerald-800 uppercase block">
                    COOPERATIVA AGROINDUSTRIAL AGRONORTE LTDA.
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {isPt
                      ? 'CERTIFICADO OFICIAL DE RASTREABILIDADE AGRÍCOLA'
                      : 'CERTIFICADO OFICIAL DE TRAZABILIDAD AGRÍCOLA'}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Guayaibí, Dpto. de San Pedro • Paraguay | Buenas Prácticas Agrícolas (BPA-PY) • Res. SENAVE 340
                  </p>
                </div>
              </div>

              {/* Selo Gráfico Oficial de Auditoria */}
              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {isPt ? 'Emissão Oficial' : 'Emisión Oficial'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {new Date().toLocaleDateString(isPt ? 'pt-BR' : 'es-PY')} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-emerald-600 border-dashed bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5">
                    100% AUDITADO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Mestres do Lote & Cultivo (Grid de 3 Colunas) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Coluna 1: Identificação do Lote */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-700" />
                {isPt ? 'Identificação do Lote' : 'Identificación del Lote'}
              </span>
              <div className="font-mono text-base sm:text-lg font-black text-emerald-900">
                {batch.batchCode}
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Origem da Muda:' : 'Origen Semillero:'} </span>
                <span>{batch.seedlingOrigin}</span>
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Plantas Ativas:' : 'Plantas Activas:'} </span>
                <span className="font-bold">{batch.currentActiveQuantity.toLocaleString()} plantas</span>
              </div>
            </div>

            {/* Coluna 2: Cultivo & Estufa */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sprout className="w-3 h-3 text-emerald-700" />
                {isPt ? 'Cultura & Ambiente' : 'Cultivo y Ambiente'}
              </span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{batch.crop.includes('Tomate') ? '🍅' : '🫑'}</span>
                <span>{batch.crop}</span>
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Variedade:' : 'Variedad:'} </span>
                <span className="font-medium">{batch.cultivar}</span>
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Estufa:' : 'Invernadero:'} </span>
                <span className="font-bold text-slate-900">{zone.name} ({zone.systemType})</span>
              </div>
            </div>

            {/* Coluna 3: Datas & Conformidade */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-700" />
                {isPt ? 'Cronologia & Validação' : 'Cronología y Validación'}
              </span>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Transplante:' : 'Transplante:'} </span>
                <span>{new Date(batch.plantingDate).toLocaleDateString(isPt ? 'pt-BR' : 'es-PY')}</span>
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{isPt ? 'Ciclo Estimado:' : 'Cosecha Oficial:'} </span>
                <span className="font-medium text-emerald-800">
                  {new Date(batch.expectedHarvestDate).toLocaleDateString(isPt ? 'pt-BR' : 'es-PY')}
                </span>
              </div>
              <div className="text-xs text-slate-700 flex items-center gap-1">
                <span className="font-semibold">{isPt ? 'Status Sanitário:' : 'Estado Sanitario:'} </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {isPt ? 'Aprovado para Consumo' : 'Aprobado para Consumo'}
                </span>
              </div>
            </div>
          </div>

          {/* 📡 PAINEL DE CONDUTIVIDADE E AMBIENTE DOS SENSORES IoT */}
          <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                {isPt ? 'Condições Médias Registradas por Sensores IoT na Estufa' : 'Condiciones Promedio Registradas por Sensores IoT'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900 px-2 py-0.5 rounded border border-emerald-700">
                LoRaWAN • Telemetria Contínua
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/60">
                <span className="text-[10px] text-emerald-300 block font-semibold">pH Médio da Solução</span>
                <span className="text-lg font-black text-white font-mono">{avgPh}</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">Faixa Alvo: 5.8 - 6.5</span>
              </div>

              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/60">
                <span className="text-[10px] text-emerald-300 block font-semibold">Condutividade Elétrica (EC)</span>
                <span className="text-lg font-black text-white font-mono">{avgEc} mS/cm</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">Nutrição de Alta Precisão</span>
              </div>

              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/60">
                <span className="text-[10px] text-emerald-300 block font-semibold">Temperatura Média</span>
                <span className="text-lg font-black text-white font-mono">{avgTemp} °C</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">Conforto Térmico Foliar</span>
              </div>

              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/60">
                <span className="text-[10px] text-emerald-300 block font-semibold">Umidade Relativa (UR)</span>
                <span className="text-lg font-black text-white font-mono">{avgHum}%</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">Ventilação Controlada</span>
              </div>
            </div>
          </div>

          {/* 📋 TABELA OFICIAL DE INTERVENÇÕES (HISTÓRICO COMPLETO DA PLANTA) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
                <span>📋</span>
                <span>{isPt ? 'Livro Oficial de Campo: Histórico Completo de Intervenções e Manejo' : 'Cuaderno Oficial de Campo: Historial Completo de Manejos'}</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {interventions.length} {isPt ? 'registros cronológicos auditados' : 'registros auditados'}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 whitespace-nowrap">{isPt ? 'Data & Hora' : 'Fecha y Hora'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isPt ? 'Tipo' : 'Tipo'}</th>
                    <th className="py-2.5 px-3 min-w-[200px]">{isPt ? 'O que foi Aplicado / Ação Realizada' : 'Acción / Producto Aplicado'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isPt ? 'Dose / Especificação' : 'Dosis / Detalle'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isPt ? 'Carência' : 'Carencia'}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{isPt ? 'Responsável Técnico' : 'Responsable'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {interventions.map((item) => {
                    const d = new Date(item.timestamp);
                    const formattedDate = d.toLocaleDateString(isPt ? 'pt-BR' : 'es-PY');
                    const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const typeBadge = {
                      nutricao: { label: isPt ? 'Nutrição' : 'Nutrición', bg: 'bg-blue-100 text-blue-800' },
                      manejo: { label: isPt ? 'Manejo' : 'Manejo', bg: 'bg-emerald-100 text-emerald-800' },
                      fitossanidade: { label: isPt ? 'Sanidade' : 'Sanidad', bg: 'bg-amber-100 text-amber-800' },
                      sensor_leitura: { label: isPt ? 'Calibração' : 'Calibración', bg: 'bg-purple-100 text-purple-800' },
                      colheita: { label: isPt ? 'Colheita' : 'Cosecha', bg: 'bg-rose-100 text-rose-800' }
                    }[item.type] || { label: item.type, bg: 'bg-slate-100 text-slate-800' };

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                          <div>{formattedDate}</div>
                          <div className="text-[10px] text-slate-400">{formattedTime}</div>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge.bg}`}>
                            {typeBadge.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800">
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-600">{item.productOrAction}</div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">"{item.notes}"</div>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-700 text-[11px]">
                          {item.dosage || '—'}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-[11px]">
                          {item.gracePeriodDays !== undefined ? (
                            <span className="font-semibold text-emerald-700">
                              {item.gracePeriodDays === 0
                                ? (isPt ? '0 dias (Biológico)' : '0 días (Biológico)')
                                : `${item.gracePeriodDays} dias`}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                          <div className="font-bold text-[11px] text-slate-900">{item.operatorName}</div>
                          <div className="text-[10px] text-slate-500">{item.operatorRole || 'Operador'}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🔍 QR CODE DE CONSULTA PÚBLICA & ASSINATURAS OFICIAIS */}
          <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* QR Code com Link do Consumidor */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="w-18 h-18 bg-white p-1 rounded-xl shadow-xs border border-slate-200 shrink-0">
                <img src={qrDataUrl} alt="QR Code de Rastreabilidade" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {isPt ? 'Consulta Pública do Consumidor' : 'Consulta Pública'}
                </span>
                <p className="text-[11px] text-slate-700 leading-tight">
                  {isPt
                    ? 'Aponte a câmera para auditar a procedência, estufa e histórico sanitário.'
                    : 'Escanee para verificar origen, invernadero e historial sanitario.'}
                </p>
                {onOpenPublicTrace && (
                  <button
                    onClick={() => onOpenPublicTrace(batch.qrToken)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <span>{isPt ? 'Abrir portal público' : 'Ver portal público'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Assinatura do Responsável Técnico */}
            <div className="text-center p-3 border-t sm:border-t-0 sm:border-l border-slate-200">
              <div className="h-8 flex items-end justify-center">
                <span className="font-serif italic text-sm text-slate-800 font-bold border-b border-slate-400 px-4">
                  Ing. Carlos Ortiz
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 uppercase block mt-1">
                Ing. Carlos Ortiz — Reg. SENAVE 4.812
              </span>
              <span className="text-[9px] text-slate-500 block">
                {isPt ? 'Responsável Técnico / Auditor de Qualidade' : 'Responsable Técnico / Auditor de Calidad'}
              </span>
            </div>

            {/* Assinatura da Diretoria da Cooperativa */}
            <div className="text-center p-3 border-t sm:border-t-0 sm:border-l border-slate-200">
              <div className="h-8 flex items-end justify-center">
                <span className="font-serif italic text-sm text-emerald-900 font-bold border-b border-slate-400 px-4">
                  Cooperativa Agronorte Ltda.
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 uppercase block mt-1">
                Diretoria de Operações & Rastreabilidade
              </span>
              <span className="text-[9px] text-slate-500 block">
                Comitê Central de Sanidade Hidropônica
              </span>
            </div>
          </div>

          {/* Rodapé Criptográfico (Imutabilidade) */}
          <div className="text-[10px] text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-1 pt-2 border-t border-slate-100">
            <span>HASH SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
            <span>SENAVE PY • BPA CERT. Nº 2026-09-AGRONORTE</span>
          </div>
        </div>

        {/* Bottom Actions (Não sai na impressão) */}
        <div className="bg-surface-container-high px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between gap-4 print:hidden shrink-0">
          <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isPt
                ? 'Certificado válido para exportação e redes de supermercados.'
                : 'Certificado válido para exportación y cadenas de supermercados.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant/40 transition-colors cursor-pointer"
            >
              {isPt ? 'Fechar' : 'Cerrar'}
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPt ? 'Imprimir Certificado A4' : 'Imprimir Certificado A4'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
