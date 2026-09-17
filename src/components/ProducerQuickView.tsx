import React, { useState, useMemo } from 'react';
import {
  Language,
  UserProfile,
  ProductionZone,
  PlantBatch,
  HarvestRecord,
  FieldInspection,
  UnifiedIntervention,
  QualityGrade
} from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { VoiceAssistantService } from '../services/voiceAssistantService';
import { BatchCertificateModal } from './BatchCertificateModal';
import { MobileTab } from './MobileBottomNav';
import {
  Sprout,
  Camera,
  Package,
  FilePenLine,
  Volume2,
  CheckCircle2,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Thermometer,
  Activity,
  Award,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Zap,
  History,
  Check,
  Edit3,
  Trash2,
  AlertTriangle,
  Scale,
  Filter
} from 'lucide-react';

interface ProducerQuickViewProps {
  lang: Language;
  currentUser: UserProfile;
  zones: ProductionZone[];
  batches: PlantBatch[];
  activeMobileTab?: MobileTab;
  onMobileTabChange?: (tab: MobileTab) => void;
  onSwitchToExpert: () => void;
  onOpenPestDiagnosis: () => void;
  onOpenMateoChat: () => void;
  onOpenFieldInspections?: () => void;
  onOpenPublicTrace?: (token: string) => void;
  onHarvestSaved?: () => void;
  onInspectionSaved?: () => void;
  onSelectZone: (zoneId: string) => void;
  onOpenAboutSystem?: () => void;
}

export const ProducerQuickView: React.FC<ProducerQuickViewProps> = ({
  lang,
  currentUser,
  zones,
  batches,
  activeMobileTab = 'inicio',
  onMobileTabChange,
  onSwitchToExpert,
  onOpenPestDiagnosis,
  onOpenMateoChat,
  onOpenFieldInspections,
  onOpenPublicTrace,
  onHarvestSaved,
  onInspectionSaved,
  onSelectZone,
  onOpenAboutSystem
}) => {
  const t = translations[lang];
  const isPt = lang === 'pt-BR';

  // Internal tab state if not controlled externally
  const [internalTab, setInternalTab] = useState<MobileTab>('inicio');
  const currentTab = activeMobileTab || internalTab;

  const handleTabSwitch = (tab: MobileTab) => {
    if (tab === 'mateo') {
      onOpenMateoChat();
      return;
    }
    setInternalTab(tab);
    if (onMobileTabChange) onMobileTabChange(tab);
  };

  // 🎯 CROP SELECTOR (Tomate vs Locote Verde)
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
    return (
      batches.find((b) => b.zoneId === currentZone.id) ||
      batches.find((b) => (selectedCrop === 'tomate' ? b.crop.includes('Tomate') : b.crop.includes('Locote'))) ||
      batches[0]
    );
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

  // Certificate Modal State
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // History Modal State (oculta el historial de la pantalla principal y lo abre en modal)
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Sincronizar apertura de historial si la pestaña activa móvil es 'historial'
  React.useEffect(() => {
    if (activeMobileTab === 'historial') {
      setShowHistoryModal(true);
    }
  }, [activeMobileTab]);

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    if (currentTab === 'historial') {
      handleTabSwitch('inicio');
    }
  };

  // Timeline Filter State
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'nutricao' | 'manejo' | 'fitossanidade' | 'colheita'>('all');

  // Expanded History Item State for "Ver detalles"
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const filteredInterventions = useMemo(() => {
    if (timelineFilter === 'all') return interventions;
    return interventions.filter((i) => i.type === timelineFilter);
  }, [interventions, timelineFilter]);

  // Quick Harvest & Harvest Management State (CRUD)
  const [showQuickHarvestModal, setShowQuickHarvestModal] = useState<boolean>(false);
  const [boxCount, setBoxCount] = useState<number>(15);
  const [estimatedKgPerBox, setEstimatedKgPerBox] = useState<number>(18);
  const [harvestSuccessMessage, setHarvestSuccessMessage] = useState<string | null>(null);
  const [harvests, setHarvests] = useState<HarvestRecord[]>(() => StorageService.getHarvests());
  const [harvestSubTab, setHarvestSubTab] = useState<'registrar' | 'historial'>('registrar');
  const [editingHarvest, setEditingHarvest] = useState<HarvestRecord | null>(null);
  const [deletingHarvest, setDeletingHarvest] = useState<HarvestRecord | null>(null);
  const [editHarvestBoxes, setEditHarvestBoxes] = useState<number>(15);
  const [editHarvestNetKg, setEditHarvestNetKg] = useState<number>(270);
  const [editHarvestGrade, setEditHarvestGrade] = useState<QualityGrade>('primeira');
  const [editHarvestCullsKg, setEditHarvestCullsKg] = useState<number>(0);

  // Manual Field Technician Entry State (Full Agricultural Collection & CRUD)
  const [showManualEntryModal, setShowManualEntryModal] = useState<boolean>(false);
  const [editingIntervention, setEditingIntervention] = useState<UnifiedIntervention | null>(null);
  const [deletingIntervention, setDeletingIntervention] = useState<UnifiedIntervention | null>(null);

  const [manualTemplateType, setManualTemplateType] = useState<FieldInspection['templateType']>('ph_ec_manual');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualProductOrAction, setManualProductOrAction] = useState<string>('Fórmula N-P-K 15-05-30 Hidropónica');
  const [manualDosage, setManualDosage] = useState<string>('1.5 g/L');
  const [manualVolumeLiters, setManualVolumeLiters] = useState<string>('1500');
  const [manualPh, setManualPh] = useState<string>(selectedCrop === 'tomate' ? '6.05' : '6.25');
  const [manualEc, setManualEc] = useState<string>(selectedCrop === 'tomate' ? '2.15' : '1.85');
  const [manualTemp, setManualTemp] = useState<string>('24.5');
  const [manualHumidity, setManualHumidity] = useState<string>('72');
  const [manualFindings, setManualFindings] = useState<string>('');
  const [manualCorrectiveAction, setManualCorrectiveAction] = useState<string>('');
  const [manualSeverity, setManualSeverity] = useState<FieldInspection['severity']>('normal');
  const [manualTargetPest, setManualTargetPest] = useState<string>('Preventivo General / Cero Plagas');
  const [manualGracePeriodDays, setManualGracePeriodDays] = useState<string>('0');
  const [manualSenaveRegistry, setManualSenaveRegistry] = useState<string>('SENAVE Res. 840/22');
  const [manualCoverageArea, setManualCoverageArea] = useState<string>('100% Invernadero (Completo)');
  const [manualPlantsTreated, setManualPlantsTreated] = useState<string>('4000');
  const [manualCropStatus, setManualCropStatus] = useState<string>('Óptimo - Vigoroso');
  const [manualOperatorName, setManualOperatorName] = useState<string>(currentUser.name || 'Ing. Carlos Ortiz');
  const [manualSuccessMessage, setManualSuccessMessage] = useState<string | null>(null);

  // Switch crop handler
  const handleCropChange = (crop: 'tomate' | 'locote') => {
    setSelectedCrop(crop);
    const newZones = zones.filter((z) => z.cropType === crop);
    if (newZones.length > 0) {
      setActiveZoneId(newZones[0].id);
      onSelectZone(newZones[0].id);
    }
    if (crop === 'tomate') {
      setManualPh('6.05');
      setManualEc('2.15');
      setEstimatedKgPerBox(18);
    } else {
      setManualPh('6.25');
      setManualEc('1.85');
      setEstimatedKgPerBox(20);
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

  // Open Create Entry modal with presets
  const handleOpenCreateEntry = (type: FieldInspection['templateType'] = 'ph_ec_manual') => {
    setEditingIntervention(null);
    setManualTemplateType(type);
    setManualPh(selectedCrop === 'tomate' ? '6.05' : '6.25');
    setManualEc(selectedCrop === 'tomate' ? '2.15' : '1.85');
    setManualTemp('24.5');
    setManualHumidity('72');
    setManualFindings('');
    setManualCorrectiveAction('');
    setManualSeverity('normal');
    setManualOperatorName(currentUser.name || 'Ing. Carlos Ortiz');

    if (type === 'ph_ec_manual') {
      setManualProductOrAction('Fórmula N-P-K 15-05-30 Hidropónica');
      setManualDosage('1.5 g/L');
      setManualVolumeLiters('1500');
    } else if (type === 'fitossanidade') {
      setManualTargetPest('Preventivo General / Cero Plagas');
      setManualProductOrAction('Bacillus subtilis + Trichoderma (Biofungicida)');
      setManualDosage('2.5 mL/L');
      setManualGracePeriodDays('0');
      setManualSenaveRegistry('SENAVE Cert. BIO-4412');
    } else {
      setManualProductOrAction('Desbrote manual y tutorado');
      setManualCoverageArea('100% Invernadero (Completo)');
      setManualPlantsTreated('4000');
      setManualCropStatus('Óptimo - Vigoroso');
    }

    setShowManualEntryModal(true);
  };

  // Open Edit Entry modal with existing data
  const handleStartEditIntervention = (item: UnifiedIntervention) => {
    setEditingIntervention(item);
    const mappedType: FieldInspection['templateType'] =
      item.type === 'fitossanidade' ? 'fitossanidade' : item.type === 'nutricao' ? 'ph_ec_manual' : 'poda_manejo';
    setManualTemplateType(mappedType);
    setManualTitle(item.title);
    setManualProductOrAction(item.productOrAction || '');
    setManualDosage(item.dosage || '');
    setManualVolumeLiters(item.volumeLiters ? String(item.volumeLiters) : '1500');
    setManualPh(item.ph !== undefined ? String(item.ph) : '6.05');
    setManualEc(item.ec !== undefined ? String(item.ec) : '2.15');
    setManualTemp(item.temperature !== undefined ? String(item.temperature) : '24.5');
    setManualHumidity(item.humidity !== undefined ? String(item.humidity) : '72');
    setManualFindings(item.notes || '');
    setManualCorrectiveAction('');
    setManualSeverity((item.severity as any) || 'normal');
    setManualTargetPest(item.targetPestOrDisease || 'Preventivo General / Cero Plagas');
    setManualGracePeriodDays(item.gracePeriodDays !== undefined ? String(item.gracePeriodDays) : '0');
    setManualSenaveRegistry(item.senaveRegistry || 'SENAVE Res. 840/22');
    setManualCoverageArea(item.coverageArea || '100% Invernadero (Completo)');
    setManualPlantsTreated(item.plantsTreated ? String(item.plantsTreated) : '4000');
    setManualCropStatus(item.cropStatus || 'Óptimo - Vigoroso');
    setManualOperatorName(item.operatorName || currentUser.name);

    setShowManualEntryModal(true);
  };

  // Confirm delete intervention
  const handleConfirmDeleteIntervention = () => {
    if (!deletingIntervention) return;
    StorageService.deleteIntervention(deletingIntervention.id, currentUser);
    setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));
    setDeletingIntervention(null);
  };

  // Save or Update manual field entry
  const handleSaveManualEntry = () => {
    const phNum = parseFloat(manualPh) || 6.1;
    const ecNum = parseFloat(manualEc) || 2.1;
    const tempNum = parseFloat(manualTemp) || 24.5;
    const humNum = parseFloat(manualHumidity) || 72;
    const volumeNum = parseFloat(manualVolumeLiters) || 1500;
    const graceNum = parseInt(manualGracePeriodDays) || 0;
    const plantsNum = parseInt(manualPlantsTreated) || 4000;

    let defaultTitle = '';
    let productOrActionFinal = manualProductOrAction.trim();

    if (manualTemplateType === 'fitossanidade') {
      defaultTitle = `Control Fitosanitario: ${manualTargetPest}`;
      if (!productOrActionFinal) productOrActionFinal = 'Bioinsumo de Control Biológico';
    } else if (manualTemplateType === 'ph_ec_manual') {
      defaultTitle = 'Calibración Nutricional y Medición de pH/CE';
      if (!productOrActionFinal) productOrActionFinal = 'Solución Hidropónica Equilibrada';
    } else {
      defaultTitle = `Manejo Cultural: ${productOrActionFinal || 'Desbrote y Tutorado'}`;
      if (!productOrActionFinal) productOrActionFinal = 'Manejo y Poda de Invernadero';
    }

    if (editingIntervention) {
      // UPDATE INTERVENTION (CRUD - Update)
      const updated: UnifiedIntervention = {
        ...editingIntervention,
        type: manualTemplateType === 'fitossanidade' ? 'fitossanidade' : manualTemplateType === 'ph_ec_manual' ? 'nutricao' : 'manejo',
        title: defaultTitle,
        productOrAction: productOrActionFinal,
        dosage: manualDosage.trim() || `pH ${phNum} • EC ${ecNum} mS/cm`,
        gracePeriodDays: manualTemplateType === 'fitossanidade' ? graceNum : 0,
        ph: phNum,
        ec: ecNum,
        temperature: tempNum,
        humidity: humNum,
        operatorName: manualOperatorName.trim() || currentUser.name,
        severity: manualSeverity,
        notes: manualFindings.trim() || undefined,
        volumeLiters: volumeNum,
        targetPestOrDisease: manualTemplateType === 'fitossanidade' ? manualTargetPest : undefined,
        senaveRegistry: manualTemplateType === 'fitossanidade' ? manualSenaveRegistry : undefined,
        coverageArea: manualTemplateType === 'poda_manejo' ? manualCoverageArea : undefined,
        plantsTreated: manualTemplateType === 'poda_manejo' ? plantsNum : undefined,
        cropStatus: manualTemplateType === 'poda_manejo' ? manualCropStatus : undefined
      };

      StorageService.updateIntervention(updated, currentUser);
      setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));

      const successTxt = `¡Apunte técnico actualizado exitosamente!`;
      setManualSuccessMessage(successTxt);
      VoiceAssistantService.speak(successTxt, lang);

      setTimeout(() => {
        setShowManualEntryModal(false);
        setEditingIntervention(null);
        setManualSuccessMessage(null);
      }, 1500);
      return;
    }

    // CREATE INTERVENTION (CRUD - Create)
    const newInspection: FieldInspection = {
      id: `insp-man-${Date.now()}`,
      tenantId: currentUser.tenantId || 'tenant-agronorte-demo',
      templateType: manualTemplateType,
      zoneId: currentZone.id,
      batchId: currentBatch.id,
      inspectorName: manualOperatorName.trim() || currentUser.name || 'Técnico de Campo Agronorte',
      inspectedAt: new Date().toISOString(),
      phManual: phNum,
      ecManual: ecNum,
      findings: manualFindings.trim() || `Carga técnica en ${currentZone.name}: ${productOrActionFinal}. pH ${phNum}, CE ${ecNum} mS/cm.`,
      severity: manualSeverity,
      correctiveActionTaken: manualCorrectiveAction.trim() || undefined,
      syncStatus: 'synced',
      hash: `sha256_man_${Date.now().toString(16)}`
    };

    StorageService.addInspection(newInspection, currentUser);

    const newIntervention: UnifiedIntervention = {
      id: `int-man-${Date.now()}`,
      batchId: currentBatch.id,
      zoneId: currentZone.id,
      timestamp: new Date().toISOString(),
      type: manualTemplateType === 'fitossanidade' ? 'fitossanidade' : manualTemplateType === 'ph_ec_manual' ? 'nutricao' : 'manejo',
      title: defaultTitle,
      productOrAction: productOrActionFinal,
      dosage: manualDosage.trim() || `pH ${phNum} • EC ${ecNum} mS/cm`,
      gracePeriodDays: manualTemplateType === 'fitossanidade' ? graceNum : 0,
      ph: phNum,
      ec: ecNum,
      temperature: tempNum,
      humidity: humNum,
      operatorName: manualOperatorName.trim() || currentUser.name || 'Técnico de Campo',
      operatorRole: currentUser.role === 'agronomist' ? 'Ingeniero Agrónomo' : 'Técnico Agrícola',
      severity: manualSeverity,
      notes: manualFindings.trim() || undefined,
      verifiedHash: `sha256_bpa_${Date.now().toString(16)}`,
      volumeLiters: volumeNum,
      targetPestOrDisease: manualTemplateType === 'fitossanidade' ? manualTargetPest : undefined,
      senaveRegistry: manualTemplateType === 'fitossanidade' ? manualSenaveRegistry : undefined,
      coverageArea: manualTemplateType === 'poda_manejo' ? manualCoverageArea : undefined,
      plantsTreated: manualTemplateType === 'poda_manejo' ? plantsNum : undefined,
      cropStatus: manualTemplateType === 'poda_manejo' ? manualCropStatus : undefined
    };

    StorageService.addIntervention(newIntervention, currentUser);
    setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));

    const successTxt = `¡Apunte técnico guardado con éxito para ${currentZone.name}! (${productOrActionFinal})`;
    setManualSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowManualEntryModal(false);
      setManualSuccessMessage(null);
      setManualFindings('');
      setManualCorrectiveAction('');
      if (onInspectionSaved) onInspectionSaved();
    }, 1500);
  };

  // Save Harvest (CRUD - Create)
  const handleSaveHarvest = () => {
    const totalKg = boxCount * estimatedKgPerBox;

    const newHarvest: HarvestRecord = {
      id: `col-${Date.now().toString().slice(-5)}`,
      tenantId: currentUser.tenantId,
      batchId: currentBatch.id,
      harvestCode: `COL-${selectedCrop === 'tomate' ? 'TOM' : 'LOC'}-${Date.now().toString().slice(-4)}`,
      harvestedAt: new Date().toISOString(),
      grossWeightKg: totalKg + boxCount * 1.5,
      tareWeightKg: boxCount * 1.5,
      netWeightKg: totalKg,
      unitsCount: boxCount,
      cullsKg: 0,
      operatorId: currentUser.name || currentUser.id,
      qualityGrade: 'primeira',
      isLocked: false
    };

    StorageService.addHarvest(newHarvest, currentUser);
    setHarvests(StorageService.getHarvests());

    const harvestIntervention: UnifiedIntervention = {
      id: `int-harv-${Date.now()}`,
      batchId: currentBatch.id,
      zoneId: currentZone.id,
      timestamp: new Date().toISOString(),
      type: 'colheita',
      title: 'Cosecha Comercial de 1ª Calidad',
      productOrAction: `${boxCount} cajas (${totalKg} kg netos cosechados)`,
      dosage: `${estimatedKgPerBox} kg/caja`,
      operatorName: currentUser.name || 'Operador de Cosecha',
      operatorRole: 'Operador de Campo',
      severity: 'normal',
      notes: 'Frutos seleccionados de primera calidad.',
      verifiedHash: `sha256_bpa_harv_${Date.now().toString(16)}`
    };

    StorageService.addIntervention(harvestIntervention, currentUser);
    setInterventions(StorageService.getBatchInterventions(currentBatch.id, currentZone.id));

    const cropName = selectedCrop === 'tomate' ? 'Tomate' : 'Locote';
    const successTxt = `¡Cosecha registrada! ${boxCount} cajas (${totalKg} kg) de ${cropName}.`;
    setHarvestSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowQuickHarvestModal(false);
      setHarvestSuccessMessage(null);
      if (onHarvestSaved) onHarvestSaved();
    }, 2000);
  };

  // Harvest Edit and Delete (CRUD - Update & Delete)
  const handleStartEditHarvest = (h: HarvestRecord) => {
    setEditingHarvest(h);
    setEditHarvestBoxes(h.unitsCount);
    setEditHarvestNetKg(h.netWeightKg);
    setEditHarvestGrade(h.qualityGrade);
    setEditHarvestCullsKg(h.cullsKg || 0);
  };

  const handleSaveEditHarvest = () => {
    if (!editingHarvest) return;
    const updated: HarvestRecord = {
      ...editingHarvest,
      unitsCount: editHarvestBoxes,
      netWeightKg: editHarvestNetKg,
      grossWeightKg: editHarvestNetKg + editHarvestBoxes * 1.5 + editHarvestCullsKg,
      cullsKg: editHarvestCullsKg,
      qualityGrade: editHarvestGrade
    };
    StorageService.updateHarvest(updated, currentUser);
    setHarvests(StorageService.getHarvests());
    setEditingHarvest(null);
  };

  const handleConfirmDeleteHarvest = () => {
    if (!deletingHarvest) return;
    StorageService.deleteHarvest(deletingHarvest.id, currentUser);
    setHarvests(StorageService.getHarvests());
    setDeletingHarvest(null);
  };

  // Agronomic ideal targets
  const targets =
    selectedCrop === 'tomate'
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
          stage: 'Día 48 de 90 • Floración y Cuajado'
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
          stage: 'Día 56 de 110 • Crecimiento de Frutos'
        };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 max-w-7xl mx-auto">
      {/* =========================================================
          1. HEADER MOBILE COMPACTO TIPO APP (Oculto en Desktop)
         ========================================================= */}
      <div className="md:hidden space-y-2.5">
        {/* Barra superior compacta con Selector de Invernadero y Estado General */}
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {selectedCrop === 'tomate' ? '🍅' : '🫑'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 dark:text-emerald-400 block leading-tight">
                Coop Agronorte
              </span>
              <div className="relative inline-block max-w-[180px]">
                <select
                  aria-label="Seleccionar Invernadero"
                  value={currentZone.id}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="appearance-none text-xs font-black text-on-surface bg-transparent pr-4 truncate focus:outline-none cursor-pointer"
                >
                  {cropZones.map((z) => (
                    <option key={z.id} value={z.id} className="text-black dark:text-white">
                      {z.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Óptimo
            </span>
          </div>
        </div>

        {/* Selector de Cultivo Activo (Tomate vs Locote Verde) */}
        <div className="grid grid-cols-2 gap-2 bg-surface-container-high/60 p-1 rounded-2xl border border-outline-variant/20">
          <button
            type="button"
            onClick={() => handleCropChange('tomate')}
            className={`min-h-[44px] py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedCrop === 'tomate'
                ? 'bg-red-600 text-white shadow-sm scale-101'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">🍅</span>
            <span>Tomate</span>
            <span className="text-[10px] opacity-80 font-mono bg-black/20 px-1.5 py-0.2 rounded-full">
              {zones.filter((z) => z.cropType === 'tomate').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCropChange('locote')}
            className={`min-h-[44px] py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedCrop === 'locote'
                ? 'bg-emerald-700 text-white shadow-sm scale-101'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">🫑</span>
            <span>Locote Verde</span>
            <span className="text-[10px] opacity-80 font-mono bg-black/20 px-1.5 py-0.2 rounded-full">
              {zones.filter((z) => z.cropType === 'locote').length}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. BANNER HERO PARA DESKTOP (Oculto en Móvil)
         ========================================================= */}
      <div className="hidden md:block bg-linear-to-r from-emerald-800 via-primary to-emerald-950 rounded-3xl p-6 lg:p-7 text-white shadow-xl border-2 border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sprout className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 lg:h-18 px-3 py-2 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
              <img
                src="/assets/logo-oficial-agronorte-tight.png"
                alt="Cooperativa Agronorte"
                className="h-full w-auto object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-emerald-500/30 text-emerald-100 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/40">
                  Modo Productor • Trazabilidad
                </span>
                <span className="text-xs text-emerald-100/90 font-semibold">
                  350+ Familias Conectadas • Guayaibí, San Pedro
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                Monitoreo de Invernaderos y Trazabilidad
              </h1>
              <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
                Control de sensores, sanidad e historial de cultivo para emisión de certificado oficial.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePlayBriefing}
              className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              title="Escuchar resumen del día"
            >
              <Volume2 className="w-4 h-4" />
              <span>Escuchar Don Mateo</span>
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

      {/* =========================================================
          3. SELECTOR DE CULTIVO & INVERNADEROS (DESKTOP)
         ========================================================= */}
      <div className="hidden md:flex bg-surface-container-lowest rounded-3xl p-3 sm:p-4 shadow-sm border border-outline-variant/30 flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-2 shrink-0">
            Cultivo Activo:
          </span>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleCropChange('tomate')}
              className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                selectedCrop === 'tomate'
                  ? 'bg-red-600 text-white shadow-md scale-102 ring-2 ring-red-400'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-lg">🍅</span>
              <span>TOMATE</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                {zones.filter((z) => z.cropType === 'tomate').length} Invernaderos
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCropChange('locote')}
              className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                selectedCrop === 'locote'
                  ? 'bg-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-400'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-lg">🫑</span>
              <span>LOCOTE VERDE</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                {zones.filter((z) => z.cropType === 'locote').length} Invernaderos
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCertificateModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer border border-amber-300"
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>📄 Emitir Certificado Oficial del Lote</span>
        </button>
      </div>

      {/* Selector Horizontal de Invernaderos (Desktop) */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {cropZones.map((z, idx) => {
          const isSelected = z.id === currentZone.id;
          return (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z.id)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border-2 shrink-0 ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-md'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isSelected ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {idx + 1}
              </span>
              <span>{z.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                Óptimo
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          4. VISTAS SEGÚN PESTAÑA EN MOBILE / SECCIONES COMPLETAS EN DESKTOP
         ========================================================= */}

      {/* --- PESTAÑA: INICIO (Mobile Dashboard) --- */}
      <div className={`${currentTab === 'inicio' ? 'block' : 'hidden md:block'} space-y-3.5`}>
        {/* Mini Resumen de Sensores (Compacto) */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-4 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between pb-2.5 border-b border-outline-variant/20 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📡</span>
              <h2 className="text-xs sm:text-sm font-bold text-on-surface">
                Estado del Invernadero • {currentZone.name}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              Lote: {currentBatch?.batchCode || 'TOM-2026-088'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* pH */}
            <div className="bg-surface-container-high/60 rounded-xl p-2 border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[10px] text-on-surface-variant font-medium flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" />
                pH
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-on-surface my-0.5">
                {targets.phCurrent}
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Ideal
              </span>
            </div>

            {/* EC */}
            <div className="bg-surface-container-high/60 rounded-xl p-2 border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[10px] text-on-surface-variant font-medium flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                CE
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-on-surface my-0.5">
                {targets.ecCurrent}
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Equil.
              </span>
            </div>

            {/* Temp */}
            <div className="bg-surface-container-high/60 rounded-xl p-2 border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[10px] text-on-surface-variant font-medium flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-500" />
                Temp
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-on-surface my-0.5">
                {targets.tempCurrent}°
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Confort
              </span>
            </div>

            {/* Humedad */}
            <div className="bg-surface-container-high/60 rounded-xl p-2 border border-outline-variant/20 flex flex-col justify-between">
              <span className="text-[10px] text-on-surface-variant font-medium flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-teal-500" />
                Hum
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-on-surface my-0.5">
                {targets.humidityCurrent}%
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Normal
              </span>
            </div>
          </div>
        </div>

        {/* 5 Cards de Acciones Rápidas (Requisito 3) */}
        <div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* 1. Registrar cosecha */}
            <button
              type="button"
              onClick={() => handleTabSwitch('cosecha')}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer shadow-xs min-h-[56px] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Registrar cosecha
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Cargue las cajas del día
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            </button>

            {/* 2. Botón Historial de la planta (Abre modal con toda la información sin exponerla en la pantalla principal) */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer shadow-xs min-h-[56px] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-xs">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Historial de la planta
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {interventions.length} pasos registrados • Tocar para abrir
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            </button>

            {/* 3. Detectar plagas/enfermedades */}
            <button
              type="button"
              onClick={onOpenPestDiagnosis}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-amber-500 text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer shadow-xs min-h-[56px] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-amber-600 transition-colors">
                    Detectar plagas
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Diagnóstico con IA
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            </button>

            {/* 4. Generar certificado */}
            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-emerald-600 text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer shadow-xs min-h-[56px] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-emerald-600 transition-colors">
                    Generar certificado
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Lote {currentBatch?.batchCode || 'TOM-2026-088'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            </button>

            {/* 5. Escuchar Don Mateo */}
            <button
              type="button"
              onClick={handlePlayBriefing}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-emerald-600 text-left flex items-center justify-between transition-all active:scale-98 cursor-pointer shadow-xs min-h-[56px] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-emerald-600 transition-colors">
                    Escuchar Don Mateo
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Resumen del día en audio
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* --- PESTAÑA: CULTIVO (Telemetría y Microclima) --- */}
      <div className={`${currentTab === 'cultivo' ? 'block' : 'hidden md:block'} space-y-4`}>
        <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-sm border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-on-surface">
                  {currentZone.name}
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Lote: {currentBatch?.batchCode || 'TOM-2026-088'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {currentZone.cultivar} • Sistema {currentZone.systemType} • {targets.stage}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManualEntryModal(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <FilePenLine className="w-4 h-4" />
                <span>+ Cargar Apunte</span>
              </button>
            </div>
          </div>

          {/* 4 Sensores IoT en tiempo real */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {/* pH */}
            <div className="bg-surface-container-high/70 rounded-2xl p-3.5 border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  pH Solución
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                  {targets.phCurrent}
                </span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">pH</span>
              </div>
              <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <span>Meta: {targets.phMin} - {targets.phMax}</span>
                <span className="font-bold">✓ Ideal</span>
              </div>
            </div>

            {/* EC */}
            <div className="bg-surface-container-high/70 rounded-2xl p-3.5 border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Conductividad
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                  {targets.ecCurrent}
                </span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">mS/cm</span>
              </div>
              <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <span>Meta: {targets.ecMin} - {targets.ecMax}</span>
                <span className="font-bold">✓ Equilibrada</span>
              </div>
            </div>

            {/* Temp */}
            <div className="bg-surface-container-high/70 rounded-2xl p-3.5 border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  Temperatura
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                  {targets.tempCurrent}
                </span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">°C</span>
              </div>
              <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <span>Meta: {targets.tempMin} - {targets.tempMax}°C</span>
                <span className="font-bold">✓ Confort</span>
              </div>
            </div>

            {/* Humedad */}
            <div className="bg-surface-container-high/70 rounded-2xl p-3.5 border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-500" />
                  Humedad
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-on-surface">
                  {targets.humidityCurrent}
                </span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">% UR</span>
              </div>
              <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <span>Rango: 65% - 80%</span>
                <span className="font-bold">✓ Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PESTAÑA: COSECHA (Gestión Completa de Cosechas CRUD) --- */}
      <div className={`${currentTab === 'cosecha' ? 'block' : 'hidden'}`}>
        <div className="max-w-xl mx-auto space-y-4">
          {/* Sub-tabs Selector: Registrar vs Historial */}
          <div className="flex items-center justify-center p-1 bg-surface-container-high rounded-2xl border border-outline-variant/20 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setHarvestSubTab('registrar')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                harvestSubTab === 'registrar'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Cosecha</span>
            </button>
            <button
              type="button"
              onClick={() => setHarvestSubTab('historial')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                harvestSubTab === 'historial'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lotes Cosechados ({harvests.length})</span>
            </button>
          </div>

          {harvestSubTab === 'registrar' ? (
            <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-md border border-outline-variant/30 text-center space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center shadow-xs mb-2">
                  <Package className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="text-xl font-black text-on-surface">
                  Registrar cosecha
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Cargue las cajas cosechadas hoy en {currentZone.name}
                </p>
                <div className="mt-2 inline-block">
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-400/40">
                    Lote: {currentBatch?.batchCode || 'TOM-2026-088'}
                  </span>
                </div>
              </div>

              {harvestSuccessMessage ? (
                <div className="py-6 space-y-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-on-surface">¡Cosecha Guardada!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    {harvestSuccessMessage}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Counter simple */}
                  <div className="flex items-center justify-center gap-4 bg-surface-container-high/60 p-3.5 rounded-2xl border border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setBoxCount(Math.max(1, boxCount - 1))}
                      className="w-12 h-12 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
                      aria-label="Restar una caja"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <div className="w-24 text-center">
                      <span className="text-4xl font-black text-primary font-mono block">
                        {boxCount}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        Cajas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBoxCount(boxCount + 1)}
                      className="w-12 h-12 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
                      aria-label="Sumar una caja"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Total Estimado */}
                  <div className="bg-primary/10 rounded-2xl p-3.5 flex items-center justify-between border border-primary/20 text-xs">
                    <span className="font-semibold text-on-surface">
                      Total neto estimado:
                    </span>
                    <span className="text-lg font-black text-primary font-mono">
                      {boxCount * estimatedKgPerBox} kg
                    </span>
                  </div>

                  {/* Botón Principal */}
                  <button
                    type="button"
                    onClick={handleSaveHarvest}
                    className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Registrar {boxCount} cajas</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Sub-tab: Historial de Cosechas (CRUD - Read, Update, Delete) */
            <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-md border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-sm text-on-surface">
                    Lotes Cosechados Registrados
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                  {harvests.reduce((acc, h) => acc + h.unitsCount, 0)} cajas totales
                </span>
              </div>

              {harvests.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-6">
                  No hay registros de cosecha guardados aún.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {harvests.map((h) => {
                    const hDate = new Date(h.harvestedAt).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'es-PY');
                    return (
                      <div
                        key={h.id}
                        className="bg-surface-container-high/60 hover:bg-surface-container-high p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-on-surface">
                              {h.harvestCode}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {h.qualityGrade}
                            </span>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              {hDate}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Operador: <strong className="text-on-surface">{h.operatorId}</strong> • Descarte: {h.cullsKg || 0} kg
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                          <div className="text-right font-mono">
                            <span className="text-sm font-black text-primary block">
                              {h.netWeightKg.toFixed(1)} kg
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-bold">
                              {h.unitsCount} cajas
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditHarvest(h)}
                              title="Editar cosecha"
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingHarvest(h)}
                              title="Eliminar cosecha"
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* =========================================================
          5. MODALES (Historial completo, Certificado, Cosecha rápida, Apunte técnico)
         ========================================================= */}

      {/* 📜 MODAL DEDICADO: HISTORIAL DE LA PLANTA (Toda la información contenida dentro de este modal) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-primary/30 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-on-surface">
                      Historial de la planta
                    </h3>
                    <span className="text-[11px] bg-primary text-on-primary font-mono font-bold px-2 py-0.5 rounded-full">
                      {filteredInterventions.length} registros
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {currentZone.name} • Lote: {currentBatch?.batchCode || 'TOM-2026-088'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreateEntry('ph_ec_manual')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nuevo Apunte</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseHistoryModal}
                  className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
                  aria-label="Cerrar Historial"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chips Horizontales de Filtro */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'nutricao', label: 'Nutrición' },
                { id: 'manejo', label: 'Manejo' },
                { id: 'fitossanidade', label: 'Sanidad' },
                { id: 'colheita', label: 'Cosechas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimelineFilter(tab.id as any)}
                  className={`min-h-[36px] px-3 py-1 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    timelineFilter === tab.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lista de Eventos con scroll */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {filteredInterventions.map((item) => {
                const d = new Date(item.timestamp);
                const dateStr = d.toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'es-PY');
                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isExpanded = expandedHistoryId === item.id;

                const typeConfig = {
                  nutricao: { icon: Droplets, color: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-400', badge: 'Nutrición' },
                  manejo: { icon: Sprout, color: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-400', badge: 'Manejo' },
                  fitossanidade: { icon: ShieldCheck, color: 'bg-amber-600', text: 'text-amber-700 dark:text-amber-400', badge: 'Sanidad' },
                  sensor_leitura: { icon: Activity, color: 'bg-purple-600', text: 'text-purple-700 dark:text-purple-400', badge: 'Calibración' },
                  colheita: { icon: Package, color: 'bg-rose-600', text: 'text-rose-700 dark:text-rose-400', badge: 'Cosecha' }
                }[item.type] || { icon: CheckCircle2, color: 'bg-slate-600', text: 'text-slate-700', badge: item.type };

                const Icon = typeConfig.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-surface-container-high/60 hover:bg-surface-container-high rounded-2xl p-3 sm:p-3.5 border border-outline-variant/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg ${typeConfig.color} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-white/80 dark:bg-black/40 ${typeConfig.text}`}>
                              {typeConfig.badge}
                            </span>
                            <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dateStr} • {timeStr}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-on-surface mt-0.5 truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5">
                            <span className="font-semibold text-primary">{item.productOrAction}</span>
                            {item.dosage && <span> ({item.dosage})</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.type !== 'colheita' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditIntervention(item)}
                              title="Editar apunte técnico"
                              className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingIntervention(item)}
                              title="Eliminar apunte técnico"
                              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                          className="min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold text-primary hover:bg-primary-container/40 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-outline-variant/20 text-xs text-on-surface-variant space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between gap-2 text-[11px] flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span className="font-bold text-on-surface">{item.operatorName}</span>
                            <span className="text-on-surface-variant">({item.operatorRole || 'Responsable'})</span>
                          </div>
                          {item.cropStatus && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium text-[10px]">
                              {item.cropStatus}
                            </span>
                          )}
                        </div>

                        {/* Extra agronomic details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/15">
                          {item.dosage && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">DOSIS:</span>
                              <span className="font-semibold text-on-surface">{item.dosage}</span>
                            </div>
                          )}
                          {item.volumeLiters !== undefined && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">VOLUMEN SOLUCIÓN:</span>
                              <span className="font-semibold text-on-surface font-mono">{item.volumeLiters} Litros</span>
                            </div>
                          )}
                          {item.targetPestOrDisease && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">PLAGA / MONITOREO:</span>
                              <span className="font-semibold text-on-surface">{item.targetPestOrDisease}</span>
                            </div>
                          )}
                          {item.senaveRegistry && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">REGISTRO SENAVE:</span>
                              <span className="font-semibold text-on-surface font-mono">{item.senaveRegistry}</span>
                            </div>
                          )}
                          {item.coverageArea && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">SECTOR / BANCADAS:</span>
                              <span className="font-semibold text-on-surface">{item.coverageArea}</span>
                            </div>
                          )}
                          {item.plantsTreated !== undefined && (
                            <div>
                              <span className="text-on-surface-variant block text-[10px] font-bold">PLANTAS ATENDIDAS:</span>
                              <span className="font-semibold text-on-surface">{item.plantsTreated} plantas</span>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 italic text-on-surface">
                            "{item.notes}"
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-on-surface-variant">
                          {item.ph !== undefined && <span>pH: {item.ph}</span>}
                          {item.ec !== undefined && <span>CE: {item.ec} mS/cm</span>}
                          {item.temperature !== undefined && <span>Temp: {item.temperature}°C</span>}
                          {item.humidity !== undefined && <span>Hum: {item.humidity}%</span>}
                          {item.gracePeriodDays !== undefined && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              {item.gracePeriodDays === 0 ? '✓ Carencia Cero' : `Carencia: ${item.gracePeriodDays}d`}
                            </span>
                          )}
                          <span className="text-outline-variant truncate max-w-[200px]" title={item.verifiedHash}>
                            Hash: {item.verifiedHash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer del Modal */}
            <div className="p-3.5 sm:p-4 border-t border-outline-variant/30 bg-surface-container-low/60 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-on-surface-variant font-mono">
                Trazabilidad BPA • SENAVE
              </span>
              <button
                type="button"
                onClick={handleCloseHistoryModal}

                className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Certificado Oficial */}
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

      {/* Modal Cosecha Rápida (para Desktop o fallback) */}
      {showQuickHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-primary/30 w-full max-w-md p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    Registrar cosecha
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
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-on-surface">¡Cosecha Guardada!</h4>
                <p className="text-xs text-primary font-semibold max-w-xs mx-auto">
                  {harvestSuccessMessage}
                </p>
              </div>
            ) : (
              <div className="py-3 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                    Cajas cosechadas hoy:
                  </label>
                  <div className="flex items-center justify-center gap-4 bg-surface-container-high p-3 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBoxCount(Math.max(1, boxCount - 1))}
                      className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <span className="text-3xl font-extrabold text-primary font-mono w-20 text-center">
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

                <div className="bg-primary/10 rounded-2xl p-3 flex items-center justify-between border border-primary/20 text-xs">
                  <span className="font-medium text-on-surface">
                    Total estimado (kg):
                  </span>
                  <span className="text-lg font-extrabold text-primary font-mono">
                    {boxCount * estimatedKgPerBox} kg
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHarvest}
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Registrar cajas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Apunte Técnico de Campo (CREATE & UPDATE) */}
      {showManualEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-emerald-600/40 w-full max-w-lg p-5 my-auto animate-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
                  {editingIntervention ? <Edit3 className="w-5 h-5" /> : <FilePenLine className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {editingIntervention ? 'Editar Apunte Técnico' : 'Cargar Apunte Técnico'}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {currentZone.name} • {currentUser.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowManualEntryModal(false);
                  setEditingIntervention(null);
                }}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualSuccessMessage ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-on-surface">
                  {editingIntervention ? '¡Apunte Actualizado!' : '¡Apunte Registrado!'}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold max-w-xs mx-auto">
                  {manualSuccessMessage}
                </p>
              </div>
            ) : (
              <div className="py-3 space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
                {/* Tipo de Formulario */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Tipo de Manejo Agronómico:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ph_ec_manual', label: 'Nutrición / pH' },
                      { id: 'fitossanidade', label: 'Sanidad' },
                      { id: 'poda_manejo', label: 'Manejo / Poda' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          setManualTemplateType(btn.id as any);
                          if (!editingIntervention) {
                            if (btn.id === 'ph_ec_manual') {
                              setManualProductOrAction('Fórmula N-P-K 15-05-30 Hidropónica');
                              setManualDosage('1.5 g/L');
                            } else if (btn.id === 'fitossanidade') {
                              setManualProductOrAction('Bacillus subtilis + Trichoderma (Biofungicida)');
                              setManualDosage('2.5 mL/L');
                            } else {
                              setManualProductOrAction('Desbrote manual y tutorado');
                            }
                          }
                        }}
                        className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          manualTemplateType === btn.id
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* --- CAMPOS SEGÚN TIPO DE MANEJO --- */}
                {manualTemplateType === 'ph_ec_manual' && (
                  <div className="space-y-3 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/20">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Fórmula / Fertilizante Nutritivo:
                      </label>
                      <select
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-1.5"
                      >
                        <option value="Fórmula N-P-K 15-05-30 Hidropónica">Fórmula N-P-K 15-05-30 Hidropónica</option>
                        <option value="Nitrato de Calcio Calcinit (YaraLiva)">Nitrato de Calcio Calcinit (YaraLiva)</option>
                        <option value="Quelato de Hierro EDDHA 6% (Fe)">Quelato de Hierro EDDHA 6% (Fe)</option>
                        <option value="Sulfato de Magnesio Heptahidratado">Sulfato de Magnesio Heptahidratado</option>
                        <option value="Fosfato Monopotásico (MKP)">Fosfato Monopotásico (MKP)</option>
                        <option value="Solución Nutritiva Balanceada Completa (A + B)">Solución Nutritiva Balanceada Completa (A + B)</option>
                        <option value="Ácido Fosfórico (Regulador pH)">Ácido Fosfórico (Regulador pH)</option>
                      </select>
                      <input
                        type="text"
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        placeholder="O nombre de insumo específico..."
                        className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Dosis Aplicada:
                        </label>
                        <input
                          type="text"
                          value={manualDosage}
                          onChange={(e) => setManualDosage(e.target.value)}
                          placeholder="Ej: 1.5 g/L"
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Volumen (Litros):
                        </label>
                        <input
                          type="number"
                          value={manualVolumeLiters}
                          onChange={(e) => setManualVolumeLiters(e.target.value)}
                          placeholder="1500"
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-on-surface-variant">
                            pH Medido:
                          </label>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">Meta: 5.8-6.3</span>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          value={manualPh}
                          onChange={(e) => setManualPh(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-on-surface-variant">
                            Conductividad (mS/cm):
                          </label>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">Meta: 1.8-2.5</span>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          value={manualEc}
                          onChange={(e) => setManualEc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Temp Solución (°C):
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={manualTemp}
                          onChange={(e) => setManualTemp(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Humedad Aire (% UR):
                        </label>
                        <input
                          type="number"
                          value={manualHumidity}
                          onChange={(e) => setManualHumidity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {manualTemplateType === 'fitossanidade' && (
                  <div className="space-y-3 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/20">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Plaga / Enfermedad o Estado Fitosanitario:
                      </label>
                      <select
                        value={manualTargetPest}
                        onChange={(e) => setManualTargetPest(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Preventivo General / Cero Plagas">Preventivo General / Cero Plagas (Monitoreo OK)</option>
                        <option value="Mosca Blanca (Bemisia tabaci)">Mosca Blanca (Bemisia tabaci)</option>
                        <option value="Ácaro Blanco (Polyphagotarsonemus latus)">Ácaro Blanco (Polyphagotarsonemus latus)</option>
                        <option value="Oídio / Cenizilla (Leveillula taurica)">Oídio / Cenizilla (Leveillula taurica)</option>
                        <option value="Mildiú / Tizón foliar">Mildiú / Tizón foliar</option>
                        <option value="Trips de flores (Frankliniella occidentalis)">Trips de flores (Frankliniella occidentalis)</option>
                        <option value="Moho Gris (Botrytis cinerea)">Moho Gris (Botrytis cinerea)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Nivel de Incidencia / Severidad:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'normal', label: 'Preventivo' },
                          { id: 'leve', label: 'Leve <5%' },
                          { id: 'moderada', label: 'Mod. 5-15%' },
                          { id: 'critica', label: 'Crítica >15%' }
                        ].map((sev) => (
                          <button
                            key={sev.id}
                            type="button"
                            onClick={() => setManualSeverity(sev.id as any)}
                            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                              manualSeverity === sev.id
                                ? sev.id === 'critica'
                                  ? 'bg-rose-700 text-white'
                                  : sev.id === 'moderada'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-emerald-700 text-white'
                                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Bioinsumo o Tratamiento Aplicado:
                      </label>
                      <select
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-1.5"
                      >
                        <option value="Bacillus subtilis + Trichoderma (Biofungicida)">Bacillus subtilis + Trichoderma (Biofungicida)</option>
                        <option value="Aceite de Neem prensado en frío 80%">Aceite de Neem prensado en frío 80%</option>
                        <option value="Jabón Potásico Concentrado al 2%">Jabón Potásico Concentrado al 2%</option>
                        <option value="Beauveria bassiana (Bioinsecticida)">Beauveria bassiana (Bioinsecticida)</option>
                        <option value="Extracto Natural de Ajo y Ají picante">Extracto Natural de Ajo y Ají picante</option>
                        <option value="Caldo Bordelés / Cobre preventivo">Caldo Bordelés / Cobre preventivo</option>
                        <option value="Solo Monitoreo Visual (Sin aplicación)">Solo Monitoreo Visual (Sin aplicación)</option>
                      </select>
                      <input
                        type="text"
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        placeholder="O nombre de bioinsumo..."
                        className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Dosis:
                        </label>
                        <input
                          type="text"
                          value={manualDosage}
                          onChange={(e) => setManualDosage(e.target.value)}
                          placeholder="Ej: 2.5 mL/L"
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Carencia SENAVE (días):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={manualGracePeriodDays}
                          onChange={(e) => setManualGracePeriodDays(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Certificado / Registro SENAVE:
                      </label>
                      <input
                        type="text"
                        value={manualSenaveRegistry}
                        onChange={(e) => setManualSenaveRegistry(e.target.value)}
                        placeholder="SENAVE Cert. BIO-4412"
                        className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/50 font-mono text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {manualTemplateType === 'poda_manejo' && (
                  <div className="space-y-3 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/20">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Labor Cultural Realizada:
                      </label>
                      <select
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-1.5"
                      >
                        <option value="Desbrote manual y tutorado con clips">Desbrote manual y tutorado con clips</option>
                        <option value="Poda de hojas basales senescentes">Poda de hojas basales senescentes</option>
                        <option value="Raleo de flor rey y frutos no comerciales">Raleo de flor rey y frutos no comerciales</option>
                        <option value="Bajada de plantas y reacomodo en rafia">Bajada de plantas y reacomodo en rafia</option>
                        <option value="Regulación de mallas y cortinas cenitales">Regulación de mallas y cortinas cenitales</option>
                        <option value="Polinización asistida / vibración de racimos">Polinización asistida / vibración de racimos</option>
                        <option value="Limpieza y desinfección de pasillos">Limpieza y desinfección de pasillos</option>
                      </select>
                      <input
                        type="text"
                        value={manualProductOrAction}
                        onChange={(e) => setManualProductOrAction(e.target.value)}
                        placeholder="O describa la labor cultural..."
                        className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Sector / Bancadas:
                        </label>
                        <select
                          value={manualCoverageArea}
                          onChange={(e) => setManualCoverageArea(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="100% Invernadero (Completo)">100% Invernadero (Completo)</option>
                          <option value="Bancadas 1 a 4">Bancadas 1 a 4</option>
                          <option value="Bancadas 5 a 8">Bancadas 5 a 8</option>
                          <option value="Sector Norte">Sector Norte</option>
                          <option value="Sector Sur">Sector Sur</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant block mb-1">
                          Plantas Atendidas:
                        </label>
                        <input
                          type="number"
                          value={manualPlantsTreated}
                          onChange={(e) => setManualPlantsTreated(e.target.value)}
                          placeholder="4000"
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant block mb-1">
                        Estado del Cultivo Post-Manejo:
                      </label>
                      <select
                        value={manualCropStatus}
                        onChange={(e) => setManualCropStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Óptimo - Vigoroso y con excelente aireación">Óptimo - Vigoroso y con excelente aireación</option>
                        <option value="Bueno - En parámetros normales">Bueno - En parámetros normales</option>
                        <option value="Requiere Seguimiento en próximas 48h">Requiere Seguimiento en próximas 48h</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Técnico Responsable */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Técnico / Responsable del Registro:
                  </label>
                  <input
                    type="text"
                    value={manualOperatorName}
                    onChange={(e) => setManualOperatorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Observaciones */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Observaciones Técnicas de Campo:
                  </label>
                  <textarea
                    rows={2}
                    value={manualFindings}
                    onChange={(e) => setManualFindings(e.target.value)}
                    placeholder="Ej: Labores completadas sin incidencias, solución equilibrada, sin plagas observadas..."
                    className="w-full p-2.5 rounded-xl bg-surface border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>

                {/* Botón de Envio */}
                <button
                  type="button"
                  onClick={handleSaveManualEntry}
                  className="w-full min-h-[44px] py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{editingIntervention ? 'Actualizar Apunte Técnico' : 'Guardar en Historial'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación: Eliminar Apunte Técnico (CRUD - Delete) */}
      {deletingIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-rose-500/40 w-full max-w-sm p-5 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">¿Eliminar este apunte?</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Se eliminará permanentemente el registro "{deletingIntervention.title}" ({deletingIntervention.productOrAction}).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingIntervention(null)}
                className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteIntervention}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Modal: Editar Cosecha (CRUD - Update) */}
      {editingHarvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-primary/30 w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-on-surface">
                  Editar Cosecha: {editingHarvest.harvestCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingHarvest(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Cantidad de Cajas:
                </label>
                <input
                  type="number"
                  min="1"
                  value={editHarvestBoxes}
                  onChange={(e) => {
                    const b = parseInt(e.target.value) || 1;
                    setEditHarvestBoxes(b);
                    setEditHarvestNetKg(b * estimatedKgPerBox);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Peso Neto Total (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editHarvestNetKg}
                  onChange={(e) => setEditHarvestNetKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Calidad:
                  </label>
                  <select
                    value={editHarvestGrade}
                    onChange={(e) => setEditHarvestGrade(e.target.value as QualityGrade)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-outline-variant/50 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="extra">Extra</option>
                    <option value="primeira">Primeira</option>
                    <option value="segunda">Segunda</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Descarte (kg):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editHarvestCullsKg}
                    onChange={(e) => setEditHarvestCullsKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-outline-variant/50 font-mono text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveEditHarvest}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación: Eliminar Cosecha (CRUD - Delete) */}
      {deletingHarvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-rose-500/40 w-full max-w-sm p-5 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">¿Eliminar registro de cosecha?</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Se removerá el registro {deletingHarvest.harvestCode} ({deletingHarvest.unitsCount} cajas, {deletingHarvest.netWeightKg} kg).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingHarvest(null)}
                className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHarvest}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
