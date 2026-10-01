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
  AlertTriangle,
  Droplets,
  X,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  Volume2,
  Square,
  Sparkles,
} from 'lucide-react';

interface WeatherWidgetProps {
  lang: Language;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lang }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<GreenhouseCrop>('tomate');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (isPlayingAudio) {
        VoiceAssistantService.stop();
      }
    };
  }, [isPlayingAudio]);

  if (!weather) return null;

  const current = weather.current;
  const activeAlerts = weather.activeAlerts;
  const hasAlerts = activeAlerts.length > 0;
  const criticalAlert = activeAlerts.find((a) => a.severity === 'critical') || activeAlerts[0];

  const advice: CropGreenhouseAdvice = WeatherService.getGreenhouseAdvice(weather, selectedCrop);

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

  const getMainWeatherIcon = (code: number, size = 16) => {
    if (code >= 95) return <CloudLightning size={size} className="text-amber-500 shrink-0" />;
    if (code >= 51 && code <= 82) return <CloudRain size={size} className="text-blue-500 shrink-0" />;
    if (code === 0) return <Sun size={size} className="text-amber-500 shrink-0" />;
    return <CloudSun size={size} className="text-amber-400 shrink-0" />;
  };

  const getStatusColor = (status: 'ideal' | 'attention' | 'critical') => {
    if (status === 'critical') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100',
        badge: 'bg-rose-600 text-white',
        icon: <ShieldAlert size={18} className="text-rose-600 shrink-0" />,
      };
    }
    if (status === 'attention') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100',
        badge: 'bg-amber-500 text-slate-950 font-bold',
        icon: <AlertTriangle size={18} className="text-amber-600 shrink-0" />,
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100',
      badge: 'bg-emerald-600 text-white font-bold',
      icon: <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />,
    };
  };

  const statusTheme = getStatusColor(advice.overallStatus);

  return (
    <>
      {/* ─── CHIP COMPACTO NO CABEÇALHO ─── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
          hasAlerts
            ? criticalAlert?.severity === 'critical'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
            : 'bg-surface-container-high/80 border-outline-variant/40 text-on-surface hover:bg-surface-container'
        }`}
        title={lang === 'es-PY' ? 'Ver Pronóstico y Estufa' : 'Ver Previsão e Estufa'}
        aria-label="Abrir Clima"
      >
        <div className="flex items-center gap-1">
          {getMainWeatherIcon(current.weatherCode, 14)}
          <span className="font-mono font-bold text-xs">{current.temperature.toFixed(0)}°</span>
        </div>

        {hasAlerts ? (
          <div className="flex items-center gap-1 pl-1 border-l border-current/20">
            {criticalAlert.type === 'rain' && <CloudRain size={12} className="animate-bounce" />}
            {criticalAlert.type === 'wind' && <Wind size={12} className="animate-pulse" />}
            {criticalAlert.type === 'sun' && <Sun size={12} className="animate-spin" />}
            <span className="font-mono text-[10px] uppercase font-bold tracking-tight hidden sm:inline">
              {lang === 'es-PY' ? criticalAlert.titleEs.slice(0, 14) : criticalAlert.titlePt.slice(0, 14)}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-on-surface-variant hidden md:inline">
            Guayaibí
          </span>
        )}
      </button>

      {/* ─── MODAL DETALHADO DO MONITOR DE ESTUFA ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-outline-variant/40 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="px-4 sm:px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {getMainWeatherIcon(current.weatherCode, 20)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span>{lang === 'es-PY' ? 'Monitor de Invernadero y Clima' : 'Monitor de Estufa & Clima'}</span>
                  </h3>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    {weather.city} • {weather.updatedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchWeather}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  title={lang === 'es-PY' ? 'Actualizar ahora' : 'Atualizar agora'}
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conteúdo Rolável */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Seletor de Cultivo (Tomate vs Locote) */}
              <div className="flex items-center justify-between gap-2 p-1 bg-surface-container rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedCrop('tomate')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedCrop === 'tomate'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>🍅</span>
                  <span>TOMATE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCrop('locote')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedCrop === 'locote'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>🫑</span>
                  <span>{lang === 'es-PY' ? 'LOCOTE' : 'PIMENTÃO'}</span>
                </button>
              </div>

              {/* Botão Don Mateo Ouvir (1 Toque) */}
              <button
                type="button"
                onClick={handlePlayVoice}
                className={`w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square size={16} className="fill-current" />
                    <span>{lang === 'es-PY' ? 'Detener Don Mateo' : 'Parar Don Mateo'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    <span>{lang === 'es-PY' ? 'Escuchar Recomendación (1 toque)' : 'Ouvir Recomendação (1 toque)'}</span>
                  </>
                )}
              </button>

              {/* Semáforo de Status */}
              <div className={`p-3.5 rounded-2xl border ${statusTheme.bg} flex items-start gap-2.5`}>
                <div className="mt-0.5 shrink-0">{statusTheme.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold font-sans">
                      {lang === 'es-PY' ? advice.statusTitleEs : advice.statusTitlePt}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full uppercase ${statusTheme.badge}`}>
                      {advice.overallStatus}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {lang === 'es-PY' ? advice.statusMessageEs : advice.statusMessagePt}
                  </p>
                </div>
              </div>

              {/* 4 Pilares de Ação na Estufa */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <Sparkles size={13} className="text-primary" />
                  <span>{lang === 'es-PY' ? 'Acciones para Hoy en Invernadero' : 'Ações para Hoje na Estufa'}</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {advice.actions.map((act) => {
                    const badgeColor =
                      act.status === 'alert'
                        ? 'bg-rose-500 text-white'
                        : act.status === 'warning'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold';

                    return (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-on-surface">
                            {act.id === 'curtains' && '🪟 '}
                            {act.id === 'shading' && '☀️ '}
                            {act.id === 'irrigation' && '💧 '}
                            {act.id === 'sanitary' && '🛡️ '}
                            {lang === 'es-PY' ? act.titleEs : act.titlePt}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${badgeColor}`}>
                            {lang === 'es-PY' ? act.badgeEs : act.badgePt}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-on-surface leading-tight">
                          {lang === 'es-PY' ? act.instructionEs : act.instructionPt}
                        </p>
                        <span className="text-[10px] text-on-surface-variant leading-tight">
                          {lang === 'es-PY' ? act.reasonEs : act.reasonPt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clima Atual Exterior */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-extrabold font-mono text-on-surface">
                    {current.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-xs text-on-surface-variant block">
                    {lang === 'es-PY' ? current.weatherDescriptionEs : current.weatherDescriptionPt}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">💧 Hum</span>
                    <span className="font-bold text-on-surface">{current.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">🌬️ Viento</span>
                    <span className="font-bold text-on-surface">{current.windSpeed.toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">☀️ UV</span>
                    <span className={`font-bold ${current.uvIndex >= 7.5 ? 'text-rose-600' : 'text-on-surface'}`}>
                      {current.uvIndex.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Próximos Dias */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-outline block mb-1.5">
                  {lang === 'es-PY' ? 'Próximos Días' : 'Próximos Dias'}
                </span>
                <div className="space-y-1.5">
                  {weather.daily.slice(0, 3).map((day, idx) => {
                    const dateObj = new Date(day.date + 'T12:00:00');
                    const dayLabel =
                      idx === 0
                        ? (lang === 'es-PY' ? 'Hoy' : 'Hoje')
                        : dateObj.toLocaleDateString(lang === 'es-PY' ? 'es-PY' : 'pt-BR', { weekday: 'short' });

                    return (
                      <div
                        key={day.date}
                        className="px-3 py-2 rounded-xl bg-surface-container flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <span className="font-semibold capitalize w-10">{dayLabel}</span>
                          {getMainWeatherIcon(day.weatherCode, 15)}
                        </div>
                        <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                          🌧️ {day.precipitationProbability}%
                        </span>
                        <div className="font-mono text-xs font-bold">
                          <span>{day.tempMax.toFixed(0)}°</span>
                          <span className="text-on-surface-variant/60 ml-1">{day.tempMin.toFixed(0)}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>📍 Guayaibí, San Pedro</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold cursor-pointer hover:bg-primary-container transition-colors"
              >
                {lang === 'es-PY' ? 'Cerrar' : 'Fechar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

