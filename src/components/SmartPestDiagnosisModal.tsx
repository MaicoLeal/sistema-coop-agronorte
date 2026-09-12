import React, { useState, useRef, useEffect } from 'react';
import {
  Language,
  PlantBatch,
  ProductionZone,
  UserProfile,
  AIDiagnosisResult,
  FieldInspection
} from '../types';
import { translations } from '../i18n/translations';
import {
  AIDiagnosisService,
  PEST_AND_FUNGI_CATALOG,
  DiagnosisCatalogItem
} from '../services/aiDiagnosisService';
import { StorageService } from '../services/storageService';
import {
  Camera,
  Video,
  Mic,
  Volume2,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  Bug,
  Trees,
  UploadCloud,
  X,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface SmartPestDiagnosisModalProps {
  lang: Language;
  zones: ProductionZone[];
  batches: PlantBatch[];
  currentUser: UserProfile;
  onClose: () => void;
  onInspectionSaved: () => void;
}

export const SmartPestDiagnosisModal: React.FC<SmartPestDiagnosisModalProps> = ({
  lang,
  zones,
  batches,
  currentUser,
  onClose,
  onInspectionSaved
}) => {
  const t = translations[lang];

  // Selection
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [technicianNotes, setTechnicianNotes] = useState<string>('');

  // Media
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [isMediaSample, setIsMediaSample] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // AI Diagnostic State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<AIDiagnosisResult | null>(null);

  // Audio Speech Synthesis State
  const [audioLang, setAudioLang] = useState<'PT' | 'ES'>(lang === 'pt-BR' ? 'PT' : 'ES');
  const [isPlayingAudioSolution, setIsPlayingAudioSolution] = useState<boolean>(false);
  const speechControllerRef = useRef<{ stop: () => void } | null>(null);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick preset sample selection
  const handleSelectSample = (sample: DiagnosisCatalogItem) => {
    setIsMediaSample(true);
    setMediaType('photo');
    setMediaPreviewUrl(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f4fbf4"/><path d="M200 40 Q300 150 200 260 Q100 150 200 40 Z" fill="%2381c784" stroke="%232b6a4f" stroke-width="4"/><circle cx="180" cy="120" r="14" fill="%23ba1a1a" opacity="0.85"/><circle cx="220" cy="160" r="20" fill="%23ba1a1a" opacity="0.85"/><circle cx="170" cy="190" r="16" fill="%23ba1a1a" opacity="0.85"/><text x="200" y="285" font-family="sans-serif" font-size="14" text-anchor="middle" fill="%232b6a4f" font-weight="bold">Amostra: ' +
        encodeURIComponent(sample.namePt) +
        '</text></svg>'
    );
    setTechnicianNotes(
      lang === 'pt-BR'
        ? `Observada anomalia nas folhas superiores: ${sample.symptomsPt}`
        : `Anomalía observada en follaje superior: ${sample.symptomsEs}`
    );
    setAudioTranscript(
      lang === 'pt-BR'
        ? `Técnico relatando: Amostra coletada na Estufa. Identificados sinais compatíveis com ${sample.namePt}.`
        : `Técnico reportando: Muestra recolectada en invernadero con síntomas compatibles de ${sample.nameEs}.`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMediaSample(false);
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('photo');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start direct microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Simulated automatic transcription
        if (!audioTranscript) {
          setAudioTranscript(
            lang === 'pt-BR'
              ? 'Áudio do técnico gravado com sucesso: Relato de sintomas na folhagem superior e solicitação de validação de calda.'
              : 'Audio del técnico grabado con éxito: Reporte de síntomas en follaje superior y solicitud de validación de dosis.'
          );
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or availability issue:', err);
      // Fallback simulated recording
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecordingAudio(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    } else {
      setRecordedAudioUrl('simulated-audio');
      if (!audioTranscript) {
        setAudioTranscript(
          lang === 'pt-BR'
            ? 'Áudio do técnico em campo: Detecção de sintomas foliares na estufa hidropônica.'
            : 'Audio del técnico en campo: Detección de síntomas foliares en invernadero hidropónico.'
        );
      }
    }
  };

  // Run multimodal AI diagnosis
  const handleRunDiagnosis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await AIDiagnosisService.diagnosePestOrFungus({
        photoUrl: mediaPreviewUrl,
        audioTranscript: audioTranscript || technicianNotes,
        notes: technicianNotes,
        zoneName: zones.find((z) => z.id === selectedZoneId)?.name
      });
      setDiagnosisResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Play audio solution in PT or ES
  const handlePlayAudio = (targetLang: 'PT' | 'ES') => {
    if (!diagnosisResult) return;

    if (isPlayingAudioSolution && audioLang === targetLang) {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
      setIsPlayingAudioSolution(false);
      return;
    }

    if (speechControllerRef.current) {
      speechControllerRef.current.stop();
    }

    const script =
      targetLang === 'PT'
        ? diagnosisResult.solutionAudioScriptPt
        : diagnosisResult.solutionAudioScriptEs;

    setIsPlayingAudioSolution(true);
    setAudioLang(targetLang);

    speechControllerRef.current = AIDiagnosisService.playAudioSolution(
      script,
      targetLang,
      () => setIsPlayingAudioSolution(true),
      () => setIsPlayingAudioSolution(false)
    );
  };

  // Save to Field Notebook
  const handleSaveToFieldInspection = () => {
    if (!diagnosisResult) return;

    const selectedZone = zones.find((z) => z.id === selectedZoneId);

    const newInspection: FieldInspection = {
      id: `insp-ai-${Date.now()}`,
      tenantId: 'tenant-agronorte-demo',
      templateType: 'fitossanidade',
      zoneId: selectedZoneId,
      batchId: selectedBatchId,
      inspectorName: currentUser.name,
      inspectedAt: new Date().toISOString(),
      findings: `[DIAGNÓSTICO IA FITOSSANITÁRIO] ${diagnosisResult.pestOrFungus} (${diagnosisResult.scientificName}) - Confiança: ${diagnosisResult.confidencePct}%. ${diagnosisResult.descriptionPt}`,
      severity: diagnosisResult.severity,
      correctiveActionTaken: diagnosisResult.biologicalControl,
      syncStatus: 'synced',
      photoUrl: mediaPreviewUrl || undefined,
      mediaType,
      audioTranscript,
      audioRecordingUrl: recordedAudioUrl || undefined,
      aiDiagnosis: diagnosisResult,
      hash: `hash_diag_${Date.now().toString(16)}`
    };

    const currentList = StorageService.getInspections();
    currentList.unshift(newInspection);
    StorageService.saveInspections(currentList);

    StorageService.appendAudit(
      currentUser.email,
      currentUser.role,
      'AI_PEST_DIAGNOSIS_RECORDED',
      'FieldInspection',
      newInspection.id,
      `Diagnóstico com IA fitossanitária registrado na estufa ${selectedZone?.name}: ${diagnosisResult.pestOrFungus} (${diagnosisResult.severity}) com prescrição de biocontrole.`
    );

    onInspectionSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">
                  Diagnóstico Fitossanitário Inteligente
                </h3>
                <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  IA Agronômica Multimodal
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Envie foto, vídeo ou áudio para identificar pragas e fungos com prescrição falada em PT ou ES.
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Location & Batch Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Setor / Estufa Monitorada
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.cropType} - {z.systemType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Lote em Cultivo Vinculado
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchCode} ({b.crop} - {b.cultivar})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Multimodal Input (Photo, Video & Voice) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Visual Evidence (Photo / Video) */}
            <div className="border border-outline-variant/30 rounded-2xl p-5 space-y-3 bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  Evidência Visual (Foto ou Vídeo)
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">JPG, PNG, MP4</span>
              </div>

              {/* Media Preview or Upload Area */}
              {mediaPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-low aspect-video flex items-center justify-center">
                  {mediaType === 'video' ? (
                    <video
                      src={mediaPreviewUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={mediaPreviewUrl}
                      alt="Evidência vegetal"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <button
                    onClick={() => {
                      setMediaPreviewUrl('');
                      setIsMediaSample(false);
                    }}
                    className="absolute top-2 right-2 bg-on-surface/80 hover:bg-on-surface text-white p-1.5 rounded-full text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isMediaSample && (
                    <span className="absolute bottom-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Amostra Demonstrativa
                    </span>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/60 hover:border-primary/80 rounded-2xl p-6 text-center cursor-pointer transition-all bg-surface-container-low/40 hover:bg-primary-container/20 group"
                >
                  <UploadCloud className="w-8 h-8 text-on-surface-variant group-hover:text-primary mx-auto mb-2 transition-colors" />
                  <span className="text-xs font-bold text-on-surface block">
                    Toque para tirar foto, gravar vídeo ou anexar arquivo
                  </span>
                  <span className="text-[11px] text-on-surface-variant block mt-0.5">
                    Capture folhas, brotos apicais, frutos ou caules danificados
                  </span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Sample Quick Selector */}
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                  Ou selecione uma amostra rápida para teste imediato:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PEST_AND_FUNGI_CATALOG.map((sample) => (
                    <button
                      key={sample.key}
                      onClick={() => handleSelectSample(sample)}
                      className="text-[11px] bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface border border-outline-variant/40 rounded-xl px-2.5 py-1 font-semibold transition-colors cursor-pointer"
                    >
                      {sample.namePt.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Technician Voice & Spoken Audio Notes */}
            <div className="border border-outline-variant/30 rounded-2xl p-5 space-y-3 bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-primary" />
                    Relato de Voz do Técnico (Áudio)
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">Gravação Direta</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Descreva por voz os sintomas visuais, localização na planta e intensidade.
                </p>

                {/* Voice Recording Control */}
                <div className="mt-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-center space-y-3">
                  {!isRecordingAudio ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="h-11 px-4 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-xs transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Iniciar Gravação de Áudio</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-error font-mono font-bold text-sm animate-pulse">
                        <span className="w-3 h-3 rounded-full bg-error"></span>
                        <span>Gravando Áudio: {recordingSeconds}s</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="h-11 px-4 bg-error hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-xs transition-all cursor-pointer"
                      >
                        <Square className="w-4 h-4" />
                        <span>Parar e Concluir Áudio</span>
                      </button>
                    </div>
                  )}

                  {recordedAudioUrl && (
                    <div className="pt-2 border-t border-outline-variant/30">
                      <audio src={recordedAudioUrl} controls className="w-full h-8" />
                    </div>
                  )}
                </div>

                {/* Spoken transcript or written notes */}
                <div className="mt-3">
                  <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                    Transcrição / Observações Adicionais do Técnico:
                  </label>
                  <textarea
                    rows={2}
                    value={audioTranscript || technicianNotes}
                    onChange={(e) => {
                      setAudioTranscript(e.target.value);
                      setTechnicianNotes(e.target.value);
                    }}
                    placeholder="Descreva sintomas: manchas brancas, folhas enroladas, insetos no verso..."
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Execute Analysis Action */}
              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={isAnalyzing}
                className="w-full h-11 bg-primary hover:opacity-90 disabled:opacity-50 text-on-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAnalyzing
                    ? 'Analisando Evidências com IA...'
                    : 'Identificar Pragas e Gerar Solução'}
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: AI Diagnosis Result & Audio Solution Player */}
          {diagnosisResult && (
            <div className="border border-primary/30 bg-primary-container/20 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      Diagnóstico Fitossanitário Concluído
                    </span>
                    <h4 className="text-base font-bold text-on-surface">
                      {diagnosisResult.pestOrFungus}
                      <span className="text-xs font-normal italic text-on-surface-variant ml-2">
                        ({diagnosisResult.scientificName})
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {diagnosisResult.confidencePct}% Confiança
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      diagnosisResult.severity === 'critica'
                        ? 'bg-error-container text-on-error-container'
                        : diagnosisResult.severity === 'moderada'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    Severidade: {diagnosisResult.severity}
                  </span>
                </div>
              </div>

              {/* Audio Solution Player Banner */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h5 className="text-xs font-bold text-on-surface">
                        Solução Agronômica em Áudio (Voz Sintetizada)
                      </h5>
                      <p className="text-[11px] text-on-surface-variant">
                        Ouça a recomendação imediata de manejo fitossanitário no idioma de sua escolha:
                      </p>
                    </div>
                  </div>

                  {/* Language Selector (PT or ES) */}
                  <div className="flex items-center gap-1.5 bg-surface-container-high p-1 rounded-xl border border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio('PT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        audioLang === 'PT' && isPlayingAudioSolution
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface hover:bg-surface-container-highest'
                      }`}
                    >
                      {audioLang === 'PT' && isPlayingAudioSolution ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Áudio em Português (PT)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayAudio('ES')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        audioLang === 'ES' && isPlayingAudioSolution
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface hover:bg-surface-container-highest'
                      }`}
                    >
                      {audioLang === 'ES' && isPlayingAudioSolution ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Audio en Español (ES)</span>
                    </button>
                  </div>
                </div>

                {/* Animated Speech Status bar */}
                {isPlayingAudioSolution && (
                  <div className="bg-primary-container/40 p-2.5 rounded-xl border border-primary/30 flex items-center justify-between text-xs text-primary font-semibold animate-pulse">
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-primary" />
                      Reproduzindo recomendação em áudio ({audioLang})...
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(audioLang)}
                      className="text-primary underline font-bold cursor-pointer"
                    >
                      Pausar Áudio
                    </button>
                  </div>
                )}

                {/* Solution Transcript */}
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface leading-relaxed font-sans">
                  <strong className="text-on-surface block mb-1">
                    Transcrição da Solução ({audioLang}):
                  </strong>
                  {audioLang === 'PT'
                    ? diagnosisResult.solutionAudioScriptPt
                    : diagnosisResult.solutionAudioScriptEs}
                </div>
              </div>

              {/* Recommended Measures Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* Cultural measures */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
                  <strong className="text-on-surface font-bold block mb-1.5 flex items-center gap-1.5 text-primary">
                    <Trees className="w-3.5 h-3.5" />
                    Manejo Cultural & Estufa
                  </strong>
                  <ul className="space-y-1 text-on-surface-variant text-[11px] list-disc list-inside">
                    {diagnosisResult.culturalMeasures.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Biological Control */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
                  <strong className="text-on-surface font-bold block mb-1.5 flex items-center gap-1.5 text-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Controle Biológico Aprovado
                  </strong>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed">
                    {diagnosisResult.biologicalControl}
                  </p>
                </div>

                {/* SENAVE compliance */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
                  <strong className="text-on-surface font-bold block mb-1.5 flex items-center gap-1.5 text-primary">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Conformidade SENAVE / BPA
                  </strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {diagnosisResult.approvedProductsSenave.map((prod, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-container/40 text-on-primary-container text-[10px] px-2 py-0.5 rounded-full font-medium"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save directly to field notebook */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveToFieldInspection}
                  className="h-11 px-5 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gravar no Diário de Campo Oficial</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-between items-center text-xs text-on-surface-variant">
          <span>Coop Agronorte • Inteligência Fitossanitária de Precisão</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold transition-colors cursor-pointer border border-outline-variant/40"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
