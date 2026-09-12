import { DatastreamReading } from '../types';

export function calculateVPD(airTempCelsius: number, relativeHumidityPct: number): number {
  // Buck equation / Tetens approximation for Saturation Vapor Pressure in kPa
  const vpSat = 0.61078 * Math.exp((17.27 * airTempCelsius) / (airTempCelsius + 237.3));
  const vpAct = vpSat * (relativeHumidityPct / 100);
  const vpd = Math.max(0, vpSat - vpAct);
  return Number(vpd.toFixed(2));
}

export interface TelemetryState {
  currentReadings: Record<string, DatastreamReading>;
  history: DatastreamReading[];
  anomalyMode: 'none' | 'ph_spike' | 'frozen' | 'vpd_critical';
}

export class TelemetryService {
  private static anomalyMode: 'none' | 'ph_spike' | 'frozen' | 'vpd_critical' = 'none';

  static setAnomalyMode(mode: 'none' | 'ph_spike' | 'frozen' | 'vpd_critical'): void {
    this.anomalyMode = mode;
  }

  static getAnomalyMode(): string {
    return this.anomalyMode;
  }

  static generateReading(zoneId: string, previous?: DatastreamReading): DatastreamReading {
    const now = new Date().toISOString();

    if (this.anomalyMode === 'frozen' && previous) {
      return {
        ...previous,
        id: `read-${Date.now()}`,
        timestamp: now,
        quality: 'frozen'
      };
    }

    let temp = previous ? previous.airTemp + (Math.random() * 0.4 - 0.2) : 24.5;
    let rh = previous ? previous.airHumidity + (Math.random() * 1.2 - 0.6) : 66.0;
    let ph = previous ? previous.solutionPH + (Math.random() * 0.04 - 0.02) : 5.95;
    let ec = previous ? previous.solutionEC + (Math.random() * 0.04 - 0.02) : 2.20;
    let quality: DatastreamReading['quality'] = 'good';

    if (this.anomalyMode === 'ph_spike') {
      ph = 7.15; // Critical alkaline shift
      ec = 3.40; // Critical salt accumulation
      quality = 'out_of_range';
    } else if (this.anomalyMode === 'vpd_critical') {
      temp = 34.2;
      rh = 38.0;
      quality = 'warning';
    }

    // Normal bounding
    temp = Math.max(16, Math.min(38, temp));
    rh = Math.max(30, Math.min(95, rh));
    ph = Math.max(4.0, Math.min(8.5, ph));
    ec = Math.max(1.0, Math.min(4.0, ec));

    const vpd = calculateVPD(temp, rh);

    return {
      id: `read-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: 'tenant-agronorte-demo',
      deviceId: `gw-${zoneId}-esp32`,
      zoneId,
      timestamp: now,
      airTemp: Number(temp.toFixed(1)),
      airHumidity: Number(rh.toFixed(1)),
      calculatedVPD: vpd,
      solutionPH: Number(ph.toFixed(2)),
      solutionEC: Number(ec.toFixed(2)),
      solutionTemp: Number((temp - 2.5).toFixed(1)),
      flowRateLh: Number((400 + (Math.random() * 30 - 15)).toFixed(0)),
      reservoirLevelPct: Number((82 + (Math.random() * 4 - 2)).toFixed(1)),
      quality
    };
  }
}
