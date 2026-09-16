import React, { useState, useMemo } from 'react';
import {
  Language,
  UserProfile,
  ProductionZone,
  PlantBatch,
  HarvestRecord,
  FieldInspection,
  UnifiedIntervention
} from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { VoiceAssistantService } from '../services/voiceAssistantService';
import { BatchCertificateModal } from './BatchCertificateModal';
import {
  Sprout,
  Camera,
  Package,
  ClipboardCheck,
  FilePenLine,
  Sliders,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Thermometer,
  Activity,
  Check,
  Award,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Filter,
  FileText,
  ExternalLink,
  Zap
} from 'lucide-react';

interface ProducerQuickViewProps {
  lang: Language;
  currentUser: UserProfile;
  zones: ProductionZone[];
  batches: PlantBatch[];
  onSwitchToExpert: () => void;
  onOpenPestDiagnosis: () => void;
  onOpenMateoChat: () => void;
  onOpenFieldInspections?: () => void;
  onOpenPublicTrace?: (token: string) => void;
  onHarvestSaved?: () => void;
  onInspectionSaved?: () => void;
  onSelectZone: (zoneId: string) => void;
}

export const ProducerQuickView: React.FC<ProducerQuickViewProps> = ({
  lang,
  currentUser,
  zones,
  batches,
  onSwitchToExpert,
  onOpenPestDiagnosis,
  onOpenMateoChat,
  onOpenFieldInspections,
  onOpenPublicTrace,
  onHarvestSaved,
  onInspectionSaved,
  onSelectZone
}) => {
  const t = translations[lang];
  const isPt = lang === 'pt-BR';

  // 🎯 CROP SELECTOR (Foco Unificado: Tomate vs Locote Verde)
  const [selectedCrop, setSelectedCrop] = useState<'tomate' | 'locote'>('tomate');

  // Filter greenhouses by the selected crop
  const cropZones = useMemo(() => {
    return zones.filter((z) => z.cropType === selectedCrop);
  }, [zones, selectedCrop]);

  // Active Selected Greenhouse
  const [activeZoneId, setActiveZoneId] = useState<string>(cropZones[0]?.id || zones[0]?.id || 'zone-estufa-01');

  // Ensure activeZoneId matches the current crop
  const currentZone = useMemo(() => {
    return cropZones.find((z) => z.id === activeZoneId) || cropZones[0] || zones[0];
  }, [cropZones, activeZoneId]);

  // Current active batch for this zone
  const currentBatch = useMemo(() => {
    return batches.find((b) => b.zoneId === currentZone.id) ||
      batches.find((b) => selectedCrop === 'tomate' ? b.crop.includes('Tomate') : b.crop.includes('Locote')) ||
      batches[0];
  }, [batches, currentZone, selectedCrop]);

  // Interventions for this batch & zone
  const [interventions, setInterventions] = useState<UnifiedIntervention[]>(() => {
    return StorageService.getBatchInterventions(currentBatch?.id || 'batch-tom-088', currentZone?.id);
  });

  // Reload interventions when batch or zone changes
  React.useEffect(() => {
    if (currentBatch) {
      setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));
    }
  }, [currentBatch, currentZone]);

  // 📄 Certificate Modal State
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // 📜 Timeline Category Filter
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'nutricao' | 'manejo' | 'fitossanidade' | 'colheita'>('all');

  const filteredInterventions = useMemo(() => {
    if (timelineFilter === 'all') return interventions;
    return interventions.filter((i) => i.type === timelineFilter);
  }, [interventions, timelineFilter]);

  // Quick Harvest Modal State
  const [showQuickHarvestModal, setShowQuickHarvestModal] = useState<boolean>(false);
  const [boxCount, setBoxCount] = useState<number>(15);
  const [estimatedKgPerBox, setEstimatedKgPerBox] = useState<number>(18);
  const [harvestSuccessMessage, setHarvestSuccessMessage] = useState<string | null>(null);

  // Manual Field Technician Entry State
  const [showManualEntryModal, setShowManualEntryModal] = useState<boolean>(false);
  const [manualTemplateType, setManualTemplateType] = useState<FieldInspection['templateType']>('ph_ec_manual');
  const [manualPh, setManualPh] = useState<string>(selectedCrop === 'tomate' ? '6.05' : '6.25');
  const [manualEc, setManualEc] = useState<string>(selectedCrop === 'tomate' ? '2.15' : '1.85');
  const [manualTemp, setManualTemp] = useState<string>('24.5');
  const [manualHumidity, setManualHumidity] = useState<string>('72');
  const [manualFindings, setManualFindings] = useState<string>('');
  const [manualCorrectiveAction, setManualCorrectiveAction] = useState<string>('');
  const [manualSeverity, setManualSeverity] = useState<FieldInspection['severity']>('normal');
  const [manualSuccessMessage, setManualSuccessMessage] = useState<string | null>(null);

  // Switch crop handler
  const handleCropChange = (crop: 'tomate' | 'locote') => {
    setSelectedCrop(crop);
    const newZones = zones.filter((z) => z.cropType === crop);
    if (newZones.length > 0) {
      setActiveZoneId(newZones[0].id);
      onSelectZone(newZones[0].id);
    }
    // Update default manual values based on agronomic targets
    if (crop === 'tomate') {
      setManualPh('6.05');
      setManualEc('2.15');
    } else {
      setManualPh('6.25');
      setManualEc('1.85');
    }
  };

  // Switch zone handler
  const handleZoneChange = (zoneId: string) => {
    setActiveZoneId(zoneId);
    onSelectZone(zoneId);
  };

  // Daily voice briefing
  const handlePlayBriefing = () => {
    const isTomato = selectedCrop === 'tomate';
    const speech = isPt
      ? `Olá, produtor! Aqui é o Don Mateo. Estamos monitorando o cultivo de ${isTomato ? 'Tomates' : 'Locote Verde'}. A ${currentZone.name} está operando com pH e condutividade adequados. O histórico do lote está atualizado e pronto para emissão de certificado. Boa colheita!`
      : `¡Hola, amigo productor! Aquí Don Mateo. Estamos monitoreando el cultivo de ${isTomato ? 'Tomates' : 'Locote Verde'}. El ${currentZone.name} opera con pH y conductividad adecuados. El historial del lote está al día y listo para emitir certificado. ¡Buena jornada!`;

    VoiceAssistantService.speak(speech, lang);
  };

  // Save manual field entry & append to unified timeline
  const handleSaveManualEntry = () => {
    const phNum = parseFloat(manualPh) || 6.1;
    const ecNum = parseFloat(manualEc) || 2.1;
    const tempNum = parseFloat(manualTemp) || 24.5;
    const humNum = parseFloat(manualHumidity) || 72;

    const newInspection: FieldInspection = {
      id: `insp-man-${Date.now()}`,
      tenantId: currentUser.tenantId || 'tenant-agronorte-demo',
      templateType: manualTemplateType,
      zoneId: currentZone.id,
      batchId: currentBatch.id,
      inspectorName: currentUser.name || 'Técnico de Campo Agronorte',
      inspectedAt: new Date().toISOString(),
      phManual: phNum,
      ecManual: ecNum,
      findings: manualFindings.trim() || (isPt
        ? `Lançamento técnico realizado na ${currentZone.name}. Solução com pH ${phNum} e EC ${ecNum} mS/cm aferidos em bancada.`
        : `Carga técnica realizada en ${currentZone.name}. Solución con pH ${phNum} y EC ${ecNum} mS/cm medidos en bancada.`),
      severity: manualSeverity,
      correctiveActionTaken: manualCorrectiveAction.trim() || undefined,
      syncStatus: 'synced',
      hash: `sha256_man_${Date.now().toString(16)}`
    };

    StorageService.addInspection(newInspection, currentUser);

    // Also add to UnifiedIntervention for the batch history timeline & certificate
    const newIntervention: UnifiedIntervention = {
      id: `int-man-${Date.now()}`,
      batchId: currentBatch.id,
      zoneId: currentZone.id,
      timestamp: new Date().toISOString(),
      type: manualTemplateType === 'fitossanidade' ? 'fitossanidade' : manualTemplateType === 'ph_ec_manual' ? 'nutricao' : 'manejo',
      title: manualTemplateType === 'fitossanidade'
        ? (isPt ? 'Inspeção Fitossanitária de Campo' : 'Inspección Fitosanitaria de Campo')
        : manualTemplateType === 'ph_ec_manual'
        ? (isPt ? 'Aferição de pH & Condutividade Nutritiva' : 'Calibración de pH y Conductividad Nutritiva')
        : (isPt ? 'Manejo Operacional de Estufa' : 'Manejo Operacional de Invernadero'),
      productOrAction: manualFindings.trim() || (isPt ? 'Ajuste de solução e medição instrumental' : 'Ajuste de solución y medición'),
      dosage: `pH ${phNum} • EC ${ecNum} mS/cm`,
      gracePeriodDays: 0,
      ph: phNum,
      ec: ecNum,
      temperature: tempNum,
      humidity: humNum,
      operatorName: currentUser.name || 'Técnico de Campo',
      operatorRole: currentUser.role === 'agronomist' ? 'Engenheiro Agrônomo' : 'Técnico Agrícola',
      severity: manualSeverity,
      notes: manualCorrectiveAction.trim() ? `${isPt ? 'Ação:' : 'Acción:'} ${manualCorrectiveAction}` : undefined,
      verifiedHash: `sha256_bpa_${Date.now().toString(16)}`
    };

    StorageService.addIntervention(newIntervention, currentUser);

    // Update local state
    setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));

    const successTxt = isPt
      ? `Apontamento gravado com sucesso para a ${currentZone.name}! (pH: ${phNum}, EC: ${ecNum} mS/cm)`
      : `¡Apunte técnico guardado con éxito para ${currentZone.name}! (pH: ${phNum}, EC: ${ecNum} mS/cm)`;

    setManualSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowManualEntryModal(false);
      setManualSuccessMessage(null);
      setManualFindings('');
      setManualCorrectiveAction('');
      if (onInspectionSaved) onInspectionSaved();
    }, 2000);
  };

  // Save Harvest and add to timeline
  const handleSaveHarvest = () => {
    const totalKg = boxCount * estimatedKgPerBox;

    const currentHarvests = StorageService.getHarvests();
    const newHarvest: HarvestRecord = {
      id: `col-${Date.now().toString().slice(-5)}`,
      tenantId: currentUser.tenantId,
      batchId: currentBatch.id,
      harvestCode: `COL-${selectedCrop === 'tomate' ? 'TOM' : 'LOC'}-${Date.now().toString().slice(-4)}`,
      harvestedAt: new Date().toISOString(),
      grossWeightKg: totalKg + (boxCount * 1.5),
      tareWeightKg: boxCount * 1.5,
      netWeightKg: totalKg,
      unitsCount: boxCount,
      cullsKg: 0,
      operatorId: currentUser.id,
      qualityGrade: 'primeira',
      isLocked: false
    };

    StorageService.saveHarvests([newHarvest, ...currentHarvests]);

    // Add harvest intervention to unified timeline
    const harvestIntervention: UnifiedIntervention = {
      id: `int-harv-${Date.now()}`,
      batchId: currentBatch.id,
      zoneId: currentZone.id,
      timestamp: new Date().toISOString(),
      type: 'colheita',
      title: isPt ? 'Colheita Comercial de 1ª Linha' : 'Cosecha Comercial de 1ª Calidad',
      productOrAction: `${boxCount} caixas (${totalKg} kg líquidos colhidos)`,
      dosage: `${estimatedKgPerBox} kg/caixa`,
      operatorName: currentUser.name || 'Operador de Colheita',
      operatorRole: 'Operador de Campo',
      severity: 'normal',
      notes: isPt ? 'Frutos selecionados de primeira qualidade. Lote atualizado no estoque.' : 'Frutos seleccionados de primera calidad.',
      verifiedHash: `sha256_bpa_harv_${Date.now().toString(16)}`
    };

    StorageService.addIntervention(harvestIntervention, currentUser);
    setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));

    const cropName = selectedCrop === 'tomate' ? 'Tomate' : 'Locote';
    const successTxt = isPt
      ? `Colheita registrada com sucesso! ${boxCount} caixas (${totalKg} kg) de ${cropName}.`
      : `¡Cosecha guardada con éxito! ${boxCount} cajas (${totalKg} kg) de ${cropName}.`;

    setHarvestSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowQuickHarvestModal(false);
      setHarvestSuccessMessage(null);
      if (onHarvestSaved) onHarvestSaved();
    }, 2400);
  };

  // Agronomic ideal targets based on crop
  const targets = selectedCrop === 'tomate'
    ? {
        phMin: 5.8,
        phMax: 6.2,
        ecMin: 1.8,
        ecMax: 2.5,
        tempMin: 22,
        tempMax: 28,
        phCurrent: 6.08,
        ecCurrent: 2.18,
        tempCurrent: 24.5,
        humidityCurrent: 74,
        stage: isPt ? 'Dia 48 de 90 • Floração & Frutificação Plena' : 'Día 48 de 90 • Floración y Fructificación Plena'
      }
    : {
        phMin: 6.0,
        phMax: 6.5,
        ecMin: 1.6,
        ecMax: 2.2,
        tempMin: 24,
        tempMax: 30,
        phCurrent: 6.25,
        ecCurrent: 1.95,
        tempCurrent: 26.8,
        humidityCurrent: 70,
        stage: isPt ? 'Dia 56 de 110 • Pegamento de Frutos & Engorde' : 'Día 56 de 110 • Cuajado de Frutos y Engorde'
      };

  return (
    <div className="space-y-6 pb-24">
      {/* 🌾 BARRA SUPERIOR INSTITUCIONAL & MODO PRODUTOR */}
      <div className="bg-linear-to-r from-emerald-800 via-primary to-emerald-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border-2 border-emerald-500/20 relative overflow-hidden">
        {/* Marca d'água decorativa */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sprout className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 sm:h-20 px-3 py-2 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
              <img
                src="/assets/logo-oficial-agronorte-tight.png"
                alt="Cooperativa Agronorte"
                className="h-full w-auto object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-emerald-500/30 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/40">
                  {isPt ? 'Modo Campo Fácil • Rastreabilidade Unificada' : 'Modo Campo Fácil • Trazabilidad Unificada'}
                </span>
                <span className="text-xs text-emerald-100/90 font-semibold">
                  350+ Familias Conectadas • Guayaibí, San Pedro
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isPt ? 'Monitoramento de Estufas & Rastreabilidade' : 'Monitoreo de Invernaderos y Trazabilidad'}
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 mt-1 max-w-xl">
                {isPt
                  ? 'Controle unificado de sensores, pragas e histórico completo de manejo para emissão de certificado oficial.'
                  : 'Control unificado de sensores, plagas e historial completo de manejo para emisión de certificado oficial.'}
              </p>
            </div>
          </div>

          {/* Botões de Ação no Topo Direito */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePlayBriefing}
              className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              title="Ouvir resumo do dia"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPt ? 'Ouvir Don Mateo' : 'Escuchar Don Mateo'}</span>
            </button>

            <button
              onClick={onSwitchToExpert}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{t.switchToExpertMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 SELETOR CENTRAL DE CULTURA: TOMATE vs LOCOTE VERDE (Foco Direto) */}
      <div className="bg-surface-container-lowest rounded-3xl p-3 sm:p-4 shadow-lg border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-2 shrink-0">
            {isPt ? 'Cultivo em Foco:' : 'Cultivo Activo:'}
          </span>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {/* Botão Tomate */}
            <button
              type="button"
              onClick={() => handleCropChange('tomate')}
              className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs ${
                selectedCrop === 'tomate'
                  ? 'bg-red-600 text-white shadow-md scale-102 ring-2 ring-red-400'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-xl">🍅</span>
              <span>{isPt ? 'TOMATE' : 'TOMATE'}</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                {zones.filter((z) => z.cropType === 'tomate').length} Estufas
              </span>
            </button>

            {/* Botão Locote Verde */}
            <button
              type="button"
              onClick={() => handleCropChange('locote')}
              className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs ${
                selectedCrop === 'locote'
                  ? 'bg-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-400'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-xl">🫑</span>
              <span>{isPt ? 'LOCOTE VERDE' : 'LOCOTE VERDE'}</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                {zones.filter((z) => z.cropType === 'locote').length} Estufas
              </span>
            </button>
          </div>
        </div>

        {/* Botão Oficial: Emitir Certificado do Lote */}
        <button
          type="button"
          onClick={() => setShowCertificateModal(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer border border-amber-300"
        >
          <Award className="w-5 h-5 text-slate-950" />
          <span>{isPt ? '📄 Emitir Certificado Oficial deste Lote' : '📄 Emitir Certificado Oficial de este Lote'}</span>
        </button>
      </div>

      {/* 🏠 SELETOR HORIZONTAL DE ESTUFAS DO CULTIVO SELECIONADO */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {cropZones.map((z, idx) => {
          const isSelected = z.id === currentZone.id;
          const isWarning = z.id === 'zone-estufa-02';

          return (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border-2 shrink-0 ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-md scale-102'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/50'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                  isSelected ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {idx + 1}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-none">{z.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                  isWarning
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {isWarning ? 'Ventilar' : 'Óptimo'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📡 CARTÃO VIVO DA ESTUFA ATIVA (SENSORES EM TEMPO REAL & METAS AGRONÔMICAS) */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xl border-2 border-primary/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md shrink-0">
              <span className="text-3xl">{selectedCrop === 'tomate' ? '🍅' : '🫑'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                  {currentZone.name}
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  LOTE: {currentBatch?.batchCode || 'LOTE-2026'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {currentZone.cultivar} • Sistema {currentZone.systemType} • {targets.stage}
              </p>
            </div>
          </div>

          {/* Ações Rápidas da Estufa */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowManualEntryModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <FilePenLine className="w-4 h-4" />
              <span>{isPt ? '+ Lançar Apontamento Técnico' : '+ Cargar Apunte Técnico'}</span>
            </button>

            <button
              onClick={() => setShowQuickHarvestModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-fixed text-on-secondary font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{isPt ? 'Registrar Colheita' : 'Anotar Cosecha'}</span>
            </button>
          </div>
        </div>

        {/* 4 Sensores IoT em Tempo Real com Semáforo Agronômico */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {/* Sensor 1: pH da Calda */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                pH da Solução
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                {targets.phCurrent}
              </span>
              <span className="text-xs text-on-surface-variant font-medium ml-1">pH</span>
            </div>
            <div className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
              <span>{isPt ? 'Alvo:' : 'Meta:'} {targets.phMin} - {targets.phMax}</span>
              <span className="font-bold">✓ Ideal</span>
            </div>
          </div>

          {/* Sensor 2: Condutividade Elétrica (EC) */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Condutividade (EC)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                {targets.ecCurrent}
              </span>
              <span className="text-xs text-on-surface-variant font-medium ml-1">mS/cm</span>
            </div>
            <div className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
              <span>{isPt ? 'Alvo:' : 'Meta:'} {targets.ecMin} - {targets.ecMax}</span>
              <span className="font-bold">✓ Equilibrada</span>
            </div>
          </div>

          {/* Sensor 3: Temperatura */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                {isPt ? 'Temperatura' : 'Temperatura'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                {targets.tempCurrent}
              </span>
              <span className="text-xs text-on-surface-variant font-medium ml-1">°C</span>
            </div>
            <div className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
              <span>{isPt ? 'Alvo:' : 'Meta:'} {targets.tempMin} - {targets.tempMax}°C</span>
              <span className="font-bold">✓ Conforto</span>
            </div>
          </div>

          {/* Sensor 4: Umidade Relativa */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-500" />
                {isPt ? 'Umidade do Ar' : 'Humedad'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                {targets.humidityCurrent}
              </span>
              <span className="text-xs text-on-surface-variant font-medium ml-1">% UR</span>
            </div>
            <div className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
              <span>{isPt ? 'Faixa:' : 'Rango:'} 65% - 80%</span>
              <span className="font-bold">✓ Ventilação OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📜 LINHA DO TEMPO UNIFICADA DA ESTUFA (HISTÓRICO COMPLETO DA PLANTA) */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-on-surface flex items-center gap-2">
                <span>📜</span>
                <span>{isPt ? 'Linha do Tempo da Estufa (Passo a Passo da Planta)' : 'Línea de Tiempo del Invernadero (Historial de la Planta)'}</span>
              </h3>
              <span className="text-xs bg-primary-container text-on-primary-container font-mono font-bold px-2 py-0.5 rounded-full">
                {filteredInterventions.length} {isPt ? 'passos' : 'pasos'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isPt
                ? 'Todos os manejos, produtos aplicados, doses, datas, horários e responsáveis auditados.'
                : 'Todos los manejos, productos aplicados, dosis, fechas, horarios y responsables auditados.'}
            </p>
          </div>

          {/* Filtros da Linha do Tempo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: isPt ? 'Todos' : 'Todos' },
              { id: 'nutricao', label: isPt ? 'Nutrição' : 'Nutrición' },
              { id: 'manejo', label: isPt ? 'Manejo' : 'Manejo' },
              { id: 'fitossanidade', label: isPt ? 'Pragas & Sanidade' : 'Sanidad' },
              { id: 'colheita', label: isPt ? 'Colheitas' : 'Cosechas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimelineFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  timelineFilter === tab.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Linha do Tempo Cronológica */}
        <div className="relative pl-6 sm:pl-8 space-y-4 pt-4 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-outline-variant/40">
          {filteredInterventions.map((item, idx) => {
            const d = new Date(item.timestamp);
            const dateStr = d.toLocaleDateString(isPt ? 'pt-BR' : 'es-PY');
            const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const typeConfig = {
              nutricao: { icon: Droplets, color: 'bg-blue-600', text: 'text-blue-600', badge: isPt ? 'Nutrição' : 'Nutrición' },
              manejo: { icon: Sprout, color: 'bg-emerald-600', text: 'text-emerald-600', badge: isPt ? 'Manejo' : 'Manejo' },
              fitossanidade: { icon: ShieldCheck, color: 'bg-amber-600', text: 'text-amber-600', badge: isPt ? 'Sanidade' : 'Sanidad' },
              sensor_leitura: { icon: Activity, color: 'bg-purple-600', text: 'text-purple-600', badge: isPt ? 'Calibração' : 'Calibración' },
              colheita: { icon: Package, color: 'bg-rose-600', text: 'text-rose-600', badge: isPt ? 'Colheita' : 'Cosecha' }
            }[item.type] || { icon: CheckCircle2, color: 'bg-slate-600', text: 'text-slate-600', badge: item.type };

            const Icon = typeConfig.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Node Bullet */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full ${typeConfig.color} text-white flex items-center justify-center shadow-xs`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Card de Conteúdo do Passo */}
                <div className="bg-surface-container-high/60 hover:bg-surface-container-high rounded-2xl p-3.5 sm:p-4 border border-outline-variant/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 ${typeConfig.text}`}>
                        {typeConfig.badge}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-on-surface-variant" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-on-surface-variant" />
                        {timeStr}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface font-medium mt-1">
                    <span className="font-semibold text-primary">{item.productOrAction}</span>
                    {item.dosage && <span className="text-on-surface-variant"> ({item.dosage})</span>}
                  </p>

                  {item.notes && (
                    <p className="text-[11px] text-on-surface-variant italic mt-1 bg-surface-container-lowest/70 p-2 rounded-xl border border-outline-variant/20">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-on-surface">{item.operatorName}</span>
                      <span className="text-outline">({item.operatorRole || 'Responsável'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.gracePeriodDays !== undefined && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          {item.gracePeriodDays === 0 ? '✓ Carência Zero (Sem Resíduo)' : `Carência: ${item.gracePeriodDays}d`}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-outline">
                        HASH: {item.verifiedHash.slice(0, 14)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🚜 2 CARDS ADICIONAIS DE AÇÃO RÁPIDA (DIAGNÓSTICO COM IA & COLHEITA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD A: SACAR FOTO A PRAGA (IA DON MATEO) */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {t.quickPestTitle}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {isPt ? 'Detecção instantânea com Don Mateo 3D' : 'Detección inmediata con foto'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed my-2">
              {isPt
                ? 'Viu folhas com pó branco, lagartas ou manchas nos tomates ou locotes? Tire uma foto para ouvir o diagnóstico agronômico e a recomendação de controle biológico em segundos.'
                : '¿Viste hojas con polvillo blanco, orugas o manchas en frutos? Saca una foto o graba un audio para escuchar la solución agronómica de inmediato.'}
            </p>

            <div className="bg-surface-container-high rounded-2xl p-3 my-3 flex items-center gap-2 text-xs text-on-surface-variant">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>
                {selectedCrop === 'tomate'
                  ? 'Reconhece Oídio, Míldio, Traça-do-Tomateiro e Deficiência de Cálcio.'
                  : 'Reconhece Ácaro-Branco, Trips, Antracnose e Podridão Apical.'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenPestDiagnosis}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary-container hover:text-on-primary-container active:scale-98 transition-all shadow-md"
          >
            <Camera className="w-5 h-5" />
            <span>{isPt ? 'Abrir Câmera para Diagnóstico' : 'Abrir Cámara para Diagnóstico'}</span>
          </button>
        </div>

        {/* CARD B: REGISTRO DE COLHEITA DO DIA */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border border-outline-variant/30 hover:border-secondary transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {t.quickHarvestTitle}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {isPt ? 'Lançamento simples em 2 toques' : 'Anotación fácil en 2 toques'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed my-2">
              {isPt
                ? 'Terminou o turno de colheita? Informe quantas caixas foram colhidas para atualizar o estoque e emitir as etiquetas com rastreamento oficial.'
                : '¿Terminaste de cosechar? Indica cuántas cajas se recogieron hoy para sumar al stock y generar las etiquetas con trazabilidad oficial.'}
            </p>

            <div className="bg-surface-container-high rounded-2xl p-3 my-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">
                {isPt ? 'Lote Ativo Selecionado:' : 'Lote de Hoy:'}
              </span>
              <span className="font-bold text-primary font-mono">
                {currentBatch?.batchCode || 'LOTE-2026'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowQuickHarvestModal(true)}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary-container hover:text-on-secondary-container active:scale-98 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>{isPt ? 'Registrar Caixas Colhidas' : 'Anotar Cajas Cosechadas'}</span>
          </button>
        </div>
      </div>

      {/* 📄 MODAL DO CERTIFICADO OFICIAL DE RASTREABILIDADE */}
      {showCertificateModal && currentBatch && (
        <BatchCertificateModal
          lang={lang}
          batch={currentBatch}
          zone={currentZone}
          interventions={interventions}
          currentUser={currentUser}
          onClose={() => setShowCertificateModal(false)}
          onOpenPublicTrace={onOpenPublicTrace}
        />
      )}

      {/* 📦 QUICK HARVEST DIALOG MODAL */}
      {showQuickHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-primary/30 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">
                    {t.quickHarvestTitle}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {currentZone.name} • {selectedCrop === 'tomate' ? 'Tomate' : 'Locote'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickHarvestModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {harvestSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-on-surface">
                  {isPt ? 'Colheita Confirmada!' : '¡Cosecha Guardada!'}
                </h4>
                <p className="text-sm text-primary font-semibold max-w-xs mx-auto">
                  {harvestSuccessMessage}
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                    {isPt ? 'Quantidade de Caixas Colhidas:' : 'Cantidad de Cajas Cosechadas:'}
                  </label>
                  <div className="flex items-center justify-center gap-4 bg-surface-container-high p-4 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBoxCount(Math.max(1, boxCount - 1))}
                      className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <span className="text-4xl font-extrabold text-primary font-mono w-20 text-center">
                      {boxCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBoxCount(boxCount + 1)}
                      className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between border border-primary/20">
                  <span className="text-xs font-medium text-on-surface">
                    {isPt ? 'Total Estimado (kg):' : 'Total Estimado (kg):'}
                  </span>
                  <span className="text-xl font-extrabold text-primary font-mono">
                    {boxCount * estimatedKgPerBox} kg
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHarvest}
                  className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isPt ? 'Confirmar e Salvar Colheita' : 'Confirmar y Guardar Cosecha'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📝 MODAL DE APONTAMENTO TÉCNICO DE CAMPO (ENTRADA MANUAL) */}
      {showManualEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-emerald-600/40 w-full max-w-lg p-5 sm:p-6 my-auto animate-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">
                    {isPt ? 'Apontamento Técnico de Campo' : 'Planilla Técnica de Campo'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {currentZone.name} • {currentBatch?.batchCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualEntryModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-on-surface">
                  {isPt ? 'Apontamento Gravado com Sucesso!' : '¡Registro Guardado con Éxito!'}
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold max-w-sm mx-auto">
                  {manualSuccessMessage}
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {/* Tipo de Registro */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    {isPt ? 'Tipo de Lançamento Técnico:' : 'Tipo de Carga Técnica:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'ph_ec_manual', label: isPt ? '🧪 pH & EC da Calda' : '🧪 pH y EC de Solución' },
                      { id: 'turno_diario', label: isPt ? '📋 Turno de Manejo' : '📋 Turno de Manejo' },
                      { id: 'fitossanidade', label: isPt ? '🔍 Inspeção Fitossanitária' : '🔍 Inspección Fitosanitaria' },
                      { id: 'higiene_estufa', label: isPt ? '🧼 Limpeza & Calibração' : '🧼 Limpieza y Calibración' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setManualTemplateType(item.id as any)}
                        className={`p-2 rounded-xl text-left font-semibold border transition-all cursor-pointer ${
                          manualTemplateType === item.id
                            ? 'bg-emerald-800 text-white border-emerald-600 shadow-xs'
                            : 'bg-surface-container-high hover:bg-surface-container text-on-surface border-transparent'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medições Numéricas de pH e EC */}
                <div className="grid grid-cols-2 gap-3 bg-surface-container-high/60 p-3 rounded-2xl border border-outline-variant/30">
                  {/* pH Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-on-surface">pH da Calda</label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {targets.phMin} - {targets.phMax}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="4.0"
                      max="9.0"
                      value={manualPh}
                      onChange={(e) => setManualPh(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-base font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* EC Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-on-surface">EC (mS/cm)</label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {targets.ecMin} - {targets.ecMax}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={manualEc}
                      onChange={(e) => setManualEc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-base font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Temperatura e Umidade */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">
                      {isPt ? 'Temperatura (°C):' : 'Temperatura (°C):'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={manualTemp}
                      onChange={(e) => setManualTemp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">
                      {isPt ? 'Umidade do Ar (%):' : 'Humedad (%):'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={manualHumidity}
                      onChange={(e) => setManualHumidity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Observações Agronômicas & Tags Rápidas */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    {isPt ? 'Observações do Técnico de Campo:' : 'Observaciones Técnicas:'}
                  </label>
                  <textarea
                    rows={2}
                    value={manualFindings}
                    onChange={(e) => setManualFindings(e.target.value)}
                    placeholder={
                      isPt
                        ? 'Ex: Nutrição equilibrada, cortinas reguladas, sem presença de pragas...'
                        : 'Ej: Nutrición equilibrada, cortinas abiertas, sin plagas observadas...'
                    }
                    className="w-full p-2.5 rounded-xl bg-surface border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>

                {/* Botão de Envio */}
                <button
                  type="button"
                  onClick={handleSaveManualEntry}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isPt ? 'Gravar Apontamento na Linha do Tempo' : 'Guardar Apunte en la Línea de Tiempo'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
