import React from 'react';
import { Language, AuditEntry } from '../types';
import { History, ShieldCheck, Terminal } from 'lucide-react';

interface AuditLogViewProps {
  lang: Language;
  auditLogs: AuditEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ lang, auditLogs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-on-surface">
              Trilha de Auditoria Imutável (Append-Only)
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Registro encadeado por hashes criptográficos para conformidade regulatória e auditoria sem exclusão destrutiva.
          </p>
        </div>

        <div className="bg-secondary-container text-on-secondary-container px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>Encadeamento Criptográfico Válido</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Registros de Operações Sensíveis
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{auditLogs.length} eventos auditados</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {auditLogs.slice().reverse().map((entry) => (
            <div key={entry.id} className="p-5 hover:bg-surface-container-low/40 transition-colors space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-primary bg-primary-container/40 px-2.5 py-0.5 rounded-full text-[11px]">
                    {entry.action}
                  </span>
                  <span className="text-on-surface font-bold">{entry.userId}</span>
                  <span className="text-on-surface-variant text-[11px]">({entry.userRole})</span>
                </div>
                <span className="text-on-surface-variant font-mono text-[11px]">
                  {new Date(entry.timestamp).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })}
                </span>
              </div>

              <p className="text-xs text-on-surface leading-relaxed">{entry.details}</p>

              {/* Hashes */}
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-[10px] font-mono text-on-surface-variant flex flex-col sm:flex-row justify-between gap-2">
                <div className="truncate max-w-sm">
                  <span className="text-outline font-semibold">prev_hash:</span> {entry.previousHash}
                </div>
                <div className="truncate max-w-sm text-primary font-semibold">
                  <span className="text-outline font-semibold">current_hash:</span> {entry.currentHash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
