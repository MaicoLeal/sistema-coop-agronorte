import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Tag, CheckCircle2, ShieldCheck, Calendar, X, Sparkles, Volume2, Camera, Bug, Palette } from 'lucide-react';

interface VersionModalProps {
  lang: Language;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ lang, onClose }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                {lang === 'pt-BR' ? 'Sobre o Sistema Coop Agronorte' : 'Acerca del Sistema Coop Agronorte'}
                <span className="bg-primary-container text-on-primary-container border border-primary/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  v1.2.0
                </span>
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Release: <span className="font-mono text-on-surface font-semibold">Multimodal AI & Mobile App Experience</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Ficha Técnica del Sistema */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 space-y-2 text-[11px]">
            <h4 className="font-bold text-on-surface uppercase tracking-wider text-[10px] text-primary">
              {lang === 'pt-BR' ? 'Especificações Técnicas de Campo' : 'Ficha Técnica de Operación'}
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1 text-on-surface-variant">
              <div>
                <span className="block font-semibold text-on-surface">Versión de App:</span>
                <span className="font-mono">1.2.0 (Build 2026.09)</span>
              </div>
              <div>
                <span className="block font-semibold text-on-surface">Zona Horaria:</span>
                <span className="font-mono">America/Asuncion (UTC-4)</span>
              </div>
              <div>
                <span className="block font-semibold text-on-surface">Red IoT de Campo:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">LoRaWAN Ready (915 MHz)</span>
              </div>
              <div>
                <span className="block font-semibold text-on-surface">Homologación:</span>
                <span className="text-primary font-bold">SENAVE & Protocolo BPA</span>
              </div>
            </div>
          </div>

          {/* Highlights in v1.2.0 */}
          <div>
            <h4 className="font-bold text-on-surface mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Novidades da Versão 1.2.0:
            </h4>
            <ul className="space-y-2.5 text-on-surface bg-primary-container/30 p-4 rounded-2xl border border-primary/20">
              <li className="flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Entrada Multimodal para Técnicos:</strong> Envio de fotografias, pequenos vídeos gravados em campo e notas faladas de áudio para triagem de sintomas foliares e de frutos.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Bug className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Identificação Inteligente de Pragas e Fungos:</strong> Diagnóstico automático de Oídio, Míldio, Mosca-branca, Tuta absoluta, Podridão Apical e Tripes com nível de severidade e conformidade SENAVE.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Prescrição Fitossanitária Falada em Áudio (PT / ES):</strong> Síntese de voz que lê em voz alta para o operador a solução recomendada (biocontrole, manejo de ventilação, dosagem de calda) no idioma selecionado.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Palette className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Identidade Visual Suave e Material:</strong> Transição para uma interface agronômica limpa, com tons neutros botânicos acolhedores e ergonomia para trabalho sob a luz do sol.
                </span>
              </li>
            </ul>
          </div>

          {/* Historical versions */}
          <div>
            <h4 className="font-bold text-on-surface-variant mb-1.5 text-[11px] uppercase tracking-wider">
              Histórico de Versões Anteriores
            </h4>
            <div className="space-y-1.5">
              <div className="border border-outline-variant/30 rounded-xl p-3 bg-surface-container-low text-[11px] text-on-surface-variant flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-on-surface">v1.1.0</span>
                  <span className="mx-2">•</span>
                  <span>Telemetria em Tempo Real e KPIs de Estufa</span>
                </div>
                <span className="font-mono text-on-surface-variant">10/09/2026</span>
              </div>
              <div className="border border-outline-variant/30 rounded-xl p-3 bg-surface-container-low text-[11px] text-on-surface-variant flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-on-surface">v1.0.0</span>
                  <span className="mx-2">•</span>
                  <span>MVP de Rastreabilidade e Motor Offline</span>
                </div>
                <span className="font-mono text-on-surface-variant">09/09/2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
