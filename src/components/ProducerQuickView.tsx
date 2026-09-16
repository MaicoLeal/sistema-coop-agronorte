import React, { useState } from 'react';
import { Language, UserProfile, ProductionZone, PlantBatch, HarvestRecord, FieldInspection } from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { VoiceAssistantService } from '../services/voiceAssistantService';
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
  Check
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
  onHarvestSaved,
  onInspectionSaved,
  onSelectZone
}) => {
  const t = translations[lang];
  const isPt = lang === 'pt-BR';

  // Quick Harvest Modal State
  const [showQuickHarvestModal, setShowQuickHarvestModal] = useState<boolean>(false);
  const [selectedHarvestBatchId, setSelectedHarvestBatchId] = useState<string>(
    batches.find((b) => b.status === 'active')?.id || batches[0]?.id || ''
  );
  const [boxCount, setBoxCount] = useState<number>(15);
  const [estimatedKgPerBox, setEstimatedKgPerBox] = useState<number>(18);
  const [harvestSuccessMessage, setHarvestSuccessMessage] = useState<string | null>(null);

  // Manual Field Technician Entry State
  const [showManualEntryModal, setShowManualEntryModal] = useState<boolean>(false);
  const [manualZoneId, setManualZoneId] = useState<string>(zones[0]?.id || 'zone-estufa-01');
  const [manualBatchId, setManualBatchId] = useState<string>(batches[0]?.id || '');
  const [manualTemplateType, setManualTemplateType] = useState<FieldInspection['templateType']>('ph_ec_manual');
  const [manualPh, setManualPh] = useState<string>('6.1');
  const [manualEc, setManualEc] = useState<string>('2.1');
  const [manualTemp, setManualTemp] = useState<string>('24.5');
  const [manualHumidity, setManualHumidity] = useState<string>('68');
  const [manualFindings, setManualFindings] = useState<string>('');
  const [manualCorrectiveAction, setManualCorrectiveAction] = useState<string>('');
  const [manualSeverity, setManualSeverity] = useState<FieldInspection['severity']>('normal');
  const [manualSuccessMessage, setManualSuccessMessage] = useState<string | null>(null);

  const handleSaveManualEntry = () => {
    const phNum = parseFloat(manualPh) || 6.1;
    const ecNum = parseFloat(manualEc) || 2.1;
    const tempNum = parseFloat(manualTemp) || 24.5;
    const zoneObj = zones.find((z) => z.id === manualZoneId) || zones[0];
    const batchObj = batches.find((b) => b.id === manualBatchId) || batches.find((b) => b.zoneId === manualZoneId) || batches[0];

    const newInspection: FieldInspection = {
      id: `insp-man-${Date.now()}`,
      tenantId: currentUser.tenantId || 'tenant-agronorte-demo',
      templateType: manualTemplateType,
      zoneId: manualZoneId,
      batchId: batchObj?.id,
      inspectorName: currentUser.name || 'Técnico de Campo Agronorte',
      inspectedAt: new Date().toISOString(),
      phManual: phNum,
      ecManual: ecNum,
      findings: manualFindings.trim() || (isPt
        ? `Lançamento manual realizado na ${zoneObj.name}. Solução com pH ${phNum} e EC ${ecNum} mS/cm aferidos com instrumentos portáteis de bancada.`
        : `Carga manual realizada en ${zoneObj.name}. Solución con pH ${phNum} y EC ${ecNum} mS/cm medidos con instrumentos portátiles.`),
      severity: manualSeverity,
      correctiveActionTaken: manualCorrectiveAction.trim() || undefined,
      syncStatus: 'synced',
      hash: `sha256_man_${Date.now().toString(16)}`
    };

    StorageService.addInspection(newInspection, currentUser);

    const successTxt = isPt
      ? `Apontamento do técnico gravado com sucesso para a ${zoneObj.name}! (pH: ${phNum}, EC: ${ecNum} mS/cm)`
      : `¡Apunte técnico guardado con éxito para ${zoneObj.name}! (pH: ${phNum}, EC: ${ecNum} mS/cm)`;

    setManualSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowManualEntryModal(false);
      setManualSuccessMessage(null);
      setManualFindings('');
      setManualCorrectiveAction('');
      if (onInspectionSaved) onInspectionSaved();
      if (onHarvestSaved) onHarvestSaved();
    }, 2400);
  };

  // Status values
  const tomatoBatch = batches.find((b) => b.crop.includes('Tomate')) || batches[0];
  const pepperBatch = batches.find((b) => b.crop.includes('Locote')) || batches[1];

  // Daily voice briefing
  const handlePlayBriefing = () => {
    const speech = isPt
      ? 'Bom dia, produtor! Aqui é o Don Mateo. Nossas 12 estufas em Guayaibí estão operando com mais de 350 famílias cooperadas conectadas. O Tomate Saladete na Estufa 1 está com água e nutrientes no ponto ideal. Na Estufa 2 de Locote, está quente nesta manhã, lembre-se de abrir as cortinas laterais. Boa colheita!'
      : '¡Buen día, amigo productor! Aquí Don Mateo. Nuestros 12 invernaderos en Guayaibí están activos con más de 350 familias conectadas. El Tomate Saladete en Invernadero 1 tiene agua y nutrientes ideales. En Invernadero 2 de Locote hace calor matutino, recuerda ventilar bien. ¡Buena jornada de trabajo!';

    VoiceAssistantService.speak(speech, lang);
  };

  const handleSaveHarvest = () => {
    const batch = batches.find((b) => b.id === selectedHarvestBatchId) || batches[0];
    const totalKg = boxCount * estimatedKgPerBox;

    const currentHarvests = StorageService.getHarvests();
    const newHarvest: HarvestRecord = {
      id: `col-${Date.now().toString().slice(-5)}`,
      tenantId: currentUser.tenantId,
      batchId: batch.id,
      harvestCode: `COL-${batch.crop.includes('Tomate') ? 'TOM' : 'LOC'}-${Date.now().toString().slice(-4)}`,
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

    const cropName = batch.crop.includes('Tomate') ? 'Tomate' : 'Locote';
    const successTxt = isPt
      ? `Colheita registrada com sucesso! ${boxCount} caixas (${totalKg} kg) de ${cropName}.`
      : `¡Cosecha guardada con éxito! ${boxCount} cajas (${totalKg} kg) de ${cropName}.`;

    setHarvestSuccessMessage(successTxt);
    VoiceAssistantService.speak(successTxt, lang);

    setTimeout(() => {
      setShowQuickHarvestModal(false);
      setHarvestSuccessMessage(null);
      if (onHarvestSaved) onHarvestSaved();
    }, 2800);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 🌾 TOP WELCOME & EASY BAR */}
      <div className="bg-linear-to-r from-primary to-primary-container rounded-3xl p-5 sm:p-7 text-on-primary shadow-xl border-2 border-primary-fixed/20 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sprout className="w-64 h-64 text-on-primary" />
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
                <span className="bg-primary-fixed/25 text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-on-primary/30">
                  {t.easyModeBadge}
                </span>
                <span className="text-xs text-on-primary/90 font-semibold">
                  350+ Familias Conectadas • Guayaibí, San Pedro
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isPt ? 'Painel do Produtor Rural' : 'Panel del Productor'}
              </h1>
              <p className="text-sm sm:text-base text-on-primary/90 mt-1 max-w-xl">
                {isPt
                  ? 'Controle simplificado das 12 estufas ativas com poucos toques e auxílio de voz do Don Mateo.'
                  : 'Control simplificado de los 12 invernaderos activos con pocos toques y apoyo por voz de Don Mateo.'}
              </p>
            </div>
          </div>

          {/* Actions on Top Right */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Briefing Button */}
            <button
              onClick={handlePlayBriefing}
              className="px-4 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-xs sm:text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              title="Ouvir resumo do dia"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPt ? 'Ouvir Don Mateo' : 'Escuchar Don Mateo'}</span>
            </button>

            {/* Switch to Expert ERP Mode */}
            <button
              onClick={onSwitchToExpert}
              className="px-4 py-2.5 rounded-full bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-on-primary font-semibold text-xs sm:text-sm transition-all border border-on-primary/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{t.switchToExpertMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚜 4 BIG DIRECT ACTION CARDS (Tactile & High Contrast) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD 1: ESTUFAS E ÁGUA */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border-2 border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-on-surface">
                      {t.quickGreenhouseTitle}
                    </h2>
                    <span className="bg-primary/15 text-primary text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-primary/20">
                      12 Ativos
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {isPt ? 'Água, adubo e clima em tempo real' : 'Agua, nutrición y clima en tiempo real'}
                  </span>
                </div>
              </div>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>

            {/* Status list of key greenhouses */}
            <div className="space-y-2.5 my-2 max-h-72 overflow-y-auto pr-1">
              {zones.map((zone, idx) => {
                const isWarning = zone.id === 'zone-estufa-02';
                const isRD = zone.id === 'zone-estufa-12';

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone(zone.id)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                      isWarning
                        ? 'bg-secondary-fixed/20 border-secondary/30'
                        : isRD
                        ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700/40'
                        : 'bg-primary-fixed/20 border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-xs shadow-xs shrink-0 ${
                          isWarning
                            ? 'bg-secondary text-on-secondary'
                            : isRD
                            ? 'bg-amber-600 text-white'
                            : 'bg-primary text-on-primary'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-on-surface truncate">
                          {zone.name}
                        </h3>
                        <p
                          className={`text-[11px] font-semibold flex items-center gap-1 truncate ${
                            isWarning
                              ? 'text-secondary'
                              : isRD
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-primary'
                          }`}
                        >
                          {isWarning ? (
                            <>
                              <Flame className="w-3.5 h-3.5 shrink-0" />
                              <span>{isPt ? 'Atenção ao calor (29.5°C)' : 'Atención al calor (29.5°C)'}</span>
                            </>
                          ) : isRD ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>{isPt ? 'I+D e Biocontrole IoT' : 'I+D y Biocontrol IoT'}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{zone.cultivar} • pH 6.1</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isWarning
                          ? 'text-secondary bg-surface-container-lowest border-secondary/30'
                          : isRD
                          ? 'text-amber-700 bg-surface-container-lowest border-amber-300'
                          : 'text-primary bg-surface-container-lowest border-primary/30'
                      }`}
                    >
                      {isWarning ? (isPt ? 'Ventilar' : 'Ventilar') : isRD ? 'I+D' : (isPt ? 'Ótimo' : 'Óptimo')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              onSelectZone('zone-estufa-01');
              onSwitchToExpert();
            }}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span>{isPt ? 'Ver Detalhes e Gráficos das 12 Estufas' : 'Ver Detalles y Gráficos de los 12 Invernaderos'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 2: DIAGNÓSTICO DE PRAGAS COM IA */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border-2 border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-tertiary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {t.quickPestTitle}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {isPt ? 'Identificação na hora por foto' : 'Detección inmediata con foto'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed my-2">
              {isPt
                ? 'Viu folhas com pó branco, brotos furados ou frutos com manchas pretas? Tire uma foto com o celular ou grave um áudio para receber a recomendação falada na hora.'
                : '¿Viste hojas con polvillo blanco, orugas o manchas en frutos? Saca una foto o graba un audio para escuchar la solución agronómica de inmediato.'}
            </p>

            <div className="bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl p-3 my-3 flex items-center gap-2.5 text-xs text-on-surface">
              <Sparkles className="w-4 h-4 text-tertiary shrink-0" />
              <span>
                {isPt
                  ? 'Reconhece Oídio, Míldio, Traça-do-tomateiro, Mosca-branca e Deficiência de Cálcio.'
                  : 'Reconoce Oídio, Mildiu, Polilla del Tomate, Mosca Blanca y Falta de Calcio.'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenPestDiagnosis}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-tertiary text-on-tertiary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-98 transition-all shadow-md"
          >
            <Camera className="w-5 h-5" />
            <span>{isPt ? 'Abrir Câmera para Diagnóstico' : 'Abrir Cámara para Diagnóstico'}</span>
          </button>
        </div>

        {/* CARD 3: REGISTRAR COLHEITA DO DIA */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border-2 border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between">
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
                ? 'Terminou o turno de colheita? Informe quantas caixas foram colhidas para atualizar o estoque e emitir o código de rastreamento com selo de qualidade.'
                : '¿Terminaste de cosechar? Indica cuántas cajas se recogieron hoy para sumar al stock y generar las etiquetas con trazabilidad oficial.'}
            </p>

            <div className="bg-surface-container-high rounded-2xl p-3 my-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">
                {isPt ? 'Lote Ativo Hoje:' : 'Lote de Hoy:'}
              </span>
              <span className="font-bold text-primary">
                {tomatoBatch?.batchCode || 'LOTE-TOM-2026-088'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowQuickHarvestModal(true)}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary-container hover:text-on-primary-container active:scale-98 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>{isPt ? 'Registrar Caixas Colhidas' : 'Anotar Cajas Cosechadas'}</span>
          </button>
        </div>

        {/* CARD 4: APONTAMENTO TÉCNICO DE CAMPO (ENTRADA MANUAL) */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border-2 border-outline-variant/30 hover:border-emerald-500 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-13 h-13 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-on-surface">
                    {isPt ? 'Apontamento Técnico' : 'Planilla Técnica'}
                  </h2>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-600/40 font-bold">
                    {isPt ? 'Entrada Manual' : 'Carga Manual'}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {isPt ? 'Lançamento manual de pH, EC, clima e manejo' : 'Carga de pH, EC, clima y manejo agronómico'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed my-2">
              {isPt
                ? 'Opção para o técnico de campo e agrônomo inserirem medições manuais de pHmetro, condutivímetro portátil, temperatura da calda e notas de manejo.'
                : 'Opción para el técnico de campo y agrónomo ingresar mediciones manuales de pHmetro, conductímetro portátil, temperatura y notas de manejo.'}
            </p>

            <div className="flex flex-wrap gap-1.5 my-3">
              <span className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <span>🧪</span>
                {isPt ? 'pH & EC Manual' : 'pH y EC Manual'}
              </span>
              <span className="text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant flex items-center gap-1">
                <span>🌡️</span>
                {isPt ? 'Temp & Clima' : 'Temp y Clima'}
              </span>
              <span className="text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant flex items-center gap-1">
                <span>📋</span>
                {isPt ? 'Diário Oficial BPA' : 'Libro Oficial BPA'}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <button
              id="btn-open-manual-entry"
              type="button"
              onClick={() => setShowManualEntryModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-md"
            >
              <FilePenLine className="w-5 h-5" />
              <span>{isPt ? 'Lançar Dados Manuais de Campo' : 'Cargar Datos Manuales de Campo'}</span>
            </button>

            {onOpenFieldInspections && (
              <button
                type="button"
                onClick={onOpenFieldInspections}
                className="w-full py-1.5 px-3 text-xs text-on-surface-variant hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isPt ? 'Ver Histórico de Inspeções' : 'Ver Historial de Inspecciones'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

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
                    {isPt ? 'Registro Rápido de Campo' : 'Registro Fácil'}
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
              <div className="space-y-4 py-4">
                {/* Select Crop / Batch */}
                <div>
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1.5">
                    {isPt ? '1. Escolha o Lote / Cultura' : '1. Elige el Lote / Cultivo'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {batches
                      .filter((b) => b.status === 'active')
                      .slice(0, 4)
                      .map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedHarvestBatchId(b.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            selectedHarvestBatchId === b.id
                              ? 'border-primary bg-primary-fixed/20 text-on-surface font-bold shadow-xs'
                              : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'
                          }`}
                        >
                          <span className="text-xs font-extrabold block text-primary">
                            {b.crop}
                          </span>
                          <span className="text-[11px] block truncate text-on-surface">
                            {b.cultivar}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Box Counter */}
                <div>
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1.5">
                    {isPt ? '2. Quantas caixas colheu?' : '2. ¿Cuántas cajas cosechaste?'}
                  </label>
                  <div className="flex items-center justify-between gap-3 bg-surface-container-high rounded-2xl p-2">
                    <button
                      type="button"
                      onClick={() => setBoxCount((prev) => Math.max(1, prev - 5))}
                      className="w-12 h-12 rounded-xl bg-surface-container-lowest text-on-surface font-bold text-lg shadow-xs hover:bg-surface-container cursor-pointer flex items-center justify-center"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <span className="text-3xl font-black text-primary block">
                        {boxCount}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {isPt ? 'caixas' : 'cajas'} (~{boxCount * estimatedKgPerBox} kg)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBoxCount((prev) => prev + 5)}
                      className="w-12 h-12 rounded-xl bg-primary text-on-primary font-bold text-lg shadow-xs hover:bg-primary-container cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {[10, 20, 35, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBoxCount(num)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          boxCount === num
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
                        }`}
                      >
                        {num} cx
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSaveHarvest}
                    className="w-full py-4 rounded-2xl bg-primary text-on-primary font-extrabold text-base shadow-lg hover:bg-primary-container hover:text-on-primary-container active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isPt ? 'Salvar Colheita no Sistema' : 'Confirmar Cosecha'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 📋 MODAL DE APONTAMENTO MANUAL DO TÉCNICO DE CAMPO */}
      {showManualEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border-2 border-emerald-500/40 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-stone-950 p-4 text-white flex items-center justify-between shrink-0 border-b border-emerald-700/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700/60 text-emerald-200 flex items-center justify-center ring-1 ring-emerald-400/40">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">
                    {isPt ? 'Apontamento Técnico de Campo' : 'Planilla Técnica de Campo'}
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentUser.name} • {isPt ? 'Entrada Manual Oficial' : 'Carga Manual Oficial'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowManualEntryModal(false);
                  setManualSuccessMessage(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Feedback Screen */}
            {manualSuccessMessage ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-on-surface">
                  {isPt ? 'Apontamento Registrado!' : '¡Registro Guardado!'}
                </h4>
                <p className="text-sm text-on-surface-variant max-w-sm">
                  {manualSuccessMessage}
                </p>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  HASH: sha256_bpa_verified • SENAVE/GLOBALG.A.P.
                </span>
              </div>
            ) : (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
                {/* 1. Seleção de Estufa e Lote */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {isPt ? 'Estufa Inspecionada' : 'Invernadero Inspeccionado'}
                    </label>
                    <select
                      value={manualZoneId}
                      onChange={(e) => setManualZoneId(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} ({z.cultivar})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {isPt ? 'Tipo de Apontamento' : 'Tipo de Apunte'}
                    </label>
                    <select
                      value={manualTemplateType}
                      onChange={(e) => setManualTemplateType(e.target.value as any)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ph_ec_manual">{isPt ? '🧪 pH & Condutividade (Calda)' : '🧪 pH y Conductividad'}</option>
                      <option value="turno_diario">{isPt ? '📋 Turno Diário de Manejo' : '📋 Turno Diario de Manejo'}</option>
                      <option value="fitossanidade">{isPt ? '🔬 Inspeção Fitossanitária' : '🔬 Inspección Fitosanitaria'}</option>
                      <option value="higiene_estufa">{isPt ? '🧼 Limpeza & Calibração' : '🧼 Limpieza y Calibración'}</option>
                    </select>
                  </div>
                </div>

                {/* 2. Medições Instrumentais Manuais (pH, EC, Temp, Umidade) */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-600/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      {isPt ? 'Medições Instrumentais Portáteis' : 'Mediciones con Instrumentos Portátiles'}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-900/30 px-2 py-0.5 rounded">
                      BPA-PY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* pH Manual */}
                    <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-on-surface">pH da Calda</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          parseFloat(manualPh) >= 5.8 && parseFloat(manualPh) <= 6.5
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}>
                          {parseFloat(manualPh) >= 5.8 && parseFloat(manualPh) <= 6.5 ? 'Ideal' : 'Ajustar'}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="4.0"
                        max="8.5"
                        value={manualPh}
                        onChange={(e) => setManualPh(e.target.value)}
                        className="w-full text-lg font-bold text-primary bg-surface-container-high rounded-lg px-2.5 py-1 text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex justify-between gap-1 mt-1.5">
                        {['5.8', '6.0', '6.2', '6.5'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setManualPh(val)}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-container hover:bg-emerald-100 dark:hover:bg-emerald-950 text-on-surface cursor-pointer"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* EC Manual */}
                    <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-on-surface">EC (mS/cm)</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          parseFloat(manualEc) >= 1.8 && parseFloat(manualEc) <= 2.5
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}>
                          {parseFloat(manualEc) >= 1.8 && parseFloat(manualEc) <= 2.5 ? 'Ideal' : 'Ajustar'}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="4.0"
                        value={manualEc}
                        onChange={(e) => setManualEc(e.target.value)}
                        className="w-full text-lg font-bold text-secondary bg-surface-container-high rounded-lg px-2.5 py-1 text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex justify-between gap-1 mt-1.5">
                        {['1.8', '2.0', '2.2', '2.4'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setManualEc(val)}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-container hover:bg-emerald-100 dark:hover:bg-emerald-950 text-on-surface cursor-pointer"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        🌡️ {isPt ? 'Temperatura Calda/Estufa (°C)' : 'Temperatura Solución (°C)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={manualTemp}
                        onChange={(e) => setManualTemp(e.target.value)}
                        className="w-full text-sm font-semibold bg-surface-container border border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        💧 {isPt ? 'Umidade Relativa do Ar (%)' : 'Humedad Relativa (%)'}
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={manualHumidity}
                        onChange={(e) => setManualHumidity(e.target.value)}
                        className="w-full text-sm font-semibold bg-surface-container border border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-on-surface"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Notas Agronômicas & Manejo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface">
                      {isPt ? 'Observações Agronômicas & Manejo' : 'Observaciones Agronómicas y Manejo'}
                    </label>
                    <span className="text-[10px] text-on-surface-variant">{isPt ? 'Registro técnico' : 'Libro de campo'}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={manualFindings}
                    onChange={(e) => setManualFindings(e.target.value)}
                    placeholder={isPt
                      ? 'Ex: Verificada uniformidade dos gotejadores nas bancadas centrais; cortinas laterais reguladas; sem presença de oídio.'
                      : 'Ej: Verificada uniformidad de goteros; cortinas laterales reguladas a 40cm; sin síntomas de oídio.'}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  {/* Quick Preset Tags */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      isPt ? '✅ Nutrição equilibrada' : '✅ Nutrición equilibrada',
                      isPt ? '💨 Cortinas reguladas' : '💨 Cortinas reguladas',
                      isPt ? '🔍 Amostragem foliar ok' : '🔍 Muestreo foliar ok',
                      isPt ? '🚿 Gotejadores limpos' : '🚿 Goteros limpios'
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setManualFindings((prev) => (prev ? `${prev}. ${tag}` : tag))}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container hover:bg-emerald-100 dark:hover:bg-emerald-950 text-on-surface-variant cursor-pointer border border-outline-variant/30"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Ação Corretiva Realizada (Opcional) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {isPt ? 'Ação Corretiva / Intervenção Realizada' : 'Acción Correctiva / Intervención Realizada'}
                  </label>
                  <input
                    type="text"
                    value={manualCorrectiveAction}
                    onChange={(e) => setManualCorrectiveAction(e.target.value)}
                    placeholder={isPt ? 'Ex: Calibrado injetor de ácido fosfórico para baixar pH em 0.2' : 'Ej: Calibrado inyector de nutrientes para ajustar pH'}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 5. Nível de Severidade / Status */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    {isPt ? 'Status do Setor Avaliado' : 'Estado del Sector'}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { val: 'normal', label: isPt ? 'Normal' : 'Normal', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
                      { val: 'leve', label: isPt ? 'Leve' : 'Leve', color: 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40' },
                      { val: 'moderada', label: isPt ? 'Atenção' : 'Atención', color: 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
                      { val: 'critica', label: isPt ? 'Crítico' : 'Crítico', color: 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setManualSeverity(item.val as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                          manualSeverity === item.val
                            ? `${item.color} shadow-xs ring-1 ring-current`
                            : 'border-outline-variant/30 text-on-surface-variant bg-surface-container hover:bg-surface-container-high'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveManualEntry}
                    className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isPt ? 'Gravar Apontamento Oficial no Sistema' : 'Guardar Apunte Oficial en el Sistema'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
