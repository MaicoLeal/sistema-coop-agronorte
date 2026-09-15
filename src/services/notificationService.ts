/**
 * Notification Service — Local browser notifications for pH/EC/VPD alerts.
 * Uses the Notification API (no backend push server required).
 */

import { DatastreamReading, ProductionZone } from '../types';

interface NotificationThresholds {
  ph: { min: number; max: number };
  ec: { min: number; max: number };
  vpd: { min: number; max: number };
  airTemp: { min: number; max: number };
}

const DEFAULT_THRESHOLDS: NotificationThresholds = {
  ph: { min: 5.5, max: 6.5 },
  ec: { min: 1.5, max: 3.0 },
  vpd: { min: 0.4, max: 1.6 },
  airTemp: { min: 18, max: 35 }
};

// Throttle: max 1 notification per type per 5 minutes
const notificationCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000;

export class NotificationService {
  private static permission: NotificationPermission = 'default';
  private static thresholds = DEFAULT_THRESHOLDS;

  /**
   * Request notification permission from the user.
   * Returns true if permission was granted.
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[NotificationService] Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Check if notifications are enabled.
   */
  static isEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Update thresholds if needed.
   */
  static setThresholds(thresholds: Partial<NotificationThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Evaluate a telemetry reading and send notifications for out-of-range values.
   */
  static evaluateReading(reading: DatastreamReading, zone?: ProductionZone): void {
    if (!this.isEnabled()) return;

    const zoneName = zone?.name || reading.zoneId;
    const alerts: { type: string; title: string; body: string; icon: string }[] = [];

    // pH check
    if (reading.solutionPH < this.thresholds.ph.min) {
      alerts.push({
        type: `ph-low-${reading.zoneId}`,
        title: '⚠️ pH Bajo',
        body: `${zoneName}: pH ${reading.solutionPH.toFixed(2)} — por debajo del mínimo (${this.thresholds.ph.min})`,
        icon: '🧪'
      });
    } else if (reading.solutionPH > this.thresholds.ph.max) {
      alerts.push({
        type: `ph-high-${reading.zoneId}`,
        title: '⚠️ pH Elevado',
        body: `${zoneName}: pH ${reading.solutionPH.toFixed(2)} — por encima del máximo (${this.thresholds.ph.max})`,
        icon: '🧪'
      });
    }

    // EC check
    if (reading.solutionEC < this.thresholds.ec.min) {
      alerts.push({
        type: `ec-low-${reading.zoneId}`,
        title: '⚠️ EC Baja',
        body: `${zoneName}: EC ${reading.solutionEC.toFixed(2)} mS/cm — por debajo del mínimo (${this.thresholds.ec.min})`,
        icon: '⚡'
      });
    } else if (reading.solutionEC > this.thresholds.ec.max) {
      alerts.push({
        type: `ec-high-${reading.zoneId}`,
        title: '🔴 EC Crítica',
        body: `${zoneName}: EC ${reading.solutionEC.toFixed(2)} mS/cm — por encima del máximo (${this.thresholds.ec.max}). Riesgo de salinidad.`,
        icon: '⚡'
      });
    }

    // VPD check
    if (reading.calculatedVPD > this.thresholds.vpd.max) {
      alerts.push({
        type: `vpd-high-${reading.zoneId}`,
        title: '🌡️ VPD Crítico',
        body: `${zoneName}: VPD ${reading.calculatedVPD.toFixed(2)} kPa — estrés hídrico alto (máximo: ${this.thresholds.vpd.max} kPa)`,
        icon: '🌡️'
      });
    } else if (reading.calculatedVPD < this.thresholds.vpd.min) {
      alerts.push({
        type: `vpd-low-${reading.zoneId}`,
        title: '💧 VPD Bajo',
        body: `${zoneName}: VPD ${reading.calculatedVPD.toFixed(2)} kPa — riesgo de condensación y hongos (mínimo: ${this.thresholds.vpd.min} kPa)`,
        icon: '💧'
      });
    }

    // Temperature check
    if (reading.airTemp > this.thresholds.airTemp.max) {
      alerts.push({
        type: `temp-high-${reading.zoneId}`,
        title: '🔥 Temperatura Alta',
        body: `${zoneName}: ${reading.airTemp.toFixed(1)}°C — excede el límite (${this.thresholds.airTemp.max}°C)`,
        icon: '🔥'
      });
    }

    // Sensor quality check
    if (reading.quality === 'frozen') {
      alerts.push({
        type: `sensor-frozen-${reading.zoneId}`,
        title: '❄️ Sensor Congelado',
        body: `${zoneName}: Sensor reportando datos idénticos — posible falla de comunicación.`,
        icon: '❄️'
      });
    }

    // Send alerts respecting cooldowns
    for (const alert of alerts) {
      this.sendIfNotCoolingDown(alert.type, alert.title, alert.body);
    }
  }

  /**
   * Send a notification if the cooldown period has passed.
   */
  private static sendIfNotCoolingDown(type: string, title: string, body: string): void {
    const now = Date.now();
    const lastSent = notificationCooldowns.get(type);
    if (lastSent && now - lastSent < COOLDOWN_MS) return;

    notificationCooldowns.set(type, now);

    try {
      new Notification(title, {
        body,
        icon: '/assets/logo-oficial-agronorte.png',
        badge: '/assets/logo-oficial-agronorte.jpg',
        tag: type, // Replaces existing notification with same tag
        requireInteraction: false,
        silent: false
      });
    } catch (err) {
      console.warn('[NotificationService] Failed to create notification:', err);
    }
  }

  /**
   * Send a custom notification directly.
   */
  static sendCustom(title: string, body: string, tag = 'custom'): void {
    if (!this.isEnabled()) return;
    this.sendIfNotCoolingDown(tag, title, body);
  }
}
