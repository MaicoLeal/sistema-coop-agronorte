import React from 'react';
import { Language, ComplianceItem } from '../types';
import { translations } from '../i18n/translations';
import { FileCheck, ShieldCheck, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ComplianceMatrixViewProps {
  lang: Language;
  complianceList: ComplianceItem[];
}

export const ComplianceMatrixView: React.FC<ComplianceMatrixViewProps> = ({
  lang,
  complianceList
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
            <FileCheck className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-on-surface">
            {t.complianceTitle}
          </h2>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Estrutura de conformidade e auditoria segundo as normas do SENAVE (Paraguay),
          Boas Práticas Agrícolas (BPA), GLOBALG.A.P. e GS1. Itens sem confirmação legal formal estão sinalizados.
        </p>
      </div>

      {/* Compliance Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 text-on-surface-variant font-semibold bg-surface-container-low/60">
                <th className="py-3.5 px-5">Norma / Base</th>
                <th className="py-3.5 px-5 font-mono">Código Requisito</th>
                <th className="py-3.5 px-5">Descrição da Exigência</th>
                <th className="py-3.5 px-5">Evidência Obrigatória</th>
                <th className="py-3.5 px-5">Responsável</th>
                <th className="py-3.5 px-5 text-right">Status de Validação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {complianceList.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-primary">
                    {item.standard}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-on-surface font-semibold">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-5 text-on-surface max-w-xs leading-relaxed">
                    {item.requirement}
                  </td>
                  <td className="py-3.5 px-5 text-on-surface">
                    <span className="bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant/30 inline-block font-medium">
                      {item.mandatoryEvidence}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-on-surface-variant font-medium">
                    {item.responsibleRole.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        item.validationStatus === 'validated'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {item.validationStatus === 'validated' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {item.validationStatus === 'validated' ? 'Validado com Evidência' : 'Pendente de Validação'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
