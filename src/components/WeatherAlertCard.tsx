import React, { useState, useEffect } from 'react';
import {
  WeatherService,
  WeatherData,
  GreenhouseCrop,
  CropGreenhouseAdvice,
} from '../services/weatherService';
import { VoiceAssistantService } from '../services/voiceAssistantService';
import { Language } from '../types';
import {
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  CloudLightning,
  Droplets,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Square,
  Thermometer,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface WeatherAlertCardProps {
  lang: Language;
  crop?: GreenhouseCrop;
  onCropChange?: (crop: GreenhouseCrop) => void;
  onOpenMateoChat?: () => void;
  showCropSelector?: boolean;
}

export const WeatherAlertCard: React.FC<WeatherAlertCardProps> = ({
  lang,
  crop,
  onCropChange,
  onOpenMateoChat,
  showCropSelector = true,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [internalCrop, setInternalCrop] = useState<GreenhouseCrop>('tomate');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showForecastDetails, setShowForecastDetails] = useState(false);

  const activeCrop = crop || internalCrop;

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const data = await WeatherService.getWeatherForecast();
      setWeather(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWeather();
  }, []);

  useEffect(() => {
    return () => {
      if (isPlayingAudio) {
        VoiceAssistantService.stop();
      }
    };
  }, [isPlayingAudio]);

  const handleSelectCrop = (newCrop: GreenhouseCrop) => {
    if (isPlayingAudio) {
      VoiceAssistantService.stop(() => setIsPlayingAudio(false));
    }
    if (onCropChange) {
      onCropChange(newCrop);
    }
    setInternalCrop(newCrop);
  };

  if (!weather) return null;

  const { current, daily } = weather;
  const advice: CropGreenhouseAdvice = WeatherService.getGreenhouseAdvice(weather, activeCrop);

  const handlePlayVoice = () => {
    if (isPlayingAudio) {
      VoiceAssistantService.stop(() => setIsPlayingAudio(false));
      return;
    }
    const textToSpeak = lang === 'pt-BR' ? advice.voiceBriefingPt : advice.voiceBriefingEs;
    setIsPlayingAudio(true);
    VoiceAssistantService.speak(
      textToSpeak,
      lang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const getMainIcon = (code: number, size = 24) => {
    if (code >= 95) return <CloudLightning size={size} className="text-amber-500 shrink-0" />;
    if (code >= 51 && code <= 82) return <CloudRain size={size} className="text-blue-500 shrink-0" />;
    if (code === 0) return <Sun size={size} className="text-amber-500 shrink-0" />;
    return <CloudSun size={size} className="text-amber-400 shrink-0" />;
  };

  const getStatusColorClasses = (status: 'ideal' | 'attention' | 'critical') => {
    if (status === 'critical') {
      return {
        bg: 'bg-surface border-outline-variant/30 text-on-surface',
        badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />,
        ring: 'ring-rose-400/50',
      };
    }
    if (status === 'attention') {
      return {
        bg: 'bg-surface border-outline-variant/30 text-on-surface',
        badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        ring: 'ring-amber-400/50',
      };
    }
    return {
      bg: 'bg-surface border-outline-variant/30 text-on-surface',
      badge: 'bg-emerald-600 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      ring: 'ring-emerald-400/50',
    };
  };

  const statusTheme = getStatusColorClasses(advice.overallStatus);

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant/40 shadow-sm overflow-hidden select-none transition-all">
      {/* ─── 1. BARRA SUPERIOR: Contexto da Estufa & Botão Atualizar ─── */}
      <div className="px-4 sm:px-5 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {getMainIcon(current.weatherCode, 18)}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-on-surface truncate flex items-center gap-1.5">
              <span>{lang === 'es-PY' ? 'Clima y manejo' : 'Clima e manejo'}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {lang === 'es-PY' ? 'Clima exterior' : 'Clima externo'}
              </span>
            </h3>
            <p className="text-[11px] text-on-surface-variant truncate">
              📍 Guayaibí, San Pedro • {lang === 'es-PY' ? 'Sensación' : 'Sensação'}: {current.apparentTemperature.toFixed(0)}°C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fetchWeather}
            disabled={loading}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title={lang === 'es-PY' ? 'Actualizar clima' : 'Atualizar clima'}
            aria-label="Atualizar Clima"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── 2. SELETOR DE CULTIVO (TOMATE OU LOCOTE) ─── */}
      <div className="p-3 sm:p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {showCropSelector ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant tracking-normal shrink-0">
              {lang === 'es-PY' ? 'Cultivo en Estufa:' : 'Cultivo na Estufa:'}
            </span>
            <div className="grid grid-cols-2 gap-2 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => handleSelectCrop('tomate')}
                className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCrop === 'tomate'
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="text-base">🍅</span>
                <span>TOMATE</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCrop('locote')}
                className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCrop === 'locote'
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="text-base">🫑</span>
                <span>{lang === 'es-PY' ? 'LOCOTE VERDE' : 'PIMENTÃO'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant tracking-normal shrink-0">
              {lang === 'es-PY' ? 'Cultivo' : 'Cultivo'}
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container font-semibold text-xs sm:text-sm text-on-surface border border-outline-variant/30">
              <span className="text-base">{advice.cropEmoji}</span>
              <span>{lang === 'es-PY' ? advice.cropNameEs : advice.cropNamePt}</span>
            </div>
          </div>
        )}

        {/* Botão de Áudio com Don Mateo (1 Toque) */}
        <button
          type="button"
          onClick={handlePlayVoice}
          className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
            isPlayingAudio
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 ring-2 ring-amber-300 animate-pulse'
              : 'bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20'
          }`}
          title={lang === 'es-PY' ? 'Escuchar recomendación de voz' : 'Ouvir recomendação por voz'}
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>{lang === 'es-PY' ? 'Detener audio' : 'Parar Don Mateo'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'es-PY' ? 'Escuchar a Don Mateo' : 'Ouvir Don Mateo'}</span>
            </>
          )}
        </button>
      </div>

      {/* ─── 3. SEMÁFORO DE STATUS DO MICROCLIMA ─── */}
      <div className={`p-4 border-b ${statusTheme.bg} flex flex-col xl:flex-row xl:items-center justify-between gap-3`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-surface/80 dark:bg-black/30 shrink-0 mt-0.5 shadow-xs">
            {statusTheme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold font-sans">
                {lang === 'es-PY' ? advice.statusTitleEs : advice.statusTitlePt}
              </span>
              <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full font-bold uppercase ${statusTheme.badge}`}>
                {advice.overallStatus === 'ideal'
                  ? (lang === 'es-PY' ? 'Óptimo' : 'Ideal')
                  : advice.overallStatus === 'attention'
                  ? (lang === 'es-PY' ? 'Atención' : 'Atenção')
                  : (lang === 'es-PY' ? 'Acción Urgente' : 'Ação Urgente')}
              </span>
            </div>
            <p className="text-sm mt-2 text-on-surface-variant leading-relaxed">
              {lang === 'es-PY' ? advice.statusMessageEs : advice.statusMessagePt}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 4. CARDS DE AÇÕES DA ESTUFA ("O QUE FAZER HOJE") ─── */}
      <div className="p-4 sm:p-5 bg-surface-container-lowest/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-sans font-bold tracking-normal text-on-surface-variant flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" />
            <span>
              {lang === 'es-PY'
                ? 'Qué hacer hoy'
                : 'O que fazer hoje'}
            </span>
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {lang === 'es-PY' ? 'Recomendaciones' : 'Recomendações'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
          {advice.actions.map((act) => {
            const isAlert = act.status === 'alert';
            const isWarning = act.status === 'warning';
            const badgeBg = isAlert
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
              : isWarning
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
              : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold';

            const cardBorder = isAlert
              ? 'border-outline-variant/30 bg-surface'
              : isWarning
              ? 'border-outline-variant/30 bg-surface'
              : 'border-outline-variant/30 bg-surface';

            return (
              <div
                key={act.id}
                className={`p-3.5 rounded-2xl border ${cardBorder} flex flex-col justify-between gap-2.5 transition-all shadow-xs`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                      {act.id === 'curtains' && '🪟'}
                      {act.id === 'shading' && '☀️'}
                      {act.id === 'irrigation' && '💧'}
                      {act.id === 'sanitary' && '🛡️'}
                      <span>{lang === 'es-PY' ? act.titleEs : act.titlePt}</span>
                    </span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full uppercase tracking-tight shrink-0 ${badgeBg}`}>
                      {lang === 'es-PY' ? act.badgeEs : act.badgePt}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-on-surface leading-snug">
                    {lang === 'es-PY' ? act.instructionEs : act.instructionPt}
                  </p>
                </div>

                <details className="pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed">
                  <summary className="font-medium text-on-surface cursor-pointer py-1">
                    {lang === 'es-PY' ? 'Ver motivo' : 'Ver motivo'}</summary>
                  <p className="mt-2">{lang === 'es-PY' ? act.reasonEs : act.reasonPt}</p></details>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. MÉTRICAS CLIMÁTICAS EXTERIORES (LIMPO & SEM POLUIÇÃO) ─── */}
      <div className="px-4 py-3.5 sm:px-5 bg-surface-container-low/40 border-t border-outline-variant/30 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
        {/* Temperatura e Condição do Céu */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-surface rounded-2xl shadow-xs border border-outline-variant/30 shrink-0">
            {getMainIcon(current.weatherCode, 28)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold font-sans text-on-surface">
                {current.temperature.toFixed(1)}°C
              </span>
              <span className="text-xs font-sans text-on-surface-variant">
                ({lang === 'es-PY' ? 'Sensación' : 'Sensação'}: {current.apparentTemperature.toFixed(0)}°)
              </span>
            </div>
            <span className="text-xs text-on-surface-variant block font-medium">
              {lang === 'es-PY' ? current.weatherDescriptionEs : current.weatherDescriptionPt}
            </span>
          </div>
        </div>

        {/* 4 Indicadores Essenciais para o Produtor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 md:max-w-xl">
          {/* Umidade */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-sans text-on-surface-variant flex items-center gap-1 font-semibold">
              <Droplets size={13} className="text-blue-500" />
              <span>{lang === 'es-PY' ? 'Humedad' : 'Umidade'}</span>
            </span>
            <span className="text-xs font-bold font-sans text-on-surface mt-1">
              {current.humidity}%
            </span>
          </div>

          {/* Vento */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-sans text-on-surface-variant flex items-center gap-1 font-semibold">
              <Wind size={13} className="text-teal-500" />
              <span>{lang === 'es-PY' ? 'Viento' : 'Vento'}</span>
            </span>
            <span className="text-xs font-bold font-sans text-on-surface mt-1">
              {current.windSpeed.toFixed(0)} km/h
            </span>
          </div>

          {/* Radiação UV */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-sans text-on-surface-variant flex items-center gap-1 font-semibold">
              <Sun size={13} className="text-amber-500" />
              <span>{lang === 'es-PY' ? 'Índice UV' : 'Índice UV'}</span>
            </span>
            <span className={`text-xs font-bold font-sans mt-1 ${current.uvIndex >= 7.5 ? 'text-rose-600' : 'text-on-surface'}`}>
              {current.uvIndex.toFixed(1)} {current.uvIndex >= 7.5 ? '⚠️' : ''}
            </span>
          </div>

          {/* Chuva */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-sans text-on-surface-variant flex items-center gap-1 font-semibold">
              <CloudRain size={13} className="text-blue-500" />
              <span>{lang === 'es-PY' ? 'Lluvia' : 'Chuva'}</span>
            </span>
            <span className="text-xs font-bold font-sans text-on-surface mt-1">
              {current.precipitation.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* Botão de Alternar Detalhes dos Próximos Dias */}
        <button
          type="button"
          onClick={() => setShowForecastDetails((prev) => !prev)}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <span>{lang === 'es-PY' ? '3 Días' : '3 Dias'}</span>
          {showForecastDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ─── 6. PREVISÃO DOS PRÓXIMOS 3 DIAS (EXPANSÍVEL) ─── */}
      {showForecastDetails && (
        <div className="p-4 bg-surface-container-high/40 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
          {daily.slice(0, 3).map((day, idx) => {
            const dateObj = new Date(day.date + 'T12:00:00');
            const dayLabel =
              idx === 0
                ? (lang === 'es-PY' ? 'Hoy' : 'Hoje')
                : idx === 1
                ? (lang === 'es-PY' ? 'Mañana' : 'Amanhã')
                : dateObj.toLocaleDateString(lang === 'es-PY' ? 'es-PY' : 'pt-BR', { weekday: 'long' });

            return (
              <div
                key={day.date}
                className="p-3 rounded-2xl bg-surface border border-outline-variant/30 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-surface-container shrink-0">
                    {getMainIcon(day.weatherCode, 20)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface capitalize block leading-tight">
                      {dayLabel}
                    </span>
                    <span className="text-[10px] font-sans text-on-surface-variant">
                      {day.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-sans text-xs font-black text-on-surface">
                    <span>{day.tempMax.toFixed(0)}°</span>
                    <span className="text-on-surface-variant/60 font-normal ml-1">
                      {day.tempMin.toFixed(0)}°
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-blue-600 dark:text-blue-400 font-semibold block">
                    {day.precipitationProbability}% {lang === 'es-PY' ? 'lluvia' : 'chuva'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

