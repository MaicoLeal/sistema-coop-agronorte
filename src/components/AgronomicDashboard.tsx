import React, { useState, useEffect } from 'react';
import { Language, DatastreamReading, ProductionZone } from '../types';
import { translations } from '../i18n/translations';
import { TelemetryService } from '../services/telemetryService';
import {
  Thermometer,
  Droplets,
  Gauge,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Zap,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface AgronomicDashboardProps {
  lang: Language;
  zones: ProductionZone[];
}

export const AgronomicDashboard: React.FC<AgronomicDashboardProps> = ({ lang, zones }) => {
  const t = translations[lang];
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-estufa-01');
  const [reading, setReading] = useState<DatastreamReading | null>(null);
  const [history, setHistory] = useState<DatastreamReading[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [anomalyStatus, setAnomalyStatus] = useState<string>('none');

  // Initialize and run telemetry tick
  useEffect(() => {
    const initial = TelemetryService.generateReading(selectedZoneId);
    setReading(initial);
    setHistory([initial]);

    if (!isSimulating) return;

    const interval = setInterval(() => {
      setReading((prev) => {
        const next = TelemetryService.generateReading(selectedZoneId, prev || undefined);
        setHistory((h) => [...h.slice(-14), next]);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedZoneId, isSimulating]);

  const handleAnomalyChange = (mode: 'none' | 'ph_spike' | 'frozen' | 'vpd_critical') => {
    TelemetryService.setAnomalyMode(mode);
    setAnomalyStatus(mode);
  };

  if (!reading) return null;

  // Status helper with soft semantic colors
  const getPHStatus = (ph: number) => {
    if (ph < 5.5) return { text: 'Ácido (< 5.5)', color: 'text-on-error-container', bg: 'bg-error-container' };
    if (ph > 6.5) return { text: 'Alcalino (> 6.5)', color: 'text-amber-900', bg: 'bg-amber-100 border border-amber-200' };
    return { text: 'Ótimo (5.8 - 6.2)', color: 'text-on-secondary-container', bg: 'bg-secondary-container' };
  };

  const getECStatus = (ec: number) => {
    if (ec < 1.8) return { text: 'Subnutrido (< 1.8)', color: 'text-on-primary-container', bg: 'bg-primary-container' };
    if (ec > 2.6) return { text: 'Salinidade Alta (> 2.6)', color: 'text-amber-900', bg: 'bg-amber-100 border border-amber-200' };
    return { text: 'Equilibrado (2.0 - 2.4)', color: 'text-on-secondary-container', bg: 'bg-secondary-container' };
  };

  const getVPDStatus = (vpd: number) => {
    if (vpd < 0.8) return { text: 'Baixa Transpiração (< 0.8)', color: 'text-on-primary-container', bg: 'bg-primary-container' };
    if (vpd > 1.4) return { text: 'Estresse Hídrico / Alto (> 1.4)', color: 'text-on-error-container', bg: 'bg-error-container' };
    return { text: 'Faixa Ótima (0.9 - 1.2)', color: 'text-on-secondary-container', bg: 'bg-secondary-container' };
  };

  const phStatus = getPHStatus(reading.solutionPH);
  const ecStatus = getECStatus(reading.solutionEC);
  const vpdStatus = getVPDStatus(reading.calculatedVPD);

  return (
    <div className="space-y-6">
      {/* Header and Zone selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-on-surface">
              {t.telemetryTitle}
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{t.telemetrySubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-on-surface-variant font-semibold">Invernadero:</label>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              isSimulating
                ? 'bg-surface-container-high border-outline-variant/40 text-primary hover:bg-surface-container-highest'
                : 'bg-amber-100 border-amber-200 text-amber-900'
            }`}
            title={isSimulating ? 'Pausar Telemetria' : 'Retomar Telemetria'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Simulator Injection Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-on-surface">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-bold">{t.simulatorControls}:</span>
          <span className="bg-surface-container-lowest px-2.5 py-0.5 rounded-full text-[11px] font-mono text-on-surface-variant border border-outline-variant/40">
            MQTT v1/{reading.deviceId}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAnomalyChange('none')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              anomalyStatus === 'none'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-high'
            }`}
          >
            {t.simNormal}
          </button>
          <button
            onClick={() => handleAnomalyChange('ph_spike')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              anomalyStatus === 'ph_spike'
                ? 'bg-error text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-high'
            }`}
          >
            {t.simInjectAnomaly}
          </button>
          <button
            onClick={() => handleAnomalyChange('frozen')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              anomalyStatus === 'frozen'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-high'
            }`}
          >
            {t.simFreezeSensor}
          </button>
          <button
            onClick={() => handleAnomalyChange('vpd_critical')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              anomalyStatus === 'vpd_critical'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-high'
            }`}
          >
            Pico VPD Térmico
          </button>
        </div>
      </div>

      {/* Main Agronomic Readings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solution pH */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.sensorPH}</span>
            <div className="w-8 h-8 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">
              {reading.solutionPH.toFixed(2)}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">pH</span>
          </div>
          <div className={`mt-2.5 text-xs font-bold px-2.5 py-1 rounded-full inline-block ${phStatus.bg} ${phStatus.color}`}>
            {phStatus.text}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2.5 leading-relaxed">
            Faixa agronômica ideal para absorção de micronutrientes: 5.80 a 6.20.
          </p>
        </div>

        {/* Solution EC */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.sensorEC}</span>
            <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">
              {reading.solutionEC.toFixed(2)}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">mS/cm</span>
          </div>
          <div className={`mt-2.5 text-xs font-bold px-2.5 py-1 rounded-full inline-block ${ecStatus.bg} ${ecStatus.color}`}>
            {ecStatus.text}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2.5 leading-relaxed">
            Condutividade que reflete a concentração iônica dos tanques A e B.
          </p>
        </div>

        {/* Calculated VPD */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              {t.sensorVpd}
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">
              {reading.calculatedVPD.toFixed(2)}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">kPa</span>
          </div>
          <div className={`mt-2.5 text-xs font-bold px-2.5 py-1 rounded-full inline-block ${vpdStatus.bg} ${vpdStatus.color}`}>
            {vpdStatus.text}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2.5 leading-relaxed">
            {t.sensorVpdNote}
          </p>
        </div>
      </div>

      {/* Secondary Sensor Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span className="text-xs text-on-surface-variant font-semibold">{t.sensorAirTemp}</span>
          <div className="text-lg font-bold text-on-surface mt-1 font-mono">{reading.airTemp}°C</div>
          <span className="text-[10px] text-on-surface-variant">Microclima estufa</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span className="text-xs text-on-surface-variant font-semibold">{t.sensorHumidity}</span>
          <div className="text-lg font-bold text-on-surface mt-1 font-mono">{reading.airHumidity}%</div>
          <span className="text-[10px] text-on-surface-variant">Umidade Relativa</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span className="text-xs text-on-surface-variant font-semibold">{t.sensorSolTemp}</span>
          <div className="text-lg font-bold text-on-surface mt-1 font-mono">{reading.solutionTemp}°C</div>
          <span className="text-[10px] text-on-surface-variant">Oxigênio dissolvido</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span className="text-xs text-on-surface-variant font-semibold">{t.sensorFlow}</span>
          <div className="text-lg font-bold text-on-surface mt-1 font-mono">{reading.flowRateLh} L/h</div>
          <span className="text-[10px] text-on-surface-variant">Bomba cabeçal #1</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span className="text-xs text-on-surface-variant font-semibold">{t.sensorTankLevel}</span>
          <div className="text-lg font-bold text-on-surface mt-1 font-mono">{reading.reservoirLevelPct}%</div>
          <span className="text-[10px] text-on-surface-variant">Reservatório 5000L</span>
        </div>
      </div>

      {/* Sensor Trend Stream Visualization */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Série Temporal Recente (Últimos pacotes recebidos do Gateway)
          </h3>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Qualidade: <span className="text-primary font-bold uppercase">{reading.quality}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 text-on-surface-variant font-semibold">
                <th className="py-2.5 px-3 font-mono">Horário (UTC / Asunción)</th>
                <th className="py-2.5 px-3">pH Solução</th>
                <th className="py-2.5 px-3">EC (mS/cm)</th>
                <th className="py-2.5 px-3">VPD (kPa)</th>
                <th className="py-2.5 px-3">Temp Ar</th>
                <th className="py-2.5 px-3">Umidade</th>
                <th className="py-2.5 px-3 text-right">Status do Pacote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-mono">
              {history.slice(-6).reverse().map((h) => (
                <tr key={h.id} className="hover:bg-surface-container-low/50">
                  <td className="py-2.5 px-3 text-on-surface-variant">
                    {new Date(h.timestamp).toLocaleTimeString('es-PY', { timeZone: 'America/Asuncion' })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-secondary">{h.solutionPH.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-bold text-primary">{h.solutionEC.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">{h.calculatedVPD.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-on-surface">{h.airTemp}°C</td>
                  <td className="py-2.5 px-3 text-on-surface">{h.airHumidity}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase ${
                        h.quality === 'good'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : h.quality === 'frozen'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {h.quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
