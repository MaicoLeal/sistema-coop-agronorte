import React, { useState, useEffect } from 'react';
import { Language, PublicTraceData } from '../types';
import { QRService } from '../services/qrService';
import {
  QrCode,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Trees,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface PublicTraceViewProps {
  lang: Language;
  initialToken?: string;
  onBack?: () => void;
}

export const PublicTraceView: React.FC<PublicTraceViewProps> = ({
  lang,
  initialToken = 'trace_token_tom_088_safe',
  onBack
}) => {
  const [token, setToken] = useState(initialToken);
  const [traceData, setTraceData] = useState<PublicTraceData | null>(null);

  useEffect(() => {
    const data = QRService.getPublicTraceData(token);
    setTraceData(data);
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button if opened from internal menu */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface font-semibold mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Sistema Interno</span>
        </button>
      )}

      {/* Simulator QR Token input */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-on-surface-variant font-semibold">Testar Token de Trazabilidade Pública:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-surface-container-high border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface font-mono flex-1 sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Informe o token opaco do QR..."
          />
          <button
            onClick={() => setTraceData(QRService.getPublicTraceData(token))}
            className="bg-primary hover:opacity-90 text-on-primary font-bold px-4 py-2 rounded-xl shrink-0 cursor-pointer shadow-xs"
          >
            Consultar
          </button>
        </div>
      </div>

      {/* Public Consumer Card */}
      {traceData ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-lg">
          {/* Header banner with Official Logo */}
          <div className="bg-primary p-6 text-on-primary text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src="/assets/logo-oficial-agronorte.png"
                  alt="Cooperativa Agronorte"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-on-primary/80 font-bold block mb-0.5">
                  Trazabilidade de Origem Verificada
                </span>
                <h2 className="text-2xl font-bold tracking-tight">{traceData.productName}</h2>
                <p className="text-sm text-on-primary/90 mt-0.5">{traceData.cultivar}</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  traceData.status === 'released'
                    ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                    : 'bg-error-container text-on-error-container shadow-xs'
                }`}
              >
                {traceData.status === 'released' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{traceData.status === 'released' ? 'Lote Aprovado' : 'Retido Sanitário'}</span>
              </span>
            </div>
          </div>

          {/* Body details */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1 font-semibold">Lote Comercial Certificado</span>
                <span className="font-mono font-bold text-on-surface text-base">{traceData.lotCode}</span>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1 font-semibold">Produtor e Cooperativa</span>
                <span className="font-bold text-on-surface text-sm">{traceData.producerName}</span>
                <span className="text-xs text-on-surface-variant block mt-0.5">{traceData.region}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-on-surface-variant block font-semibold">Colheita e Seleção</span>
                  <span className="text-sm font-bold text-on-surface">
                    {new Date(traceData.harvestDate).toLocaleDateString('es-PY', { timeZone: 'America/Asuncion' })}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl flex items-start gap-3">
                <Trees className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-on-surface-variant block font-semibold">Método de Cultivo</span>
                  <span className="text-sm font-bold text-on-surface">{traceData.systemType}</span>
                </div>
              </div>
            </div>

            {/* Certifications and Compliance */}
            <div className="bg-primary-container/30 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-on-surface block">Conformidade e Sanidade Vegetal</span>
                <p className="text-xs text-on-surface mt-0.5">{traceData.qualityCertification}</p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Este produto atende aos limites máximos de resíduos (LMR) e boas práticas de manejo hídrico e nutricional.
                </p>
              </div>
            </div>

            {/* Institutional footer */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-on-surface-variant" />
                <span>Contato Institucional: {traceData.institutionalContact}</span>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant font-medium">
                Coop Agronorte • Sistema Oficial
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center text-on-surface-variant shadow-xs">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-on-surface">Código de Rastreabilidade Não Encontrado</h4>
          <p className="text-xs mt-1">Verifique o token digitado ou escaneie a etiqueta novamente.</p>
        </div>
      )}
    </div>
  );
};
