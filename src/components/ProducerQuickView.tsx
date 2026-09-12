import React, { useState } from 'react';
import { Language, UserProfile, ProductionZone, PlantBatch, HarvestRecord } from '../types';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/storageService';
import { VoiceAssistantService } from '../services/voiceAssistantService';
import {
  Sprout,
  Camera,
  Package,
  MessageCircle,
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
  X
} from 'lucide-react';

interface ProducerQuickViewProps {
  lang: Language;
  currentUser: UserProfile;
  zones: ProductionZone[];
  batches: PlantBatch[];
  onSwitchToExpert: () => void;
  onOpenPestDiagnosis: () => void;
  onOpenMateoChat: () => void;
  onHarvestSaved?: () => void;
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
  onHarvestSaved,
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

        {/* CARD 4: CONVERSAR COM DON MATEO */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border-2 border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {t.askMateo}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {isPt ? 'Assistente com voz humana e conselhos' : 'Asistente con voz humana'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed my-2">
              {isPt
                ? 'Converse com Don Mateo por voz ou texto. Ele te orienta sobre dosagem de fertilizantes, ventilação de estufas, previsão de colheita e normas de auditoria.'
                : 'Habla con Don Mateo por voz o texto. Te ayuda con dudas de nutrientes, manejo de invernaderos, fechas de cosecha y normas técnicas.'}
            </p>

            <div className="flex flex-wrap gap-1.5 my-3">
              <span className="text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant">
                {isPt ? '🎙️ Resposta por voz' : '🎙️ Respuesta hablada'}
              </span>
              <span className="text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant">
                {isPt ? '🇧🇷 Português' : '🇵🇾 Español'}
              </span>
              <span className="text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant">
                {isPt ? '🌱 Foco em Tomate e Locote' : '🌱 Tomate y Locote'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenMateoChat}
            className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-primary-container text-on-primary-container font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary hover:text-on-primary active:scale-98 transition-all shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isPt ? 'Falar com Don Mateo Agora' : 'Hablar con Don Mateo Ahora'}</span>
          </button>
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
    </div>
  );
};
