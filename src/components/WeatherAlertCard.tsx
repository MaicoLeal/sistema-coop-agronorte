import React, { useState, useEffect } from 'react';
import {
  WeatherService,
  WeatherData,
} from '../services/weatherService';
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
  ArrowRight,
} from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface WeatherAlertCardProps {
  lang: Language;
}

export const WeatherAlertCard: React.FC<WeatherAlertCardProps> = ({ lang }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
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
  }, []);

  if (!weather) return null;

  const { current, activeAlerts, daily } = weather;
  const hasAlerts = activeAlerts.length > 0;
  const criticalAlert = activeAlerts.find((a) => a.severity === 'critical') || activeAlerts[0];

  const getMainIcon = (code: number, size = 20) => {
    if (code >= 95) return <CloudLightning size={size} className="text-amber-500" />;
    if (code >= 51 && code <= 82) return <CloudRain size={size} className="text-blue-500" />;
    if (code === 0) return <Sun size={size} className="text-amber-500" />;
    return <CloudSun size={size} className="text-amber-400" />;
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
      {/* ─── BANNER DE ALERTA CLIMÁTICO CRÍTICO (SE HOUVER) ─── */}
      {hasAlerts && (
        <div
          className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            criticalAlert.severity === 'critical'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                criticalAlert.severity === 'critical'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-slate-900'
              }`}
            >
              {criticalAlert.type === 'rain' && <CloudRain size={18} />}
              {criticalAlert.type === 'wind' && <Wind size={18} />}
              {criticalAlert.type === 'sun' && <Sun size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-sans">
                  {lang === 'es-PY' ? criticalAlert.titleEs : criticalAlert.titlePt}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 uppercase font-semibold">
                  {criticalAlert.value}
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90 leading-tight">
                {lang === 'es-PY' ? criticalAlert.messageEs : criticalAlert.messagePt}
              </p>
              <p className="text-xs font-semibold mt-1 flex items-center gap-1">
                <span>🛡️ {lang === 'es-PY' ? 'Recomendación:' : 'Manejo Recomendado:'}</span>
                <span className="underline decoration-current/30">
                  {lang === 'es-PY' ? criticalAlert.actionEs : criticalAlert.actionPt}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── CORPO: CLIMA ATUAL + PRÓXIMOS DIAS ─── */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-surface-container-low/40">
        {/* Esquerda: Cidade e Temperatura Atual */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-surface rounded-2xl shadow-xs border border-outline-variant/30 shrink-0">
            {getMainIcon(current.weatherCode, 32)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-on-surface">
                {current.temperature.toFixed(1)}°C
              </span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">
                ({lang === 'es-PY' ? 'Sensación' : 'Sensação'}: {current.apparentTemperature.toFixed(0)}°)
              </span>
            </div>
            <span className="text-xs text-on-surface-variant block mt-0.5 font-medium">
              {lang === 'es-PY' ? current.weatherDescriptionEs : current.weatherDescriptionPt} • Guayaibí, San Pedro (PY)
            </span>
          </div>
        </div>

        {/* Centro: Indicadores Chave de Campo (Chuva, Vento, UV, Umidade) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 lg:max-w-md">
          {/* Chuva */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-semibold">
              <CloudRain size={13} className="text-blue-500" />
              <span>{lang === 'es-PY' ? 'Lluvia' : 'Chuva'}</span>
            </span>
            <span className="text-xs font-bold font-mono text-on-surface mt-1">
              {current.precipitation.toFixed(1)} mm
            </span>
          </div>

          {/* Vento */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-semibold">
              <Wind size={13} className="text-teal-500" />
              <span>{lang === 'es-PY' ? 'Viento' : 'Vento'}</span>
            </span>
            <span className="text-xs font-bold font-mono text-on-surface mt-1">
              {current.windSpeed.toFixed(0)} <span className="text-[10px] font-normal">km/h</span>
            </span>
          </div>

          {/* Radiação UV */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-semibold">
              <Sun size={13} className="text-amber-500" />
              <span>{lang === 'es-PY' ? 'Índice UV' : 'Índice UV'}</span>
            </span>
            <span className={`text-xs font-bold font-mono mt-1 ${current.uvIndex >= 8 ? 'text-rose-600' : 'text-on-surface'}`}>
              {current.uvIndex.toFixed(1)} {current.uvIndex >= 8 ? '⚠️' : ''}
            </span>
          </div>

          {/* Umidade */}
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 flex flex-col">
            <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-semibold">
              <Droplets size={13} className="text-blue-500" />
              <span>{lang === 'es-PY' ? 'Humedad' : 'Umidade'}</span>
            </span>
            <span className="text-xs font-bold font-mono text-on-surface mt-1">
              {current.humidity}%
            </span>
          </div>
        </div>

        {/* Direita: Previsão Rápida dos Próximos 3 Dias */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-outline-variant/30 lg:pl-4 shrink-0">
          {daily.slice(0, 3).map((day, idx) => {
            const dateObj = new Date(day.date + 'T12:00:00');
            const dayLabel =
              idx === 0
                ? (lang === 'es-PY' ? 'Hoy' : 'Hoje')
                : dateObj.toLocaleDateString(lang === 'es-PY' ? 'es-PY' : 'pt-BR', { weekday: 'short' });

            return (
              <div
                key={day.date}
                className="flex flex-col items-center px-2 py-1.5 rounded-xl bg-surface border border-outline-variant/20 min-w-[65px] text-center"
              >
                <span className="text-[10px] font-mono text-on-surface-variant font-semibold capitalize">
                  {dayLabel}
                </span>
                <div className="my-0.5">{getMainIcon(day.weatherCode, 16)}</div>
                <span className="text-[11px] font-mono font-bold text-on-surface">
                  {day.tempMax.toFixed(0)}° / {day.tempMin.toFixed(0)}°
                </span>
                {day.precipitationProbability > 20 && (
                  <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {day.precipitationProbability}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
