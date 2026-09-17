import React, { useState, useRef } from 'react';
import { Language, FieldInspection, ProductionZone, PlantBatch, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { AIDiagnosisService } from '../services/aiDiagnosisService';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Droplets,
  Bug,
  Sparkles,
  Volume2,
  Play,
  Square,
  Mic,
  Video,
  FileAudio,
  Languages,
  ShieldCheck,
  Trash2
} from 'lucide-react';

interface FieldInspectionsProps {
  lang: Language;
  inspections: FieldInspection[];
  zones: ProductionZone[];
  batches: PlantBatch[];
  currentUser: UserProfile;
  isOnline: boolean;
  onRefreshData: () => void;
  onOpenPestDiagnosis?: () => void;
}

export const FieldInspections: React.FC<FieldInspectionsProps> = ({
  lang,
  inspections,
  zones,
  batches,
  currentUser,
  isOnline,
  onRefreshData,
  onOpenPestDiagnosis
}) => {
  const t = translations[lang];
  const [showForm, setShowForm] = useState(false);
  const [templateType, setTemplateType] = useState<FieldInspection['templateType']>('turno_diario');
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [batchId, setBatchId] = useState(batches[0]?.id || '');
  const [phManual, setPhManual] = useState<string>('6.0');
  const [ecManual, setEcManual] = useState<string>('2.1');
  const [findings, setFindings] = useState('');
  const [severity, setSeverity] = useState<FieldInspection['severity']>('normal');
  const [formError, setFormError] = useState<string | null>(null);

  // Active audio player state for inspection cards
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [activeSpeechLang, setActiveSpeechLang] = useState<'PT' | 'ES'>(lang === 'pt-BR' ? 'PT' : 'ES');
  const speechControllerRef = useRef<{ stop: () => void } | null>(null);

  const handlePlayInspectionAudio = (insp: FieldInspection, targetLang: 'PT' | 'ES') => {
    if (!insp.aiDiagnosis) return;

    if (activePlayingId === insp.id && activeSpeechLang === targetLang) {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
      setActivePlayingId(null);
      return;
    }

    if (speechControllerRef.current) {
      speechControllerRef.current.stop();
    }

    setActivePlayingId(insp.id);
    setActiveSpeechLang(targetLang);

    const script =
      targetLang === 'PT'
        ? insp.aiDiagnosis.solutionAudioScriptPt
        : insp.aiDiagnosis.solutionAudioScriptEs;

    speechControllerRef.current = AIDiagnosisService.playAudioSolution(
      script,
      targetLang,
      () => setActivePlayingId(insp.id),
      () => setActivePlayingId(null)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings.trim()) {
      setFormError('Por favor, descreva as observações do campo.');
      return;
    }
    setFormError(null);

    const newInspection: FieldInspection = {
      id: `insp-${Date.now()}`,
      tenantId: 'tenant-agronorte-demo',
      templateType,
      zoneId,
      batchId: batchId || undefined,
      inspectorName: currentUser.name,
      inspectedAt: new Date().toISOString(),
      phManual: templateType === 'ph_ec_manual' ? parseFloat(phManual) : undefined,
      ecManual: templateType === 'ph_ec_manual' ? parseFloat(ecManual) : undefined,
      findings,
      severity,
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      hash: `hash_${Date.now().toString(16)}`
    };

    const currentInspections = StorageService.getInspections();
    currentInspections.unshift(newInspection);
    StorageService.saveInspections(currentInspections);

    if (!isOnline) {
      StorageService.addToOutbox({
        opId: `op-${Date.now()}`,
        entity: 'inspection',
        payload: newInspection
      });
    }

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'FIELD_INSPECTION_CREATED',
      'FieldInspection',
      newInspection.id,
      `Nova checagem (${templateType}) por ${currentUser.name}. Status sync: ${newInspection.syncStatus}`
    );

    // Reset form
    setFindings('');
    setShowForm(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-on-surface">
              {t.fieldNotebookTitle}
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Diário oficial de campo com checagens diárias, anexos multimídia e identificação fitossanitária com IA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenPestDiagnosis && (
            <button
              onClick={onOpenPestDiagnosis}
              className="bg-primary-container hover:opacity-90 text-on-primary-container text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Bug className="w-4 h-4 text-primary" />
              <span>Diagnóstico IA (Foto/Vídeo/Áudio)</span>
            </button>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:opacity-90 text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.newInspection}
          </button>
        </div>
      </div>

      {/* New Inspection Form Modal / Inline */}
      {showForm && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Novo Registro de Inspeção Técnica no Invernadero
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-on-surface-variant hover:text-on-surface text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Tipo de Formulário
                </label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as any)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
                >
                  <option value="turno_diario">Abertura / Fechamento de Turno</option>
                  <option value="ph_ec_manual">Conferência Portátil de pH / EC</option>
                  <option value="fitossanidade">Monitoramento Fitossanitário</option>
                  <option value="higiene_estufa">Higiene e Desinfecção de Estufa</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Invernadero</label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Lote Vinculado</label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} ({b.crop})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* If pH/EC Manual check */}
            {templateType === 'ph_ec_manual' && (
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    pH Medido Manualmente
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={phManual}
                    onChange={(e) => setPhManual(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2 text-xs text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                    EC Medido Manualmente (mS/cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ecManual}
                    onChange={(e) => setEcManual(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2 text-xs text-on-surface font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                {t.observations} e Relato do Técnico
              </label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Descreva as condições das plantas, sintomas observados, bicos gotejadores ou correções efetuadas..."
                rows={3}
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-semibold">Severidade:</span>
                {(['normal', 'leve', 'moderada', 'critica'] as const).map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="severity"
                      value={s}
                      checked={severity === s}
                      onChange={() => setSeverity(s)}
                      className="accent-primary"
                    />
                    <span className="capitalize">{s}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-semibold cursor-pointer border border-outline-variant/40"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.saveLocal}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Inspections List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Histórico de Checagens Realizadas
            </h3>
            <span className="text-xs text-on-surface-variant">
              Total: {inspections.length} registros no diário
            </span>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {inspections.map((insp) => (
            <div key={insp.id} className="p-5 hover:bg-surface-container-low/40 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-surface-container-high text-on-surface border border-outline-variant/40">
                    {insp.templateType.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-on-surface">
                    {insp.inspectorName}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    ({new Date(insp.inspectedAt).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      insp.severity === 'normal'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : insp.severity === 'critica'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    Severidade: {insp.severity}
                  </span>

                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      insp.syncStatus === 'synced'
                        ? 'bg-primary-container/60 text-on-primary-container'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {insp.syncStatus === 'synced' ? (
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-700" />
                    )}
                    <span>{insp.syncStatus === 'synced' ? 'Sincronizado' : 'Offline / Pendente'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Está seguro de eliminar esta inspección del registro?')) {
                        StorageService.deleteInspection(insp.id, currentUser);
                        onRefreshData();
                      }
                    }}
                    title="Eliminar inspección"
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Findings */}
              <p className="text-xs text-on-surface leading-relaxed">{insp.findings}</p>

              {/* Portable ph/ec readings if present */}
              {insp.phManual !== undefined && (
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-mono bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
                  <span>pH portátil: <strong className="text-secondary">{insp.phManual}</strong></span>
                  <span>EC portátil: <strong className="text-primary">{insp.ecManual} mS/cm</strong></span>
                </div>
              )}

              {/* AI Diagnosis Pill & Audio Playback for this item if attached */}
              {insp.aiDiagnosis && (
                <div className="bg-primary-container/30 border border-primary/20 rounded-xl p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
                        <Bug className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-on-surface block">
                          {insp.aiDiagnosis.pestOrFungus} ({insp.aiDiagnosis.scientificName})
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          Identificação IA ({insp.aiDiagnosis.confidencePct}% de confiança)
                        </span>
                      </div>
                    </div>

                    {/* Speech Audio Trigger in PT and ES */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePlayInspectionAudio(insp, 'PT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          activePlayingId === insp.id && activeSpeechLang === 'PT'
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
                        }`}
                        title="Ouvir recomendação em Português"
                      >
                        {activePlayingId === insp.id && activeSpeechLang === 'PT' ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>Áudio PT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayInspectionAudio(insp, 'ES')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          activePlayingId === insp.id && activeSpeechLang === 'ES'
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
                        }`}
                        title="Escuchar recomendación en Español"
                      >
                        {activePlayingId === insp.id && activeSpeechLang === 'ES' ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>Audio ES</span>
                      </button>
                    </div>
                  </div>

                  {activePlayingId === insp.id && (
                    <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-primary/40 text-xs text-primary flex items-center gap-2 font-medium animate-pulse shadow-xs">
                      <Volume2 className="w-4 h-4 text-primary" />
                      <span>Reproduzindo diagnóstico e prescrição fitossanitária em áudio ({activeSpeechLang})...</span>
                    </div>
                  )}

                  {insp.correctiveActionTaken && (
                    <div className="text-xs text-on-surface font-medium pt-1">
                      <strong className="text-primary">Recomendação de Biocontrole:</strong> {insp.correctiveActionTaken}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
