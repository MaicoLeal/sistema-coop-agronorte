import React, { useState, useEffect } from 'react';
import {
  WeatherService,
  WeatherData,
  WeatherAlert,
} from '../services/weatherService';
import { Language } from '../types';
import {
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  CloudLightning,
  AlertTriangle,
  Droplets,
  Gauge,
  X,
  RefreshCw,
  Compass,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface WeatherWidgetProps {
  lang: Language;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lang }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    // Atualiza o clima a cada 15 minutos automaticamente
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  const current = weather.current;
  const activeAlerts = weather.activeAlerts;
  const hasAlerts = activeAlerts.length > 0;
  const criticalAlert = activeAlerts.find((a) => a.severity === 'critical') || activeAlerts[0];

  // Helper de ícone principal
  const getMainWeatherIcon = (code: number, size = 16) => {
    if (code >= 95) return <CloudLightning size={size} className="text-amber-500" />;
    if (code >= 51 && code <= 82) return <CloudRain size={size} className="text-blue-500" />;
    if (code === 0) return <Sun size={size} className="text-amber-500" />;
    return <CloudSun size={size} className="text-amber-400" />;
  };

  return (
    <>
      {/* ─── CHIP COMPACTO NO CABEÇALHO ─── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
          hasAlerts
            ? criticalAlert?.severity === 'critical'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
            : 'bg-surface-container-high/80 border-outline-variant/40 text-on-surface hover:bg-surface-container'
        }`}
        title={lang === 'es-PY' ? 'Ver Pronóstico y Alertas de Clima' : 'Ver Previsão do Tempo e Alertas'}
      >
        <div className="flex items-center gap-1.5">
          {getMainWeatherIcon(current.weatherCode, 15)}
          <span className="font-mono font-bold text-xs">{current.temperature.toFixed(0)}°C</span>
        </div>

        {/* Alerta dinâmico em destaque */}
        {hasAlerts ? (
          <div className="flex items-center gap-1 pl-1 border-l border-current/20">
            {criticalAlert.type === 'rain' && <CloudRain size={13} className="animate-bounce" />}
            {criticalAlert.type === 'wind' && <Wind size={13} className="animate-pulse" />}
            {criticalAlert.type === 'sun' && <Sun size={13} className="animate-spin" />}
            <span className="font-mono text-[10px] uppercase font-bold tracking-tight hidden sm:inline">
              {lang === 'es-PY' ? criticalAlert.titleEs.slice(0, 18) : criticalAlert.titlePt.slice(0, 18)}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-on-surface-variant hidden md:inline">
            Guayaibí
          </span>
        )}
      </button>

      {/* ─── MODAL DETALHADO DE PREVISÃO E ALERTAS AGRONÔMICOS ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {getMainWeatherIcon(current.weatherCode, 20)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span>{lang === 'es-PY' ? 'Pronóstico y Clima Agrícola' : 'Previsão do Tempo & Alertas'}</span>
                  </h3>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    {weather.city}, {weather.country} • {weather.updatedAt}
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
            <div className="p-5 overflow-y-auto space-y-4">
              {/* 1. SEÇÃO DE ALERTAS EM DESTAQUE (SE HOUVER) */}
              {hasAlerts ? (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-amber-500" />
                    <span>{lang === 'es-PY' ? 'Alertas para Manejo de Invernaderos' : 'Alertas de Manejo para as Estufas'}</span>
                  </span>

                  {activeAlerts.map((alert) => {
                    const isCritical = alert.severity === 'critical';
                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                          isCritical
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {alert.type === 'rain' && <CloudRain className="w-5 h-5 text-blue-600 shrink-0" />}
                            {alert.type === 'wind' && <Wind className="w-5 h-5 text-teal-600 shrink-0" />}
                            {alert.type === 'sun' && <Sun className="w-5 h-5 text-amber-600 shrink-0" />}
                            <span className="text-xs font-bold font-sans">
                              {lang === 'es-PY' ? alert.titleEs : alert.titlePt}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                              isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'
                            }`}
                          >
                            {isCritical ? 'Crítico' : 'Atenção'}
                          </span>
                        </div>

                        <p className="text-xs text-on-surface leading-relaxed">
                          {lang === 'es-PY' ? alert.messageEs : alert.messagePt}
                        </p>

                        <div className="mt-1 p-2 rounded-lg bg-white/70 dark:bg-black/30 border border-current/10 text-xs font-medium flex items-start gap-2">
                          <span className="font-bold shrink-0">👉 {lang === 'es-PY' ? 'Manejo:' : 'Ação:'}</span>
                          <span>{lang === 'es-PY' ? alert.actionEs : alert.actionPt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-xs font-medium">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'es-PY'
                      ? 'Condiciones climáticas favorables. Sin alertas de lluvia intensa, viento fuerte ni exceso de radiación.'
                      : 'Condições climáticas favoráveis. Sem alertas de chuva intensa, vento forte ou excesso de radiação.'}
                  </span>
                </div>
              )}

              {/* 2. CARD CLIMÁTICO ATUAL EM GUAYAIBÍ */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-extrabold font-mono text-on-surface">
                      {current.temperature.toFixed(1)}°C
                    </span>
                    <span className="text-xs text-on-surface-variant block mt-0.5">
                      {lang === 'es-PY' ? current.weatherDescriptionEs : current.weatherDescriptionPt} • {lang === 'es-PY' ? 'Sensación' : 'Sensação'}: {current.apparentTemperature.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="p-3 bg-surface rounded-2xl shadow-xs border border-outline-variant/30">
                    {getMainWeatherIcon(current.weatherCode, 32)}
                  </div>
                </div>

                {/* Grid com Métricas Agronômicas Fundamentais */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/20">
                  {/* Umidade */}
                  <div className="p-2 rounded-lg bg-surface flex flex-col">
                    <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                      <Droplets size={12} className="text-blue-500" />
                      <span>{lang === 'es-PY' ? 'Humedad' : 'Umidade'}</span>
                    </span>
                    <span className="text-sm font-bold font-mono mt-0.5">{current.humidity}%</span>
                  </div>

                  {/* Vento */}
                  <div className="p-2 rounded-lg bg-surface flex flex-col">
                    <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                      <Wind size={12} className="text-teal-500" />
                      <span>{lang === 'es-PY' ? 'Viento' : 'Vento'}</span>
                    </span>
                    <span className="text-sm font-bold font-mono mt-0.5">
                      {current.windSpeed.toFixed(0)} <span className="text-[10px] font-normal">km/h</span>
                    </span>
                  </div>

                  {/* Radiação UV */}
                  <div className="p-2 rounded-lg bg-surface flex flex-col">
                    <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                      <Sun size={12} className="text-amber-500" />
                      <span>{lang === 'es-PY' ? 'Índice UV' : 'Índice UV'}</span>
                    </span>
                    <span className={`text-sm font-bold font-mono mt-0.5 ${current.uvIndex >= 8 ? 'text-rose-600' : 'text-on-surface'}`}>
                      {current.uvIndex.toFixed(1)}
                    </span>
                  </div>

                  {/* Chuva */}
                  <div className="p-2 rounded-lg bg-surface flex flex-col">
                    <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                      <CloudRain size={12} className="text-blue-500" />
                      <span>{lang === 'es-PY' ? 'Lluvia' : 'Chuva'}</span>
                    </span>
                    <span className="text-sm font-bold font-mono mt-0.5">
                      {current.precipitation.toFixed(1)} <span className="text-[10px] font-normal">mm</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. PREVISÃO DOS PRÓXIMOS DIAS */}
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-outline block mb-2">
                  {lang === 'es-PY' ? 'Pronóstico Próximos Días' : 'Previsão Próximos Dias'}
                </span>

                <div className="space-y-1.5">
                  {weather.daily.map((day, idx) => {
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
                        <div className="flex items-center gap-2.5 min-w-[90px]">
                          <span className="font-semibold capitalize w-12">{dayLabel}</span>
                          {getMainWeatherIcon(day.weatherCode, 15)}
                        </div>

                        {/* Chuva prob */}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400">
                          <CloudRain size={12} />
                          <span>{day.precipitationProbability}%</span>
                        </div>

                        {/* Vento máx */}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant">
                          <Wind size={12} />
                          <span>{day.windSpeedMax.toFixed(0)} km/h</span>
                        </div>

                        {/* Temp min / max */}
                        <div className="font-mono text-xs font-bold text-right min-w-[80px]">
                          <span className="text-on-surface">{day.tempMax.toFixed(0)}°</span>
                          <span className="text-on-surface-variant/60 font-normal ml-1.5">
                            {day.tempMin.toFixed(0)}°
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer com dica operacional */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>📍 Guayaibí, San Pedro (PY)</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-primary text-on-primary font-bold cursor-pointer hover:bg-primary-container transition-colors"
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
