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
import { WeatherAlertCard } from './WeatherAlertCard';
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
    if (tab === 'historial') {
      setShowHistoryModal(true);
      return;
    }
    setInternalTab(tab as any);
    if (onMobileTabChange) onMobileTabChange(tab as any);
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
  const [cultivoSubTab, setCultivoSubTab] = useState<'sensores' | 'cosecha' | 'apunte'>('sensores');
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

      const successTxt = isPt
        ? 'Apontamento técnico atualizado com sucesso!'
        : '¡Apunte técnico actualizado exitosamente!';
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

    const successTxt = isPt
      ? `Apontamento técnico guardado com sucesso para ${currentZone.name}! (${productOrActionFinal})`
      : `¡Apunte técnico guardado con éxito para ${currentZone.name}! (${productOrActionFinal})`;
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

    const cropName = selectedCrop === 'tomate'
      ? 'Tomate'
      : (isPt ? 'Pimentão' : 'Locote');
    const successTxt = isPt
      ? `Colheita registrada! ${boxCount} caixas (${totalKg} kg) de ${cropName}.`
      : `¡Cosecha registrada! ${boxCount} cajas (${totalKg} kg) de ${cropName}.`;
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
      <div className="md:hidden space-y-2">
        {/* Barra superior única: Cultivo activo + Estado + Selector de Invernadero */}
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/30">
          <div className="flex flex-col items-stretch gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{selectedCrop === 'tomate' ? '🍅' : '🫑'}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider leading-none">
                  Coop Agronorte
                </p>
                <div className="relative block max-w-full">
                  <select
                    aria-label="Seleccionar Invernadero"
                    value={currentZone.id}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="appearance-none w-full min-w-0 text-sm font-semibold text-on-surface bg-transparent pr-5 truncate focus:outline-none cursor-pointer leading-tight"
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

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Óptimo
            </span>
          </div>

          {/* Selector de Cultivo Activo (Tomate vs Locote Verde) */}
          <div className="grid grid-cols-2 gap-1.5 bg-surface-container-high/50 p-1 rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={() => handleCropChange('tomate')}
              className={`min-h-[40px] py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedCrop === 'tomate'
                  ? 'bg-surface text-primary shadow-sm ring-1 ring-outline-variant/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🍅</span>
              <span>Tomate</span>
              <span className="text-[10px] opacity-70 font-sans bg-primary/5 px-1.5 py-0.5 rounded-full">
                {zones.filter((z) => z.cropType === 'tomate').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCropChange('locote')}
              className={`min-h-[40px] py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedCrop === 'locote'
                  ? 'bg-surface text-primary shadow-sm ring-1 ring-outline-variant/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🫑</span>
              <span>{lang === 'pt-BR' ? 'Pimentão' : 'Locote'}</span>
              <span className="text-[10px] opacity-70 font-sans bg-primary/5 px-1.5 py-0.5 rounded-full">
                {zones.filter((z) => z.cropType === 'locote').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. BANNER HERO PARA DESKTOP (Oculto en Móvil)
         ========================================================= */}
      <div className="hidden md:block bg-surface rounded-2xl p-6 lg:p-7 text-on-surface shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sprout className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
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
                <span className="bg-primary/5 text-primary text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/40">
                  Modo Productor • Trazabilidad
                </span>
                <span className="text-xs text-on-surface-variant font-semibold">
                  350+ Familias Conectadas • Guayaibí, San Pedro
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                Monitoreo de Invernaderos y Trazabilidad
              </h1>
              <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
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
              className="px-4 py-2.5 rounded-full bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{t.switchToExpertMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previsão do Tempo em Tempo Real e Monitor Inteligente de Estufa (Tomate & Locote) */}
      <div className={currentTab === 'inicio' ? 'block' : 'hidden md:block'}>
        <WeatherAlertCard
          lang={lang}
          crop={selectedCrop}
          onCropChange={handleCropChange}
          onOpenMateoChat={onOpenMateoChat}
          showCropSelector={false}
        />
      </div>

      {/* =========================================================
          3. SELECTOR DE CULTIVO & INVERNADEROS (DESKTOP)
         ========================================================= */}
      <div className="hidden md:flex bg-surface-container-lowest rounded-3xl p-3 sm:p-4 shadow-sm border border-outline-variant/30 flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-2 shrink-0">
            Cultivo Activo:
          </span>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleCropChange('tomate')}
              className={`px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                selectedCrop === 'tomate'
                  ? 'bg-primary/5 text-primary border border-primary/20'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-lg">🍅</span>
              <span>TOMATE</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-sans">
                {zones.filter((z) => z.cropType === 'tomate').length} Invernaderos
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCropChange('locote')}
              className={`px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                selectedCrop === 'locote'
                  ? 'bg-primary/5 text-primary border border-primary/20'
                  : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="text-lg">🫑</span>
              <span>{lang === 'pt-BR' ? 'PIMENTÃO VERDE' : 'LOCOTE VERDE'}</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-sans">
                {zones.filter((z) => z.cropType === 'locote').length} {lang === 'pt-BR' ? 'Estufas' : 'Invernaderos'}
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCertificateModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer border border-amber-300"
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
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  isSelected ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {idx + 1}
              </span>
              <span>{z.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase ${
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
      <div className={`${currentTab === 'inicio' ? 'block' : 'hidden md:block'} space-y-3`}>

        {/* SENSORES: Cards grandes e claros — 2x2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🧪</span>
              <h2 className="text-sm font-bold text-on-surface">
                Sensores Internos
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                • {currentZone.name}
              </span>
            </div>
            <span className="text-[10px] font-sans text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
              {currentBatch?.batchCode || 'TOM-2026-088'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* pH */}
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-3.5 border border-blue-200/60 dark:border-blue-800/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">pH Solução</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold font-sans text-on-surface leading-none">
                  {targets.phCurrent}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ✓ Ideal
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Meta: {targets.phMin} – {targets.phMax}
              </p>
            </div>

            {/* CE / EC */}
            <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-3.5 border border-amber-200/60 dark:border-amber-800/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">CE Adubo</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold font-sans text-on-surface leading-none">
                  {targets.ecCurrent}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ✓ Equil.
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Meta: {targets.ecMin} – {targets.ecMax} mS/cm
              </p>
            </div>

            {/* Temperatura */}
            <div className="bg-rose-50 dark:bg-rose-950/40 rounded-2xl p-3.5 border border-rose-200/60 dark:border-rose-800/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Temperatura</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold font-sans text-on-surface leading-none">
                  {targets.tempCurrent}°
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ✓ Confort
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Meta: {targets.tempMin} – {targets.tempMax} °C
              </p>
            </div>

            {/* Humedad */}
            <div className="bg-teal-50 dark:bg-teal-950/40 rounded-2xl p-3.5 border border-teal-200/60 dark:border-teal-800/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Humedad</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold font-sans text-on-surface leading-none">
                  {targets.humidityCurrent}%
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ✓ Normal
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Rango: 65% – 80% UR
              </p>
            </div>
          </div>

          {/* Stage badge */}
          <div className="mt-3 flex items-center justify-center">
            <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant/20">
              🌱 {targets.stage}
            </span>
          </div>
        </div>

        {/* ACCIONES PRIMÁRIAS — 3 botões grandes em linha */}
        <div>
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
            Acciones rápidas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Registrar Cosecha → vai para aba cultivo sub-tab cosecha */}
            <button
              type="button"
              onClick={() => {
                handleTabSwitch('cultivo');
                setCultivoSubTab('cosecha');
              }}
              className="min-h-[72px] p-3 rounded-2xl bg-secondary-container border border-secondary/20 hover:bg-secondary/20 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-on-surface text-center leading-tight">
                Registrar{'\n'}Cosecha
              </span>
            </button>

            {/* 2. Cargar Apunte */}
            <button
              type="button"
              onClick={() => handleOpenCreateEntry('ph_ec_manual')}
              className="min-h-[72px] p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/50 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <FilePenLine className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-on-surface text-center leading-tight">
                Cargar{'\n'}Apunte
              </span>
            </button>

            {/* 3. Detectar Plagas */}
            <button
              type="button"
              onClick={onOpenPestDiagnosis}
              className="min-h-[72px] p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-on-surface text-center leading-tight">
                Detectar{'\n'}Plagas
              </span>
            </button>
          </div>
        </div>

        {/* ACCIONES SECUNDÁRIAS — 2 botões em linha */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary text-left flex items-center gap-3 transition-all active:scale-98 cursor-pointer shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <History className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                Historial
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {interventions.length} registros
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 hover:border-amber-500 text-left flex items-center gap-3 transition-all active:scale-98 cursor-pointer shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface group-hover:text-amber-700 transition-colors">
                Certificado
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {currentBatch?.batchCode || 'Lote activo'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* --- PESTAÑA: CULTIVO (Sub-tabs: Sensores | Cosecha | Apunte) --- */}
      <div className={`${currentTab === 'cultivo' ? 'block' : 'hidden md:block'} space-y-3`}>

        {/* Zona info header */}
        <div className="bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-on-surface">{currentZone.name}</h2>
              <span className="text-[10px] font-sans font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                {currentBatch?.batchCode || 'TOM-2026-088'}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {currentZone.cultivar} • {targets.stage}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En línea
          </span>
        </div>

        {/* Sub-tab selector: Sensores | Cosecha | Apunte */}
        <div className="flex gap-1.5 bg-surface-container-high/60 p-1 rounded-2xl border border-outline-variant/20">
          {[
            { id: 'sensores' as const, label: '🌡️ Sensores' },
            { id: 'cosecha' as const, label: '📦 Cosecha' },
            { id: 'apunte' as const, label: '📝 Apunte' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setCultivoSubTab(st.id)}
              className={`flex-1 min-h-[40px] py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cultivoSubTab === st.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* === SUB-TAB: SENSORES === */}
        {cultivoSubTab === 'sensores' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {/* pH */}
              <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200/60 dark:border-blue-800/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">pH Solução</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-3xl font-semibold font-sans text-on-surface mb-1">{targets.phCurrent}</div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-400/30 inline-block">
                  Meta: {targets.phMin} – {targets.phMax} ✓
                </div>
              </div>

              {/* CE */}
              <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200/60 dark:border-amber-800/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">CE Adubo</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-3xl font-semibold font-sans text-on-surface mb-1">{targets.ecCurrent}</div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-400/30 inline-block">
                  Meta: {targets.ecMin} – {targets.ecMax} mS ✓
                </div>
              </div>

              {/* Temp */}
              <div className="bg-rose-50 dark:bg-rose-950/40 rounded-2xl p-4 border border-rose-200/60 dark:border-rose-800/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Temperatura</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-3xl font-semibold font-sans text-on-surface mb-1">{targets.tempCurrent}°</div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-400/30 inline-block">
                  Meta: {targets.tempMin} – {targets.tempMax} °C ✓
                </div>
              </div>

              {/* Humedad */}
              <div className="bg-teal-50 dark:bg-teal-950/40 rounded-2xl p-4 border border-teal-200/60 dark:border-teal-800/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Humedad</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-3xl font-semibold font-sans text-on-surface mb-1">{targets.humidityCurrent}%</div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-400/30 inline-block">
                  Rango: 65% – 80% UR ✓
                </div>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCultivoSubTab('cosecha')}
                className="min-h-[52px] p-3 rounded-2xl bg-secondary-container border border-secondary/20 hover:bg-secondary/15 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <Package className="w-5 h-5 text-secondary shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-on-surface">Registrar Cosecha</p>
                  <p className="text-[10px] text-on-surface-variant">Cajas del día</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCultivoSubTab('apunte')}
                className="min-h-[52px] p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/50 hover:bg-emerald-100 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <FilePenLine className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-on-surface">Apunte Técnico</p>
                  <p className="text-[10px] text-on-surface-variant">pH, CE, manejo...</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* === SUB-TAB: COSECHA === */}
        {cultivoSubTab === 'cosecha' && (
          <div className="max-w-xl mx-auto space-y-3">
            {/* Sub-tabs Selector: Registrar vs Historial */}
            <div className="flex items-center justify-center p-1 bg-surface-container-high rounded-2xl border border-outline-variant/20">
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
                <span>Lotes ({harvests.length})</span>
              </button>
            </div>

            {harvestSubTab === 'registrar' ? (
              <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-md border border-outline-variant/30 text-center space-y-4">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center shadow-xs mb-2">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-xl font-semibold text-on-surface">
                    Registrar cosecha
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Cargue las cajas cosechadas hoy en {currentZone.name}
                  </p>
                  <div className="mt-2 inline-block">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-sans font-bold px-3 py-1 rounded-full border border-emerald-400/40">
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
                        className="w-14 h-14 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
                        aria-label="Restar una caja"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="w-28 text-center">
                        <span className="text-5xl font-semibold text-primary font-sans block">
                          {boxCount}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">
                          Cajas
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBoxCount(boxCount + 1)}
                        className="w-14 h-14 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
                        aria-label="Sumar una caja"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Total Estimado */}
                    <div className="bg-primary/10 rounded-2xl p-3.5 flex items-center justify-between border border-primary/20">
                      <span className="text-sm font-semibold text-on-surface">Total estimado:</span>
                      <span className="text-2xl font-semibold text-primary font-sans">
                        {boxCount * estimatedKgPerBox} kg
                      </span>
                    </div>

                    {/* Botón Principal */}
                    <button
                      type="button"
                      onClick={handleSaveHarvest}
                      className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Registrar {boxCount} cajas</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sub-tab: Historial de Cosechas */
              <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-md border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-secondary" />
                    <h3 className="font-bold text-sm text-on-surface">Lotes Cosechados</h3>
                  </div>
                  <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                    {harvests.reduce((acc, h) => acc + h.unitsCount, 0)} cajas totales
                  </span>
                </div>

                {harvests.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">
                    No hay registros de cosecha guardados aún.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                    {harvests.map((h) => {
                      const hDate = new Date(h.harvestedAt).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'es-PY');
                      return (
                        <div
                          key={h.id}
                          className="bg-surface-container-high/60 p-3.5 rounded-2xl border border-outline-variant/20 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-sans font-bold text-xs text-on-surface">{h.harvestCode}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {h.qualityGrade}
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant font-sans">{hDate}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right font-sans">
                              <span className="text-sm font-semibold text-primary block">{h.netWeightKg.toFixed(1)} kg</span>
                              <span className="text-[10px] text-on-surface-variant font-bold">{h.unitsCount} cajas</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditHarvest(h)}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingHarvest(h)}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* === SUB-TAB: APUNTE TÉCNICO === */}
        {cultivoSubTab === 'apunte' && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white mx-auto flex items-center justify-center shadow-xs">
              <FilePenLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Cargar Apunte Técnico</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Registre nutrición (pH/CE), sanidad fitosanitaria o manejo cultural
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'ph_ec_manual' as const, label: '🧪 Nutrición', sub: 'pH / CE / Fórmula' },
                { type: 'fitossanidade' as const, label: '🛡️ Sanidad', sub: 'Plagas / Bioinsumo' },
                { type: 'poda_manejo' as const, label: '✂️ Manejo', sub: 'Poda / Tutorado' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleOpenCreateEntry(item.type)}
                  className="min-h-[72px] p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/50 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <span className="text-lg">{item.label.split(' ')[0]}</span>
                  <span className="text-[11px] font-bold text-on-surface">{item.label.split(' ').slice(1).join(' ')}</span>
                  <span className="text-[9px] text-on-surface-variant">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
                    <h3 className="text-base sm:text-lg font-semibold text-on-surface">
                      Historial de la planta
                    </h3>
                    <span className="text-[11px] bg-primary text-on-primary font-sans font-bold px-2 py-0.5 rounded-full">
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
                            <span className="text-[11px] font-sans text-on-surface-variant flex items-center gap-1">
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
                              <span className="font-semibold text-on-surface font-sans">{item.volumeLiters} Litros</span>
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
                              <span className="font-semibold text-on-surface font-sans">{item.senaveRegistry}</span>
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

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-sans text-on-surface-variant">
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
              <span className="text-[11px] text-on-surface-variant font-sans">
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
                    <span className="text-3xl font-semibold text-primary font-sans w-20 text-center">
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
                  <span className="text-lg font-semibold text-primary font-sans">
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
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-on-surface-variant">
                            pH Medido:
                          </label>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans">Meta: 5.8-6.3</span>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          value={manualPh}
                          onChange={(e) => setManualPh(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-on-surface-variant">
                            Conductividad (mS/cm):
                          </label>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans">Meta: 1.8-2.5</span>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          value={manualEc}
                          onChange={(e) => setManualEc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                        className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/50 font-sans text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-outline-variant/50 font-sans text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
